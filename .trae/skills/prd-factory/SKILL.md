---
name: "prd-factory"
description: "生成 PRD.md + prd-package.yaml，并为 C0 映射准备结构化证据。用户要把复杂B端问题扩展并产出PRD时调用。"
---

# PRD Factory（Phase 0）

## 目标
把复杂 ToB 原始问题扩展为“可评审的 PRD 文档 + 可校验的结构化 PRD 包”，为后续 C0 映射提供稳定输入，减少信息损失。

## 产物
- `cases/<case_id>/prd/PRD.md`（叙事性）
- `cases/<case_id>/prd/prd-package.yaml`（结构化，可校验）
- `cases/<case_id>/decisions/c0-decisions.md`（关键决策）
- `cases/<case_id>/context/index.yaml`（维度索引）

## 执行步骤（推荐）
1) Intake 扩展（开放思维，不怕问）
   - 行业/知识域：明确行业范围、关键术语、监管/标准
   - Stakeholders：角色/诉求/痛点/决策权
   - Journey：As-Is/To-Be，关键场景（频率/影响/成功标准）
   - 需求：MUST/SHOULD/COULD + 非功能需求
   - 数据与集成：数据源、权限、证据链要求
   - 风险/假设/开放问题：必须在 C0 签署前澄清项
2) 写 PRD.md（用 templates/PRD.md 为骨架）
3) 写 prd-package.yaml（把 PRD 的关键结论结构化）
4) Gate 校验 prd-package

```bash
pnpm gate:prd:validate -- --file cases/<case_id>/prd/prd-package.yaml
```

5) 把结构化 PRD 的关键结论映射到 C0（交给 c0-mapper）

## 质量门槛（必须满足）
- prd-package 校验通过
- open_questions 不为空时，不允许推进 C0 签署（应触发 backtrack 或补充调研）
- success_metrics 必须“可测量 + 可复现口径”

