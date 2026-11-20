import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSearch,
  readQuickFilters,
  matchesQuickFilter,
  quickQuery,
} from '../src/lib/quick-reference';
const item = {
  search: normalizeSearch('AsyncMock 异步调用 await_count'),
  category: 'testing',
  difficulty: 'intermediate',
  roles: ['测试开发'],
};
test('速查关键词统一大小写、全角字符，多个词必须同时匹配', () => {
  assert.equal(matchesQuickFilter(item, readQuickFilters('?q=ＡＳＹＮＣＭＯＣＫ+异步')), true);
  assert.equal(matchesQuickFilter(item, readQuickFilters('?q=AsyncMock+事务')), false);
  assert.equal(matchesQuickFilter(item, readQuickFilters('?q=%20%20')), true);
});
test('速查分类、难度、岗位同时生效，分类页不可被查询参数切换', () => {
  assert.equal(
    matchesQuickFilter(
      item,
      readQuickFilters('?category=testing&difficulty=intermediate&role=测试开发'),
    ),
    true,
  );
  assert.equal(matchesQuickFilter(item, readQuickFilters('?role=AI+应用')), false);
  assert.equal(matchesQuickFilter(item, readQuickFilters('?difficulty=basic')), false);
  assert.equal(readQuickFilters('?category=language', 'testing').category, 'testing');
});
test('分享筛选往返一致，未知条件恢复默认并限制输入长度', () => {
  const filters = readQuickFilters(
    '?q=__len__&category=protocols&difficulty=advanced&role=Python+后端',
  );
  assert.deepEqual(readQuickFilters(quickQuery(filters)), filters);
  assert.deepEqual(readQuickFilters('?category=unknown&difficulty=unknown&role=unknown'), {
    query: '',
    category: 'all',
    difficulty: 'all',
    role: 'all',
  });
  assert.equal(readQuickFilters('?q=' + 'a'.repeat(500)).query.length, 200);
  assert.equal(
    quickQuery({ ...filters, category: 'testing' }, 'testing').includes('category='),
    false,
  );
});
