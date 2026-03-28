/**
 * 安全解析 Request JSON，避免在 Route Handler 内直接抛异常。
 */
export async function safeJson<T>(request: Request): Promise<
  | { ok: true; data: T }
  | { ok: false; error: { code: "INVALID_JSON"; message: string } }
> {
  try {
    const data = (await request.json()) as T
    return { ok: true, data }
  } catch {
    return { ok: false, error: { code: "INVALID_JSON", message: "JSON 解析失败" } }
  }
}

