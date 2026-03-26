# Run02（能源巡检系统）Phase 3：部署与环境变量对齐 & 线上验证点检查清单

适用范围：
- 仓库：TommyTong21/MDDA_test
- 部署平台：Vercel（已连接 GitHub，默认自动部署）
- 框架：Next.js（App Router）
- 当前策略：无 Supabase env 时页面可运行（Mock），但需提前准备 Supabase 对接所需的 env 与上线验证点

---

## 1. Vercel 部署前检查

### 1.1 代码与分支
- 确认默认分支（通常为 `main`）用于 Production 部署；PR 分支用于 Preview 部署。
- 确认 `pnpm-lock.yaml` 已提交（Vercel 将据此锁定依赖）。
- 确认已实现线上验证点：
  - `GET /api/health`
  - `GET /api/version`

### 1.2 本地可重复构建
在 macOS 下建议执行：

```bash
pnpm install
pnpm lint
pnpm build
pnpm test
```

预期：
- `pnpm build` 无报错，能够生成 Next.js 构建产物。
- 测试（如 Playwright）若依赖外部服务，需确保本地/CI 具备对应条件；否则将其定位为“可选验证项”。

### 1.3 Vercel 项目设置（Project Settings）
- Framework Preset：Next.js（一般可自动识别，无需额外配置）。
- Install Command：`pnpm install`
- Build Command：`pnpm build`
- Output Directory：留空（Next.js 默认）
- Node.js 版本：建议选择 LTS（与团队本地一致；若无特殊要求可保持 Vercel 默认）

---

## 2. Vercel 环境变量清单（Supabase 对接准备）

> 说明：Next.js 中以 `NEXT_PUBLIC_` 开头的 env 会注入到浏览器端；其余 env 仅在服务端可用。  
> 建议在 Vercel 的 `Production` 与 `Preview` 环境都配置（至少 `Production` 必配）。

### 2.1 必备（Supabase 基础连通）
| Key | 示例/来源 | 作用域 | 必需 | 说明 |
|---|---|---:|---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API → Project URL | Browser + Server | 是 | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings → API → anon public | Browser + Server | 是 | 浏览器端使用的匿名 Key（受 RLS 约束） |

### 2.2 服务端可选/推荐（需要服务端管理能力时再启用）
| Key | 示例/来源 | 作用域 | 必需 | 说明 |
|---|---|---:|---:|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API → service_role | Server only | 视需求 | 高权限 Key，仅允许在服务端使用；不要以 `NEXT_PUBLIC_` 暴露到前端 |
| `SUPABASE_JWT_SECRET` | Supabase Project Settings → API → JWT Secret | Server only | 视需求 | 若服务端需自行校验 JWT/自定义鉴权逻辑可配置 |

### 2.3 CLI/运维辅助（本地/CI 用，不建议放到前端运行环境）
| Key | 示例/来源 | 用途 | 说明 |
|---|---|---|
| `SUPABASE_PROJECT_REF` | Supabase 项目 Ref（项目 URL 中或 CLI link 时可见） | CLI 操作目标 | 用于 `supabase link`/脚本化操作 |
| `SUPABASE_ACCESS_TOKEN` | `supabase login` 生成 | CI 自动化 | 仅在需要在 CI 执行 supabase CLI 时使用 |

### 2.4 配置建议
- Preview 与 Production 使用不同的 Supabase 项目（推荐）：避免测试数据污染生产。
- 至少先在 Production 配置 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`，确保未来切换到真实 Supabase 时无需改代码。
- 任何 `service_role` 类 Key 只放在 Vercel Server 端 env 中，并确保代码中仅在 Route Handler / Server Action 等服务端模块读取。

---

## 3. Supabase 迁移如何执行（CLI 或手动）

仓库已包含迁移文件：
- `supabase/migrations/20260326003000_energy_inspection_schema.sql`

> 重要：Vercel 部署默认不会自动执行数据库迁移。迁移需在上线前/上线窗口由运维手动或通过单独的 CI Job 执行。

### 3.1 方案 A：Supabase CLI（推荐，审计与可重复性更好）
前置条件：
- 本机已安装/可运行 Supabase CLI（可用 `pnpm dlx` 免全局安装）
- 具备目标 Supabase 项目的访问权限

执行步骤（在仓库根目录）：

```bash
# 1) 登录（会打开浏览器授权）
pnpm dlx supabase@latest login

# 2) 绑定目标项目（将 <project-ref> 替换为你的 Supabase 项目 Ref）
pnpm dlx supabase@latest link --project-ref <project-ref>

# 3) 将 supabase/migrations 下的迁移推送到远端数据库
pnpm dlx supabase@latest db push
```

验证建议：
- 在 Supabase Dashboard → Database → Tables/SQL Editor 中确认表/索引/视图已创建。
- 若使用 RLS/Policy，需确认策略与角色权限符合预期。

### 3.2 方案 B：Dashboard 手动执行（适用于一次性或紧急场景）
步骤：
1. 打开 Supabase Dashboard → SQL Editor
2. 复制 `supabase/migrations/20260326003000_energy_inspection_schema.sql` 内容粘贴执行
3. 检查执行日志，确认无报错

注意事项：
- 手工执行可能造成“已执行/未记录”的漂移；后续若改用 CLI，需确保迁移状态一致。

---

## 4. 线上验证点（如何访问与预期返回）

> 目的：在“无 Supabase env（Mock）”与“有 Supabase env（真实对接）”两种情况下，都能通过简单 URL 快速确认部署健康与版本信息。

### 4.1 `GET /api/health`
访问方式：
- 浏览器：`https://<your-vercel-domain>/api/health`
- 命令行：

```bash
curl -sS https://<your-vercel-domain>/api/health | jq .
```

预期：
- HTTP 200
- JSON 包含 `ok: true`
- `supabaseEnv` 字段能反映 Supabase env 是否已配置（仅布尔标识，不泄露敏感值）

### 4.2 `GET /api/version`
访问方式：
- 浏览器：`https://<your-vercel-domain>/api/version`
- 命令行：

```bash
curl -sS https://<your-vercel-domain>/api/version | jq .
```

预期：
- HTTP 200
- JSON 包含：
  - `version`：来自 `package.json`（用于确认部署的应用版本）
  - `commit/ref/env`：来自 Vercel 的 Git 元信息（用于确认对应的提交与环境）

---

## 5. 常见问题与排障提示（最小集合）

- `/api/health` 正常但页面异常：优先检查 Vercel Build Logs 是否有构建期错误（依赖/TS/ESLint）。
- Supabase 相关功能上线后报错：先对照 Vercel env 是否在对应环境（Preview/Production）都配置；再检查 RLS/Policy 与 anon key 权限。
- 需要快速回滚：Vercel → Deployments 选择上一版本部署并 Promote 到 Production。

