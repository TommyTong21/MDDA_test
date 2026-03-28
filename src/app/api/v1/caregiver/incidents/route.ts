import { getAuthUser } from "@/lib/api/auth"
import { jsonError, jsonOk } from "@/lib/api/response"
import { safeJson } from "@/lib/api/safeJson"
import { createTraceId } from "@/lib/api/trace"
import { createIncident, listIncidents } from "@/lib/caregiver/dal"
import type { IncidentStatus, IncidentType } from "@/lib/caregiver/types"
import { createClient } from "@/lib/supabase/server"

const incidentTypes: readonly IncidentType[] = ["fall", "fever", "refusal", "breathing", "vitals", "other"] as const
const incidentStatuses: readonly IncidentStatus[] = ["open", "acknowledged", "resolved", "archived"] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isIncidentType(value: unknown): value is IncidentType {
  return typeof value === "string" && (incidentTypes as readonly string[]).includes(value)
}

function isIncidentStatus(value: unknown): value is IncidentStatus {
  return typeof value === "string" && (incidentStatuses as readonly string[]).includes(value)
}

/**
 * GET/POST /api/v1/caregiver/incidents
 */
export async function GET(request: Request): Promise<Response> {
  const traceId = createTraceId()
  const db = await createClient()
  const user = await getAuthUser(db)
  if (!user) return jsonError("UNAUTHORIZED", "未登录", 401, traceId)

  const url = new URL(request.url)
  const residentId = url.searchParams.get("resident_id") ?? undefined
  const statusRaw = url.searchParams.get("status") ?? undefined
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "20"), 1), 100)

  if (statusRaw !== undefined && !isIncidentStatus(statusRaw)) {
    return jsonError("INVALID_ARGUMENT", "status 不合法", 400, traceId)
  }

  try {
    const incidents = await listIncidents(db, {
      residentId,
      status: statusRaw,
      limit,
    })
    return jsonOk({ incidents }, 200)
  } catch {
    return jsonError("INTERNAL", "查询事件失败", 500, traceId)
  }
}

/**
 * POST /api/v1/caregiver/incidents
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
  const type = bodyRes.data.type
  const description = bodyRes.data.description

  if (typeof residentId !== "string" || residentId.length === 0) {
    return jsonError("INVALID_ARGUMENT", "resident_id 必填", 400, traceId)
  }
  if (!isIncidentType(type)) {
    return jsonError("INVALID_ARGUMENT", "type 不合法", 400, traceId)
  }
  if (description !== undefined && description !== null && typeof description !== "string") {
    return jsonError("INVALID_ARGUMENT", "description 必须是字符串", 400, traceId)
  }

  try {
    const incident = await createIncident(db, {
      residentId,
      reporterId: user.id,
      type,
      description: typeof description === "string" ? description : null,
    })
    return jsonOk(incident, 201)
  } catch {
    return jsonError("INTERNAL", "创建事件失败", 500, traceId)
  }
}

