export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">今日排线概览</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">待分配订单</h3>
          <p className="text-4xl font-bold mt-2">128</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">空闲运力</h3>
          <p className="text-4xl font-bold mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">时窗违规预警</h3>
          <p className="text-4xl font-bold mt-2 text-red-500">3</p>
        </div>
      </div>
    </div>
  )
}
