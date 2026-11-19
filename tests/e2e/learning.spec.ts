import { test, expect } from '@playwright/test';
test('知识阅读、练习、刷新恢复和结果记录', async ({ page }) => {
  await page.goto('topics/mutable-defaults/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('可变默认参数');
  await page.getByRole('button', { name: '标记已阅读', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '已阅读 · 点击取消' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page
    .locator('.article-complete')
    .getByRole('link', { name: '练习这篇', exact: true })
    .click();
  await page.getByRole('button', { name: '开始 4 道练习' }).click();
  for (let i = 0; i < 4; i++) {
    if (await page.locator('input[name="choice"]').count()) {
      await page.locator('input[name="choice"]').first().check();
      await page.getByRole('button', { name: '提交答案' }).click();
    } else if (await page.locator('#output-answer').count()) {
      await page.locator('#output-answer').fill('not the expected output');
      await page.getByRole('button', { name: '检查输出' }).click();
    } else {
      await page.getByRole('button', { name: '我想好了，查看回答要点' }).click();
      await page.getByRole('button', { name: '能说出部分', exact: true }).click();
    }
    await expect(page.locator('.feedback')).toBeVisible();
    if (i === 0) {
      await page.reload();
      await page.getByRole('button', { name: /继续上次练习/ }).click();
      await expect(page.locator('.feedback')).toBeVisible();
    }
    await page
      .getByRole('button', { name: i === 3 ? '查看本轮结果' : '下一题', exact: true })
      .click();
  }
  await expect(page.getByRole('heading', { name: '本轮练习完成' })).toBeVisible();
  await expect(page.locator('.result-stats').nth(0)).toContainText('开放题已自评');
  await page.getByRole('link', { name: '查看学习记录', exact: true }).click();
  await expect(page.locator('.review-row')).toContainText('已阅读');
  await expect(page.locator('.review-row')).toContainText('/2 次答对');
});
test('中文与技术术语搜索返回可打开的正确页面', async ({ page }) => {
  await page.goto('search/');
  for (const q of ['可变默认参数', 'GIL', 'TaskGroup']) {
    await page.getByRole('searchbox').fill(q);
    await page.getByRole('button', { name: '搜索', exact: true }).click();
    await expect(page.locator('.search-result').first()).toBeVisible();
    await expect(page.locator('#search-status')).toContainText('找到');
  }
  await page.locator('.search-result').first().click();
  await expect(page.locator('.prose')).toContainText('TaskGroup');
});
test('分类导航、响应式宽度与正文展示', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('.field-art')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  if (await page.locator('#category-select').isVisible())
    await page.locator('#category-select').selectOption('runtime');
  else await page.getByRole('button', { name: /运行时/ }).click();
  await expect(page.locator('[data-topic-card]:visible')).toHaveCount(9);
  await page.locator('[data-topic-card]:visible').first().click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect(page.locator('.prose')).toContainText('free-threaded');
});
test('损坏存储有明确提示且仍可阅读', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('python-cheat-sheets:progress:v1', '{bad'));
  await page.goto('topics/object-sharing/');
  await expect(page.locator('#storage-notice')).toBeVisible();
  await expect(page.locator('.prose')).toBeVisible();
});
