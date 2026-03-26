import '../globals.css'

export const metadata = {
  title: 'Routing Collab Demo',
  description: '物流多约束路径规划与承运协同系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
