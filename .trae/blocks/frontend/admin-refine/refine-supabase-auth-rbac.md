# Refine × Supabase（鉴权 + RBAC）积木

## 何时调用

- 选择 Refine 作为 Admin 端框架
- 后端/鉴权固定为 Supabase Auth + RLS，需要前端做路由保护与角色权限控制

## 目标

- 统一登录态来源（Supabase session）
- 基于“角色/组织/租户”实现访问控制（RBAC/ABAC 其中之一）
- 与数据库 RLS 策略保持一致（前端只做 UX 兜底，不替代 RLS）

## 角色模型建议（最小）

- `admin`：全量管理权限
- `operator`：业务操作权限（创建/编辑/处理）
- `viewer`：只读权限

角色存储建议（二选一）：
- 放在 `profiles.role`（最直观）
- 放在 JWT 自定义 claim（更强一致性，但初始化更复杂）

## 接入步骤（概念级）

### 1) 登录

- 使用 Supabase Auth（邮箱/第三方）完成登录
- 登录成功后拿到 session，并缓存到 Refine 的 authProvider 能识别的位置

### 2) 获取用户与角色

必须能在前端拿到：
- user id
- role
- 可选：org_id / tenant_id

### 3) 权限映射到 Refine 的访问控制

Refine 的权限系统需要回答三类问题：
- 是否已认证（authenticated）
- 是否可访问某页面/资源（can）
- 是否可执行某动作（create/edit/delete）

### 4) 与 RLS 对齐

要求：
- 数据写入必须带上 `org_id` / `owner_id` 等 RLS 关键字段
- UI 层仅隐藏按钮不算安全，必须以 RLS 为准

## 验证标准（最小）

- 未登录访问 Admin：被拦截（重定向或 401 页面）
- `viewer` 无法看到“新增/删除”入口
- `operator` 可新增但不可删除（示例）
- 对应数据库策略存在时，越权请求会失败并有明确错误反馈

