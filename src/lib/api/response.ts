import { createTraceId } from "@/lib/api/trace"

/**
 * 返回标准成功 JSON 响应。
 */
export function jsonOk(data: unknown, init?: number | ResponseInit): Response {
  const resInit: ResponseInit =
    typeof init === "number" ? { status: init } : init ?? { status: 200 }

  return Response.json(data, resInit)
}

/**
 * 返回标准错误 JSON 响应（包含 traceId）。
 */
export function jsonError(
  code: string,
  message: string,
  status: number,
  traceId?: string
): Response {
  const t = traceId ?? createTraceId()
  return Response.json(
    { error: { code, message, trace_id: t } },
    { status }
  )
}
