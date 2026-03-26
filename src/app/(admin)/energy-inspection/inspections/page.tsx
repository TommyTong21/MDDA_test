import Link from "next/link"

import {
  inspectionStatusLabel,
  mockDevices,
  mockInspections,
} from "../_lib/mock-data"

export default function InspectionsPage() {
  const deviceById = new Map(mockDevices.map((d) => [d.id, d]))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">
            <Link href="/energy-inspection" className="hover:underline">
              能源巡检
            </Link>{" "}
            / 巡检记录
          </div>
          <h1 className="text-2xl font-bold mt-1">巡检记录</h1>
          <p className="text-slate-600 mt-2">
            当前页面使用 Mock 数据模拟“回传入队→异步缺陷检测→复核闭环”的流程状态（不依赖 Supabase
            环境变量）。
          </p>
        </div>
        <Link
          href="/energy-inspection/defects"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          去处理缺陷
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="font-semibold">记录列表</div>
          <div className="text-sm text-slate-500">
            共 {mockInspections.length} 条
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-medium px-6 py-3">巡检单</th>
                <th className="text-left font-medium px-6 py-3">站点/房间</th>
                <th className="text-left font-medium px-6 py-3">设备</th>
                <th className="text-left font-medium px-6 py-3">回传</th>
                <th className="text-left font-medium px-6 py-3">状态</th>
                <th className="text-right font-medium px-6 py-3">素材</th>
              </tr>
            </thead>
            <tbody>
              {mockInspections.map((insp) => {
                const dev = deviceById.get(insp.deviceId)
                return (
                  <tr key={insp.id} className="border-t">
                    <td className="px-6 py-4">
                      <div className="font-medium">{insp.id}</div>
                      <div className="text-slate-500 mt-1">
                        任务：{insp.taskId} · 巡检员：{insp.inspectorName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{dev?.site ?? "-"}</div>
                      <div className="text-slate-500 mt-1">{dev?.room ?? "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{dev?.name ?? insp.deviceId}</div>
                      <div className="text-slate-500 mt-1">
                        视角：{dev?.viewpoint ?? "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">{insp.submittedAt}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {inspectionStatusLabel(insp.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums">
                      {insp.media.length}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
        <div className="font-medium">说明</div>
        <div className="mt-1 text-amber-900/90">
          检测链路按 ADR 选择“上传/入库在线完成 + 缺陷检测异步化”；本仓库页面仅实现前端占位与状态展示，
          不触发真实入队/推理。
        </div>
      </div>
    </div>
  )
}
