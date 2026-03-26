# MDDA 框架 - Trae 开箱即用配置指南

为了让 MDDA 框架在 Trae IDE 中发挥最大威力，本指南将帮助你“开箱即用”地完成环境初始化。
整个过程采取 **文档驱动 + 资产复制** 的方式，确保配置透明可控。

## 1. 基础环境确认 (Phase 0)

在开始前，请确保你已经安装或注册了以下工具/服务：
- [Trae IDE](https://www.trae.ai) (最新版)
- GitHub 账号
- Vercel 账号
- Supabase 账号
- Node.js (建议 v20+) & pnpm

## 2. 挂载本地知识库 (Knowledge Base)

MDDA 的工作流依赖于对 Agent 行为规范的严格定义。
请在 Trae 的设置中，将本仓库的 `.trae/knowledge` 目录或其中的关键文件作为**上下文知识库**挂载。

关键文件包括：
- `.trae/knowledge/mdda-guidelines-v2.md` (总纲领)
- `.trae/knowledge/solo-coder-framework.md` (主程编排协议)
- `.trae/knowledge/*-agent.md` (各专业 Agent 的行为规范)

## 3. 配置 Custom Agents

在 Trae 的 Custom Agent 配置界面，按照以下清单创建 Agent，并将对应的 System Prompt 复制进去。
（*提示：Prompt 原文可参考仓库根目录下的 `创世文档/System Prompt.md`，你也可以直接复制以下内容。*）

### 3.1 SOLO Coder (编排中枢)
- **Agent Name**: SOLO Coder
- **Description**: 多 Agent 协作体系的编排中枢，负责分发任务、验证结果和推进阶段。
- **System Prompt**: 
  > *复制 `.trae/knowledge/solo-coder-framework.md` 的内容，或直接使用 `创世文档/System Prompt.md` 中对应的段落。*

### 3.2 PM Agent (产品经理)
- **Agent Name**: PM Agent
- **Description**: 需求翻译与范围界定专家。负责竞品分析、用户故事与 PRD 编写。
- **System Prompt**: 
  > *复制 `.trae/knowledge/product-manager-agent.md` 的内容。*

### 3.3 Tech Lead Agent (技术负责人)
- **Agent Name**: Tech Lead Agent
- **Description**: 架构决策的唯一权威。负责制定 ADR 和技术规格。
- **System Prompt**: 
  > *复制 `.trae/knowledge/tech-lead-agent.md` 的内容。*

*(同理，根据需要配置 Frontend Agent, Backend Agent, DevOps Agent, QA / Docs Agent)*

## 4. 启用必要的 MCP (Model Context Protocol)

为了让 Agent 能够与外部环境交互，请在 Trae 的 MCP 设置中启用/配置以下集成：
1. **GitHub MCP**: 用于版本控制、创建 PR、读取仓库状态。
2. **Vercel MCP** (如有): 用于读取部署状态、日志和环境变量。
3. **Supabase MCP** (如有): 用于直接查询 Schema 状态或管理 RLS。
4. **Shadcn UI MCP**: 用于快速搜索、导入前端组件（例如 `npx shadcn-ui@latest add button`）。
5. **Context7 / Search**: 用于在 Phase 1 阶段执行竞品搜索和网页资料检索。

## 5. 启动你的第一个项目

完成上述配置后，你就可以开始使用了！
MDDA 强调 **用户深度参与的对话驱动**。

**开始方式**：
在 Trae 的对话框中，召唤 `SOLO Coder` 或 `PM Agent`，并输入你的第一句话，例如：
> "@PM Agent 我想做一个物流多约束路径规划与承运协同系统（routing-collab-demo），核心痛点是人工排线低效和异常上报滞后，请带我进行 Phase 1 的需求拆解和竞品分析。"

---
> 💡 **提示**：在这个过程中，Agent 会不断向你提问（Maker-Checker 循环）。请像真正的产品经理一样回答它的问题，直到双方确认 PRD 可以“冻结”，再交由 SOLO Coder 推进到 Phase 2（实现阶段）。
