import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Routing Collab Demo</h1>
      <p className="mb-8">物流多约束路径规划与承运协同系统 - Web端入口</p>
      <div className="flex gap-4">
        <Button>承运商登录</Button>
        <Button variant="outline">调度员后台</Button>
      </div>
    </main>
  )
}
