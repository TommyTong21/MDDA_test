import { getAuthUser } from "@/lib/api/auth"
import { mapSupabaseError } from "@/lib/api/errorMapping"
import { jsonError, jsonOk } from "@/lib/api/response"
import { safeJson } from "@/lib/api/safeJson"
import { createTraceId } from "@/lib/api/trace"
import { isRecord, isUuid } from "@/lib/api/validators"
import { updateIncidentStatus } from "@/lib/caregiver/dal"
import type { IncidentStatus } from "@/lib/caregiver/types"
import { createClient } from "@/lib/supabase/server"

const incidentStatuses: readonly IncidentStatus[] = ["open", "acknowledged", "resolved", "archived"] as const

function isIncidentStatus(value: unknown): value is IncidentStatus {
  return typeof value === "string" && (incidentStatuses as readonly string[]).includes(value)
}

/**
 * PATCH /api/v1/caregiver/incidents/{incident_id}
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ incident_id: string }> }
): Promise<Response> {
  const traceId = createTraceId()
  const db = await createClient()
  const user = await getAuthUser(db)
  if (!user) return jsonError("UNAUTHORIZED", "未登录", 401, traceId)

  const { incident_id: incidentId } = await params
  if (!isUuid(incidentId)) return jsonError("INVALID_ARGUMENT", "incident_id 必须是 UUID", 400, traceId)

  const bodyRes = await safeJson<unknown>(request)
  if (!bodyRes.ok) return jsonError(bodyRes.error.code, bodyRes.error.message, 400, traceId)
  if (!isRecord(bodyRes.data)) return jsonError("INVALID_ARGUMENT", "请求体必须是对象", 400, traceId)

  const status = bodyRes.data.status
  if (!isIncidentStatus(status)) return jsonError("INVALID_ARGUMENT", "status 不合法", 400, traceId)

  try {
    const incident = await updateIncidentStatus(db, { incidentId, status })
    if (!incident) return jsonError("NOT_FOUND", "事件不存在", 404, traceId)
    return jsonOk(incident, 200, traceId)
  } catch (err) {
    console.error("PATCH /api/v1/caregiver/incidents/{incident_id} failed", { traceId, err })
    const mapped = mapSupabaseError(err)
    if (mapped) return jsonError(mapped.code, mapped.message, mapped.status, traceId)
    return jsonError("INTERNAL", "更新事件失败", 500, traceId)
  }
}
