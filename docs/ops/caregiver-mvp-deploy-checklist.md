# 护工端 MVP 部署检查清单

## 1. Supabase（必须）
- [ ] 创建/选择 Supabase Project
- [ ] 执行迁移：`supabase/migrations/20260328000200_caregiver_mvp.sql`
- [ ] 写入最小老人主数据（residents）
  - 字段：name / bed_no / care_level
- [ ] 确认 Auth 已启用（邮箱 OTP 或短信 OTP 二选一）

## 2. 环境变量（Vercel / 本地）
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

## 3. 发布前本地验证（快速通道）
- [ ] `pnpm lint:fast`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`

## 4. 线上验证点（最小集合）
- [ ] `/api/version` 返回版本信息
- [ ] `/caregiver` 页面可打开
- [ ] 用可用邮箱登录（收到 OTP 链接后完成登录）
- [ ] （登录后）护工端可刷新老人列表（需要 Supabase 已有 residents 数据）
- [ ] （登录后）可提交快速记录 / 紧急上报 / 交接补充（RLS 生效）

