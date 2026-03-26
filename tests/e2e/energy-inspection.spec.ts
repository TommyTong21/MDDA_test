import { expect, test, type Page } from "@playwright/test"

async function gotoAndExpectTexts(page: Page, path: string, texts: Array<string | RegExp>) {
  await page.goto(path)
  const body = page.locator("body")
  for (const t of texts) {
    await expect(body).toContainText(t)
  }
}

function makePlaceholderUploadFile() {
  const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xd9])
  return {
    name: "placeholder.jpg",
    mimeType: "image/jpeg",
    buffer,
  }
}

test.describe("Run02｜能源：配电房巡检缺陷检测与安全作业卡（Mock E2E）", () => {
  test("Admin 入口/巡检/缺陷/作业卡页面可打开并出现关键文案", async ({ page }) => {
    await gotoAndExpectTexts(page, "/energy-inspection", [
      "能源巡检",
      /历史变化检测（ChangeFormer）/,
      /不会影响风险分级/,
    ])

    await gotoAndExpectTexts(page, "/energy-inspection/inspections", [
      "巡检记录",
      /Mock 数据/,
      /不依赖 Supabase 环境变量/,
    ])

    await gotoAndExpectTexts(page, "/energy-inspection/defects", [
      "缺陷看板",
      "历史变化检测（ChangeFormer）：待接入 / 占位",
      /不.*影响.*风险分级/,
    ])

    await gotoAndExpectTexts(page, "/energy-inspection/workcards", [
      "作业卡",
      /线性审批链（MVP）/,
    ])
  })

  test("Submit 页：填写描述/选择文件并提交后出现“已入队”反馈", async ({ page }) => {
    await gotoAndExpectTexts(page, "/energy-inspection/submit", ["配电房巡检提交"])

    const description = "柜门温升异常，伴随轻微异响（E2E 占位提交）"
    await page.locator("textarea").fill(description)

    const uploadInput = page.locator('input[type="file"]')
    await uploadInput.setInputFiles([makePlaceholderUploadFile()])
    await expect(page.getByText("placeholder.jpg")).toBeVisible()

    const submitBtn = page.getByRole("button", { name: "提交入队" })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    await expect(page.getByText("已入队，等待缺陷检测结果")).toBeVisible()
    await expect(page.locator("span.font-mono")).toHaveText(/queue_/)
  })
})
