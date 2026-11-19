import { url } from '../lib/urls';
const input = document.getElementById('search-input') as HTMLInputElement;
const form = document.getElementById('search-form') as HTMLFormElement;
const status = document.getElementById('search-status')!;
const results = document.getElementById('search-results')!;
type Result = { url: string; meta: { title: string; description?: string } };
type Pagefind = {
  search: (query: string) => Promise<{ results: { data: () => Promise<Result> }[] }>;
  options: (options: { baseUrl: string }) => Promise<void>;
};
let engine: Promise<Pagefind> | undefined;
let requestId = 0;
async function search(query: string) {
  const request = ++requestId;
  const q = query.trim();
  results.replaceChildren();
  if (!q) {
    status.textContent = '输入关键词，搜索全部知识点正文。';
    return;
  }
  history.replaceState(null, '', `${url('search/')}?q=${encodeURIComponent(q)}`);
  status.textContent = '正在查找…';
  try {
    const moduleUrl = url('pagefind/pagefind.js');
    engine ??= import(/* @vite-ignore */ moduleUrl)
      .then(async (m) => {
        await m.options({ baseUrl: url() });
        return m as Pagefind;
      })
      .catch((error) => {
        engine = undefined;
        throw error;
      });
    const found = await (await engine).search(q);
    const items = await Promise.all(found.results.slice(0, 30).map((r) => r.data()));
    if (request !== requestId) return;
    status.textContent = items.length
      ? `找到 ${found.results.length} 个知识点`
      : '没有找到相关内容。试试更短的关键词或对应的英文 API。';
    for (const item of items) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = item.url;
      const h = document.createElement('h2');
      h.textContent = item.meta.title;
      const p = document.createElement('p');
      p.textContent = item.meta.description || '打开知识点查看讲解和练习';
      link.append(h, p);
      results.append(link);
    }
  } catch {
    if (request !== requestId) return;
    status.textContent = import.meta.env.DEV
      ? '搜索索引在构建后生成。请运行 npm run build 后用预览模式验证搜索。'
      : '搜索暂时不可用，请刷新重试，或返回知识库按分类查找。';
  }
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  void search(input.value);
});
let debounce: ReturnType<typeof setTimeout>;
input.addEventListener('input', () => {
  requestId++;
  clearTimeout(debounce);
  debounce = setTimeout(() => void search(input.value), 200);
});
document.querySelectorAll<HTMLButtonElement>('[data-query]').forEach((button) =>
  button.addEventListener('click', () => {
    input.value = button.dataset.query!;
    void search(input.value);
  }),
);
const initial = new URLSearchParams(location.search).get('q');
if (initial) {
  input.value = initial;
  void search(initial);
}
input.focus();
