# ADR-002: 配电房巡检缺陷检测与安全作业卡端到端架构（ChangeFormer 预留）

## 1. 状态
Proposed

## 2. 背景与上下文 (Context)
- 关联PRD：`docs/prd/20260326-energy-inspection-prd.md`
- 目标链路：缺陷检测 → 风险分级 → 自动作业卡 → 闭环复核，并满足合规留痕与审计导出。
- 输入数据：多源影像（可见光/红外照片与视频），需要规范化回传、可追溯存储、可用于模型推理与证据呈现。
- 历史对比变化检测（Change Detection / ChangeFormer）：能力方向已纳入 PRD，但**本期不做具体推理实现**——后端不实现推理/变化检测任务与结果回写；前端仅提供“我们有该能力考虑”的**占位 UI / 状态**与**数据模型/接口预留**，用于未来无缝对接推理服务。
- 技术设计需要冻结的关键点：
  - 多源影像上传与存储如何做到可校验、强关联、可防篡改留痕。
  - 缺陷检测的服务边界（在线推理 vs 异步队列），以及模型版本/输入输出的可追溯性；变化检测仅保留未来扩展点。
  - 风险分级规则引擎与版本化（规程分级），以及自动作业卡模板与审批流（允许先 MVP）。
  - 合规留痕与审计：关键操作审计日志、证据链导出（素材清单、哈希、版本、审批链与过程打卡）。

## 3. 约束条件 (Constraints)
- 物理约束：Vercel, Supabase, Next.js (App Router), GitHub
- 技术栈硬约束：Next.js App Router + Supabase（Auth/DB/Storage；Edge Functions/Realtime 可选）+ Vercel 部署
- 业务/合规约束：
  - 全链路留痕与可追溯（模型版本/规则版本/模板版本/审批链/证据哈希）
  - 弱网与现场高频上传场景需避免“推理阻塞上传与提交”
  - （Future）若后续接入 Change Detection：在缺少基线或对齐失败时必须“可跳过且不影响自动分级”
- 资源/性能约束（未冻结指标）：检测时延、并发规模、保留期限、电子签章/CA 等仍为开放项（必须在 Phase 2 进一步确认）

## 4. 备选方案 (Options Considered)
1. 方案 A：在线同步推理（上传后立即在 Vercel/Edge 上完成缺陷检测；变化检测未来可扩展）
2. 方案 B：上传/入库在线完成 + 缺陷检测推理异步化（队列/任务表驱动），推理由独立推理服务执行并回写 Supabase；变化检测本期不做，仅保留占位与扩展点

## 5. 决策 (Decision)
- **选择方案**：方案 B（在线完成“上传+校验+入库+触发任务”，缺陷检测异步执行；结果回写并通过 Realtime/轮询更新 UI）。
- **范围声明（本期冻结）**：Change Detection（ChangeFormer）为**本期非目标**——后端**不实现**变化检测推理、变化检测任务入队与结果回写；前端仅实现**占位 UI/状态**，并对数据模型/接口做**向后兼容的预留**（可选字段或接口占位，默认不返回结果）。
- **核心理由**：
  - Vercel/Edge 不适合承载 GPU/重计算推理与视频解码；异步化可隔离上传链路与推理链路，满足现场回传稳定性与弹性扩展。
  - Change Detection 依赖“历史基线检索 + 视角/工位对齐”，适合未来在异步任务中执行；本期先通过前端占位与模型/接口预留降低后续接入成本。
  - 通过版本化配置（模型/规则/模板）与不可变证据引用（哈希+对象键）实现可追溯、可审计与可回放。
- **上传与存储策略（多源影像）**：
  - 前端先向 Next.js 获取“直传签名”（Signed Upload URL），再把照片/视频直传 Supabase Storage；直传完成后调用 Next.js 提交素材元数据入库并触发推理任务。
  - 上传校验：客户端与服务端共同校验 mime/扩展名白名单、content-length 上限、设备/视角/任务归属；客户端计算 sha256 并提交，服务端将 sha256 作为内容地址的一部分固化到 object_key（例如 `sha256/<hash>.<ext>`）以避免覆盖式篡改。
  - 元数据固化：media_assets 记录采集时间（exif/端上时间）、操作者、终端信息、设备ID、viewpoint_id、modality（visible/infrared/video）、sha256、原始文件名与上传批次，作为后续“基线检索/对齐/审计导出”的索引。
  - 防篡改：对象存储侧禁止覆盖写（同 key 不允许 update），业务侧只允许 append（新增引用/新增记录）；任何删除/作废均以“写入撤销记录 + 审计日志”替代直接物理删除（物理删除仅管理员受控且必须留痕）。
- **推理边界（缺陷检测）与可追溯性**：
  - 在线边界：Next.js/Edge 只负责入队（inference_jobs）与权限校验，不进行重推理；推理执行由独立推理服务消费任务并回写结果。
  - 缺陷检测任务：输入为一个或多个 media_asset（可见光/红外/视频帧），输出 defect_candidates（类型、定位、置信度、证据截图引用）并固化 model_version 与输入哈希列表。
  - （Future）变化检测（ChangeFormer）：本期不实现推理与落库；仅预留“按 device_id + viewpoint_id + modality 检索历史 baseline 并对齐”的能力接口与可选字段，未来接入时必须支持 skip_reason（baseline_missing / viewpoint_mismatch / alignment_failed）且不得影响自动分级。
- **风险分级与作业卡（规则/模板版本化 + 审批流 MVP）**：
  - 风险分级：以 versioned ruleset（risk_rulesets）驱动；分级结果必须写入 ruleset_version_id 与条款引用（rule_refs），保证审计可回放。
  - 自动作业卡：以 versioned template（workcard_templates）驱动生成草稿（work_cards），并记录 template_version_id；审批流 MVP 采用线性审批链（approvals）满足“可用可审计”，后续再扩展并行/会签。
- **合规留痕与证据链导出**：
  - 审计日志 audit_logs 采用追加式写入（append-only），覆盖上传、复核、分级、生成/提交/审批、执行打卡、闭环等关键动作，并记录 before/after diff、操作者、时间、原因字段。
  - 证据链导出按“时间/站点/设备/作业卡号”生成导出包：包含结构化记录（JSON/CSV）、审批链、素材清单与 sha256、模型/规则/模板版本引用，以及 manifest 的哈希链（支持后续外部验真）。

## 6. 后果与影响 (Consequences)
### 6.1 正面影响 (Pros)
- 上传链路可控：前端直传 Supabase Storage（签名 URL），在线服务只做轻量校验与落库，不被推理耗时拖慢。
- 推理可扩展：缺陷检测可独立扩容/替换，支持多模型并存与灰度升级（按 model_version 固化输入输出）；变化检测通过占位与预留扩展点降低未来接入成本。
- 可追溯与可审计：素材哈希、模型版本、规则版本、模板版本、审批链、关键操作审计日志都可在 DB 中形成完整证据链索引。
- （Future）变化检测边界可控：接入后支持“基线缺失/对齐失败”显式 skip_reason 且不参与自动升降级。

### 6.2 负面影响及缓解措施 (Cons & Mitigations)
- 系统复杂度增加（任务队列/回调/幂等/重试）：通过“任务表 + 状态机 + 幂等键 + 统一重试策略”控制复杂度，并把所有状态可观测化（指标/告警）。
- 外部推理服务引入依赖与安全面：通过私网/签名请求、最小权限的短期访问令牌、结果回写验签与审计日志降低风险；推理服务不可用时保持业务可用（允许延迟出结果）。
- 防篡改难以做到绝对不可变（对象存储仍可被管理员删除）：采用“内容寻址对象键（hash key）+ 追加式审计日志 + 哈希链/签名清单导出”，并把“删除/覆盖”收敛为受控的管理员流程且全量留痕。

## 7. 任务分解说明 (Task Breakdown)
为下游 Agent 提供明确的技术规格：
- **frontend-architect**: Next.js App Router 实现巡检任务/缺陷看板/作业卡/复核页面；多源影像直传 Supabase Storage（支持照片/视频、弱网重试、上传进度）；客户端计算 sha256 并随元数据提交；展示缺陷检测结果与推理任务状态；在缺陷详情/证据区域增加**“历史变化检测：待接入/占位”** UI/状态（明确说明未来可接入推理服务并展示结果），并为未来结果展示预留数据结构（例如可选字段 changeDetection: { status, skipReason?, overlays? }）。
- **backend-architect**: Supabase Postgres Schema 与 RLS（站点/班组隔离、最小权限）；素材与证据模型（media_assets 记录 modality=visible/infrared/video、sha256、exif/采集端信息、关联 inspection/device/viewpoint、不可变 object_key 规则）；任务队列表（inference_jobs：仅覆盖 defect_detection 任务类型；状态机、重试、幂等键）；推理结果表（defect_candidates：固化 model_version、输入 media_hash 列表、证据对象引用与哈希）；规则/模板版本化与审批生效（risk_rulesets/workcard_templates：draft→pending→active，active_at、生效窗口、引用历史不可变）；作业卡与审批流 MVP（work_cards + approvals：draft→submitted→approved/rejected；步骤可配置但先支持线性审批链）；审计与防篡改（audit_logs 追加式表 + 关键表触发器记录 before/after、操作者、原因；证据链导出生成 manifest.json（含对象列表、sha256、版本引用、哈希链）并打包下载）。**明确不包含**变化检测任务表/结果表与回写逻辑（本期非目标）。
- **api-test-pro**: 冻结接口边界与错误语义（上传签名、巡检提交、任务状态、缺陷结果查询、风险分级结果、作业卡生成/提交/审批、审计导出）；增加“变化检测占位态”测试点（缺陷详情接口/页面返回 changeDetection 预留字段为空或 status=not_integrated，前端展示“待接入/占位”且不影响分级与闭环流程）；覆盖幂等与重试（重复提交素材、重复触发推理、审批并发）以及 RLS/权限用例（站点隔离、审计只读）。
- **devops-architect**: Vercel + Supabase 项目配置（环境变量、密钥轮换、Storage Bucket 策略与 CORS）；监控与告警（任务积压、失败率、导出生成失败、审批超时）；备份与保留策略（数据库备份、对象存储生命周期/归档策略、审计日志保留）；上线回滚策略（规则/模板/模型版本灰度与一键回退到上一个 active 版本）。（Future）推理服务对接的安全通道与部署要求在接入变化检测/外部推理服务时再补充。
