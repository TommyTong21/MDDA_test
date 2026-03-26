export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-white p-4">
        <h2 className="text-xl font-bold mb-4">调度中心</h2>
        <nav className="space-y-2">
          <div className="p-2 bg-slate-800 rounded">排线看板</div>
          <div className="p-2 hover:bg-slate-800 rounded">承运池</div>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-slate-50">
        {children}
      </main>
    </div>
  )
}
