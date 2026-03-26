# 多 Agent 协作体系总索引 v1.0

**文档用途**：全局视图，快速定位各 Agent 职责、输入输出、协作接口  
**生效日期**：2026-03-26  
**技术栈**：Trae + Supabase + Vercel + GitHub + Next.js

---

## 1. 体系全景图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户/需求输入                          │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  SOLO Coder（编排中枢）                                        │
│  - 接收需求，分析类型                                          │
│  - 调度 Agent，传递上下文包                                     │
│  - 质量守门，决策流转                                          │
│  文档：solo-coder-framework.md                                 │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   PM Agent   │  │  Tech Lead   │  │   （直接）   │
│  需求分析     │  │   Agent      │  │  简单任务    │
│  输出 PRD    │  │  架构决策     │  │  → Frontend  │
│  用户故事     │  │  输出 ADR    │  │              │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       │    ┌────────────┘
       │    ▼
       │  ┌─────────────────────────────┐
       │  │      Tech Lead 决策节点      │
       │  │  锁定：Next.js + Supabase +   │
       │  │       Vercel + GitHub         │
       │  │  指定：UI库/API模式/实时策略   │
       │  └─────────────────────────────┘
       │                 │
       └─────────────────┤
                         ▼
              ┌─────────┴─────────┐
              ▼                   ▼
      ┌──────────────┐    ┌──────────────┐
      │ Frontend     │◄──►│   Backend    │
      │   Agent      │接口契约│   Agent      │
      │  UI实现      │协商   │  数据库/API  │
      │  页面开发     │      │  服务端逻辑   │
      └──────┬───────┘      └──────┬───────┘
             │                     │
             └──────────┬──────────┘
                        ▼
              ┌─────────────────┐
              │   DevOps Agent  │
              │  Vercel部署      │
              │  GitHub CI/CD   │
              │  Supabase集成    │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │  QA/Docs Agent  │
              │   （终点）       │
              │  测试验证        │
              │  文档归档        │
              │  知识沉淀        │
              └─────────────────┘
```

---

## 2. Agent 快速定位表

| Agent | 核心职责 | 必收输入 | 核心输出 | 下游消费者 |
|-------|---------|---------|---------|-----------|
| **SOLO Coder** | 编排调度 | 用户需求 | 上下文包 + 调度指令 | 所有 Agent |
| **PM** | 需求翻译 | 模糊需求 | PRD + 用户故事 + 竞品分析 | Tech Lead |
| **Tech Lead** | 技术决策 | PRD | ADR + 技术规格 | Frontend, Backend, DevOps |
| **Frontend** | UI 实现 | ADR + 接口契约 | 页面代码 + 组件 | DevOps, QA |
| **Backend** | 服务端逻辑 | ADR + 接口契约 | Schema + Server Actions/Edge Functions | DevOps, QA |
| **DevOps** | 部署运维 | ADR + 前后端产物 | Vercel 配置 + CI/CD | QA |
| **QA/Docs** | 验证归档 | 所有上游产物 | 测试报告 + 知识库 | （终点/下一轮输入） |

---

## 3. 关键协作接口

### 3.1 文档接口（文件约定）

| 文档类型 | 命名规范 | 存放位置 | 生产者 | 消费者 |
|---------|---------|---------|--------|--------|
| PRD | `YYYYMMDD-{feature}.md` | `docs/prd/` | PM | Tech Lead, QA |
| ADR | `{编号}-{name}.md` | `docs/adr/` | Tech Lead | Frontend, Backend, DevOps |
| 技术规格 | `{编号}-specs.md` | `docs/adr/` | Tech Lead | Frontend, Backend |
| 接口契约 | `frontend-backend-{feature}.md` | `docs/api-contract/` | Frontend ↔ Backend | QA |
| 测试策略 | `test-strategy-{feature}.md` | `docs/qa/` | QA | SOLO Coder |
| 用户手册 | `{feature}-guide.md` | `docs/user/` | Docs | 用户 |
| API 文档 | `{feature}.md` | `docs/api/` | Docs | 开发者 |

### 3.2 代码接口（目录约定）

| 代码类型 | 存放位置 | 生产者 | 备注 |
|---------|---------|--------|------|
| UI 组件 | `src/components/ui/` | Frontend | Shadcn/Mantine |
| 业务组件 | `src/components/{feature}/` | Frontend | |
| 页面路由 | `src/app/{route}/` | Frontend | Next.js App Router |
| Server Actions | `src/app/{feature}/actions.ts` | Backend | 或 Frontend 兼任 |
| Edge Functions | `supabase/functions/{name}/` | Backend | |
| 数据库迁移 | `supabase/migrations/` | Backend | |
| 测试代码 | `tests/e2e/`, `tests/api/` | QA | |

### 3.3 配置接口（文件约定）

| 配置类型 | 文件 | 生产者 | 备注 |
|---------|------|--------|------|
| Vercel 配置 | `vercel.json` | DevOps | |
| Supabase 配置 | `supabase/config.toml` | DevOps | |
| CI/CD | `.github/workflows/*.yml` | DevOps | |
| 环境变量模板 | `.env.local.example` | DevOps | |

---

## 4. 上下文包（Context Package）标准

```typescript
interface ContextPackage {
  // 基础标识
  projectId: string;
  currentStage: 'pm' | 'tech' | 'frontend' | 'backend' | 'devops' | 'qa';
  
  // 上游输入引用（只读）
  inputs: {
    prd?: string;           // PM 输出路径
    adr?: string;           // Tech Lead 输出路径
    specs?: string;         // 技术规格路径
    apiContract?: string;   // 接口契约路径
    deploymentUrl?: string; // DevOps 输出
  };
  
  // 硬约束（不可突破）
  constraints: {
    platform: 'vercel';
    database: 'supabase';
    auth: 'supabase-auth';
    repo: 'github';
    ide: 'trae';
  };
  
  // 当前任务
  task: {
    id: string;
    description: string;
    acceptanceCriteria: string[];
    priority: 'P0' | 'P1' | 'P2';
    deadline?: string;
  };
  
  // 历史决策（防止重复讨论）
  decisions: Array<{
    id: string;
    agent: string;
    decision: string;
    reason: string;
    timestamp: string;
  }>;
  
  // 阻塞与风险
  blockers?: Array<{
    id: string;
    description: string;
    blocking: string;
    owner: string;
    escalation: string;
  }>;
}
```

---

## 5. 质量门检查清单（跨 Agent）

| 检查点 | 执行 Agent | 检查内容 | 阻断发布 |
|-------|-----------|---------|---------|
| PRD 完整 | PM | 用户故事 + 验收条件 | 是 |
| ADR 批准 | Tech Lead | 技术选型 + 下游任务 | 是 |
| 接口契约确认 | Frontend ↔ Backend | 双方签字确认 | 是 |
| 构建成功 | DevOps | Vercel 构建无错误 | 是 |
| 测试通过 | QA | P0 用例 100% 通过 | 是 |
| 文档归档 | Docs | 用户手册 + API 文档 | 否（警告） |

> 注：采用显式确认检查点（CP1-CP8）以降低沟通成本与返工风险，覆盖范围确认、差异化确认、实现深度、PRD 冻结、UI 确认、API 契约确认、Demo 验收与迭代前确认等关键节点。

---

## 6. 异常升级路径

```
Level 1: Agent 内解决（代码调整、方案优化）
    ↓ 无法解决
Level 2: 相关 Agent 协商（Frontend ↔ Backend 接口调整）
    ↓ 无法达成一致
Level 3: SOLO Coder 介入（上下文仲裁、重新调度）
    ↓ 架构级变更
Level 4: Tech Lead 重新评估（ADR 修订）
    ↓ 产品级变更
Level 5: PM 重新评估需求（PRD 调整）
```

---

## 7. 文档导航

| 文档 | 路径 | 读者 |
|-----|------|------|
| 本索引 | `.trae/knowledge/agent-system-index.md` | 所有角色 |
| SOLO Coder 框架 | `.trae/knowledge/solo-coder-framework.md` | SOLO Coder |
| Tech Lead 规范 | `.trae/knowledge/tech-lead-agent.md` | Tech Lead Agent |
| PM 规范 | `.trae/knowledge/product-manager-agent.md` | PM Agent |
| Frontend 规范 | `.trae/knowledge/frontend-agent.md` | Frontend Agent |
| Backend 规范 | `.trae/knowledge/backend-agent.md` | Backend Agent |
| DevOps 规范 | `.trae/knowledge/devops-agent.md` | DevOps Agent |
| QA/Docs 规范 | `.trae/knowledge/qa-docs-agent.md` | QA/Docs Agent |

---

**文档结束**

保存为 `.trae/knowledge/agent-system-index.md`。

---
