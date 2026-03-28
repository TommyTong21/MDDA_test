# MDDA 文档区

本目录用于存放在 MDDA 工作流中产出的各阶段文档。这里不绑定单一示例产品；未来每一轮盲测/每一个真实项目都应把产物落在这里，便于复盘与复用。

## 目录说明

- **prd/**: Phase 1 产物（需求/范围/验收标准/风险）
- **adr/**: Phase 2 产物（架构决策与权衡）
- **api-contract/**: Phase 2 协作产物（接口边界与数据契约）
- **ops/**: Phase 3 产物（部署检查点、回滚与线上验证点）
- **qa/**: Phase 3 产物（测试策略与报告）
- **user/**: 用户手册与运营说明（可选）

## 命名建议

- PRD: `docs/prd/YYYYMMDD-<topic>-prd.md`
- ADR: `docs/adr/NNN-<topic>-architecture.md`
- Ops: `docs/ops/<topic>-deploy-checklist.md`

> 注意：文档应优先使用 `.trae/blocks/` 的模板生成，并在每个 Phase 结束进行人工 Review 后再进入下一 Phase。
