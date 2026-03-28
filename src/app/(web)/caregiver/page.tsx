"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Handoff, Incident, Resident } from "@/lib/caregiver/types"

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string }

type Banner =
  | { kind: "info" | "success" | "error"; text: string }
  | { kind: "none" }

function incidentTypeLabel(type: Incident["type"]): string {
  switch (type) {
    case "fall":
      return "跌倒"
    case "fever":
      return "发热"
    case "refusal":
      return "拒食/拒药"
    case "breathing":
      return "呼吸异常"
    case "vitals":
      return "生命体征异常"
    case "other":
      return "其他"
  }
}

function incidentStatusLabel(status: Incident["status"]): string {
  switch (status) {
    case "open":
      return "待处理"
    case "acknowledged":
      return "已接收"
    case "resolved":
      return "已处理"
    case "archived":
      return "已归档"
  }
}

function badgeClass(kind: "neutral" | "red" | "yellow" | "green" | "blue"): string {
  switch (kind) {
    case "red":
      return "bg-red-100 text-red-800"
    case "yellow":
      return "bg-amber-100 text-amber-800"
    case "green":
      return "bg-emerald-100 text-emerald-800"
    case "blue":
      return "bg-blue-100 text-blue-800"
    case "neutral":
      return "bg-slate-100 text-slate-800"
  }
}

function incidentStatusBadgeKind(status: Incident["status"]): "red" | "yellow" | "green" | "neutral" {
  switch (status) {
    case "open":
      return "red"
    case "acknowledged":
      return "yellow"
    case "resolved":
      return "green"
    case "archived":
      return "neutral"
  }
}

/**
 * 护工端 MVP 工作台：登录后可进行记录/紧急上报/交接的最小闭环演示。
 */
export default function CaregiverPage() {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const supabase = useMemo(() => (hasSupabaseEnv ? createClient() : null), [hasSupabaseEnv])
  const [email, setEmail] = useState("")
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [banner, setBanner] = useState<Banner>({ kind: "none" })
  const [isSendingLogin, setIsSendingLogin] = useState(false)
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false)
  const [isSubmittingHandoff, setIsSubmittingHandoff] = useState(false)

  const [residentsState, setResidentsState] = useState<LoadState<Resident[]>>({ status: "idle" })
  const [selectedResidentId, setSelectedResidentId] = useState<string>("")

  const [noteText, setNoteText] = useState("")
  const [incidentType, setIncidentType] = useState<Incident["type"]>("fall")
  const [incidentDesc, setIncidentDesc] = useState("")
  const [handoffShiftType, setHandoffShiftType] = useState<Handoff["shift_type"]>("day")
  const [handoffSummary, setHandoffSummary] = useState("")
  const [incidentsState, setIncidentsState] = useState<LoadState<Incident[]>>({ status: "idle" })
  const [handoffsState, setHandoffsState] = useState<LoadState<Handoff[]>>({ status: "idle" })

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const reloadResidents = useCallback(async () => {
    setResidentsState({ status: "loading" })
    try {
      const res = await fetch("/api/v1/caregiver/residents")
      const json = (await res.json()) as unknown
      if (!res.ok) {
        setResidentsState({ status: "error", message: "加载老人列表失败" })
        return
      }
      const residents = (json as { residents: Resident[] }).residents
      setResidentsState({ status: "ready", data: residents })
      if (residents.length > 0 && !selectedResidentId) setSelectedResidentId(residents[0].id)
    } catch {
      setResidentsState({ status: "error", message: "加载老人列表失败" })
    }
  }, [selectedResidentId])

  const reloadIncidents = useCallback(async () => {
    setIncidentsState({ status: "loading" })
    try {
      const url = selectedResidentId
        ? `/api/v1/caregiver/incidents?resident_id=${encodeURIComponent(selectedResidentId)}`
        : "/api/v1/caregiver/incidents"
      const res = await fetch(url)
      const json = (await res.json()) as unknown
      if (!res.ok) {
        setIncidentsState({ status: "error", message: "加载事件失败" })
        return
      }
      const incidents = (json as { incidents: Incident[] }).incidents
      setIncidentsState({ status: "ready", data: incidents })
    } catch {
      setIncidentsState({ status: "error", message: "加载事件失败" })
    }
  }, [selectedResidentId])

  const reloadHandoffs = useCallback(async () => {
    setHandoffsState({ status: "loading" })
    try {
      const res = await fetch("/api/v1/caregiver/handoffs")
      const json = (await res.json()) as unknown
      if (!res.ok) {
        setHandoffsState({ status: "error", message: "加载交接失败" })
        return
      }
      const handoffs = (json as { handoffs: Handoff[] }).handoffs
      setHandoffsState({ status: "ready", data: handoffs })
    } catch {
      setHandoffsState({ status: "error", message: "加载交接失败" })
    }
  }, [])

  async function sendLoginLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) return
    const emailTrim = email.trim()
    if (!emailTrim) return
    try {
      setIsSendingLogin(true)
      setBanner({ kind: "none" })
      await supabase.auth.signInWithOtp({ email: emailTrim })
      setBanner({ kind: "success", text: "已发送登录链接，请查收邮箱完成登录。" })
    } catch {
      setBanner({ kind: "error", text: "发送登录链接失败，请稍后重试。" })
    } finally {
      setIsSendingLogin(false)
    }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setBanner({ kind: "info", text: "已退出登录。" })
  }

  async function submitNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedResidentId || !noteText.trim()) return
    try {
      setIsSubmittingNote(true)
      setBanner({ kind: "none" })
      const res = await fetch("/api/v1/caregiver/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resident_id: selectedResidentId, content_raw: noteText.trim() }),
      })
      if (!res.ok) {
        setBanner({ kind: "error", text: "提交记录失败，请检查登录状态或稍后重试。" })
        return
      }
      setNoteText("")
      setBanner({ kind: "success", text: "记录已提交。" })
    } catch {
      setBanner({ kind: "error", text: "提交记录失败，请稍后重试。" })
    } finally {
      setIsSubmittingNote(false)
    }
  }

  async function submitIncident(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedResidentId) return
    const ok = globalThis.confirm(`确认上报事件：${incidentTypeLabel(incidentType)}？`)
    if (!ok) return
    try {
      setIsSubmittingIncident(true)
      setBanner({ kind: "none" })
      const res = await fetch("/api/v1/caregiver/incidents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          resident_id: selectedResidentId,
          type: incidentType,
          description: incidentDesc.trim() ? incidentDesc.trim() : undefined,
        }),
      })
      if (!res.ok) {
        setBanner({ kind: "error", text: "上报失败，请检查登录状态或稍后重试。" })
        return
      }
      setIncidentDesc("")
      setBanner({ kind: "success", text: "已上报，事件已进入待处理。" })
      await reloadIncidents()
    } catch {
      setBanner({ kind: "error", text: "上报失败，请稍后重试。" })
    } finally {
      setIsSubmittingIncident(false)
    }
  }

  async function submitHandoff(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const today = new Date()
    const shiftDate = today.toISOString().slice(0, 10)
    if (!handoffSummary.trim()) return
    try {
      setIsSubmittingHandoff(true)
      setBanner({ kind: "none" })
      const res = await fetch("/api/v1/caregiver/handoffs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shift_date: shiftDate,
          shift_type: handoffShiftType,
          summary: handoffSummary.trim(),
        }),
      })
      if (!res.ok) {
        setBanner({ kind: "error", text: "提交交接失败，请检查登录状态或稍后重试。" })
        return
      }
      setHandoffSummary("")
      setBanner({ kind: "success", text: "交接已提交并存档。" })
      await reloadHandoffs()
    } catch {
      setBanner({ kind: "error", text: "提交交接失败，请稍后重试。" })
    } finally {
      setIsSubmittingHandoff(false)
    }
  }

  useEffect(() => {
    if (!userEmail) return
    reloadResidents()
    reloadIncidents()
    reloadHandoffs()
  }, [userEmail, reloadResidents, reloadIncidents, reloadHandoffs])

  useEffect(() => {
    if (!userEmail) return
    if (!selectedResidentId) return
    reloadIncidents()
  }, [userEmail, selectedResidentId, reloadIncidents])

  const selectedResident =
    residentsState.status === "ready"
      ? residentsState.data.find((r) => r.id === selectedResidentId) ?? null
      : null

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">护工端 MVP 工作台</h1>
          <p className="mt-2 text-sm text-slate-600">
            目标：现场记录、紧急上报、交接补充闭环先跑通（其余端能力 Phase 4 再迭代）。
          </p>
        </div>
        <div className="text-right text-sm text-slate-600">
          {userEmail ? (
            <div className="flex items-center justify-end gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                已登录：{userEmail}
              </span>
              <button
                onClick={signOut}
                type="button"
                className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
              >
                退出
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {!hasSupabaseEnv ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-slate-700">
            <div className="font-medium">未配置 Supabase 环境变量</div>
            <div className="mt-1 text-slate-600">
              需要设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY。当前仅展示 UI。
            </div>
          </div>
        ) : userEmail ? null : (
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm font-medium text-slate-900">Step 1 · 登录</div>
            <form onSubmit={sendLoginLink} className="mt-3 flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="login-email">
                邮箱
              </label>
              <input
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入邮箱获取登录链接"
                className="w-72 max-w-full rounded-md border bg-white px-3 py-2 text-sm"
                disabled={isSendingLogin}
              />
              <button
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                disabled={!email.trim() || isSendingLogin}
              >
                {isSendingLogin ? "发送中…" : "发送登录链接"}
              </button>
            </form>
          </div>
        )}

        {banner.kind !== "none" ? (
          <div
            className={`rounded-xl border bg-white p-3 text-sm ${
              banner.kind === "success"
                ? "border-emerald-200"
                : banner.kind === "error"
                  ? "border-red-200"
                  : "border-slate-200"
            }`}
          >
            <div
              className={
                banner.kind === "success"
                  ? "text-emerald-700"
                  : banner.kind === "error"
                    ? "text-red-700"
                    : "text-slate-700"
              }
            >
              {banner.text}
            </div>
          </div>
        ) : null}

        {selectedResident ? (
          <div className="rounded-xl border bg-white p-4">
            <div className="text-xs text-slate-500">当前选择</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-900">
                {selectedResident.bed_no} · {selectedResident.name}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                护理等级：{selectedResident.care_level}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Step 2 · 选择老人</h2>
            <button
              onClick={reloadResidents}
              type="button"
              className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
              disabled={!userEmail}
            >
              刷新
            </button>
          </div>

          <div className="mt-3">
            {residentsState.status === "idle" && <div className="text-sm text-slate-600">请先登录</div>}
            {residentsState.status === "loading" && <div className="text-sm text-slate-600">加载中…</div>}
            {residentsState.status === "error" && (
              <div className="text-sm text-red-600">{residentsState.message}</div>
            )}
            {residentsState.status === "ready" && residentsState.data.length === 0 && (
              <div className="text-sm text-slate-600">暂无数据（请先在 Supabase 写入 residents）</div>
            )}
            {residentsState.status === "ready" && residentsState.data.length > 0 && (
              <div className="space-y-2">
                <label className="sr-only" htmlFor="resident-select">
                  选择老人
                </label>
                <select
                  id="resident-select"
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                >
                  {residentsState.data.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.bed_no} - {r.name}（{r.care_level}）
                    </option>
                  ))}
                </select>
                <div className="text-xs text-slate-500">选中老人 ID：{selectedResidentId || "-"}</div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <h2 className="text-base font-semibold">Step 3 · 快速记录</h2>
          <form onSubmit={submitNote} className="mt-3 space-y-2">
            <label className="sr-only" htmlFor="note-text">
              记录内容
            </label>
            <textarea
              id="note-text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="语音转写/文本输入（MVP）"
              className="min-h-28 w-full rounded-md border bg-white px-3 py-2 text-sm"
              disabled={!userEmail || isSubmittingNote}
            />
            <button
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={!userEmail || !selectedResidentId || !noteText.trim() || isSubmittingNote}
            >
              {isSubmittingNote ? "提交中…" : "提交记录"}
            </button>
            {!userEmail ? (
              <div className="text-xs text-slate-500">请先登录</div>
            ) : !selectedResidentId ? (
              <div className="text-xs text-slate-500">请先选择老人</div>
            ) : null}
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">紧急上报</h2>
            <button
              onClick={reloadIncidents}
              type="button"
              className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
              disabled={!userEmail}
            >
              刷新
            </button>
          </div>

          <form onSubmit={submitIncident} className="mt-3 grid gap-2">
            <label className="sr-only" htmlFor="incident-type">
              事件类型
            </label>
            <select
              id="incident-type"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as Incident["type"])}
              className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              disabled={!userEmail || isSubmittingIncident}
            >
              <option value="fall">跌倒</option>
              <option value="fever">发热</option>
              <option value="refusal">拒食/拒药</option>
              <option value="breathing">呼吸异常</option>
              <option value="vitals">生命体征异常</option>
              <option value="other">其他</option>
            </select>
            <label className="sr-only" htmlFor="incident-desc">
              补充说明
            </label>
            <input
              id="incident-desc"
              value={incidentDesc}
              onChange={(e) => setIncidentDesc(e.target.value)}
              placeholder="补充说明（可选）"
              className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              disabled={!userEmail || isSubmittingIncident}
            />
            <button
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              disabled={!userEmail || !selectedResidentId || isSubmittingIncident}
            >
              {isSubmittingIncident ? "上报中…" : "立即上报"}
            </button>
            {!userEmail ? (
              <div className="text-xs text-slate-500">请先登录</div>
            ) : !selectedResidentId ? (
              <div className="text-xs text-slate-500">请先选择老人</div>
            ) : (
              <div className="text-xs text-slate-500">提交前会二次确认，避免误触</div>
            )}
          </form>

          <div className="mt-4">
            {incidentsState.status === "idle" && <div className="text-sm text-slate-600">请先登录</div>}
            {incidentsState.status === "loading" && <div className="text-sm text-slate-600">加载中…</div>}
            {incidentsState.status === "error" && (
              <div className="text-sm text-red-600">{incidentsState.message}</div>
            )}
            {incidentsState.status === "ready" && incidentsState.data.length === 0 && (
              <div className="text-sm text-slate-600">暂无事件</div>
            )}
            {incidentsState.status === "ready" && incidentsState.data.length > 0 && (
              <ul className="space-y-2 text-sm">
                {incidentsState.data.map((it) => (
                  <li key={it.id} className="rounded-xl bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{incidentTypeLabel(it.type)}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass(
                            incidentStatusBadgeKind(it.status)
                          )}`}
                        >
                          {incidentStatusLabel(it.status)}
                        </span>
                      </div>
                      <time
                        className="text-xs text-slate-500"
                        dateTime={new Date(it.created_at).toISOString()}
                      >
                        {new Date(it.created_at).toLocaleString()}
                      </time>
                    </div>
                    {it.description ? <div className="mt-1 text-slate-700">{it.description}</div> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">交接补充</h2>
            <button
              onClick={reloadHandoffs}
              type="button"
              className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
              disabled={!userEmail}
            >
              刷新
            </button>
          </div>

          <form onSubmit={submitHandoff} className="mt-3 grid gap-2">
            <label className="sr-only" htmlFor="handoff-shift">
              班次
            </label>
            <select
              id="handoff-shift"
              value={handoffShiftType}
              onChange={(e) => setHandoffShiftType(e.target.value as Handoff["shift_type"])}
              className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              disabled={!userEmail || isSubmittingHandoff}
            >
              <option value="day">白班</option>
              <option value="night">夜班</option>
            </select>
            <label className="sr-only" htmlFor="handoff-summary">
              交接摘要
            </label>
            <textarea
              id="handoff-summary"
              value={handoffSummary}
              onChange={(e) => setHandoffSummary(e.target.value)}
              placeholder="本班交接摘要（结构化可在 Phase 4 增强）"
              className="min-h-28 w-full rounded-md border bg-white px-3 py-2 text-sm"
              disabled={!userEmail || isSubmittingHandoff}
            />
            <button
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={!userEmail || !handoffSummary.trim() || isSubmittingHandoff}
            >
              {isSubmittingHandoff ? "提交中…" : "提交交接"}
            </button>
            {!userEmail ? (
              <div className="text-xs text-slate-500">请先登录</div>
            ) : null}
          </form>

          <div className="mt-4">
            {handoffsState.status === "idle" && <div className="text-sm text-slate-600">请先登录</div>}
            {handoffsState.status === "loading" && <div className="text-sm text-slate-600">加载中…</div>}
            {handoffsState.status === "error" && (
              <div className="text-sm text-red-600">{handoffsState.message}</div>
            )}
            {handoffsState.status === "ready" && handoffsState.data.length === 0 && (
              <div className="text-sm text-slate-600">暂无交接记录</div>
            )}
            {handoffsState.status === "ready" && handoffsState.data.length > 0 && (
              <ul className="space-y-2 text-sm">
                {handoffsState.data.map((it) => (
                  <li key={it.id} className="rounded-xl bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-slate-900">{it.shift_date}</div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass(
                            "blue"
                          )}`}
                        >
                          {it.shift_type === "day" ? "白班" : "夜班"}
                        </span>
                      </div>
                      <time
                        className="text-xs text-slate-500"
                        dateTime={new Date(it.created_at).toISOString()}
                      >
                        {new Date(it.created_at).toLocaleString()}
                      </time>
                    </div>
                    <div className="mt-1 whitespace-pre-wrap text-slate-700">{it.summary}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
