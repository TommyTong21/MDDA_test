import Link from "next/link"

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">AI 康养护理智能助手</h1>
      <p className="mt-4 text-slate-600">
        当前已优先跑通护工端 MVP（现场记录 / 紧急上报 / 交接补充）。护士站工作台等能力将通过 Phase 4
        敏捷迭代逐步补齐。
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          进入管理端
        </Link>
        <Link
          href="/caregiver"
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
        >
          进入护工端 MVP
        </Link>
      </div>
    </main>
  )
}
