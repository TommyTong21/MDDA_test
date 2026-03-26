import Link from "next/link"

import {
  mockDefects,
  mockInspections,
  mockWorkcards,
} from "./_lib/mock-data"

export default function EnergyInspectionAdminEntryPage() {
  const pendingDetection = mockInspections.filter(
    (i) => i.status === "uploaded_pending_detection"
  ).length
  const pendingReview = mockInspections.filter(
    (i) => i.status === "detected_pending_review"
  ).length
  const defectCandidates = mockDefects.filter((d) => d.status === "candidate").length
  const workcardsPending = mockWorkcards.filter((w) => w.status === "submitted").length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">能源巡检</h1>
          <p className="text-slate-600 mt-2">
            缺陷检测 → 风险分级 → 自动作业卡 → 闭环复核（Phase 1：前端真实页面 + Mock
            数据）。
          </p>
          <p className="text-slate-600 mt-1">
            历史变化检测（ChangeFormer）：本期不接后端，仅展示占位状态；不会影响风险分级。
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/energy-inspection/inspections"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            巡检记录
          </Link>
          <Link
            href="/energy-inspection/defects"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            缺陷看板
          </Link>
          <Link
            href="/energy-inspection/workcards"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            作业卡
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-slate-500">已回传（待检测）</div>
          <div className="text-3xl font-bold mt-2">{pendingDetection}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-slate-500">已检测（待复核）</div>
          <div className="text-3xl font-bold mt-2">{pendingReview}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-slate-500">缺陷候选（待确认）</div>
          <div className="text-3xl font-bold mt-2">{defectCandidates}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-slate-500">作业卡（待审批）</div>
          <div className="text-3xl font-bold mt-2">{workcardsPending}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold">快速开始</h2>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Link
            href="/energy-inspection/inspections"
            className="rounded-lg border p-4 hover:bg-slate-50 transition"
          >
            <div className="font-medium">巡检记录</div>
            <div className="text-sm text-slate-600 mt-1">
              查看回传、检测、复核、闭环的状态机流转。
            </div>
          </Link>
          <Link
            href="/energy-inspection/defects"
            className="rounded-lg border p-4 hover:bg-slate-50 transition"
          >
            <div className="font-medium">缺陷看板</div>
            <div className="text-sm text-slate-600 mt-1">
              多源证据（可见光/红外）+ 模型版本；ChangeFormer 占位态清晰可见。
            </div>
          </Link>
          <Link
            href="/energy-inspection/workcards"
            className="rounded-lg border p-4 hover:bg-slate-50 transition"
          >
            <div className="font-medium">作业卡</div>
            <div className="text-sm text-slate-600 mt-1">
              模板版本化 + 线性审批链 MVP（可审计可回放）。
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
