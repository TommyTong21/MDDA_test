# UI 技术栈与积木纳入策略

## 目标

在不把大型第三方仓库直接拷贝进业务工程的前提下，让各 Agent 能稳定复用成熟 UI 体系，并能按不同终端形态选择最合适的组件生态。

## 终端与推荐 UI 体系

- Web（面向外部用户/运营台/轻量后台）：shadcn/ui + Tailwind
- Admin（复杂 CRUD / 权限 / 数据密集）：Refine（按需选 UI 适配层，如 AntD/MUI/Tailwind）
- App/小程序（移动端一致性）：Gluestack UI（NativeWind/Tailwind 思路，按需拷贝组件）

## 资源位置约定

- `user_gift/`：完整源码与技能簇的离线参考来源
  - `user_gift/shadcn-ui-main/`
  - `user_gift/refine-main/`
  - `user_gift/gluestack-ui-main/`
  - `user_gift/arco-design-skill-main/`
- `.trae/blocks/`：主工程真正会被 Agent 读取与“复制粘贴”的可复用积木（轻量、可维护）
  - `frontend/ui-libraries/`：Web UI 通用积木（shadcn / tremor / table 等）
  - 未来扩展：
    - `frontend/admin-refine/`：Refine 的脚手架、数据源、鉴权与 RBAC 模式积木
    - `frontend/app-gluestack/`：Gluestack 的初始化、主题与组件拷贝策略积木
- `src/`：只放当前项目真正用到的 UI 组件与业务页面，不作为第三方仓库镜像

## 纳入原则（从 user_gift 抽“积木”，不搬“仓库”）

1. 只沉淀“可执行/可复制”的步骤与片段（命令、配置片段、文件模板、约束清单）
2. 积木必须明确适用范围（Web/Admin/App）与落盘路径
3. 新增依赖遵循“按需安装”策略，默认不把重型依赖预装进骨架
4. 每个积木文档必须能回答三件事：何时用、怎么用、怎么验证

## 关于 Arco Design Skills

Arco 的 `skills/` 更适合作为“UI Designer 的知识增强”而非默认 UI 依赖。
当某个项目明确选择 Arco 作为 Web UI 体系时，再将其 skills 以“可加载技能”的方式纳入对应 Agent 工作流。

