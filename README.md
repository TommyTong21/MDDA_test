# MDDA 工程骨架（Testbed）

这是一个用于 **MDDA 多 Agent 工作流压力测试** 与 **未来项目复用** 的基础工程骨架（Next.js App Router + Supabase + Playwright + `.trae/` 资产）。

仓库会被复制到新环境开箱即用：你只需要更换 PRD/需求输入，并按 Phase 1→2→3→4 推进即可。

## 目录结构
- `docs/`: 存放产品各阶段的沉淀文档（PRD、ADR 等）
- `src/`: 核心业务代码（Next.js App Router）
- `supabase/`: 数据库与 Edge Functions 配置
- `.trae/`: Trae IDE 相关的智能配置与资产
- `tests/`: E2E 测试（Playwright）

## 开始使用

1. 参考 `Trae-Setup-Guide.md` 完成 IDE 的初始配置。
2. 呼叫 `@SOLO Coder` 开始执行你的需求迭代或部署操作。

## 资产约定

- 复用资产优先沉淀到 `.trae/blocks/`（积木库），供各 Agent 按需读取与执行。
- 复杂的外部源码/技能簇可放在 `user_gift/` 作为离线参考来源，不直接把整套工程拷进主工程；主工程只抽取“可复用片段”到积木库。
