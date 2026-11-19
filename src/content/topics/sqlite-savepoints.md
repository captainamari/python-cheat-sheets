---
title: SAVEPOINT 能实现怎样的局部回滚？
summary: SAVEPOINT 在事务内建立可回滚的位置，允许撤销局部操作后继续外层事务。RELEASE 内层保存点不等于把外层事务提交到数据库，最终提交与回滚仍由外层边界决定。
category: data
difficulty: intermediate
minutes: 9
order: 48
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: sqlite_savepoints.py
objectives:
- 区分保存点释放与外层事务提交
- 明确事务模式，使用 SAVEPOINT 并测试外层回滚边界
sources:
- title: SAVEPOINT 能实现怎样的局部回滚：官方文档
  url: https://docs.python.org/3.14/library/sqlite3.html#transaction-control
---

## 核心机制

事务可以包含命名保存点。ROLLBACK TO 撤销保存点之后的修改，并保留该保存点以便后续使用或释放；RELEASE 移除对应保存点边界。在已有外层事务时，释放内层保存点并不会使它的修改独立持久化，外层 ROLLBACK 仍可以撤销整个事务中的修改。

## 放到工程里

批量导入希望保留合法行、跳过单行约束失败时，可以为每个局部操作设保存点，并在失败时回滚到该点，然后收集失败信息。必须先明确业务是否允许部分成功；账务转移等要求整体一致性的操作不应随意拆成部分提交。保存点名称来自程序控制，数据值仍使用绑定参数。

## 容易混淆的边界

Python 连接上下文管理器不能简单当作任意层级的嵌套事务。嵌套 with connection 的行为受驱动事务设置影响，可能提前提交外层操作。本文显式使用 autocommit=True 并发送 BEGIN/COMMIT/ROLLBACK 语句管理 SQLite 事务，避免把不同模式下的 commit 方法行为混在一起。

## 面试追问

批量导入允许部分成功时，如何用保存点记录失败而不破坏外层事务？

- 区分保存点释放与外层事务提交
- 明确事务模式，使用 SAVEPOINT 并测试外层回滚边界

SQLite 保存点的语义还可对照 [SAVEPOINT 官方说明](https://www.sqlite.org/lang_savepoint.html)，尤其注意外层事务与最外层保存点的区别。

## 一分钟回答

保存点提供局部撤销，外层事务决定最终持久化。我先定义部分成功是否合法，再设计命名、回滚与释放。测试不仅检查失败行消失，也验证释放保存点后外层回滚仍然撤销全部操作，并明确驱动事务模式。
