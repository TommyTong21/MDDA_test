/**
 * 生成用于端到端排障的 traceId。
 */
export function createTraceId(): string {
  return globalThis.crypto.randomUUID()
}

