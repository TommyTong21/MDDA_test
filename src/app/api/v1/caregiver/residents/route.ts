import { getAuthUser } from "@/lib/api/auth"
import { mapSupabaseError } from "@/lib/api/errorMapping"
import { jsonError, jsonOk } from "@/lib/api/response"
import { createTraceId } from "@/lib/api/trace"
import { parseIntParam } from "@/lib/api/validators"
import { listResidents } from "@/lib/caregiver/dal"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/v1/caregiver/residents
 */
export async function GET(request: Request): Promise<Response> {
  const traceId = createTraceId()
  const db = await createClient()
  const user = await getAuthUser(db)
  if (!user) return jsonError("UNAUTHORIZED", "未登录", 401, traceId)

  const url = new URL(request.url)
  const limit = parseIntParam(url.searchParams, "limit", 50, { min: 1, max: 100 })

  try {
    const residents = await listResidents(db, limit)
    return jsonOk({ residents }, 200, traceId)
  } catch (err) {
    console.error("GET /api/v1/caregiver/residents failed", { traceId, err })
    const mapped = mapSupabaseError(err)
    if (mapped) return jsonError(mapped.code, mapped.message, mapped.status, traceId)
    return jsonError("INTERNAL", "读取老人列表失败", 500, traceId)
  }
}
