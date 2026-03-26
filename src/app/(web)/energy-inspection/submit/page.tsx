"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

type DeviceOption = {
  id: string
  label: string
}

function makeQueueId(): string {
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 8)
  return `queue_${t}_${r}`
}

export default function EnergyInspectionSubmitPage() {
  const devices: DeviceOption[] = useMemo(
    () => [
      { id: "dev-001", label: "南苑变电站 / 配电房 A / 10kV 开关柜 #3（正面-柜门）" },
      { id: "dev-002", label: "南苑变电站 / 配电房 A / 10kV 电缆终端 #1（侧面-接头）" },
      { id: "dev-003", label: "东城站 / 配电房 B / 低压配电箱 #7（正面-面板）" },
    ],
    []
  )

  const [deviceId, setDeviceId] = useState<string>(devices[0]?.id ?? "")
  const [description, setDescription] = useState<string>("")
  const [files, setFiles] = useState<File[]>([])
  const [submitted, setSubmitted] = useState<{
    queueId: string
    submittedAt: string
  } | null>(null)

  function onPickFiles(next: FileList | null) {
    const arr = next ? Array.from(next) : []
    setFiles(arr)
  }

  function onSubmit() {
    const now = new Date()
    setSubmitted({
      queueId: makeQueueId(),
      submittedAt: now.toLocaleString("zh-CN"),
    })
  }

  function onReset() {
    setDescription("")
    setFiles([])
    setSubmitted(null)
    setDeviceId(devices[0]?.id ?? "")
  }

  const canSubmit = deviceId.length > 0 && (description.trim().length > 0 || files.length > 0)

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">配电房巡检提交</h1>
        <p className="text-slate-600 mt-2">
          简化现场提交页：上传为占位（不做真实上传），提交后进入“待检测”队列。
        </p>
      </div>

      {submitted ? (
        <div className="rounded-lg border bg-emerald-50 border-emerald-200 p-5">
          <div className="font-semibold text-emerald-900">
            已入队，等待缺陷检测结果
          </div>
          <div className="text-sm text-emerald-900/90 mt-2">
            入队编号：<span className="font-mono">{submitted.queueId}</span>
          </div>
          <div className="text-sm text-emerald-900/90 mt-1">
            提交时间：{submitted.submittedAt}
          </div>
          <div className="text-sm text-emerald-900/90 mt-2">
            说明：缺陷检测为异步流程；历史变化检测（ChangeFormer）本期仅占位，不影响风险分级。
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={onReset} variant="outline">
              再提交一条
            </Button>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg bg-white shadow p-6 space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium">设备选择</label>
          <select
            className="w-full rounded-md border px-3 py-2 bg-white"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">影像上传（占位）</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => onPickFiles(e.target.files)}
          />
          <div className="text-sm text-slate-600">
            {files.length === 0 ? (
              <span>未选择文件</span>
            ) : (
              <ul className="list-disc ml-5">
                {files.slice(0, 6).map((f) => (
                  <li key={`${f.name}-${f.size}`} className="break-all">
                    {f.name}（{Math.ceil(f.size / 1024)} KB）
                  </li>
                ))}
                {files.length > 6 ? <li>……共 {files.length} 个文件</li> : null}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">现场描述/备注</label>
          <textarea
            className="w-full min-h-24 rounded-md border px-3 py-2"
            placeholder="例如：柜门温升异常、异响、气味、环境潮湿等"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="text-xs text-slate-500">
            提示：可只上传素材不填描述，或只填描述不上传（用于弱网/先占位提交）。
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            提交后状态：已回传（待检测）→ 已检测（待复核）→ … → 已闭环（由后台处理）
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onReset}>
              清空
            </Button>
            <Button onClick={onSubmit} disabled={!canSubmit}>
              提交入队
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
        <div className="font-medium">本页占位范围</div>
        <div className="mt-1">
          上传直传、sha256 计算、入库与推理任务入队等链路在 ADR 中已定义，但本期此仓库页面不接真实后端。
        </div>
      </div>
    </main>
  )
}
