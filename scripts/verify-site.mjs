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
const expectedTopics = (await readdir('src/content/topics')).filter((f) =>
  f.endsWith('.md'),
).length;
const topicIds = (await readdir('src/content/topics'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.slice(0, -3));
const cheatPages = html.filter((f) => f.includes(`${path.sep}cheatsheets${path.sep}`));
if (cheatPages.length !== 7) errors.push(`预计 7 个速查页面，实际 ${cheatPages.length}`);
const allCheats = await readFile(path.join(dist, 'cheatsheets/index.html'), 'utf8');
const categoryIds = [];
for (const file of cheatPages) {
  const source = await readFile(file, 'utf8');
  if (source.includes('data-pagefind-body')) errors.push(`${file}: 速查页重复建立正文索引`);
  const ids = [...source.matchAll(/<article\s+id="([^"]+)"[^>]*data-quick-entry/g)].map(
    (m) => m[1],
  );
  if (!ids.length || ids.length !== new Set(ids).size) errors.push(`${file}: 速查条目为空或重复`);
  if (file !== path.join(dist, 'cheatsheets/index.html')) categoryIds.push(...ids);
}
if (categoryIds.length !== expectedTopics || new Set(categoryIds).size !== expectedTopics)
  errors.push('分类速查条目未恰好覆盖全部知识点');
for (const id of topicIds) {
  if (!allCheats.includes(`id="${id}"`) || !categoryIds.includes(id))
    errors.push(`速查缺少知识点 ${id}`);
}
if (topics.length !== expectedTopics)
  errors.push(`预计 ${expectedTopics} 个知识页面，实际 ${topics.length}`);
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
console.log(
  `静态验收通过：${html.length} 个 HTML 页面，${topics.length} 个知识点，${cheatPages.length} 个速查页，内部链接与资源路径有效。`,
);
