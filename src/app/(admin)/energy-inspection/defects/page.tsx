import Link from "next/link"

import { Button } from "@/components/ui/button"

import {
  defectStatusLabel,
  mockDefects,
  mockDevices,
  mockInspections,
  type Defect,
} from "../_lib/mock-data"

function getSingleParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string
): string | undefined {
  const v = searchParams?.[key]
  if (typeof v === "string") return v
  if (Array.isArray(v)) return v[0]
  return undefined
}

function riskBadgeClass(risk: Defect["riskLevel"]): string {
  switch (risk) {
    case "I":
      return "bg-red-50 text-red-700 border-red-200"
    case "II":
      return "bg-orange-50 text-orange-700 border-orange-200"
    case "III":
      return "bg-amber-50 text-amber-800 border-amber-200"
    case "IV":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
  }
}

export default function DefectsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const deviceById = new Map(mockDevices.map((d) => [d.id, d]))
  const inspectionById = new Map(mockInspections.map((i) => [i.id, i]))
  const defectId = getSingleParam(searchParams, "defectId")
  const selected = defectId ? mockDefects.find((d) => d.id === defectId) : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">
            <Link href="/energy-inspection" className="hover:underline">
              能源巡检
            </Link>{" "}
            / 缺陷看板
          </div>
          <h1 className="text-2xl font-bold mt-1">缺陷看板</h1>
          <p className="text-slate-600 mt-2">
            展示缺陷候选、模型版本与多源证据（可见光/红外）。变化检测（ChangeFormer）本期仅前端占位。
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
            href="/energy-inspection/workcards"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            作业卡
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-950">
        <div className="font-medium">历史变化检测（ChangeFormer）：待接入 / 占位</div>
        <div className="mt-1 text-blue-950/90">
          本期后端不实现变化检测推理与结果回写；前端仅展示占位状态与预留字段。
          <span className="font-medium">
            {" "}
            该占位不参与自动升降级，不会影响当前风险分级结果。
          </span>
        </div>
      </div>

      {selected ? (
        <DefectDetail
          defect={selected}
          deviceName={deviceById.get(selected.deviceId)?.name ?? selected.deviceId}
          site={deviceById.get(selected.deviceId)?.site ?? "-"}
          room={deviceById.get(selected.deviceId)?.room ?? "-"}
          viewpoint={deviceById.get(selected.deviceId)?.viewpoint ?? "-"}
          inspectionSubmittedAt={
            inspectionById.get(selected.inspectionId)?.submittedAt ?? "-"
          }
        />
      ) : null}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="font-semibold">缺陷列表</div>
          <div className="text-sm text-slate-500">共 {mockDefects.length} 条</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-medium px-6 py-3">缺陷</th>
                <th className="text-left font-medium px-6 py-3">设备</th>
                <th className="text-left font-medium px-6 py-3">类型/置信度</th>
                <th className="text-left font-medium px-6 py-3">风险</th>
                <th className="text-left font-medium px-6 py-3">变化检测</th>
                <th className="text-left font-medium px-6 py-3">模型版本</th>
                <th className="text-right font-medium px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {mockDefects.map((d) => {
                const dev = deviceById.get(d.deviceId)
                return (
                  <tr key={d.id} className="border-t">
                    <td className="px-6 py-4">
                      <div className="font-medium">{d.title}</div>
                      <div className="text-slate-500 mt-1">
                        {d.id} · {defectStatusLabel(d.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{dev?.name ?? d.deviceId}</div>
                      <div className="text-slate-500 mt-1">
                        {dev?.site ?? "-"} / {dev?.room ?? "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{d.defectType}</div>
                      <div className="text-slate-500 mt-1 tabular-nums">
                        置信度：{Math.round(d.confidence * 100)}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium",
                          riskBadgeClass(d.riskLevel),
                        ].join(" ")}
                      >
                        风险 {d.riskLevel}
                      </span>
                      <div className="text-slate-500 mt-1 text-xs">
                        规则集：risk-ruleset@v0.1.0（占位）
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {d.changeDetection.status === "not_integrated"
                          ? "待接入/占位"
                          : d.changeDetection.status}
                      </div>
                      <div className="text-slate-500 mt-1 text-xs">
                        不参与分级
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{d.modelVersion}</div>
                      <div className="text-slate-500 mt-1 text-xs">
                        输入哈希：待接入（占位）
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/energy-inspection/defects?defectId=${d.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        查看
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DefectDetail({
  defect,
  deviceName,
  site,
  room,
  viewpoint,
  inspectionSubmittedAt,
}: {
  defect: Defect
  deviceName: string
  site: string
  room: string
  viewpoint: string
  inspectionSubmittedAt: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">缺陷详情</div>
          <h2 className="text-xl font-bold mt-1">{defect.title}</h2>
          <div className="text-slate-600 mt-2 text-sm">
            {defect.id} · {defectStatusLabel(defect.status)} · 回传时间：
            {inspectionSubmittedAt}
          </div>
        </div>
        <div className="flex gap-2">
          <Button disabled variant="outline">
            确认缺陷（占位）
          </Button>
          <Button disabled variant="outline">
            驳回（占位）
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-slate-500">设备</div>
          <div className="font-medium mt-1">{deviceName}</div>
          <div className="text-sm text-slate-600 mt-1">
            {site} / {room}
          </div>
          <div className="text-sm text-slate-600 mt-1">视角：{viewpoint}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-slate-500">检测结果</div>
          <div className="font-medium mt-1">{defect.defectType}</div>
          <div className="text-sm text-slate-600 mt-1 tabular-nums">
            置信度：{Math.round(defect.confidence * 100)}%
          </div>
          <div className="text-sm text-slate-600 mt-1">模型：{defect.modelVersion}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-slate-500">风险分级</div>
          <div className="font-medium mt-1">风险 {defect.riskLevel}</div>
          <div className="text-sm text-slate-600 mt-1">
            依据：risk-ruleset@v0.1.0（占位）
          </div>
          <div className="text-xs text-slate-500 mt-2">
            变化检测占位不参与升降级
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">证据（可见光）</div>
            <span className="text-xs text-slate-500">占位</span>
          </div>
          <div className="mt-2 text-sm text-slate-600 break-all">
            {defect.evidence.visibleRef ?? "未提供"}
          </div>
          <div className="mt-3 rounded-md bg-slate-50 border border-dashed p-6 text-center text-slate-500 text-sm">
            证据图片预览区（占位）
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">证据（红外）</div>
            <span className="text-xs text-slate-500">占位</span>
          </div>
          <div className="mt-2 text-sm text-slate-600 break-all">
            {defect.evidence.infraredRef ?? "未提供"}
          </div>
          <div className="mt-3 rounded-md bg-slate-50 border border-dashed p-6 text-center text-slate-500 text-sm">
            红外图片/热像预览区（占位）
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border p-4 bg-slate-50">
        <div className="font-medium">历史变化检测（ChangeFormer）</div>
        <div className="text-sm text-slate-700 mt-1">
          状态：<span className="font-medium">待接入/占位</span>（not_integrated）
        </div>
        <div className="text-sm text-slate-700 mt-1">
          说明：本期不触发变化检测任务、不回写结果；未来接入后将展示“历史-当前素材对 + 变化区域 overlay +
          skipReason”。
        </div>
        <div className="text-sm text-slate-700 mt-1 font-medium">
          当前占位不会影响风险分级，也不会改变闭环流程。
        </div>
      </div>
    </div>
  )
}
