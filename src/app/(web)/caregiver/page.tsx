"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Handoff, Incident, Resident } from "@/lib/caregiver/types"

type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string }

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
    await supabase.auth.signInWithOtp({ email: emailTrim })
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function submitNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedResidentId || !noteText.trim()) return
    await fetch("/api/v1/caregiver/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resident_id: selectedResidentId, content_raw: noteText.trim() }),
    })
    setNoteText("")
  }

  async function submitIncident(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedResidentId) return
    await fetch("/api/v1/caregiver/incidents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        resident_id: selectedResidentId,
        type: incidentType,
        description: incidentDesc.trim() ? incidentDesc.trim() : undefined,
      }),
    })
    setIncidentDesc("")
    await reloadIncidents()
  }

  async function submitHandoff(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const today = new Date()
    const shiftDate = today.toISOString().slice(0, 10)
    if (!handoffSummary.trim()) return
    await fetch("/api/v1/caregiver/handoffs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        shift_date: shiftDate,
        shift_type: handoffShiftType,
        summary: handoffSummary.trim(),
      }),
    })
    setHandoffSummary("")
    await reloadHandoffs()
  }

  useEffect(() => {
    if (!userEmail) return
    reloadResidents()
    reloadIncidents()
    reloadHandoffs()
  }, [userEmail, reloadResidents, reloadIncidents, reloadHandoffs])

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
          {!hasSupabaseEnv ? (
            <div className="max-w-sm text-left text-sm text-slate-600">
              未配置 Supabase 环境变量，页面仅展示 UI。
              <div className="mt-1 text-xs text-slate-500">
                需要设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY。
              </div>
            </div>
          ) : userEmail ? (
            <div className="space-y-2">
              <div>已登录：{userEmail}</div>
              <button
                onClick={signOut}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                退出登录
              </button>
            </div>
          ) : (
            <form onSubmit={sendLoginLink} className="flex flex-wrap items-center gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入邮箱获取登录链接"
                className="w-64 rounded-md border px-3 py-2 text-sm"
              />
              <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                发送登录链接
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">老人列表</h2>
            <button
              onClick={reloadResidents}
              className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
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
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
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

        <section className="rounded-lg border p-4">
          <h2 className="text-base font-semibold">快速记录</h2>
          <form onSubmit={submitNote} className="mt-3 space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="语音转写/文本输入（MVP）"
              className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              disabled={!userEmail}
            />
            <button
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={!userEmail || !selectedResidentId || !noteText.trim()}
            >
              提交记录
            </button>
          </form>
        </section>

        <section className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">紧急上报</h2>
            <button
              onClick={reloadIncidents}
              className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
              disabled={!userEmail}
            >
              刷新
            </button>
          </div>

          <form onSubmit={submitIncident} className="mt-3 grid gap-2">
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as Incident["type"])}
              className="w-full rounded-md border px-3 py-2 text-sm"
              disabled={!userEmail}
            >
              <option value="fall">跌倒</option>
              <option value="fever">发热</option>
              <option value="refusal">拒食/拒药</option>
              <option value="breathing">呼吸异常</option>
              <option value="vitals">生命体征异常</option>
              <option value="other">其他</option>
            </select>
            <input
              value={incidentDesc}
              onChange={(e) => setIncidentDesc(e.target.value)}
              placeholder="补充说明（可选）"
              className="w-full rounded-md border px-3 py-2 text-sm"
              disabled={!userEmail}
            />
            <button
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              disabled={!userEmail || !selectedResidentId}
            >
              立即上报
            </button>
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
                  <li key={it.id} className="rounded-md bg-slate-50 p-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">
                        {it.type} · {it.status}
                      </div>
                      <div className="text-xs text-slate-500">{new Date(it.created_at).toLocaleString()}</div>
                    </div>
                    {it.description ? <div className="mt-1 text-slate-700">{it.description}</div> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">交接补充</h2>
            <button
              onClick={reloadHandoffs}
              className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
              disabled={!userEmail}
            >
              刷新
            </button>
          </div>

          <form onSubmit={submitHandoff} className="mt-3 grid gap-2">
            <select
              value={handoffShiftType}
              onChange={(e) => setHandoffShiftType(e.target.value as Handoff["shift_type"])}
              className="w-full rounded-md border px-3 py-2 text-sm"
              disabled={!userEmail}
            >
              <option value="day">白班</option>
              <option value="night">夜班</option>
            </select>
            <textarea
              value={handoffSummary}
              onChange={(e) => setHandoffSummary(e.target.value)}
              placeholder="本班交接摘要（结构化可在 Phase 4 增强）"
              className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              disabled={!userEmail}
            />
            <button
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={!userEmail || !handoffSummary.trim()}
            >
              提交交接
            </button>
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
                  <li key={it.id} className="rounded-md bg-slate-50 p-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">
                        {it.shift_date} · {it.shift_type}
                      </div>
                      <div className="text-xs text-slate-500">{new Date(it.created_at).toLocaleString()}</div>
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
