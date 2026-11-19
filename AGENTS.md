# 项目约定

- 本项目是 Astro + TypeScript 静态中文学习站，优先保持无需后端即可运行。
- 内容源为 `src/content/topics/*.md`、`questions/*.yaml`、`paths/*.yaml`。禁止手动维护平行目录或重复正文。
- 页面中的可运行示例从 `examples/*.py` 读取，预期输出在对应 `.out`。同步修改后实际执行验证。
- 所有站内链接通过 `src/lib/urls.ts`，兼容 `/python-cheat-sheets/` 子路径。
- 阅读、客观题成绩、自评必须分开。不要把“完成练习”自动映射成“已掌握”。
- 存储失败必须可见；未知版本与损坏记录不得静默覆盖。
- 内容写作和版本边界遵循 `docs/content-guide.md`。
- 变更内容或行为后运行 README 中与变更相关的验证；提交前完成 check、test、test:examples、test:outputs、build、test:site，浏览器流程以 CI 或实际浏览器验证。
- 不自动合并 PR；不把未运行的检查记录为通过。
