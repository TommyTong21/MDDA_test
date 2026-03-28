import { expect, test } from "@playwright/test"

test("home page loads", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "AI 康养护理智能助手" })).toBeVisible()
})

test("admin dashboard loads", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page.getByRole("heading", { name: "今日排线概览" })).toBeVisible()
})

test("caregiver mvp loads", async ({ page }) => {
  await page.goto("/caregiver")
  await expect(page.getByRole("heading", { name: "护工端 MVP 工作台" })).toBeVisible()
})
