# 护工端 MVP 最小验证

## 本地自动化（无需 Supabase）
- `pnpm test:e2e`
  - 覆盖：`/`、`/dashboard`、`/caregiver` 页面可加载

## 联调手工验证（需要 Supabase）
前置：
- 设置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 执行迁移 `supabase/migrations/20260328000200_caregiver_mvp.sql`
- 插入至少 1 条 residents 数据

步骤：
1) 打开 `/caregiver`
2) 输入邮箱，发送登录链接并完成登录
3) 刷新老人列表，选择一个老人
4) 提交“快速记录”
5) 提交“紧急上报”，刷新并看到新事件
6) 提交“交接补充”，刷新并看到新交接记录

