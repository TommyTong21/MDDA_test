import { getAuthUser } from "@/lib/api/auth"
import { mapSupabaseError } from "@/lib/api/errorMapping"
import { jsonError, jsonOk } from "@/lib/api/response"
import { safeJson } from "@/lib/api/safeJson"
import { createTraceId } from "@/lib/api/trace"
import { isRecord, isUuid, parseIntParam } from "@/lib/api/validators"
import { createCareNote, listCareNotes } from "@/lib/caregiver/dal"
import { createClient } from "@/lib/supabase/server"

/**
 * GET/POST /api/v1/caregiver/notes
 */
export async function GET(request: Request): Promise<Response> {
  const traceId = createTraceId()
  const db = await createClient()
  const user = await getAuthUser(db)
  if (!user) return jsonError("UNAUTHORIZED", "未登录", 401, traceId)

  const url = new URL(request.url)
  const residentIdRaw = url.searchParams.get("resident_id") ?? undefined
  const limit = parseIntParam(url.searchParams, "limit", 20, { min: 1, max: 100 })

  if (residentIdRaw !== undefined && !isUuid(residentIdRaw)) {
    return jsonError("INVALID_ARGUMENT", "resident_id 必须是 UUID", 400, traceId)
  }

  try {
    const notes = await listCareNotes(db, { residentId: residentIdRaw, limit })
    return jsonOk({ notes }, 200, traceId)
  } catch (err) {
    console.error("GET /api/v1/caregiver/notes failed", { traceId, err })
    const mapped = mapSupabaseError(err)
    if (mapped) return jsonError(mapped.code, mapped.message, mapped.status, traceId)
    return jsonError("INTERNAL", "查询记录失败", 500, traceId)
  }
}

/**
 * POST /api/v1/caregiver/notes
 */
export async function POST(request: Request): Promise<Response> {
  const traceId = createTraceId()
  const db = await createClient()
  const user = await getAuthUser(db)
  if (!user) return jsonError("UNAUTHORIZED", "未登录", 401, traceId)

  const bodyRes = await safeJson<unknown>(request)
  if (!bodyRes.ok) return jsonError(bodyRes.error.code, bodyRes.error.message, 400, traceId)

  if (!isRecord(bodyRes.data)) return jsonError("INVALID_ARGUMENT", "请求体必须是对象", 400, traceId)

  const residentId = bodyRes.data.resident_id
  const contentRaw = bodyRes.data.content_raw
  const contentStructured = bodyRes.data.content_structured

  if (!isUuid(residentId)) {
    return jsonError("INVALID_ARGUMENT", "resident_id 必须是 UUID", 400, traceId)
  }
  if (typeof contentRaw !== "string" || contentRaw.length === 0) {
    return jsonError("INVALID_ARGUMENT", "content_raw 必填", 400, traceId)
  }
  if (contentRaw.length > 4000) {
    return jsonError("INVALID_ARGUMENT", "content_raw 过长（最多 4000 字符）", 400, traceId)
  }

  if (contentStructured !== undefined && contentStructured !== null && !isRecord(contentStructured)) {
    return jsonError("INVALID_ARGUMENT", "content_structured 必须是对象", 400, traceId)
  }
  const structured: Record<string, unknown> | null =
    contentStructured === undefined || contentStructured === null ? null : contentStructured

  try {
    const note = await createCareNote(db, {
      residentId,
      authorId: user.id,
      contentRaw,
      contentStructured: structured,
    })
    return jsonOk(note, 201, traceId)
  } catch (err) {
    console.error("POST /api/v1/caregiver/notes failed", { traceId, err })
    const mapped = mapSupabaseError(err)
    if (mapped) return jsonError(mapped.code, mapped.message, mapped.status, traceId)
    return jsonError("INTERNAL", "创建记录失败", 500, traceId)
  }
}
