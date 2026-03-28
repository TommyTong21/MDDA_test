import { createClient } from "@/lib/supabase/server"
import type { CareNote, Handoff, Incident, IncidentStatus, IncidentType, Resident, ShiftType } from "@/lib/caregiver/types"

type DbClient = Awaited<ReturnType<typeof createClient>>

/**
 * 列出护工可见的老人列表（MVP：按站点范围简化为 authenticated 可见）。
 */
export async function listResidents(db: DbClient, limit: number): Promise<Resident[]> {
  const { data, error } = await db
    .from("residents")
    .select("id,name,bed_no,care_level")
    .order("bed_no", { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Resident[]
}

/**
 * 创建一条护工记录。
 */
export async function createCareNote(
  db: DbClient,
  input: { residentId: string; authorId: string; contentRaw: string; contentStructured: Record<string, unknown> | null }
): Promise<CareNote> {
  const { data, error } = await db
    .from("care_notes")
    .insert({
      resident_id: input.residentId,
      author_id: input.authorId,
      content_raw: input.contentRaw,
      content_structured: input.contentStructured,
    })
    .select("id,resident_id,author_id,content_raw,content_structured,created_at")
    .single()

  if (error) throw error
  return data as CareNote
}

/**
 * 查询护工记录列表。
 */
export async function listCareNotes(
  db: DbClient,
  input: { residentId?: string; limit: number }
): Promise<CareNote[]> {
  let q = db
    .from("care_notes")
    .select("id,resident_id,author_id,content_raw,content_structured,created_at")
    .order("created_at", { ascending: false })
    .limit(input.limit)

  if (input.residentId) q = q.eq("resident_id", input.residentId)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as CareNote[]
}

/**
 * 创建紧急上报事件。
 */
export async function createIncident(
  db: DbClient,
  input: { residentId: string; reporterId: string; type: IncidentType; description: string | null }
): Promise<Incident> {
  const { data, error } = await db
    .from("incidents")
    .insert({
      resident_id: input.residentId,
      reporter_id: input.reporterId,
      type: input.type,
      description: input.description,
    })
    .select("id,resident_id,reporter_id,type,status,description,created_at")
    .single()

  if (error) throw error
  return data as Incident
}

/**
 * 查询紧急上报事件列表。
 */
export async function listIncidents(
  db: DbClient,
  input: { residentId?: string; status?: IncidentStatus; limit: number }
): Promise<Incident[]> {
  let q = db
    .from("incidents")
    .select("id,resident_id,reporter_id,type,status,description,created_at")
    .order("created_at", { ascending: false })
    .limit(input.limit)

  if (input.residentId) q = q.eq("resident_id", input.residentId)
  if (input.status) q = q.eq("status", input.status)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Incident[]
}

/**
 * 更新事件状态（MVP：最小闭环）。
 */
export async function updateIncidentStatus(
  db: DbClient,
  input: { incidentId: string; status: IncidentStatus }
): Promise<Incident | null> {
  const { data, error } = await db
    .from("incidents")
    .update({ status: input.status })
    .eq("id", input.incidentId)
    .select("id,resident_id,reporter_id,type,status,description,created_at")
    .maybeSingle()

  if (error) throw error
  return (data ?? null) as Incident | null
}

/**
 * 创建交接记录。
 */
export async function createHandoff(
  db: DbClient,
  input: { authorId: string; shiftDate: string; shiftType: ShiftType; summary: string }
): Promise<Handoff> {
  const { data, error } = await db
    .from("handoffs")
    .insert({
      author_id: input.authorId,
      shift_date: input.shiftDate,
      shift_type: input.shiftType,
      summary: input.summary,
    })
    .select("id,author_id,shift_date,shift_type,summary,created_at")
    .single()

  if (error) throw error
  return data as Handoff
}

/**
 * 查询交接记录列表。
 */
export async function listHandoffs(
  db: DbClient,
  input: { shiftDate?: string; shiftType?: ShiftType; limit: number }
): Promise<Handoff[]> {
  let q = db
    .from("handoffs")
    .select("id,author_id,shift_date,shift_type,summary,created_at")
    .order("created_at", { ascending: false })
    .limit(input.limit)

  if (input.shiftDate) q = q.eq("shift_date", input.shiftDate)
  if (input.shiftType) q = q.eq("shift_type", input.shiftType)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Handoff[]
}

