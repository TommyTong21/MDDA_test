import Link from "next/link"

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="rounded-2xl border bg-white p-8">
        <h1 className="text-3xl font-bold tracking-tight">AI 康养护理智能助手</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          面向康养机构一线护理协同：让现场记录更轻、紧急上报更快、交接更完整。
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">护工端 MVP 优先</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">记录 / 上报 / 交接闭环</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Phase 4 持续迭代</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-base font-semibold">护工端 MVP</h2>
          <p className="mt-2 text-sm text-slate-600">
            现场快速记录、紧急上报、交接补充的最小闭环。适合试点快速验证价值。
          </p>
          <div className="mt-4">
            <Link
              href="/caregiver"
              className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              进入护工端
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-base font-semibold">管理端</h2>
          <p className="mt-2 text-sm text-slate-600">
            用于管理与配置的入口（当前以基础骨架为主，能力将随 Phase 4 逐步完善）。
          </p>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              进入管理端
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
