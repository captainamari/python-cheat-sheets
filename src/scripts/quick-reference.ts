import {
  readQuickFilters,
  matchesQuickFilter,
  normalizeSearch,
  quickQuery,
  type QuickFilters,
} from '../lib/quick-reference';
const root = document.querySelector<HTMLElement>('.quick-reference')!;
const fixed = root.dataset.fixedCategory;
const form = document.getElementById('quick-filters') as HTMLFormElement;
const query = document.getElementById('quick-query') as HTMLInputElement;
const category = document.getElementById('quick-category') as HTMLSelectElement | null;
const difficulty = document.getElementById('quick-difficulty') as HTMLSelectElement;
const role = document.getElementById('quick-role') as HTMLSelectElement;
const status = document.getElementById('quick-action-status')!;
const entries = [...root.querySelectorAll<HTMLElement>('[data-quick-entry]')].map((node) => ({
  node,
  search: normalizeSearch(node.textContent ?? ''),
  category: node.dataset.category!,
  difficulty: node.dataset.difficulty!,
  roles: JSON.parse(node.dataset.roles!) as string[],
}));
function values(): QuickFilters {
  return {
    query: query.value,
    category: fixed ?? category!.value,
    difficulty: difficulty.value,
    role: role.value,
  };
}
function update(writeUrl = true) {
  const filters = values();
  let count = 0;
  for (const entry of entries) {
    entry.node.hidden = !matchesQuickFilter(entry, filters);
    if (!entry.node.hidden) count++;
  }
  for (const section of root.querySelectorAll<HTMLElement>('[data-quick-section]'))
    section.hidden = !section.querySelector('[data-quick-entry]:not([hidden])');
  document.getElementById('quick-count')!.textContent = `${count} / ${entries.length} 个速查条目`;
  document.getElementById('quick-empty')!.hidden = count > 0;
  (document.getElementById('quick-print') as HTMLButtonElement).disabled = count === 0;
  status.textContent = '';
  if (writeUrl) {
    const search = quickQuery(filters, fixed);
    history.replaceState(
      null,
      '',
      `${location.pathname}${search ? `?${search}` : ''}${location.hash}`,
    );
  }
}
function restore() {
  const filters = readQuickFilters(location.search, fixed);
  query.value = filters.query;
  if (category) category.value = filters.category;
  difficulty.value = filters.difficulty;
  role.value = filters.role;
  update(false);
}
form.hidden = false;
document.getElementById('quick-actions')!.hidden = false;
form.addEventListener('submit', (e) => {
  e.preventDefault();
  update();
});
form.addEventListener('input', () => update());
form.addEventListener('change', () => update());
form.addEventListener('reset', (e) => {
  e.preventDefault();
  query.value = '';
  if (category) category.value = 'all';
  difficulty.value = 'all';
  role.value = 'all';
  update();
});
window.addEventListener('popstate', restore);
document.getElementById('quick-copy-link')!.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    status.textContent = '筛选链接已复制。';
  } catch {
    status.textContent = '无法访问剪贴板，请复制浏览器地址栏中的链接。';
  }
});
document.getElementById('quick-print')!.addEventListener('click', () => window.print());
for (const button of root.querySelectorAll<HTMLButtonElement>('.quick-copy')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const text = document
      .getElementById(button.dataset.codeId!)!
      .querySelector('code')!.textContent!;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = '已复制';
    } catch {
      button.textContent = '请选中代码复制';
    }
    setTimeout(() => (button.textContent = '复制代码'), 1800);
  });
}
restore();
