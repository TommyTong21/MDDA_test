# user_gift 资产使用说明

`user_gift/` 用于存放体量较大的第三方源码与技能簇，作为离线参考来源。

## 为什么不直接引入主工程

- 体量大、依赖多，会显著增加仓库复杂度与构建风险
- 很多工程包含站点/示例/脚手架，与业务骨架无直接关系
- MDDA 的目标是“可复制资产”，应优先沉淀为轻量积木而不是搬运整仓

## 如何转化为可复用积木

从 user_gift 提取以下内容并落盘到 `.trae/blocks/`：
- 初始化步骤（pnpm 命令、必改配置）
- 组件/模式的最小用法（可复制代码片段）
- 约束清单（何时用、不能用什么、边界条件）
- 验证标准（最小页面 + E2E 冒烟）

## 现有资源清单

- Arco Design Skills：`user_gift/arco-design-skill-main/`
- Gluestack UI：`user_gift/gluestack-ui-main/`
- Refine：`user_gift/refine-main/`
- shadcn/ui：`user_gift/shadcn-ui-main/`

