# TypeScript Lint Playbook（禁止 any，快速可过检）

## 目标

- 保证 `pnpm lint` 在默认配置下稳定通过
- 避免因 `@typescript-eslint/no-explicit-any` 反复返工
- 用“可复用的输入校验模板”替代临时 `any`

## 强约束（必须遵守）

- 禁止在 TypeScript 代码中使用 `any`（包括 `as any`、函数参数 `any`、`safeJson<any>` 等）。
- 不要通过关闭规则来绕过（除非 Tech Lead 明确批准并记录在 ADR / 变更请求里）。

## 推荐替代方案（按优先级）

### 1) 用 `unknown` + Type Guard（推荐）

- 请求体：`safeJson<unknown>(request)`
- 先判断 `typeof data === "object" && data !== null`，再用 `Record<string, unknown>` 读取字段
- 对每个字段做最小校验（string/number/enum/record/array）

### 2) 用 `Record<string, unknown>` 承载 JSON（可接受）

- 适用于证据、影响范围、raw_payload 等“半结构化字段”
- 存储侧：JSONB
- API 侧：`Record<string, unknown>`（不要用 `any`）

### 3) 为枚举字段写 `isXxx()`（必须）

示例：
- `isAlarmSeverity(v): v is AlarmSeverity`
- `isIncidentStatus(v): v is IncidentStatus`

## Next.js App Router Route Handler 类型坑（必须记住）

在 Next.js 16（当前工程）中，动态路由参数的 `context.params` 可能是 Promise 形态。

推荐模板：

```ts
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ...
}
```

## Route Handler 输入解析模板（可直接复制）

```ts
const bodyRes = await safeJson<unknown>(request)
if (!bodyRes.ok) return jsonError("INVALID_ARGUMENT", "JSON 解析失败", traceId, 400)
if (!bodyRes.data || typeof bodyRes.data !== "object") {
  return jsonError("INVALID_ARGUMENT", "请求体必须是对象", traceId, 400)
}
const r = bodyRes.data as Record<string, unknown>
```

## DAL（数据访问层）映射模板（避免 any）

- Supabase 返回的数据可视为 `Record<string, unknown>`
- 在 mapper 里做字段级 `as string`/`as number` 的最小断言，统一输出 API DTO

```ts
function toDto(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    created_at: row.created_at as string,
    payload: (row.payload as Record<string, unknown> | null) ?? undefined,
  }
}
```

## 质量门禁（交付前必须做）

- `pnpm lint`
- `pnpm build`

