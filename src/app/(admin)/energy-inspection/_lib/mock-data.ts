export type InspectionStatus =
  | "collected"
  | "uploaded_pending_detection"
  | "detected_pending_review"
  | "confirmed_pending_workcard"
  | "workcard_pending_approval"
  | "executing"
  | "closed"

export type RiskLevel = "I" | "II" | "III" | "IV"

export type DefectStatus =
  | "candidate"
  | "confirmed"
  | "rejected"
  | "fixed_pending_review"
  | "closed"

export type WorkcardStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "executing"
  | "closed"

export type Modality = "visible" | "infrared" | "video"

export type ChangeDetectionStatus = "not_integrated" | "skipped" | "ready"

export type ChangeDetection = {
  status: ChangeDetectionStatus
  skipReason?: "baseline_missing" | "viewpoint_mismatch" | "alignment_failed"
  overlays?: Array<{ kind: "mask" | "heatmap" | "box"; ref: string }>
}

export type Device = {
  id: string
  name: string
  site: string
  room: string
  viewpoint: string
}

export type MediaAsset = {
  id: string
  modality: Modality
  filename: string
  sha256: string
  capturedAt: string
}

export type Inspection = {
  id: string
  taskId: string
  deviceId: string
  inspectorName: string
  submittedAt: string
  status: InspectionStatus
  media: MediaAsset[]
}

export type Defect = {
  id: string
  inspectionId: string
  deviceId: string
  title: string
  defectType: string
  confidence: number
  riskLevel: RiskLevel
  status: DefectStatus
  modelVersion: string
  changeDetection: ChangeDetection
  evidence: {
    visibleRef?: string
    infraredRef?: string
  }
}

export type Workcard = {
  id: string
  defectId: string
  deviceId: string
  riskLevel: RiskLevel
  status: WorkcardStatus
  templateVersion: string
  approvals: Array<{
    role: "主管" | "安监" | "专责"
    status: "pending" | "approved" | "rejected"
    by?: string
    at?: string
  }>
}

export function inspectionStatusLabel(status: InspectionStatus): string {
  switch (status) {
    case "collected":
      return "已采集"
    case "uploaded_pending_detection":
      return "已回传（待检测）"
    case "detected_pending_review":
      return "已检测（待复核）"
    case "confirmed_pending_workcard":
      return "已确认（待票据）"
    case "workcard_pending_approval":
      return "已生成作业卡（待审批）"
    case "executing":
      return "执行中"
    case "closed":
      return "已闭环"
  }
}

export function defectStatusLabel(status: DefectStatus): string {
  switch (status) {
    case "candidate":
      return "候选（待确认）"
    case "confirmed":
      return "已确认"
    case "rejected":
      return "已驳回"
    case "fixed_pending_review":
      return "整改完成（待复核）"
    case "closed":
      return "已闭环"
  }
}

export function workcardStatusLabel(status: WorkcardStatus): string {
  switch (status) {
    case "draft":
      return "草稿"
    case "submitted":
      return "已提交（待审批）"
    case "approved":
      return "已审批通过"
    case "rejected":
      return "已驳回"
    case "executing":
      return "执行中"
    case "closed":
      return "已归档"
  }
}

export const mockDevices: Device[] = [
  {
    id: "dev-001",
    name: "10kV 开关柜 #3",
    site: "南苑变电站",
    room: "配电房 A",
    viewpoint: "正面-柜门",
  },
  {
    id: "dev-002",
    name: "10kV 电缆终端 #1",
    site: "南苑变电站",
    room: "配电房 A",
    viewpoint: "侧面-接头",
  },
  {
    id: "dev-003",
    name: "低压配电箱 #7",
    site: "东城站",
    room: "配电房 B",
    viewpoint: "正面-面板",
  },
]

export const mockInspections: Inspection[] = [
  {
    id: "insp-20260326-001",
    taskId: "task-20260326-ny-001",
    deviceId: "dev-001",
    inspectorName: "张三",
    submittedAt: "2026-03-26 09:18",
    status: "uploaded_pending_detection",
    media: [
      {
        id: "media-001-v",
        modality: "visible",
        filename: "dev-001_visible.jpg",
        sha256: "6f3a...mock",
        capturedAt: "2026-03-26 09:05",
      },
      {
        id: "media-001-ir",
        modality: "infrared",
        filename: "dev-001_infrared.jpg",
        sha256: "a91b...mock",
        capturedAt: "2026-03-26 09:06",
      },
    ],
  },
  {
    id: "insp-20260326-002",
    taskId: "task-20260326-ny-002",
    deviceId: "dev-002",
    inspectorName: "李四",
    submittedAt: "2026-03-26 10:02",
    status: "detected_pending_review",
    media: [
      {
        id: "media-002-v",
        modality: "visible",
        filename: "dev-002_visible.jpg",
        sha256: "2c0d...mock",
        capturedAt: "2026-03-26 09:55",
      },
      {
        id: "media-002-ir",
        modality: "infrared",
        filename: "dev-002_infrared.jpg",
        sha256: "f0d1...mock",
        capturedAt: "2026-03-26 09:56",
      },
    ],
  },
  {
    id: "insp-20260325-017",
    taskId: "task-20260325-ny-017",
    deviceId: "dev-003",
    inspectorName: "王五",
    submittedAt: "2026-03-25 16:40",
    status: "workcard_pending_approval",
    media: [
      {
        id: "media-003-v",
        modality: "visible",
        filename: "dev-003_visible.jpg",
        sha256: "90aa...mock",
        capturedAt: "2026-03-25 16:25",
      },
    ],
  },
]

export const mockDefects: Defect[] = [
  {
    id: "def-001",
    inspectionId: "insp-20260326-002",
    deviceId: "dev-002",
    title: "电缆接头疑似过热",
    defectType: "过热",
    confidence: 0.83,
    riskLevel: "II",
    status: "candidate",
    modelVersion: "defect-detector@v0.3.1",
    changeDetection: { status: "not_integrated" },
    evidence: {
      visibleRef: "evidence://snapshots/def-001-visible.png",
      infraredRef: "evidence://snapshots/def-001-ir.png",
    },
  },
  {
    id: "def-002",
    inspectionId: "insp-20260325-017",
    deviceId: "dev-003",
    title: "箱体门缝积尘/异物",
    defectType: "异物/积尘",
    confidence: 0.62,
    riskLevel: "III",
    status: "confirmed",
    modelVersion: "defect-detector@v0.3.1",
    changeDetection: { status: "not_integrated" },
    evidence: {
      visibleRef: "evidence://snapshots/def-002-visible.png",
    },
  },
]

export const mockWorkcards: Workcard[] = [
  {
    id: "wc-20260326-001",
    defectId: "def-002",
    deviceId: "dev-003",
    riskLevel: "III",
    status: "submitted",
    templateVersion: "workcard-template@v0.2.0",
    approvals: [
      { role: "主管", status: "approved", by: "赵主管", at: "2026-03-26 08:40" },
      { role: "安监", status: "pending" },
      { role: "专责", status: "pending" },
    ],
  },
]
