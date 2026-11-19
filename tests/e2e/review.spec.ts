import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const key = 'python-cheat-sheets:progress:v2';
const legacyKey = 'python-cheat-sheets:progress:v1';
const file = (data: unknown) => ({
  name: 'records.json',
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify(data)),
});
test('收藏独立保存，导出与预览替换往返且重复导入不累加', async ({ page }) => {
  await page.goto('topics/mutable-defaults/');
  await page.getByRole('button', { name: '收藏这篇', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '已收藏 · 点击取消' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: '标记已阅读', exact: true })).toBeVisible();
  await page.goto('review/');
  await page.getByRole('button', { name: '收藏 · 1', exact: true }).click();
  await expect(page.locator('.review-row')).toContainText('可变默认参数');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出学习记录', exact: true }).click();
  const download = await downloading;
  const backup = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(backup.progress.bookmarks['mutable-defaults']).toBeGreaterThan(0);
  expect(backup.progress.topics).toEqual({});
  backup.progress.topics['mutable-defaults'] = {
    readAt: 100,
    objective: { attempts: 2, correct: 1 },
  };
  await page.locator('#import-progress').setInputFiles(file(backup));
  await expect(page.getByRole('heading', { name: '导入预览' })).toBeVisible();
  await expect(page.locator('#review-summary')).toContainText('0 / 60');
  await page.getByRole('button', { name: '确认替换本机记录' }).click();
  await expect(page.locator('#backup-status')).toContainText('导入成功');
  await expect(page.locator('#review-summary')).toContainText('1 / 60');
  await page.locator('#import-progress').setInputFiles([]);
  await page.locator('#import-progress').setInputFiles(file(backup));
  await page.getByRole('button', { name: '确认替换本机记录' }).click();
  await page.reload();
  await expect(page.locator('.review-row')).toContainText('1/2 次答对');
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key);
  expect(saved.topics['mutable-defaults'].objective.attempts).toBe(2);
  await expect(page.getByRole('button', { name: '下载上次导入前的记录' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('错题纠正后移出队列，刷新不重复计分，开放题另行巩固', async ({ page }) => {
  await page.goto('practice/?question=mutable-defaults-mcq');
  await page.getByRole('button', { name: '开始 1 道练习' }).click();
  await page.locator('input[value="a"]').check();
  await page.getByRole('button', { name: '提交答案' }).click();
  await page.reload();
  await page.getByRole('button', { name: /继续上次练习/ }).click();
  await expect(page.locator('.feedback')).toContainText('再看一下');
  await page.goto('review/');
  await page.getByRole('button', { name: '客观错题 · 1' }).click();
  await page.getByRole('link', { name: '练习这个队列' }).click();
  await page.getByRole('button', { name: '开始 1 道练习' }).click();
  await page.locator('input[value="c"]').check();
  await page.getByRole('button', { name: '提交答案' }).click();
  // The queue is now empty, but this submitted session must still resume.
  await page.reload();
  await page.getByRole('button', { name: /继续上次练习/ }).click();
  await expect(page.locator('.feedback')).toContainText('回答正确');
  await page.goto('review/');
  await expect(page.getByRole('button', { name: '客观错题 · 0' })).toBeVisible();
  await expect(page.locator('.review-row')).toContainText('1/2 次答对');
  await page.goto('practice/?question=mutable-defaults-oral');
  await page.getByRole('button', { name: '开始 1 道练习' }).click();
  await page.getByRole('button', { name: '我想好了，查看回答要点' }).click();
  await page.getByRole('button', { name: '还需复习', exact: true }).click();
  await page.goto('review/');
  await expect(page.getByRole('button', { name: '开放题巩固 · 1' })).toBeVisible();
  await expect(page.getByRole('button', { name: '到期复习 · 1' })).toBeVisible();
  await expect(page.locator('.review-row')).toContainText('1/2 次答对');
});
test('S1记录迁移保留原文，坏备份与取消导入都不改变当前记录', async ({ page }) => {
  const old = {
    version: 1,
    topics: {
      'mutable-defaults': { readAt: 0, objective: { attempts: 5, correct: 3 }, self: 'partial' },
    },
  };
  await page.goto('');
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [legacyKey, JSON.stringify(old)]);
  await page.goto('topics/mutable-defaults/');
  await expect(page.getByRole('button', { name: '已阅读 · 点击取消' })).toBeVisible();
  await page.getByRole('button', { name: '收藏这篇', exact: true }).click();
  await expect
    .poll(() => page.evaluate((k) => localStorage.getItem(k), legacyKey))
    .toBe(JSON.stringify(old));
  await page.goto('review/');
  const before = await page.evaluate((k) => localStorage.getItem(k), key);
  await page.locator('#import-progress').setInputFiles(file({ version: 99 }));
  await expect(page.locator('#backup-status')).toContainText('版本无法识别');
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(before);
  await page.locator('#import-progress').setInputFiles(file({ version: 1, topics: {} }));
  await page.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(before);
  await expect(page.locator('.review-row')).toContainText('3/5 次答对');
});
test('导入失败保留原记录并显示可操作提示', async ({ page }) => {
  await page.goto('review/');
  const old = JSON.stringify({
    version: 1,
    topics: { 'object-sharing': { readAt: 1, objective: { attempts: 1, correct: 1 } } },
  });
  await page.evaluate(([k, raw]) => localStorage.setItem(k, raw), [legacyKey, old]);
  await page.reload();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'python-cheat-sheets:progress:v2')
        throw new DOMException('quota', 'QuotaExceededError');
      return original.call(this, k, v);
    };
  });
  await page.locator('#import-progress').setInputFiles(file({ version: 1, topics: {} }));
  await page.getByRole('button', { name: '确认替换本机记录' }).click();
  await expect(page.locator('#backup-status')).toContainText('原记录保持不变');
  expect(await page.evaluate((k) => localStorage.getItem(k), legacyKey)).toBe(old);
  await expect(page.locator('.review-row')).toContainText('1/1 次答对');
});
