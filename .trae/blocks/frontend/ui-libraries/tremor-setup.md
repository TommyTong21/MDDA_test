# Tremor 图表组件集成积木

当 Tech Lead 在 ADR 中指定需要复杂图表展示（如 Admin 仪表盘）时，Frontend Agent 请按照以下步骤初始化 Tremor：

## 1. 安装依赖
```bash
pnpm add @tremor/react
```

## 2. Tailwind 配置更新
确保在 `tailwind.config.js` 中引入 Tremor 的预设或调整颜色体系。
（由于 Tremor v3+ 已采用原生 Tailwind 变量，建议参考官方最新文档整合）。

## 3. 标准使用示例
```tsx
import { Card, Text, Metric } from "@tremor/react";

export function KpiCard({ title, value }: { title: string, value: string }) {
  return (
    <Card className="max-w-xs mx-auto">
      <Text>{title}</Text>
      <Metric>{value}</Metric>
    </Card>
  );
}
```
