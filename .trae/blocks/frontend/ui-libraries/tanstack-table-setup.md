# TanStack Table 复杂表格积木

当需要渲染复杂数据表格（带排序、分页、过滤等）时，Frontend Agent 请按照以下步骤：

## 1. 安装依赖
```bash
pnpm add @tanstack/react-table
```

## 2. 基础组件封装
建议结合 Shadcn UI 的 Table 组件 (`src/components/ui/table.tsx`) 进行封装。

## 3. 示例代码
```tsx
'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'

export function DataTable({ columns, data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      {/* 结合 Shadcn UI Table 渲染 */}
    </div>
  )
}
```
