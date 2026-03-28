# Refine（Admin）接入积木

## 何时调用

- 需求形态为 Admin/内部工具，且存在大量 CRUD、权限、数据密集列表与表单
- Tech Lead 在 ADR 中指定 Admin 端 UI 生态为 Refine

## 核心原则

- 主工程不引入完整第三方仓库源码；只按需安装依赖并落盘最小可运行样例
- Refine 的价值是“数据密集应用的框架化能力”（资源、路由、鉴权、权限、数据源、表单/表格生态），不是单纯 UI 组件

## 接入方式（两种）

### 方案 A：单仓单 Next.js（推荐默认）

把 Refine 作为主工程的一部分，放在 `src/app/(admin-refine)/` 路由组中，沿用当前 Next.js 架构、部署与 Supabase。

适用：
- 需要复用同一套 Supabase Auth/RLS
- 希望 Vercel 单项目部署，降低运维复杂度

### 方案 B：Monorepo 分应用（移动端/后台同时推进时）

在仓库内新增 `apps/admin/`（Refine）与 `apps/web/`（现有 Next.js Web）等，统一 pnpm workspace 管理。

适用：
- Admin 与 Web/移动端生命周期不同、依赖重且互相影响明显
- 团队并行开发需要更强隔离

## 方案 A：最小落地步骤（骨架）

### 1) 安装依赖（按需）

建议组合（Refine Core + Next 路由适配 + React Query）：

```bash
pnpm add @refinedev/core @refinedev/nextjs-router @tanstack/react-query
```

UI 适配层（在 ADR 指定后再选其一）：
- Ant Design：`@refinedev/antd antd`
- Material UI：`@refinedev/mui @mui/material @emotion/react @emotion/styled`
- Mantine：`@refinedev/mantine @mantine/core @mantine/hooks`

### 2) 新建 Admin 入口路由

- `src/app/(admin-refine)/layout.tsx`：Refine Provider 容器
- `src/app/(admin-refine)/page.tsx`：重定向到默认资源列表或 dashboard

### 3) 定义资源（Resources）

在 Refine 中把“业务实体”定义为资源：
- `work-orders`、`customers`、`assets`、`inspections`、`tickets` 等

每个资源最少提供：
- list
- create
- edit
- show（可选）

### 4) 数据源（Data Provider）

优先选择以下路线之一：
- Supabase dataProvider（若采用 Refine 官方 supabase connector）
- 自研最小 dataProvider（用 `@supabase/supabase-js` 直接调用）

### 5) 鉴权与权限（Auth / Access Control）

必须对齐：
- Supabase Auth 的 session 获取方式（服务端/客户端）
- 路由级保护策略（未登录跳转、无权限展示 403）

## 验证标准（最小）

- `/admin` 或 `/dashboard` 可访问且可看到一个资源的 list 页面
- list 页面可拉取数据（可用 mock 或空表）
- 未登录时跳转到登录页（或明确的访客提示页）
- E2E 冒烟：访问 admin 入口能渲染出页面标题

