---
title: bool 为什么也能参与整数运算？
summary: bool 是 int 的子类，True 与 1、False 与 0 在相等与哈希上相容。因此只用 isinstance(value, int) 校验整数会接受布尔值；接口需要明确是否允许这种输入。
category: language
difficulty: basic
minutes: 7
order: 61
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: numeric_boundaries.py
objectives:
- 解释 bool 与 int 的继承及数字键相等
- 按接口契约排除布尔并分别测试类型与数值边界
sources:
- title: bool 为什么也能参与整数运算：官方文档
  url: https://docs.python.org/3.14/library/stdtypes.html#boolean-type-bool
---

## 核心机制

类型继承决定布尔值可以参与许多整数操作，True 加 True 得到整数 2。数字映射还遵循相等对象同哈希的规则，所以字典中的 True、1 和 1.0 可以指向同一个逻辑键。这里的相等不说明三个对象具有同一类型，更不代表业务含义应当合并。

## 放到工程里

分页大小、重试次数等字段通常希望接受整数而拒绝布尔值。可以先排除 isinstance(value, bool)，再检查整数与范围；如果契约要求恰好是内置 int，也可使用 type(value) is int，但会同时拒绝整数子类。解析 JSON 后尤其需要这一层，因为 true 会变成 Python 布尔对象。

## 容易混淆的边界

不要为了拒绝布尔值就把任意输入都 int() 一遍：浮点数可能被截断，字符串可能被接受，接口约束因此扩大。也不要用数字值作为多种业务标识的混合键，遇到 True 与 1 时会覆盖条目。类型检查应与取值检查分开，测试既包含合法零值，也包含布尔、浮点和负数。

## 面试追问

为什么 True、1 和 1.0 作为字典键时可能只保留一条记录？

- 解释 bool 与 int 的继承及数字键相等
- 按接口契约排除布尔并分别测试类型与数值边界



## 一分钟回答

布尔值参与整数协议，但业务整数未必允许布尔。校验前先定义接受的类型和范围，再处理继承关系。字典键还受相等与哈希契约影响，所以不能用同一个映射混放含义不同却相等的数字标识。
