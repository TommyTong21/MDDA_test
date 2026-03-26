import Link from "next/link"

import { Button } from "@/components/ui/button"

import {
  mockDefects,
  mockDevices,
  mockWorkcards,
  workcardStatusLabel,
} from "../_lib/mock-data"

export default function WorkcardsPage() {
  const deviceById = new Map(mockDevices.map((d) => [d.id, d]))
  const defectById = new Map(mockDefects.map((d) => [d.id, d]))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">
            <Link href="/energy-inspection" className="hover:underline">
              能源巡检
            </Link>{" "}
            / 作业卡
          </div>
          <h1 className="text-2xl font-bold mt-1">作业卡</h1>
          <p className="text-slate-600 mt-2">
            从“已确认缺陷”生成作业卡草稿并走审批流（本页为占位 UI；审批与签署链路未来接后端）。
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/energy-inspection/defects"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            返回缺陷看板
          </Link>
          <Button disabled>生成作业卡（占位）</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="font-semibold">作业卡列表</div>
          <div className="text-sm text-slate-500">共 {mockWorkcards.length} 条</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-medium px-6 py-3">作业卡</th>
                <th className="text-left font-medium px-6 py-3">关联缺陷</th>
                <th className="text-left font-medium px-6 py-3">设备</th>
                <th className="text-left font-medium px-6 py-3">风险</th>
                <th className="text-left font-medium px-6 py-3">模板版本</th>
                <th className="text-left font-medium px-6 py-3">审批链（MVP）</th>
              </tr>
            </thead>
            <tbody>
              {mockWorkcards.map((wc) => {
                const defect = defectById.get(wc.defectId)
                const dev = deviceById.get(wc.deviceId)
                return (
                  <tr key={wc.id} className="border-t">
                    <td className="px-6 py-4">
                      <div className="font-medium">{wc.id}</div>
                      <div className="text-slate-500 mt-1">
                        {workcardStatusLabel(wc.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {defect ? (
                        <div>
                          <div className="font-medium">{defect.title}</div>
                          <div className="text-slate-500 mt-1">
                            <Link
                              href={`/energy-inspection/defects?defectId=${defect.id}`}
                              className="hover:underline"
                            >
                              {defect.id}
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{dev?.name ?? wc.deviceId}</div>
                      <div className="text-slate-500 mt-1">
                        {dev?.site ?? "-"} / {dev?.room ?? "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        风险 {wc.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{wc.templateVersion}</div>
                      <div className="text-slate-500 mt-1 text-xs">
                        审计引用：template_version_id（占位）
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {wc.approvals.map((a, idx) => (
                          <span
                            key={`${wc.id}-${a.role}-${idx}`}
                            className={[
                              "inline-flex items-center rounded-full border px-2 py-1 text-xs",
                              a.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : a.status === "rejected"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-slate-50 text-slate-700 border-slate-200",
                            ].join(" ")}
                            title={
                              a.by && a.at ? `${a.role}：${a.by} @ ${a.at}` : undefined
                            }
                          >
                            {a.role}：{a.status}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        线性审批链（MVP）；电子签章/CA 本期不实现
                      </div>
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
