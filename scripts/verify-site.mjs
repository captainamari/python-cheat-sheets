import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const dist = path.resolve('dist');
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map(async (entry) =>
        entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
      ),
    )
  ).flat();
}
const files = await walk(dist),
  html = files.filter((f) => f.endsWith('.html'));
const errors = [];
for (const file of html) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const value = match[1];
    if (/^(https?:|data:|mailto:|javascript:)/.test(value)) continue;
    const clean = decodeURIComponent(value.split(/[?#]/)[0]);
    let target;
    if (clean.startsWith('/')) {
      if (!clean.startsWith('/python-cheat-sheets/')) {
        errors.push(`${file}: 缺少部署 base ${value}`);
        continue;
      }
      target = path.join(dist, clean.slice('/python-cheat-sheets/'.length));
    } else target = path.resolve(path.dirname(file), clean);
    try {
      const info = await stat(target);
      if (info.isDirectory()) await stat(path.join(target, 'index.html'));
    } catch {
      errors.push(`${path.relative(dist, file)}: 链接缺失 ${value}`);
    }
  }
}
const topics = html.filter((f) => f.includes(`${path.sep}topics${path.sep}`));
if (topics.length !== 12) errors.push(`S1 预计 12 个知识页面，实际 ${topics.length}`);
for (const file of topics) {
  const text = await readFile(file, 'utf8');
  if (
    !text.includes('data-pagefind-body') ||
    !text.includes('预期输出') ||
    !text.includes('参考资料')
  )
    errors.push(`${file}: 正文结构不完整`);
}
if (!files.some((f) => f.endsWith('pagefind.js'))) errors.push('搜索索引未构建');
if (errors.length) throw Error(errors.join('\n'));
console.log(`静态验收通过：${html.length} 个 HTML 页面，12 个知识点，内部链接与资源路径有效。`);
