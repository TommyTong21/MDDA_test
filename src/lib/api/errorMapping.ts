/**
 * 将 Supabase/PostgREST/Postgres 错误映射为对外稳定的 API 错误码与 HTTP 状态码。
 * 目标：避免前端依赖底层错误字符串，同时让常见约束错误可被准确处理。
 */
export function mapSupabaseError(
  err: unknown
): { code: string; message: string; status: number } | null {
  if (!err || typeof err !== "object") return null

  const anyErr = err as { code?: unknown; message?: unknown; details?: unknown }
  const code = typeof anyErr.code === "string" ? anyErr.code : undefined
  const message = typeof anyErr.message === "string" ? anyErr.message : "数据库错误"

  // Postgres SQLSTATE（通过 PostgREST 透出）
  // 参考：23505 unique_violation, 23503 foreign_key_violation, 22P02 invalid_text_representation
  if (code === "23505") return { code: "CONFLICT", message: "资源已存在", status: 409 }
  if (code === "23503") return { code: "NOT_FOUND", message: "关联资源不存在或无权限", status: 404 }
  if (code === "22P02") return { code: "INVALID_ARGUMENT", message: "参数格式不正确", status: 400 }

  // RLS 拒绝通常表现为 42501 + message 包含 row-level security
  if (code === "42501" && /row-level security/i.test(message)) {
    return { code: "FORBIDDEN", message: "无权限执行该操作", status: 403 }
  }

  // 业务触发器/校验统一使用 raise exception ... errcode='P0001'
  if (code === "P0001") {
    // 触发器消息可能是常量（例如 INVALID_STATUS_TRANSITION）
    if (/INVALID_STATUS_TRANSITION/i.test(message)) {
      return { code: "FAILED_PRECONDITION", message: "状态流转不合法", status: 409 }
    }
    if (/IMMUTABLE_FIELD/i.test(message)) {
      return { code: "FAILED_PRECONDITION", message: "不允许修改只读字段", status: 409 }
    }
    return { code: "FAILED_PRECONDITION", message: "业务校验失败", status: 409 }
  }

  return null
}

