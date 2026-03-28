import { getAuthUser } from "@/lib/api/auth"
import { jsonError, jsonOk } from "@/lib/api/response"
import { createTraceId } from "@/lib/api/trace"
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
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "50"), 1), 100)

  try {
    const residents = await listResidents(db, limit)
    return jsonOk({ residents }, 200)
  } catch {
    return jsonError("INTERNAL", "读取老人列表失败", 500, traceId)
  }
}

