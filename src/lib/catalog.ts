export const categories = [
  {
    id: 'language',
    name: '语言与对象',
    description: '从名字绑定到对象共享，解释代码真正做了什么。',
    mark: '{}',
  },
  {
    id: 'protocols',
    name: '函数与协议',
    description: '用闭包、迭代和上下文协议组织可维护的代码。',
    mark: 'ƒ',
  },
  {
    id: 'runtime',
    name: '运行时',
    description: '把语言行为、解释器实现与版本边界分开理解。',
    mark: '≋',
  },
  {
    id: 'concurrency',
    name: '并发与异步',
    description: '理解任务的生命周期，管理取消、阻塞和资源。',
    mark: '⋈',
  },
  { id: 'data', name: '数据与事务', description: '让一次业务操作在失败时仍保持一致。', mark: '▤' },
  {
    id: 'testing',
    name: '测试工程',
    description: '选择可控的测试边界，验证真实的调用行为。',
    mark: '✓',
  },
] as const;
export const roles = ['Python 后端', '测试开发', 'AI 应用'] as const;
export const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;
export const difficultyName = (id: string) =>
  ({ basic: '基础', intermediate: '进阶', advanced: '深入' })[id] ?? id;
