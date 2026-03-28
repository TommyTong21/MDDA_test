import "./globals.css"

export const metadata = {
  title: "AI 康养护理智能助手",
  description: "面向康养机构的一线护理协同产品（护工端 MVP 优先落地）",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
