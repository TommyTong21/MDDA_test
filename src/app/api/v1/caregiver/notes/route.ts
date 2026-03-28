import { getAuthUser } from "@/lib/api/auth"
import { jsonError, jsonOk } from "@/lib/api/response"
import { safeJson } from "@/lib/api/safeJson"
import { createTraceId } from "@/lib/api/trace"
import { createCareNote, listCareNotes } from "@/lib/caregiver/dal"
import { createClient } from "@/lib/supabase/server"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/**
 * GET/POST /api/v1/caregiver/notes
 */
export async function GET(request: Request): Promise<Response> {
  const traceId = createTraceId()
  const db = await createClient()
  const user = await getAuthUser(db)
  if (!user) return jsonError("UNAUTHORIZED", "未登录", 401, traceId)

  const url = new URL(request.url)
  const residentId = url.searchParams.get("resident_id") ?? undefined
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "20"), 1), 100)

  try {
    const notes = await listCareNotes(db, { residentId, limit })
    return jsonOk({ notes }, 200)
  } catch {
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

  if (typeof residentId !== "string" || residentId.length === 0) {
    return jsonError("INVALID_ARGUMENT", "resident_id 必填", 400, traceId)
  }
  if (typeof contentRaw !== "string" || contentRaw.length === 0) {
    return jsonError("INVALID_ARGUMENT", "content_raw 必填", 400, traceId)
  }

  const structured: Record<string, unknown> | null =
    contentStructured === undefined || contentStructured === null
      ? null
      : isRecord(contentStructured)
        ? contentStructured
        : null

  try {
    const note = await createCareNote(db, {
      residentId,
      authorId: user.id,
      contentRaw,
      contentStructured: structured,
    })
    return jsonOk(note, 201)
  } catch {
    return jsonError("INTERNAL", "创建记录失败", 500, traceId)
  }
}

