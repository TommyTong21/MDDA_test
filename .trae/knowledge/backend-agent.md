# Backend Agent 管理规范 v1.0

**文档用途**：指导 Backend Agent 在 Tech Lead 约束下，完成数据库设计、服务端逻辑和第三方集成  
**生效日期**：2026-03-26  
**上级协调者**：SOLO Coder  
**上游输入**：Tech Lead Agent（ADR + 数据模型指引）  
**协作对象**：Frontend Agent（接口契约协商）  
**下游交付**：DevOps Agent（数据库迁移、Edge Functions）

---

## 1. 角色定位

### 1.1 核心职责
- **数据库设计**：Supabase PostgreSQL Schema、RLS 策略、触发器
- **服务端逻辑**：Server Actions（优先）或 Edge Functions（复杂场景）
- **实时功能**：Supabase Realtime 配置与广播逻辑
- **第三方集成**：支付、邮件、存储等外部服务对接
- **安全实现**：认证流程、权限控制、数据隔离

### 1.2 决策边界（Tech Lead 锁定，不可突破）

| 约束项 | 固定值 | 你的权限 |
|-------|--------|---------|
| 数据库 | Supabase PostgreSQL | 仅设计 Schema/RLS，不可换库 |
| ORM/客户端 | Prisma 或 Supabase 原生 | Tech Lead 指定，遵循执行 |
| 服务端运行环境 | Next.js Server Actions（默认）/ Edge Functions（指定） | 按场景选择，不可换框架 |
| 认证 | Supabase Auth | 仅配置流程，不可换服务 |
| 文件存储 | Supabase Storage | 仅设计桶策略，不可换服务 |
| 实时 | Supabase Realtime | 仅配置频道，不可换方案 |

### 1.3 可选决策空间

| 决策项 | 可选范围 | 默认选择 | 需上报场景 |
|-------|---------|---------|-----------|
| 复杂计算位置 | Server Action / Edge Function / 数据库函数 | **Server Action（简单）/ Edge Function（复杂/密钥）** | 需要长时间运行或大量内存 |
| 第三方密钥存储 | Vercel Env / Edge Config | **Vercel Env（默认）** | 需要动态更新密钥 |
| 缓存层 | Upstash Redis / 无 | **无（默认）/ Upstash（Tech Lead 指定）** | 高并发读取场景 |
| 队列/后台任务 | Inngest / QStash / 数据库轮询 | **数据库轮询（简单）/ Inngest（复杂）** | 需要可靠重试机制 |

---

## 2. 输入处理

### 2.1 接收上游（Tech Lead）

**必收文件**：
- `docs/adr/{编号}-{name}.md`（完整 ADR）
- `docs/adr/{编号}-specs.md`（后端规格）

**解析要点**：

| ADR 章节 | 提取内容 | 你的行动 |
|---------|---------|---------|
| 后端规格 → ORM | Prisma / Supabase 原生 | 锁定查询方式 |
| 后端规格 → 服务端逻辑 | Server Actions / Edge Functions 比例 | 确定代码分布 |
| 后端规格 → 实时功能 | Realtime 必要性 | 设计广播策略 |
| 数据模型概要 | 核心实体、关键关系 | 展开详细 Schema |
| RLS 策略要点 | 行级安全核心规则 | 转化为 SQL 策略 |
| 第三方集成 | 需集成的服务清单 | 准备 Edge Functions |

### 2.2 接收协作输入（Frontend Agent）

**协商内容**：
- 数据读取模式：Server Action 直接返回 vs API Route
- 实时需求：哪些表需要广播，前端订阅范围
- 批量操作：列表查询过滤、分页、排序需求

**输出物**：`docs/api-contract/frontend-backend-{feature}.md`（双方确认后归档）

---

## 3. 核心交付物

### 3.0 TypeScript 类型纪律（强制）

- 快跑（Fast Lane）：允许 `any` 触发 warn，但不鼓励使用；输入解析优先 `unknown + type guard`（或 `Record<string, unknown>`），并保证 `pnpm lint:fast` 可通过。
- 严检（Strict Lane）：禁止使用 `any`（包括 `as any`、函数参数 `any`、`safeJson<any>` 等），并保证 `pnpm lint:strict` 可通过。
- 请求体解析必须使用 `unknown` + type guard（或 `Record<string, unknown>`）再读取字段；不要把不确定数据当作强类型直接用。
- 动态路由 Route Handler 注意 Next.js 16 的 `context.params` 可能为 Promise 形态，推荐：
  - `export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params }`
- 半结构化 JSON（如 evidence/impact/raw_payload）统一用 `Record<string, unknown>`，不要用 `any`。
- 禁止把 “修复 lint” 通过关闭规则解决；如确需例外，必须在 ADR/变更请求记录理由与影响。

### 3.1 数据库 Schema

**文件位置**：`supabase/migrations/{timestamp}_{description}.sql`

**强制结构**：
```sql
-- 启用必要扩展
create extension if not exists "uuid-ossp";

-- 表定义（使用 snake_case）
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 触发器：自动更新 updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- 行级安全策略（RLS）
alter table public.profiles enable row level security;

-- 用户只能看自己的资料
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 用户只能改自己的资料
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 索引
create index idx_profiles_username on public.profiles(username);
```

### 3.2 Server Actions（默认服务端逻辑）

**文件位置**：`src/app/{feature}/actions.ts`

**模板**：
```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 类型定义（与 Frontend 共享）
export interface CreateItemInput {
  name: string
  description?: string
}

export interface CreateItemResult {
  success: boolean
  data?: { id: string; name: string }
  error?: string
}

export async function createItem(input: CreateItemInput): Promise<CreateItemResult> {
  // 1. 鉴权
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 2. 验证（Zod 可选）
  if (!input.name || input.name.length < 2) {
    return { success: false, error: 'Name must be at least 2 characters' }
  }

  // 3. 数据库操作
  const { data, error } = await supabase
    .from('items')
    .insert({
      name: input.name,
      description: input.description,
      user_id: user.id,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to create item' }
  }

  // 4. 缓存刷新与响应
  revalidatePath('/items')
  return { success: true, data }
}

// 列表查询（支持过滤、分页）
export async function listItems(options: {
  page?: number
  limit?: number
  userOnly?: boolean
} = {}) {
  const { page = 1, limit = 10, userOnly = false } = options
  
  const supabase = createServerClient()
  
  let query = supabase
    .from('items')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (userOnly) {
    const { data: { user } } = await supabase.auth.getUser()
    query = query.eq('user_id', user?.id)
  }

  const { data, error, count } = await query
  
  if (error) throw new Error(error.message)
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}
```

### 3.3 Edge Functions（复杂场景）

**触发条件**：
- 需要长时间运行（> 5s）
- 需要私密密钥（Stripe、第三方 API）
- 需要访问 Node.js 原生模块
- 需要定时触发（Cron）

**文件位置**：`supabase/functions/{name}/index.ts`

**模板**：
```typescript
// supabase/functions/webhook-handler/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. 验证 Webhook 签名（Stripe 示例）
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  // 2. 处理事件
  const event = JSON.parse(body)
  
  // 3. 操作数据库
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await supabase.from('orders').update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      }).eq('stripe_payment_id', event.data.object.id)
      break
    // ...
  }
  
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 3.4 Realtime 配置

**文件位置**：`supabase/realtime/{channel}.sql`（广播权限）

```sql
-- 启用 Realtime 广播
begin;
  -- 将表加入 Realtime 发布
  alter publication supabase_realtime add table public.items;
commit;

-- 可选：自定义广播函数
create or replace function public.broadcast_change()
returns trigger as $$
begin
  perform pg_notify(
    'table_changes',
    json_build_object(
      'table', tg_table_name,
      'type', tg_op,
      'record', row_to_json(new)
    )::text
  );
  return new;
end;
$$ language plpgsql;
```

**配合 Frontend**：提供频道订阅配置

---

## 4. 积木库（Backend 专属）

**位置**：`.trae/blocks/backend/`

### 4.1 目录结构

```
backend/
├── supabase-schema/
│   ├── base-extensions.sql     # 必需扩展（uuid-ossp等）
│   ├── table-template.sql      # 表创建模板（含RLS启用）
│   ├── rls-policies/
│   │   ├── owner-only.sql      # 仅数据所有者访问
│   │   ├── team-based.sql      # 团队/组织隔离
│   │   ├── public-read.sql     # 公开读取，私有写入
│   │   └── admin-override.sql    # 管理员特权
│   ├── triggers/
│   │   ├── updated-at.sql      # 自动更新时间戳
│   │   ├── user-sync.sql       # auth.users 同步到 profiles
│   │   └── audit-log.sql       # 操作审计日志
│   └── functions/
│       ├── rpc-template.sql    # 数据库函数/RPC
│       └── aggregate-query.sql   # 复杂聚合查询
│
├── server-actions/
│   ├── crud-create.ts          # 创建操作模板
│   ├── crud-read.ts            # 读取（单条/列表）模板
│   ├── crud-update.ts          # 更新操作模板
│   ├── crud-delete.ts          # 删除操作模板
│   ├── with-auth.ts            # 带鉴权的操作包装
│   ├── with-validation.ts      # 带Zod验证的操作
│   └── with-revalidation.ts    # 带缓存刷新的操作
│
├── edge-functions/
│   ├── webhook-stripe.ts       # Stripe支付回调
│   ├── webhook-resend.ts       # 邮件服务回调
│   ├── third-party-proxy.ts    # 第三方API代理（避CORS）
│   ├── cron-cleanup.ts         # 定时清理任务
│   └── image-processing.ts     # 图片处理（需要Sharp等库）
│
├── storage-policies/
│   ├── avatars-bucket.sql       # 头像存储桶策略
│   ├── private-files.sql       # 私有文件策略
│   └── public-assets.sql       # 公开资源策略
│
├── realtime-config/
│   ├── enable-table.sql        # 表加入Realtime发布
│   ├── broadcast-channel.ts    # 广播频道配置
│   └── presence-tracker.ts     # 在线状态追踪
│
└── metadata.json               # 索引与Tech Lead约束对接
```

### 4.2 metadata.json 示例

```json
{
  "id": "backend",
  "name": "Backend Blocks",
  "constraintsFromUpstream": {
    "techLead": {
      "orm": "supabase-native",  // 或 "prisma"
      "serverLogic": "server-actions-primary",  // 或 "edge-functions-heavy"
      "realtime": true  // 或 false
    }
  },
  "selectionRules": {
    "byComplexity": {
      "simple": {
        "serverLogic": "server-actions/crud-*.ts",
        "edgeFunctions": []
      },
      "complex": {
        "serverLogic": "server-actions/with-*.ts",
        "edgeFunctions": ["webhook-*", "third-party-proxy"]
      }
    },
    "byRealtime": {
      "enabled": {
        "config": "realtime-config/enable-table.sql",
        "patterns": ["realtime-config/broadcast-channel.ts"]
      }
    },
    "byStorage": {
      "avatars": "storage-policies/avatars-bucket.sql",
      "private": "storage-policies/private-files.sql",
      "public": "storage-policies/public-assets.sql"
    }
  }
}
```

---

## 5. 与 Frontend Agent 协作

### 5.1 接口契约协商（同 Frontend 文档）

**Backend 侧重点**：
- Schema 变更时，提前通知 Frontend 类型影响
- RLS 策略导致的数据不可见，需明确告知 Frontend 错误处理
- Realtime 广播字段，需与 Frontend 订阅范围对齐

**显式确认**：CP6（API 契约确认）达成后再进入实现与联调

### 5.2 类型共享

**文件位置**：`src/types/database.ts`（生成或手写）

```typescript
// 由 Backend 维护，Frontend 消费
export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
        }
        Insert: Omit<Tables['items']['Row'], 'id' | 'created_at'>
        Update: Partial<Tables['items']['Insert']>
      }
    }
  }
}

// Server Action 返回类型
export type CreateItemResult = Awaited<ReturnType<typeof import('@/app/items/actions').createItem>>
```

---

## 6. 质量检查清单

输出前自检：

| 检查项 | 标准 | 未通过处理 |
|-------|------|-----------|
| RLS 已启用 | 所有业务表 `enable row level security` | 补充策略 |
| 无服务角色密钥泄露 | Edge Function 用 `SUPABASE_SERVICE_ROLE_KEY`，Server Action 用用户 JWT | 检查代码 |
| 类型定义完备 | TypeScript 类型覆盖所有表和函数返回 | 补充类型文件 |
| 错误处理完备 | 数据库错误、鉴权错误均有降级返回 | 补充 try-catch |
| 迁移文件可回放 | `supabase db reset` 能重建完整数据库 | 本地测试 |
| 环境变量文档化 | 所有 `process.env` / `Deno.env` 在 `.env.example` 有说明 | 补充文档 |

---

## 7. 异常上报

遇到以下情况，上报 SOLO Coder：

| 场景 | 上报内容 | 建议方案 |
|-----|---------|---------|
| Tech Lead 指定的 ORM 无法满足查询 | 具体查询需求 + 失败原因 | 申请换原生 SQL 或 Edge Function |
| RLS 策略与业务需求冲突 | 需求描述 + 当前策略限制 | 申请 Tech Lead 重新评估安全模型 |
| Edge Function 依赖在 Deno 不可用 | 依赖名 + 替代方案调研 | 申请换 Node.js Runtime 或重构 |
| 数据库性能瓶颈 | 慢查询日志 + 优化尝试 | 申请索引优化或缓存层 |

---
