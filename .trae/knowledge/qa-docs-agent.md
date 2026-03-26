# QA / Docs Agent 管理规范 v1.0

**文档用途**：指导 QA Agent 完成测试验证，指导 Docs Agent 完成文档归档，作为多 Agent 工作流的终点  
**生效日期**：2026-03-26  
**上级协调者**：SOLO Coder  
**上游输入**：所有 Agent 交付物（PRD、ADR、代码、部署环境）  
**下游交付**：最终归档文档（项目知识库）

---

## 1. 角色定位

### 1.1 QA Agent 核心职责
- **测试策略制定**：基于 PRD 验收条件设计测试覆盖
- **自动化测试**：E2E、API、组件测试实现
- **验证执行**：在 Vercel 预览/生产环境执行测试
- **质量报告**：输出测试结果、覆盖率、风险评估

### 1.2 Docs Agent 核心职责
- **文档聚合**：收集所有 Agent 输出，统一格式归档
- **用户文档**：编写面向最终用户的使用指南
- **开发文档**：维护技术规范、API 文档、部署手册
- **知识沉淀**：将项目经验转化为可复用模板

### 1.3 决策边界
| 维度 | 权限 | 禁止 |
|-----|------|------|
| 测试范围 | 基于 PRD 验收条件设计 | 超出 PRD 范围新增测试 |
| 测试工具 | Playwright（E2E）、Vitest（单元） | 引入非 Vercel 兼容工具 |
| 文档格式 | Markdown、OpenAPI、Mermaid | 专有格式（如 Word） |
| 发布决策 | 标记质量状态，建议发布/阻断 | 直接决定发布（SOLO Coder 决策） |

---

## 2. 输入处理

### 2.1 QA Agent 输入清单

| 来源 | 文件/资源 | 提取内容 |
|-----|----------|---------|
| PM Agent | `docs/prd/*.md` | 验收条件 → 测试用例 |
| Tech Lead | `docs/adr/*.md` | 非功能需求 → 性能/安全测试 |
| Frontend | `src/app/**/*.tsx` | 页面路由、交互点 |
| Backend | `supabase/migrations/*.sql` | 数据约束、RLS 策略 |
| DevOps | Vercel 预览 URL、环境变量 | 测试目标环境 |

### 2.2 Docs Agent 输入清单

| 来源 | 文件/资源 | 归档位置 |
|-----|----------|---------|
| PM Agent | PRD、用户故事 | `docs/archive/product/` |
| Tech Lead | ADR、架构图 | `docs/archive/technical/` |
| Frontend + Backend | 代码注释、类型定义 | `docs/api/`（自动生成） |
| DevOps | 部署配置、运行手册 | `docs/ops/` |
| QA Agent | 测试报告、覆盖率 | `docs/qa/` |

---

## 3. QA Agent 核心交付物

### 3.1 测试策略文档

**文件位置**：`docs/qa/test-strategy-{feature}.md`

**模板**：
```markdown
# 测试策略：{功能名}

## 范围
- **覆盖功能**：{引用 PRD 用户故事 ID}
- **测试类型**：E2E / API / 组件 / 安全 / 性能
- **排除项**：{明确不测试的内容}

## 测试环境
- **预览环境**：{Vercel Preview URL}
- **数据库**：Supabase 分支 {分支名}
- **测试账号**：{准备的用户角色}

## 测试用例

### E2E：{用户场景}
| ID | 步骤 | 预期结果 | 优先级 |
|---|------|---------|--------|
| E2E-001 | 访问 /login → 输入有效凭证 → 点击登录 | 跳转 /dashboard，显示用户信息 | P0 |
| E2E-002 | 访问 /login → 输入错误密码 | 显示错误提示，停留登录页 | P0 |
| ... | ... | ... | ... |

### API：{接口名}
| ID | 请求 | 预期响应 | 数据库状态 |
|---|------|---------|-----------|
| API-001 | POST /api/items {有效数据} | 201 + 创建记录 | items 表新增行 |
| API-002 | POST /api/items {无认证} | 401 Unauthorized | 无变化 |
| ... | ... | ... | ... |

### RLS 策略验证
| ID | 角色 | 操作 | 预期结果 |
|---|------|------|---------|
| RLS-001 | 数据所有者 | SELECT 自己的数据 | 返回数据 |
| RLS-002 | 数据所有者 | SELECT 他人的数据 | 空结果 |
| RLS-003 | 未登录用户 | SELECT 任何数据 | 空结果 |

## 自动化覆盖
- **Playwright 场景数**：{数量}
- **API 测试覆盖率**：{百分比}
- **已知风险**：{未覆盖点及原因}

## 执行报告
- **执行日期**：{日期}
- **通过率**：{百分比}
- **阻塞问题**：{列表或"无"}
- **建议发布**：{是/否/条件通过}
```

### 3.2 Playwright E2E 测试

**文件位置**：`tests/e2e/{feature}.spec.ts`

**模板**：
```typescript
import { test, expect } from '@playwright/test'

test.describe('用户认证', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('有效凭证登录成功', async ({ page }) => {
    // 输入
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'validpassword')
    await page.click('button[type="submit"]')
    
    // 验证
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('Test User')
  })

  test('错误密码显示提示', async ({ page }) => {
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials')
    await expect(page).toHaveURL('/login')
  })

  test('未认证访问受保护路由被重定向', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/login?redirect=/settings')
  })
})

test.describe('数据隔离（RLS）', () => {
  test('用户A无法看到用户B的数据', async ({ browser }) => {
    // 用户A上下文
    const userAContext = await browser.newContext()
    const userAPage = await userAContext.newPage()
    await loginAs(userAPage, 'userA@example.com')
    
    // 创建数据
    await userAPage.goto('/items/new')
    await userAPage.fill('[name="name"]', 'UserA Item')
    await userAPage.click('button[type="submit"]')
    
    // 用户B上下文
    const userBContext = await browser.newContext()
    const userBPage = await userBContext.newPage()
    await loginAs(userBPage, 'userB@example.com')
    
    // 验证隔离
    await userBPage.goto('/items')
    await expect(userBPage.locator('text=UserA Item')).not.toBeVisible()
  })
})
```

### 3.3 API 测试

**文件位置**：`tests/api/{feature}.test.ts`

**模板**：
```typescript
import { test, expect } from 'vitest'
import { createServerClient } from '@/lib/supabase/server'

test('createItem Server Action', async () => {
  // 模拟认证用户
  const mockUser = { id: 'test-user-id', email: 'test@example.com' }
  
  // 执行
  const result = await createItem({ name: 'Test Item', description: 'Test' })
  
  // 验证
  expect(result.success).toBe(true)
  expect(result.data).toHaveProperty('id')
  
  // 数据库验证
  const supabase = createServerClient()
  const { data } = await supabase.from('items').select().eq('id', result.data!.id).single()
  expect(data).toBeDefined()
  expect(data.name).toBe('Test Item')
})

test('未认证用户无法创建', async () => {
  // 清除认证状态模拟
  const result = await createItem({ name: 'Hacker Item' })
  
  expect(result.success).toBe(false)
  expect(result.error).toContain('Unauthorized')
})
```

### 3.4 性能与边缘测试

**Vercel Edge 兼容性**：
```typescript
test('Edge Runtime 无 Node.js 模块', async () => {
  // 验证 Edge Function 不依赖 fs/path 等 Node 模块
  const edgeFunction = await import('@/app/api/edge/route')
  expect(edgeFunction.runtime).toBe('edge')
})
```

**加载性能**：
```typescript
test('关键页面 LCP < 2.5s', async ({ page }) => {
  await page.goto('/dashboard')
  const timing = await page.evaluate(() => 
    performance.getEntriesByType('largest-contentful-paint')[0]
  )
  expect(timing?.startTime).toBeLessThan(2500)
})
```

---

## 4. Docs Agent 核心交付物

### 4.1 用户手册

**文件位置**：`docs/user/{feature}-guide.md`

**模板**：
```markdown
# {功能名} 使用指南

## 快速开始
1. 访问 {URL}
2. 点击 {按钮}
3. 完成 {操作}

## 功能详解

### {子功能}
**用途**：{解决什么问题}  
**操作步骤**：
1. {步骤}
2. {步骤}  
**注意事项**：{限制或提示}

## 常见问题

| 问题 | 原因 | 解决 |
|-----|------|------|
| {问题} | {原因} | {步骤} |

## 反馈与支持
- 问题反馈：{链接}
- 功能建议：{链接}
```

### 4.2 API 文档（自动生成 + 人工补充）

**文件位置**：`docs/api/{feature}.md`

**来源**：
- Frontend/Backend 代码中的类型定义
- `docs/api-contract/` 中的协商文档

**格式**：
```markdown
# API：{功能名}

## 端点

### POST /api/{path}

**描述**：{功能}

**认证**：{需要/不需要，角色}

**请求体**：
```typescript
interface Request {
  field: string  // 说明
}
```

**响应**：
```typescript
interface Response {
  success: boolean
  data?: { ... }
  error?: string
}
```

**错误码**：
| 状态码 | 含义 | 处理 |
|-------|------|------|
| 200 | 成功 | - |
| 401 | 未认证 | 重新登录 |
| 403 | 无权限 | 联系管理员 |
| 500 | 服务器错误 | 稍后重试 |

**示例**：
```bash
curl -X POST /api/items \
  -H "Authorization: Bearer {token}" \
  -d '{"name":"Example"}'
```
```

### 4.3 项目知识库索引

**文件位置**：`docs/README.md`（入口）

```markdown
# 项目文档

## 产品文档
- [PRD：功能A](archive/product/20260326-feature-a.md)
- [用户手册：功能A](user/feature-a-guide.md)

## 技术文档
- [架构决策记录](archive/technical/)
- [API 文档](api/)
- [部署运维](ops/)

## 测试与质量
- [测试策略](qa/)
- [覆盖率报告](qa/coverage-report.md)

## 快速链接
- Vercel 生产环境：{URL}
- Supabase Dashboard：{URL}
- 错误监控（Sentry）：{URL}
```

---

## 5. 积木库（QA / Docs 专属）

**位置**：`.trae/blocks/qa-docs/`

### 5.1 目录结构

```
qa-docs/
├── qa/
│   ├── test-strategy-template.md     # 测试策略文档模板
│   ├── playwright-config.ts          # Playwright 配置模板
│   ├── e2e-scenarios/
│   │   ├── auth-flows.spec.ts        # 认证流程测试模板
│   │   ├── crud-operations.spec.ts   # CRUD 测试模板
│   │   ├── realtime-sync.spec.ts     # 实时功能测试模板
│   │   └── rls-validation.spec.ts  # RLS 策略测试模板
│   ├── api-tests/
│   │   ├── server-action.test.ts     # Server Action 测试模板
│   │   ├── edge-function.test.ts     # Edge Function 测试模板
│   │   └── supabase-rpc.test.ts      # 数据库 RPC 测试模板
│   ├── performance/
│   │   ├── lighthouse-ci.yml         # Lighthouse CI 配置
│   │   └── load-test.yml               # 负载测试配置（k6）
│   └── coverage/
│       ├── threshold-config.json       # 覆盖率阈值
│       └── report-template.md          # 覆盖率报告模板
│
├── docs/
│   ├── user-guide-template.md        # 用户手册模板
│   ├── api-doc-template.md           # API 文档模板
│   ├── README-template.md            # 项目 README 模板
│   ├── changelog-template.md         # 变更日志模板
│   └── faq-template.md               # FAQ 模板
│
├── aggregation/
│   ├── prd-to-user-guide.md          # PRD 转用户手册指南
│   ├── adr-to-dev-guide.md           # ADR 转开发文档指南
│   ├── code-to-api-doc.md            # 代码注释转 API 文档指南
│   └── archive-indexer.js            # 文档归档索引生成脚本
│
└── metadata.json                       # 索引与上游输入对接
```

### 5.2 metadata.json 示例

```json
{
  "id": "qa-docs",
  "name": "QA & Docs Blocks",
  "inputSources": {
    "prd": "docs/prd/*.md",
    "adr": "docs/adr/*.md",
    "code": "src/**/*.{ts,tsx}",
    "contracts": "docs/api-contract/*.md",
    "deployment": "vercel.json + supabase/config.toml"
  },
  "qaRules": {
    "byPrio": {
      "P0": { "coverage": "100% E2E + API", "blocking": true },
      "P1": { "coverage": "80% E2E", "blocking": false },
      "P2": { "coverage": "关键路径 E2E", "blocking": false }
    },
    "byTechStack": {
      "vercel": { "tools": ["playwright"], "constraints": ["Edge Runtime 兼容"] },
      "supabase": { "tools": ["supabase-test-helpers"], "focus": ["RLS 策略"] }
    }
  },
  "docsRules": {
    "autoGenerate": ["api-docs", "changelog"],
    "manualWrite": ["user-guide", "faq"],
    "aggregationOrder": ["prd → user-guide", "adr → dev-docs", "code+contracts → api-docs"]
  }
}
```

---

## 6. 与 SOLO Coder 的最终交付

### 6.1 QA Agent 交付

| 交付物 | 位置 | SOLO Coder 用途 |
|-------|------|----------------|
| 测试策略 | `docs/qa/test-strategy-*.md` | 了解测试覆盖 |
| 自动化测试代码 | `tests/` | 持续集成执行 |
| 测试报告 | `docs/qa/report-*.md` | 发布决策依据 |
| 质量状态 | `docs/qa/quality-gate.json` | 自动化判断 |

**质量门示例**：
```json
{
  "feature": "points-mall",
  "date": "2026-03-26",
  "status": "passed",  // passed / conditional / failed
  "summary": {
    "e2e": { "total": 15, "passed": 15, "failed": 0 },
    "api": { "total": 20, "passed": 19, "failed": 1 },
    "coverage": { "statements": 85, "branches": 78 }
  },
  "risks": [
    { "level": "medium", "description": "API-017 失败：并发积分扣除需重试机制" }
  ],
  "recommendation": "conditional-pass",
  "conditions": ["修复 API-017 后重新测试"]
}
```

### 6.2 Docs Agent 交付

| 交付物 | 位置 | SOLO Coder 用途 |
|-------|------|----------------|
| 用户手册 | `docs/user/` | 产品发布配套 |
| API 文档 | `docs/api/` | 开发者接入 |
| 项目知识库 | `docs/README.md` | 团队 onboarding |
| 归档索引 | `docs/archive/index.md` | 历史追溯 |

**显式确认**：
- CP7（Demo 验收）：基于 Vercel Preview 环境完成关键用例验证
- CP8（迭代前确认）：每轮迭代开始前确认测试范围与报告输出

---

## 7. 质量检查清单

### QA Agent 自检

| 检查项 | 标准 | 未通过处理 |
|-------|------|-----------|
| 所有 P0 验收条件有测试用例 | 每个 `[ ]` 对应至少一个测试 | 补充测试 |
| E2E 在 Vercel Preview 通过 | `npx playwright test` 全绿 | 修复失败或标记已知问题 |
| RLS 策略有专门测试 | 至少 3 个角色场景 | 补充安全测试 |
| 性能基准建立 | 关键页面 LCP 有记录 | 补充性能测试 |

### Docs Agent 自检

| 检查项 | 标准 | 未通过处理 |
|-------|------|-----------|
| 所有上游文档已归档 | PRD/ADR 在 `docs/archive/` 可找到 | 移动文件 |
| API 文档与代码一致 | 类型定义匹配 | 重新生成或更新 |
| 用户手册覆盖核心流程 | 至少 3 个用户场景 | 补充章节 |
| 无死链 | `docs/README.md` 所有链接有效 | 修复或移除 |

---

## 8. 异常上报

遇到以下情况，上报 SOLO Coder：

| 场景 | 上报内容 | 建议方案 |
|-----|---------|---------|
| 测试覆盖无法达到阈值 | 具体缺口 + 原因分析 | 申请调整范围或延期 |
| 发现严重安全漏洞 | 漏洞描述 + 复现步骤 | 立即阻断发布，修复后重测 |
| 文档与代码严重不一致 | 差异点 + 建议同步方式 | 召集 Frontend/Backend 对齐 |
| 需要非标准测试工具 | 需求原因 + 替代方案 | 申请例外或调整策略 |

---

## 9. 工作流终点

QA / Docs Agent 是 **多 Agent 工作流的终点**：

```
PM → Tech Lead → [Frontend ↔ Backend] → DevOps → QA/Docs → 归档
                                                    ↓
                                              项目知识库
                                                    ↓
                                              下一轮迭代输入
```

**闭环机制**：
- 本轮 QA 发现的问题 → 转化为下一轮 PM 需求或 Tech Lead 技术债务
- 本轮 Docs 沉淀的经验 → 更新各 Agent 积木库模板

---
