Kimi: 我将基于你的现有文档和刚才的完善建议，为你生成一版结构清晰、可直接使用的《新指南.md》。这版将整合三个文档的精华，并融入追问调整机制、竞品分析、显式确认点、异常升级路径等关键改进。

---

# Mission-Driven-Dev-Architecture（MDDA开发模式）v2.0

**文档用途**：指导多Agent协作开发工作流，定义从需求到部署的全流程规范  
**生效日期**：2026-03-26  
**技术栈**：Trae + Supabase + Vercel + GitHub + Next.js  
**核心理念**：Mission-Driven（目标驱动）、显式确认、默认保底、敏捷迭代

---

## 1. 可调用资源

### 1.1 Agent角色
| Agent | 核心职责 | 关键输出 | 下游消费者 |
|-------|---------|---------|-----------|
| **SOLO Coder** | 编排中枢、质量守门、上下文管理 | 上下文包、调度指令、决策日志 | 所有Agent |
| **PM Agent** | 需求分析、竞品调研、PRD撰写 | PRD.md + 用户故事 + 竞品分析报告 | Tech Lead, QA |
| **Tech Lead Agent** | 架构决策、技术选型、ADR制定 | ADR.md + 技术规格 + 接口契约 | Frontend, Backend, DevOps |
| **Frontend Agent** | UI实现、页面开发、组件封装 | 页面代码 + 业务组件 + 交互逻辑 | DevOps, QA |
| **Backend Agent** | 数据库设计、API开发、服务端逻辑 | Schema + Edge Functions/Server Actions | DevOps, QA |
| **DevOps Agent** | 部署配置、CI/CD、环境管理 | Vercel配置 + GitHub Actions + 环境变量 | QA |
| **QA/Docs Agent** | 测试验证、文档归档、知识沉淀 | 测试报告 + 用户手册 + API文档 | （终点） |

### 1.2 MCP工具
- **shadcnui**：UI组件库管理
- **github**：版本控制、PR管理
- **vercel**：部署与预览
- **supabase**：数据库与认证
- **context7**：上下文管理

### 1.3 Skills资源
- 产品经理分析工作流技能簇（竞品分析、用户画像、需求拆解等）

---

## 2. 项目初始化准备（Phase 0）

### 2.1 环境配置清单
- [ ] **GitHub仓库**：创建远程仓库，配置main/dev分支保护规则
- [ ] **本地Git**：确保与GitHub同一邮箱提交，约定使用Git MCP控制版本
- [ ] **Supabase**：创建项目，连接至GitHub，配置环境变量
- [ ] **Vercel**：导入GitHub仓库，配置自动部署
- [ ] **Trae IDE**：配置Agent、Skills、MCP，确保能力达标

### 2.2 项目结构约定
```
project-root/
├── .trae/knowledge/          # 知识库（ADR、PRD、规范文档）
├── docs/
│   ├── prd/                  # 产品需求文档
│   ├── adr/                  # 架构决策记录
│   ├── api-contract/         # 前后端接口契约
│   ├── qa/                   # 测试策略与报告
│   └── user/                 # 用户手册
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # UI组件 + 业务组件
│   └── lib/                  # 工具函数
├── supabase/
│   ├── migrations/           # 数据库迁移
│   └── functions/            # Edge Functions
├── tests/                    # 测试代码
└── .github/workflows/        # CI/CD配置
```

### 2.3 SOLO Coder激活与对齐
在Phase 0结束时，SOLO Coder必须明确：
- **项目架构**：技术栈、部署目标、扩展性预留
- **角色定位**：SOLO Coder只负责发任务、控流程、不干具体活
- **合作模式**：通过任务分发系统控制项目走向，利用提问补充信息
- **目标框架**：标准Todolist模板 + 项目环节控制文件

**输出物**：`project-setup-log.md`（记录环境配置、角色对齐、项目结构）

---

## 3. 核心流程

### Phase 1：需求分析与PRD制定（信息阶段）

**阶段目标**：将模糊需求转化为可执行的、有明确验收标准的PRD

#### 3.1.1 原始任务输入
- 用户提供初步想法/需求描述
- SOLO Coder接收并启动PM Agent

#### 3.1.2 信息深挖与竞品分析（新增）
PM Agent必须执行：
1. **竞品扫描**：搜索市场上现有解决方案，输出`docs/prd/YYYYMMDD-{feature}-competitor-analysis.md`
2. **差异化分析**：识别竞品不足，明确本项目的独特价值
3. **技术可行性预研**：Tech Lead Agent快速评估关键技术点

#### 3.1.3 用户画像与需求梳理
- 输出`docs/prd/YYYYMMDD-user-profile.md`
- **用户信息补充**：通过提问收集用户偏好、痛点、使用场景（权重高于Agent推测）

#### 3.1.4 Maker-Checker循环（追问调整机制）
```
初版PRD → Review Agent检查 → 修订 → 用户确认 → 冻结
```

**Review检查维度**：
- [ ] 用户故事是否完整（As a... I want... So that...）
- [ ] 验收条件是否可测试（Given... When... Then...）
- [ ] 竞品分析是否充分
- [ ] 技术可行性是否确认
- [ ] 用户画像是否准确

**显式确认检查点**：
1. **CP1-范围确认**：PRD初版完成后，用户确认功能范围
2. **CP2-差异确认**：竞品分析完成后，用户确认差异化方向
3. **CP3-深度确认**：技术方案预览后，用户确认实现深度（MVP/完整功能）
4. **CP4-冻结确认**：最终PRD签字（模拟），进入Phase 2后原则上不再变更需求

#### 3.1.5 开发深度约定
- **Phase 1默认深度**：Demo级别，重点在前端功能与页面演示，不深入复杂业务逻辑
- **Phase 4可深入**：具体功能点、AI助手集成、复杂数据处理等

**阶段输出物**：
- `YYYYMMDD-raw-requirements.md`（原始需求）
- `YYYYMMDD-competitor-analysis.md`（竞品分析）
- `YYYYMMDD-user-profile.md`（用户画像）
- `YYYYMMDD-prd-v{N}.md`（PRD版本迭代，N=1,2,3...）
- `YYYYMMDD-prd-final.md`（冻结版PRD）

---

### Phase 2：开发执行（实现阶段）

**阶段目标**：将PRD拆解为可执行任务，协调各Agent完成开发

#### 3.2.1 任务拆解与分发
SOLO Coder将PRD转化为：
1. **主Todolist**：`YYYYMMDD-todolist.md`，按Phase 2-4组织
2. **子Todolist**：每个Agent的专属任务列表

**任务包标准格式**：
```markdown
## Task-{ID}: {任务名称}
- **负责Agent**: {Agent名称}
- **上游输入**: {依赖的文档/代码路径}
- **验收标准**: {可验证的条件列表}
- **约束条件**: {技术栈、设计系统、API模式等}
- **截止时间**: {YYYY-MM-DD}
- **阻塞项**: {如有，记录并升级}
```

#### 3.2.2 Agent协作与上下文传递

**上下文包（Context Package）标准**：
```typescript
{
  projectId: string,
  currentStage: 'frontend' | 'backend' | 'devops' | 'qa',
  inputs: {
    prd: string,           // PRD路径
    adr: string,           // ADR路径
    designSystem: string, // UI库指定
    apiContract: string,   // 接口契约路径
    deploymentUrl?: string // DevOps输出（后续阶段）
  },
  constraints: {
    platform: 'vercel',
    database: 'supabase',
    auth: 'supabase-auth',
    repo: 'github',
    ide: 'trae'
  },
  task: {
    id: string,
    description: string,
    acceptanceCriteria: string[],
    priority: 'P0' | 'P1' | 'P2',
    deadline?: string
  },
  decisions: Array<{
    id: string,
    agent: string,
    decision: string,
    reason: string,
    timestamp: string
  }>,
  blockers?: Array<{
    id: string,
    description: string,
    blocking: string,
    owner: string,
    escalation: string
  }>
}
```

#### 3.2.3 交接检查清单

| 检查项 | PM → Tech | Tech → Frontend | Tech → Backend | Frontend ↔ Backend | 任何 → DevOps |
|-------|-----------|-----------------|----------------|-------------------|---------------|
| PRD已归档 | ✅ | - | - | - | - |
| 验收条件清晰 | ✅ | ✅ | ✅ | - | - |
| 技术约束明确 | - | ✅ | ✅ | - | ✅ |
| ADR已批准 | - | ✅ | ✅ | - | - |
| 接口契约定义 | - | - | - | ✅ | - |
| 构建产物就绪 | - | - | - | - | ✅ |

#### 3.2.4 显式确认检查点（Phase 2）
1. **CP5-UI确认**：UI设计稿/原型完成后，用户确认视觉方向
2. **CP6-API确认**：API契约定义后，用户确认数据边界
3. **CP7-Demo确认**：首版可部署Demo后，用户验收并决定是否进入Phase 3

**阶段输出物**：
- `YYYYMMDD-todolist.md`（主任务列表）
- `YYYYMMDD-agent-handoff-log.md`（Agent交接记录）
- `YYYYMMDD-blocker-tracker.md`（阻塞项跟踪）
- 代码产物（Frontend/Backend）

---

### Phase 3：部署上线（交付阶段）

**阶段目标**：将开发成果部署到生产环境，确保可访问、可运行

#### 3.3.1 默认部署流程
1. **GitHub管理**：代码合并至main分支，打版本标签
2. **Vercel自动部署**：配置预览环境（Preview）与生产环境（Production）
3. **Supabase集成**：数据库迁移、RLS策略配置、Edge Functions部署
4. **环境变量**：配置生产环境密钥（不提交至GitHub）

#### 3.3.2 部署前检查
- [ ] 构建成功（Vercel Build无错误）
- [ ] 环境变量已配置
- [ ] 数据库迁移已执行
- [ ] 基础功能可访问（Smoke Test）

**阶段输出物**：
- `YYYYMMDD-deployment-log.md`（部署记录）
- 生产环境URL
- 预览环境URL

---

### Phase 4：持续优化（迭代阶段）

**阶段目标**：基于用户反馈迭代优化，小步快跑，确保可回滚

#### 3.4.1 初代版本优化
- 将部署结果不满意之处反馈给SOLO Coder
- SOLO Coder组织相关Agent调整（默认满意，不主动调整）

#### 3.4.2 功能迭代标准流程（新增）
```
用户提出优化点 → 记录至backlog → 评估影响 → 小步实现 → 版本控制 → 验收
```

**详细规范**：
1. **需求记录**：SOLO Coder记录为`backlog/YYYYMMDD-{item}.md`
2. **影响评估**：确定涉及Agent，评估工作量（≤3人天优先）
3. **小步实现**：单个功能点 ≤ 1个PR，避免大规模重构
4. **Mock数据**：如需外部数据，先准备Mock，再接入真实源
5. **功能开关**：复杂功能通过Feature Flag控制，便于回滚
6. **版本控制**：每个迭代一个feature分支，PR合并前必须通过CI
7. **验收标准**：用户确认 或 **24小时无反馈自动合并**（默认机制）

#### 3.4.3 深入功能实现（可选）
此阶段可选择性深入：
- **AI助手集成**：提示词工程 + RAG + API Key管理
- **复杂业务逻辑**：积分计算、权限系统、实时协作等
- **性能优化**：数据库索引、缓存策略、CDN配置

**显式确认检查点（Phase 4）**：
- **CP8-迭代确认**：每个功能迭代前，用户确认优先级和范围

**阶段输出物**：
- `YYYYMMDD-iteration-log.md`（迭代记录）
- `backlog/`目录（待办事项）
- 版本标签（Git Tags）

---

## 4. 异常处理与升级路径

### 4.1 异常分级与处理

| 级别 | 场景 | 处理流程 | 决策权 | 升级时限 |
|-----|------|---------|--------|---------|
| **L1** | Agent内技术问题 | Agent自主解决，或请求SOLO Coder补充上下文 | Agent | 4小时 |
| **L2** | 跨Agent接口不匹配 | SOLO Coder召集相关Agent三方协商 | SOLO Coder | 8小时 |
| **L3** | 架构选型冲突 | Tech Lead重新评估ADR，可能调整技术栈 | Tech Lead | 1天 |
| **L4** | 需求范围争议 | PM重新评估PRD，可能裁剪功能 | PM + 用户 | 2天 |
| **L5** | 资源/成本超限 | 用户介入决策是否继续/调整/终止 | 用户 | 立即 |

### 4.2 常见冲突场景处理

**场景A：Frontend需要Backend接口未就绪**
1. SOLO Coder要求Backend优先提供Mock Schema
2. Frontend使用Mock开发
3. Backend完成后，Frontend切换真实接口
4. QA验证两端一致性

**场景B：Tech Lead选型与Agent能力冲突**
1. Agent上报约束（如"Shadcn无复杂日历组件"）
2. SOLO Coder转交Tech Lead重新评估
3. Tech Lead决策：换库(Mantine)/自研/降低需求
4. 更新ADR，通知相关Agent

**场景C：Vercel/Supabase限制导致无法实现**
1. Agent上报技术限制（如"Edge Function超50MB"）
2. SOLO Coder召集Tech Lead + 相关Agent
3. 方案：降级为Node.js Runtime/拆分服务/换架构
4. Tech Lead更新ADR，重新分配任务

---

## 5. 质量门与可观测性

### 5.1 质量门检查清单（跨Agent）

| 检查点 | 执行Agent | 检查内容 | 阻断发布 |
|-------|----------|---------|---------|
| PRD完整 | PM | 用户故事 + 验收条件 | ✅ |
| ADR批准 | Tech Lead | 技术选型 + 下游任务 | ✅ |
| 接口契约确认 | Frontend ↔ Backend | 双方签字确认 | ✅ |
| 构建成功 | DevOps | Vercel构建无错误 | ✅ |
| 测试通过 | QA | P0用例100%通过 | ✅ |
| 文档归档 | Docs | 用户手册 + API文档 | ⚠️（警告，不阻断） |

### 5.2 过程文件清单（工作留痕）

每个Phase必须生成的过程文件：

| Phase | 必须文件 | 路径 |
|-------|---------|------|
| Phase 0 | 项目配置日志 | `logs/project-setup-log.md` |
| Phase 1 | 原始需求、竞品分析、用户画像、PRD迭代记录 | `docs/prd/` |
| Phase 2 | 任务拆解、Agent交接日志、阻塞项跟踪 | `logs/` |
| Phase 3 | 部署日志 | `logs/deployment-log.md` |
| Phase 4 | 迭代日志、Backlog | `logs/iteration-log.md`, `backlog/` |

### 5.3 成本与Token管理

- **上下文压缩**：Agent间传递时，自动总结上游输出（保留关键决策，省略细节）
- **模型分级**：简单任务使用轻量级模型，复杂任务使用强模型
- **预算预警**：设置项目Token预算，超支时触发精简模式（减少Review环节，合并Agent任务）

---

## 6. 默认保底机制

确保即使信息不足也能输出中等质量成果：

| 场景 | 默认策略 |
|------|---------|
| 用户需求模糊 | PM Agent使用标准问卷模板引导补充 |
| 技术选型争议 | Tech Lead优先选择社区最成熟方案（Shadcn + Supabase Auth） |
| UI设计无偏好 | Frontend使用Shadcn UI默认主题（Slate色板） |
| 无竞品可参考 | PM Agent基于通用模式推导功能集（CRUD + 仪表盘） |
| 部署环境受限 | DevOps使用Vercel Hobby方案先行（后续可升级Pro） |
| 用户无反馈 | 24小时后自动进入下一阶段（基于"默认满意"原则） |

---

## 7. 协作指令模板（SOLO Coder使用）

### 7.1 标准Agent调用指令

```markdown
【调用PM Agent】
"分析需求：[描述]。执行竞品分析，输出PRD到docs/prd/{name}.md，包含用户故事、验收条件、竞品对比。"

【调用Tech Lead】
"基于PRD [路径]，输出ADR到docs/adr/{num}-{name}.md。约束：Vercel + Supabase。指定UI库和API模式。"

【调用Frontend】
"基于ADR [路径]，实现[页面/组件]。UI库：[shadcn/mantine]。输出到src/app/[route]/。先提供设计稿确认。"

【调用Backend】
"基于ADR [路径]，设计Supabase Schema。输出：supabase/migrations/ + Edge Functions。提供API契约草稿。"

【调用DevOps】
"配置Vercel部署 + GitHub Actions。输入：Frontend构建配置 + Backend环境变量需求。输出部署日志。"

【调用QA】
"基于[PRD/ADR]，编写测试用例。覆盖：功能测试 + Vercel Edge兼容性 + Supabase RLS。输出测试报告。"
```

### 7.2 追问调整指令

```markdown
【发起Review】
"对[Agent输出路径]进行Review，检查[维度]。输出Review报告，如有问题标记修订建议。"

【用户确认请求】
"当前完成[阶段/任务]，请确认：1)是否满足预期 2)是否需要调整 3)是否进入下一阶段。24小时无反馈默认通过。"

【阻塞升级】
"任务[ID]阻塞超过[时限]，升级至[L3/L4/L5]。阻塞原因：[描述]。需要决策：[问题]。"
```

---

## 8. 扩展性预留

| 未来变更 | 影响范围 | SOLO Coder应对 |
|---------|---------|---------------|
| 新增移动端（React Native） | 新增App Agent | 按相同模式接入，并行工作流 |
| 数据库换PostgreSQL自建 | Tech Lead + Backend | 更新约束条件，重新生成ADR |
| 部署迁AWS | Tech Lead + DevOps | 新增AWS CDK积木，替换Vercel配置 |
| 团队扩张（多人） | 协作协议 | Agent映射到真人角色，流程不变 |
| 接入AI Coding Agent | Tech Lead | 评估AI Agent能力边界，定义人机协作模式 |

---

## 附录A：显式确认检查点汇总（CP1-CP8）

| CP编号 | 阶段 | 触发时机 | 确认内容 | 默认行为 |
|-------|------|---------|---------|---------|
| CP1 | Phase 1 | PRD初版完成 | 功能范围 | 24h无反馈→继续 |
| CP2 | Phase 1 | 竞品分析完成 | 差异化方向 | 24h无反馈→继续 |
| CP3 | Phase 1 | 技术方案预览 | 实现深度（MVP/完整） | 24h无反馈→MVP |
| CP4 | Phase 1 | PRD冻结前 | 最终PRD签字 | 必须显式确认 |
| CP5 | Phase 2 | UI设计稿完成 | 视觉方向 | 24h无反馈→继续 |
| CP6 | Phase 2 | API契约定义 | 数据边界 | 24h无反馈→继续 |
| CP7 | Phase 2 | 首版Demo完成 | 是否进入Phase 3 | 24h无反馈→继续 |
| CP8 | Phase 4 | 每个迭代前 | 优先级和范围 | 24h无反馈→继续 |

---

## 附录B：文档命名规范

| 文档类型 | 命名模板 | 示例 |
|---------|---------|------|
| PRD | `YYYYMMDD-{feature}-prd-v{N}.md` | `20260326-points-mall-prd-v1.md` |
| ADR | `{编号}-{name}.md` | `001-vercel-supabase-stack.md` |
| 竞品分析 | `YYYYMMDD-{feature}-competitor-analysis.md` | `20260326-points-mall-competitor-analysis.md` |
| 用户画像 | `YYYYMMDD-{feature}-user-profile.md` | `20260326-points-mall-user-profile.md` |
| 任务列表 | `YYYYMMDD-todolist.md` | `20260326-todolist.md` |
| 日志 | `YYYYMMDD-{type}-log.md` | `20260326-deployment-log.md` |

---

**文档结束**

保存为 `新指南.md`，作为MDDA开发模式的核心指导文档。

---

这版《新指南.md》整合了原三个文档的所有关键信息，并系统性地融入了追问调整机制、竞品分析、8个显式确认检查点、5级异常升级路径、成本管理、可观测性等改进。文档结构清晰，可直接作为Trae中SOLO Coder和各个Agent的操作手册。

你需要我对哪个章节进行进一步细化，或者调整某些具体规范吗？
