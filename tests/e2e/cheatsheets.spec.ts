import { test, expect } from '@playwright/test';
test('速查筛选可刷新、分享，空结果和清除可恢复', async ({ page }) => {
  await page.goto('cheatsheets/');
  await expect(page.locator('[data-quick-entry]:visible')).toHaveCount(120);
  await page.getByLabel('查概念或 API').fill('AsyncMock');
  await page.getByLabel('分类', { exact: true }).selectOption('testing');
  await expect(page.locator('[data-quick-entry]:visible')).not.toHaveCount(0);
  await expect(page).toHaveURL(/q=AsyncMock/);
  const count = await page.locator('[data-quick-entry]:visible').count();
  await page.reload();
  await expect(page.getByLabel('查概念或 API')).toHaveValue('AsyncMock');
  await expect(page.getByLabel('分类', { exact: true })).toHaveValue('testing');
  await expect(page.locator('[data-quick-entry]:visible')).toHaveCount(count);
  await page.getByLabel('查概念或 API').fill('not-a-real-concept-xyz');
  await expect(page.locator('#quick-empty')).toBeVisible();
  await expect(page.getByRole('button', { name: '打印当前筛选' })).toBeDisabled();
  await page.getByRole('button', { name: '清除筛选' }).click();
  await expect(page.locator('[data-quick-entry]:visible')).toHaveCount(120);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('分类速查示例、正文和练习链接有效，打印仅包含筛选结果', async ({ page }) => {
  await page.goto('cheatsheets/testing/?q=AsyncMock');
  const row = page.locator('#async-mock');
  await row.locator('summary').click();
  await expect(row.locator('pre').first()).toContainText('AsyncMock');
  await expect(row.locator('.quick-output')).toContainText('1 0');
  await expect(row.getByRole('link', { name: '练习这篇' })).toHaveAttribute(
    'href',
    /practice\/\?topic=async-mock/,
  );
  const before = await page.evaluate(() => localStorage.getItem('python-cheat-sheets:progress:v2'));
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#quick-filters')).toBeHidden();
  await expect(page.locator('#quick-print')).toBeHidden();
  await expect(page.locator('#mock-boundaries')).toBeHidden();
  await expect(row).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('python-cheat-sheets:progress:v2'))).toBe(
    before,
  );
  await page.emulateMedia({ media: 'screen' });
  await row.getByRole('link', { name: '读原理与边界' }).click();
  await expect(page).toHaveURL(/topics\/async-mock\//);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('AsyncMock');
});
test('速查无脚本时仍有规则和可展开的示例', async ({ browser, page: fixturePage }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: fixturePage.viewportSize(),
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/python-cheat-sheets/cheatsheets/language/');
  await expect(page.locator('[data-quick-entry]')).toHaveCount(23);
  await expect(page.locator('#quick-filters')).toBeHidden();
  const row = page.locator('#numeric-boundaries');
  await row.locator('summary').click();
  await expect(row.locator('pre').first()).toContainText('isinstance(True, int)');
  await expect(row.locator('.quick-rule')).toContainText('bool');
  await context.close();
});
