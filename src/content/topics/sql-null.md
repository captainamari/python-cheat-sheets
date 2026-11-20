---
title: SQL NULL：为什么等号查不到缺失值？
summary: NULL 表示缺失或未知；与它比较通常产生 UNKNOWN。筛选缺失值用 IS NULL，并区分 COUNT(*) 与 COUNT(column)。
category: data
difficulty: basic
minutes: 7
order: 101
roles:
- Python 后端
- 测试开发
python: CPython 3.12–3.14
example: sql_null.py
objectives:
- 解释 UNKNOWN 与 WHERE 的关系，改用 IS NULL
- 用 NULL、空字符串和正常值验证 COUNT 的不同口径
sources:
- title: SQL NULL：为什么等号查不到缺失值：官方文档
  url: https://www.sqlite.org/lang_expr.html
---

## 核心机制

WHERE 只保留表达式为 TRUE 的行，FALSE 和 UNKNOWN 都被排除。因此 x = NULL 不会找到缺失值，x != NULL 也不会找到非空值。IS NULL 与 IS NOT NULL 才表达缺失判断。SQL 的三值逻辑还会影响 NOT IN：候选集合含 NULL 时，一个不匹配任何已知元素的值仍可能得到 UNKNOWN。Python 的 None 经 sqlite3 参数绑定写入 NULL；这不意味着可以把 Python 的相等规则直接套给 SQL。

## 放到工程里

统计表单填写率时，COUNT(*) 计算所有记录，COUNT(email) 只计算 email 非 NULL 的记录，空字符串仍被计数。应先明确业务上空字符串和缺失是否等价，再决定清洗或约束策略。反关联查询可以用带明确连接条件的 NOT EXISTS，避免把可空列放进 NOT IN 后意外过滤所有结果。示例同时查询两种计数和缺失记录，检查的是查询语义，而非驱动返回值的表面差别。

## 容易混淆的边界

COALESCE 可以给展示结果提供默认值，但会把原始缺失状态折叠掉；不要在审计数据里不加说明地替换成零。唯一约束、排序和聚合中的 NULL 行为还要查看具体数据库，不能因为 SQLite 某个结果就推断所有系统一致。构造反例时至少放入普通值、NULL 和空字符串，才能发现很多只有完整数据时看不出的错误。

## 面试追问

如何解释 SQL NULL 的三值逻辑及其对反关联查询和计数的影响？

- 解释 UNKNOWN 与 WHERE 的关系，改用 IS NULL
- 用 NULL、空字符串和正常值验证 COUNT 的不同口径



## 一分钟回答

NULL 采用三值逻辑，WHERE 只接受 TRUE。检查缺失用 IS NULL，统计总行用 COUNT(*)，统计有值列用 COUNT(column)。我会用带缺失值的样例验证 NOT IN 等反关联条件，并明确空字符串与缺失的业务差异。
