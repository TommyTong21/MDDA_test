export type IncidentStatus = "open" | "acknowledged" | "resolved" | "archived"

export type IncidentType = "fall" | "fever" | "refusal" | "breathing" | "vitals" | "other"

export type ShiftType = "day" | "night"

export interface Resident {
  id: string
  name: string
  bed_no: string
  care_level: string
}

export interface CareNote {
  id: string
  resident_id: string
  author_id: string
  content_raw: string
  content_structured: Record<string, unknown> | null
  created_at: string
}

export interface Incident {
  id: string
  resident_id: string
  reporter_id: string
  type: IncidentType
  status: IncidentStatus
  description: string | null
  created_at: string
}

export interface Handoff {
  id: string
  author_id: string
  shift_date: string
  shift_type: ShiftType
  summary: string
  created_at: string
}

