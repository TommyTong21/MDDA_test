# Gluestack UI（App/小程序）接入积木

## 何时调用

- 需求明确包含 App 或小程序形态（移动端优先）
- Tech Lead 在 ADR 中指定移动端 UI 生态为 Gluestack UI（而不是 shadcn）

## 核心原则

- Gluestack UI 更适合独立的移动端工程（Expo/React Native）
- 主工程（Next.js）不直接塞入移动端全量依赖；采用 Monorepo 分应用或独立仓库
- 复用策略：把“初始化/主题/组件拷贝策略/验证方式”沉淀为积木，不搬整仓源码

## 推荐落地方式：Monorepo 分应用（pnpm workspace）

### 目录建议

```
apps/
  web/        # 现有 Next.js（可选：未来迁移进来）
  mobile/     # Expo（Gluestack UI）
packages/
  ui/         # 可选：跨端共享的轻量 token/类型
```

### 初始化（Expo）

在仓库根目录执行（示例命令，按实际约束调整）：

```bash
pnpm dlx create-expo-app@latest apps/mobile
```

然后在移动端工程内按 Gluestack 的方式初始化（其本质是“按需生成/拷贝组件与配置”）：
- 初始化 Tailwind/NativeWind（若采用其推荐栈）
- 引入主题 tokens
- 选择需要的组件集（Button、Input、Form、Toast、Modal、Tabs 等）

## 与现有 Supabase 的对齐点

- 认证：移动端使用 Supabase Auth（PKCE/深链回跳）
- 数据：与 Web/Admin 共用同一套表结构与 RLS
- 存储：上传图片/文件统一走 Supabase Storage

## 验证标准（最小）

- App 首屏可打开并渲染一个 Gluestack 组件（Button/Input）
- 登录流程可跑通（可先用匿名/测试账号）
- E2E（可选）：移动端建议用 Detox；本骨架默认只要求 Web 的 Playwright 冒烟

## 参考来源

- 完整源码参考：`user_gift/gluestack-ui-main/`

