import { categories, roles } from './catalog';
export type QuickFilters = { query: string; category: string; difficulty: string; role: string };
export type QuickEntry = { search: string; category: string; difficulty: string; roles: string[] };
export const normalizeSearch = (value: string) =>
  value.normalize('NFKC').toLocaleLowerCase('en').trim();
export function readQuickFilters(search: string, fixedCategory?: string): QuickFilters {
  const p = new URLSearchParams(search);
  const category = fixedCategory ?? p.get('category') ?? 'all';
  const difficulty = p.get('difficulty') ?? 'all';
  const role = p.get('role') ?? 'all';
  return {
    query: (p.get('q') ?? '').slice(0, 200),
    category: categories.some((c) => c.id === category) ? category : 'all',
    difficulty: ['basic', 'intermediate', 'advanced'].includes(difficulty) ? difficulty : 'all',
    role: roles.includes(role as (typeof roles)[number]) ? role : 'all',
  };
}
export function matchesQuickFilter(entry: QuickEntry, filters: QuickFilters): boolean {
  return (
    (filters.category === 'all' || filters.category === entry.category) &&
    (filters.difficulty === 'all' || filters.difficulty === entry.difficulty) &&
    (filters.role === 'all' || entry.roles.includes(filters.role)) &&
    normalizeSearch(filters.query)
      .split(/\s+/)
      .filter(Boolean)
      .every((word) => entry.search.includes(word))
  );
}
export function quickQuery(filters: QuickFilters, fixedCategory?: string) {
  const p = new URLSearchParams();
  if (filters.query.trim()) p.set('q', filters.query.trim());
  if (filters.category !== 'all' && !fixedCategory) p.set('category', filters.category);
  if (filters.difficulty !== 'all') p.set('difficulty', filters.difficulty);
  if (filters.role !== 'all') p.set('role', filters.role);
  return p.toString();
}
