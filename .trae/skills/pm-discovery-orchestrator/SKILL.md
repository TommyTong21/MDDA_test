---
name: pm-discovery-orchestrator
description: 编排产品发现流程的元技能（Meta-Skill），按阶段串联市场分析、方案推演与契约生成。
---

# PM Discovery Orchestrator (/discover)

这是一个 **Meta-Skill（元技能）** 工作流，用于将多个原子的产品发现和分析技能串联为一个标准化的、可控的 AI 产品经理工作流，确保从业务发散到方案收敛、最终落地为契约的完整性。

## 外部原子技能依赖声明

在执行本 Orchestrator 之前，请确保当前环境或外部仓库已提供以下原子 Skills 依赖：
- **第一阶段 (发散与分析)**: `market-analyst`, `competitor-research`, `jobs-to-be-done`
- **第二阶段 (方案与风险)**: `opportunity-solution-tree`, `identify-assumptions-new`, `prioritize-assumptions`
- **第三阶段 (收敛与契约)**: `prd-factory`, `c0-mapper`, `nl-cli-translator`

## 触发指令

- **主命令**: `/discover [项目/需求背景]`
- **别名**: `/产品发现`, `/需求分析`
- **自然语言**: "请帮我针对[某业务]执行完整的产品发现工作流", "运行 discover 模式分析这个需求"

## 工作流编排 (The Workflow)

当你被调用来处理一个业务问题时，**必须严格按照以下顺序、按阶段（Phase）编排执行**。每个阶段完成时，必须停下来等待**人工确认（Review & Confirm）**。

在执行过程中，始终维护 `{project_root}/0-项目总览.md` 作为全局状态跟踪。

同时，必须在 case 内生成“可审计的调查过程”文件，便于人类复核：
- `cases/<case_id>/materials/background-analysis.md`

---

### 第一阶段：发散与分析 (Divergence & Analysis)

本阶段旨在明确市场宏观背景、竞品现状以及目标用户的核心 JTBD（Jobs-to-be-Done）。

#### 1.1 市场分析 (Market Analyst)
- **输入**: 用户提供的初始业务背景。
- **动作**: 调用 `market-analyst` 技能，获取行业的宏观合规硬约束与基准指标。
- **Context Management**:
  - **产物保存**: `1-发散与分析/1.1-市场分析.md`
  - **关键字段提取**: 行业合规要求、市场趋势、宏观指标。
  - **总览文档更新**: 在 `0-项目总览.md` 中记录市场分析的核心结论。
  - **材料沉淀（必须）**：将关键结论与证据写入 `cases/<case_id>/materials/background-analysis.md`（含来源链接/引用）。

#### 1.2 竞品研究 (Competitor Research)
- **输入**: 1.1 阶段提取的市场背景与用户原始需求。
- **动作**: 调用 `competitor-research` 技能，获取该领域的标杆解法与差异化切入点。
- **Context Management**:
  - **产物保存**: `1-发散与分析/1.2-竞品研究.md`
  - **关键字段提取**: 标杆产品功能列表、差异化竞争优势。
  - **总览文档更新**: 在 `0-项目总览.md` 中追加竞品的核心对标维度。
  - **材料沉淀（必须）**：补充到 `cases/<case_id>/materials/background-analysis.md`（含对标点与证据）。

#### 1.3 JTBD 分析 (Jobs-to-be-Done)
- **输入**: 1.1 与 1.2 的产物及目标用户群体。
- **动作**: 调用 `jobs-to-be-done` 技能，拆解目标用户的核心任务、痛点（Pains）与预期收益（Gains）。
- **Context Management**:
  - **产物保存**: `1-发散与分析/1.3-JTBD分析.md`
  - **关键字段提取**: 核心 Job 列表、关键痛点、预期收益。
  - **总览文档更新**: 在 `0-项目总览.md` 中沉淀核心 JTBD 结论。
  - **材料沉淀（必须）**：补充到 `cases/<case_id>/materials/background-analysis.md`（Jobs/Pains/Gains）。

🛑 **人工确认点 1 (Review & Confirm)**
> **必须暂停执行！** 向用户输出《Phase 1 洞察摘要》，包含市场关键约束、核心竞品差异点及核心 JTBD。询问用户：“**第一阶段的背景调查与核心诉求是否准确？是否可以进入第二阶段（方案与风险推演）？**”

---

### 第二阶段：方案与风险 (Solution & Risk)

本阶段基于第一阶段的洞察，推演可能的解决方案，并识别和排序关键假设。

#### 2.1 机会方案树 (Opportunity Solution Tree)
- **输入**: 第一阶段汇总的 JTBD 与业务目标。
- **动作**: 调用 `opportunity-solution-tree` 技能，构建“目标 -> 机会 -> 方案 -> 实验”的 OST 结构。
- **Context Management**:
  - **产物保存**: `2-方案与风险/2.1-OST.md`
  - **关键字段提取**: 核心机会点（Opportunities）、备选方案列表（Solutions）。
  - **总览文档更新**: 在 `0-项目总览.md` 中更新选定的高优方案方向。
  - **材料沉淀（必须）**：在 `cases/<case_id>/materials/background-analysis.md` 补充 OST 摘要与关键分支。

#### 2.2 识别假设 (Identify Assumptions)
- **输入**: 2.1 中产出的高优方案列表。
- **动作**: 调用 `identify-assumptions-new` 技能，针对选定方案识别出所有相关的可行性、价值、可用性及商业可行性假设。
- **Context Management**:
  - **产物保存**: `2-方案与风险/2.2-假设识别.md`
  - **关键字段提取**: 关键假设全集。
  - **总览文档更新**: 在 `0-项目总览.md` 中记录方案的核心风险点。
  - **材料沉淀（必须）**：在 `cases/<case_id>/materials/background-analysis.md` 追加假设清单。

#### 2.3 优先级排序 (Prioritize Assumptions)
- **输入**: 2.2 中识别的假设全集。
- **动作**: 调用 `prioritize-assumptions` 技能，使用 2x2 矩阵（重要性 vs. 证据强度）对假设进行优先级排序。
- **Context Management**:
  - **产物保存**: `2-方案与风险/2.3-假设优先级.md`
  - **关键字段提取**: Leap-of-faith 假设（最高优假设）。
  - **总览文档更新**: 在 `0-项目总览.md` 中明确下一阶段需要优先验证的 Leap-of-faith 假设。
  - **材料沉淀（必须）**：在 `cases/<case_id>/materials/background-analysis.md` 标注最致命假设与建议验证方式。

🛑 **人工确认点 2 (Review & Confirm)**
> **必须暂停执行！** 向用户输出《Phase 2 方案与风险摘要》，展示推演出的核心方案及最致命的业务假设。询问用户：“**推演出的解决方案方向与风险排序是否符合预期？是否可以进入第三阶段（收敛与契约生成）？**”

---

### 第三阶段：收敛与契约 (Convergence & Contract)

本阶段将经过确认的方案转化为标准的研发需求文档与 C0 契约。

#### 3.1 PRD 生成 (PRD Factory)
- **输入**: 第一与第二阶段的所有核心产物（JTBD, OST, 核心方案）。
- **动作**: 调用 `prd-factory` 技能，生成一份完整的、人读的 PRD，并在其中结构化地体现商业价值、关键场景与成功指标。
- **Context Management**:
  - **产物保存**: `3-收敛与契约/3.1-PRD.md`
  - **关键字段提取**: 业务目标、功能需求列表、验收标准。
  - **总览文档更新**: 在 `0-项目总览.md` 中链接最终的 PRD 产物。

#### 3.2 C0 契约映射 (C0 Mapper)
- **输入**: 3.1 生成的 PRD。
- **动作**: 调用 `c0-mapper` 技能，将生成的 PRD 无损压缩并映射为 `prd-package.yaml`，确保满足 Gate Schema 的必填字段要求。
- **Context Management**:
  - **产物保存**: `3-收敛与契约/3.2-C0契约.yaml`
  - **关键字段提取**: YAML 契约结构。
  - **总览文档更新**: 在 `0-项目总览.md` 中标记契约生成状态为“已就绪”。

#### 3.3 CLI 指令转换 (NL CLI Translator)
- **输入**: C0 契约状态与当前项目环境。
- **动作**: 调用 `nl-cli-translator` 技能，生成校验与签署该阶段的 CLI 命令。
- **Context Management**:
  - **产物保存**: `3-收敛与契约/3.3-CLI指令.md`
  - **关键字段提取**: 可执行的 CLI 命令（如 `pnpm gate ...`）。
  - **总览文档更新**: 在 `0-项目总览.md` 中记录下一步操作指引。

🛑 **人工确认点 3 (Final Review & Execution)**
> **流程结束点！** 向用户输出最终的契约包结构与 CLI 执行指令，引导用户进行评审或直接执行命令完成签署。

## 结束时的“下一步指令推荐”（必须输出）
每次对话结束时，输出一段“推荐下一步”，包含 1-3 条最可能的后续指令（按优先级排序），并说明何时该用哪一条。

推荐模板：
- 若 intake 未通过：提示 `pnpm gate:intake:validate ...` 并指向要补齐的字段
- 若 prd-package 未通过：提示 `pnpm gate:prd:validate ...` 并建议补齐 open_questions / success_metrics
- 若 C0 已生成但未签署：提示 `pnpm gate:validate ...` + `pnpm gate:approve ...`
- 若缺失维度：提示 `pnpm gate:context:load ...`（会触发 backtrack）或直接生成 backtrack-request

## 异常处理与退出机制

- 如果任何一个原子技能执行失败，必须向用户抛出明确的错误，并提供手动干预或重试的建议。
- 用户可以在任何一个“人工确认点”要求打回重做、补充特定信息，或直接使用 `/exit` 中断工作流。