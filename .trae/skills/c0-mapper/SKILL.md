---
name: "c0-mapper"
description: "将 prd-package.yaml 映射为 C0 契约并生成 context index，最大化保留关键信息并减少下游偏差。用户要进入C0签署前调用。"
---

# C0 Mapper（Phase 0）

## 目标
把结构化 PRD（prd-package.yaml）映射为 C0 契约，并生成/更新 context index，以“最小信息损失”驱动 Phase 1。

## 输入
- `cases/<case_id>/prd/prd-package.yaml`（必须已通过校验）
- `templates/PRD.md`（作为人类阅读的叙事参考）

## 输出
- `cases/<case_id>/contracts/c0/c0-vX.Y.Z.yaml`（draft）
- `cases/<case_id>/context/index.yaml`（更新维度索引）
- `cases/<case_id>/decisions/c0-decisions.md`（记录取舍与关键决策）

## 映射规则（最小集合）
- problem_space.business_context ← prd.problem_space.business_context
- problem_space.stakeholder_map ← prd.stakeholders（role + pain_points）
- problem_space.critical_scenarios ← prd.journey.critical_scenarios（scenario_id + description + 可选频率/影响）
- constraints.hard_limits ← prd.constraints.hard_limits
- success_metrics ← prd.success_metrics
- solution_hypothesis.value_proposition ← 从 prd.problem_space.problem_statement/目标凝练
- solution_hypothesis.risk_assumptions ← prd.risks（转换为 assumption_id/probability/impact）

## 防信息丢失策略（必须执行）
- 显式取舍：每次映射都在 decisions 记录“保留/丢弃/原因”
- 不把开放问题吞掉：open_questions 不为空时应阻断签署，优先触发 backtrack 或补充调研
- 关键指标不缩写：success_metrics 保留 measurement_method 与 data_source（如有）
- Context Index 必须覆盖 Phase 1 常用维度：success_metrics / hard_limits / critical_scenarios / stakeholder_map

## Gate 校验与签署
- 先校验 C0：

```bash
pnpm gate:validate -- --case cases/<case_id> --kind c0 --file cases/<case_id>/contracts/c0/<c0>.yaml
```

- 再签署（批准）：

```bash
pnpm gate:approve -- --file cases/<case_id>/contracts/c0/<c0>.yaml --by "<name>"
```

