/**
 * 判断一个 unknown 值是否为对象（plain record）。
 * Route Handler 里常用于在反序列化后做最小的结构校验。
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/**
 * 判断字符串是否为 UUID（v1-v5 均可）。
 * 仅做格式校验；不验证版本号以降低误伤。
 */
export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  )
}

/**
 * 解析并 clamp 一个整数型 query 参数；解析失败则回退到默认值。
 * 解决 Number("abc") => NaN 导致的 .limit(NaN) 等隐性错误。
 */
export function parseIntParam(
  params: URLSearchParams,
  key: string,
  defaultValue: number,
  input: { min: number; max: number }
): number {
  const raw = params.get(key)
  const n = raw === null ? defaultValue : Number.parseInt(raw, 10)
  const safe = Number.isFinite(n) ? n : defaultValue
  return Math.min(Math.max(safe, input.min), input.max)
}

/**
 * 校验 YYYY-MM-DD 格式日期字符串（不做时区转换）。
 * 用于与 Postgres date 类型对齐。
 */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  // 进一步保证是有效日期（例如 2026-02-30 视为非法）
  const [y, m, d] = value.split("-").map((x) => Number.parseInt(x, 10))
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

