import { defineConfig, devices } from "@playwright/test"

function ensureNoProxyForLocalhost(): void {
  const additions = ["localhost", "127.0.0.1"]
  const current = process.env.NO_PROXY ?? process.env.no_proxy ?? ""
  const merged = [
    ...current
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    ...additions,
  ]
    .filter((v, idx, arr) => arr.indexOf(v) === idx)
    .join(",")

  process.env.NO_PROXY = merged
  process.env.no_proxy = merged
}

function getE2EPort(): number {
  const raw = process.env.E2E_PORT
  const parsed = raw ? Number(raw) : 3000
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3000
}

ensureNoProxyForLocalhost()

const port = getE2EPort()
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "line" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: `pnpm exec next dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NO_PROXY: process.env.NO_PROXY,
      no_proxy: process.env.no_proxy,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
