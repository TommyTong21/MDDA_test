import { getAuthUser } from "@/lib/api/auth"
import { mapSupabaseError } from "@/lib/api/errorMapping"
import { jsonError, jsonOk } from "@/lib/api/response"
import { safeJson } from "@/lib/api/safeJson"
import { createTraceId } from "@/lib/api/trace"
import { isIsoDate, isRecord, parseIntParam } from "@/lib/api/validators"
import { createHandoff, listHandoffs } from "@/lib/caregiver/dal"
import type { ShiftType } from "@/lib/caregiver/types"
import { createClient } from "@/lib/supabase/server"

const shiftTypes: readonly ShiftType[] = ["day", "night"] as const

function isShiftType(value: unknown): value is ShiftType {
  return typeof value === "string" && (shiftTypes as readonly string[]).includes(value)
}

/**
 * GET/POST /api/v1/caregiver/handoffs
 */
export async function GET(request: Request): Promise<Response> {
  const traceId = createTraceId()
  const db = await createClient()
  const user = await getAuthUser(db)
  if (!user) return jsonError("UNAUTHORIZED", "未登录", 401, traceId)

  const url = new URL(request.url)
  const shiftDate = url.searchParams.get("shift_date") ?? undefined
  const shiftTypeRaw = url.searchParams.get("shift_type") ?? undefined
  const limit = parseIntParam(url.searchParams, "limit", 20, { min: 1, max: 100 })

  if (shiftDate !== undefined && !isIsoDate(shiftDate)) {
    return jsonError("INVALID_ARGUMENT", "shift_date 必须是 YYYY-MM-DD", 400, traceId)
  }
  if (shiftTypeRaw !== undefined && !isShiftType(shiftTypeRaw)) {
    return jsonError("INVALID_ARGUMENT", "shift_type 不合法", 400, traceId)
  }

  try {
    const handoffs = await listHandoffs(db, {
      shiftDate,
      shiftType: shiftTypeRaw,
      limit,
    })
    return jsonOk({ handoffs }, 200, traceId)
  } catch (err) {
    console.error("GET /api/v1/caregiver/handoffs failed", { traceId, err })
    const mapped = mapSupabaseError(err)
    if (mapped) return jsonError(mapped.code, mapped.message, mapped.status, traceId)
    return jsonError("INTERNAL", "查询交接失败", 500, traceId)
  }
}

/**
 * POST /api/v1/caregiver/handoffs
 */
export async function POST(request: Request): Promise<Response> {
  const traceId = createTraceId()
  const db = await createClient()
  const user = await getAuthUser(db)
  if (!user) return jsonError("UNAUTHORIZED", "未登录", 401, traceId)

  const bodyRes = await safeJson<unknown>(request)
  if (!bodyRes.ok) return jsonError(bodyRes.error.code, bodyRes.error.message, 400, traceId)
  if (!isRecord(bodyRes.data)) return jsonError("INVALID_ARGUMENT", "请求体必须是对象", 400, traceId)

  const shiftDate = bodyRes.data.shift_date
  const shiftType = bodyRes.data.shift_type
  const summary = bodyRes.data.summary

  if (!isIsoDate(shiftDate)) {
    return jsonError("INVALID_ARGUMENT", "shift_date 必须是 YYYY-MM-DD", 400, traceId)
  }
  if (!isShiftType(shiftType)) {
    return jsonError("INVALID_ARGUMENT", "shift_type 不合法", 400, traceId)
  }
  if (typeof summary !== "string" || summary.length === 0) {
    return jsonError("INVALID_ARGUMENT", "summary 必填", 400, traceId)
  }
  if (summary.length > 4000) {
    return jsonError("INVALID_ARGUMENT", "summary 过长（最多 4000 字符）", 400, traceId)
  }

  try {
    const handoff = await createHandoff(db, {
      authorId: user.id,
      shiftDate,
      shiftType,
      summary,
    })
    return jsonOk(handoff, 201, traceId)
  } catch (err) {
    console.error("POST /api/v1/caregiver/handoffs failed", { traceId, err })
    const mapped = mapSupabaseError(err)
    if (mapped) return jsonError(mapped.code, mapped.message, mapped.status, traceId)
    return jsonError("INTERNAL", "创建交接失败", 500, traceId)
  }
}
