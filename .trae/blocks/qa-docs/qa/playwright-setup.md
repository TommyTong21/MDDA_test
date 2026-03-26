# Playwright E2E 测试配置积木

当项目进入 Phase 3 需要建立 Quality Gate 时，QA Agent 请按此模板初始化测试环境。

## 1. 安装
```bash
pnpm create playwright
# 选择 TypeScript, tests 目录, 不添加 GitHub Actions (我们另行配置)
```

## 2. playwright.config.ts 基础模板
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // 可选添加 firefox, webkit
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 3. 测试规约
- 所有 E2E 测试用例必须对应 PRD 中的 P0 验收条件。
- 必须编写鉴权测试（验证 Supabase RLS 是否生效）。
