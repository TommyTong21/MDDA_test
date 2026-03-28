# 盲测执行 Runbook（Phase 1→4）

## 目标

在不依赖口头补充的情况下，对任意行业题目完成：
- Phase 1：PRD（可冻结）
- Phase 2：ADR（可实现）
- Phase 3：部署与线上验证点（可访问）
- Phase 4：语义化版本迭代（可追溯）

## 输入格式（最小）

- 行业/场景
- 痛点与业务目标
- 输入数据类型（文本/图片/视频/表格/传感器）
- 合规/隐私/审计约束

## Phase 1（PRD）要求

- 用户与角色：至少 2 类
- 核心流程：端到端闭环（发起→处理→复核/回填）
- 验收标准：至少 8 条可验证 AC
- 技术栈决策点：必须写明 UI 形态与组件生态选择
  - Web：shadcn
  - Admin：Refine
  - App/小程序：Gluestack

输出路径建议：
- `docs/prd/YYYYMMDD-<topic>-prd.md`

## Phase 2（ADR）要求

- 模块边界：前端/后端/数据/鉴权
- 数据模型：核心表结构与 RLS 策略方向
- UI 技术栈锁定：明确使用 shadcn/refine/gluestack 的范围
- 验证策略：最小页面 + E2E 冒烟

输出路径建议：
- `docs/adr/NNN-<topic>-architecture.md`

## Phase 3（部署与验证）要求

- Vercel 可构建通过
- 至少 1 个线上验证点（推荐 `/api/version`）
- Playwright 冒烟：访问 `/` 与一个业务入口页面
- 工程门禁（两档）：
  - 快跑（上线验证）：`pnpm lint:fast` + `pnpm build`
  - 严检（正式测试）：`pnpm lint:strict` + `pnpm build` + `pnpm test:e2e`

输出路径建议：
- `docs/ops/<topic>-deploy-checklist.md`

## Phase 4（迭代与版本）要求

- 每次改动必须：
  - 更新 `package.json version`（SemVer）
  - 更新 `CHANGELOG.md`
  - 保持最小 E2E 冒烟通过

## 必读积木

- UI 选择：`.trae/blocks/frontend/ui-libraries/ui-stack-selection.md`
- Refine Admin：`.trae/blocks/frontend/admin-refine/refine-admin-adoption.md`
- Gluestack App：`.trae/blocks/frontend/app-gluestack/gluestack-app-adoption.md`
- TypeScript Lint：`.trae/blocks/tech-lead/typescript-lint-playbook.md`
