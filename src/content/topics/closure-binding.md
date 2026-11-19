---
title: 循环里创建的闭包为什么总拿到最后一个值？
summary: 闭包保留对外层变量绑定的访问。函数体执行时才读取该绑定，循环中的多个函数可能共享同一个变量。需要固定创建时的值，可以用默认参数或工厂函数建立独立绑定。
category: protocols
difficulty: intermediate
minutes: 8
order: 4
roles:
  - Python 后端
  - 测试开发
  - AI 应用
python: CPython 3.12–3.14；版本差异见正文
example: closure_binding.py
objectives:
  - 解释闭包的延迟绑定
  - 正确使用默认参数和 nonlocal
sources:
  - title: Python FAQ：循环中的 lambda
    url: https://docs.python.org/3.14/faq/programming.html#why-do-lambdas-defined-in-a-loop-with-different-values-all-return-the-same-result
  - title: nonlocal 语句
    url: https://docs.python.org/3.14/reference/simple_stmts.html#the-nonlocal-statement
---

## 创建函数与调用函数是两件事

列表推导式创建了三个函数，但函数体此时没有执行。等到循环结束再调用，它们读取同一个外层 `i` 的当前值，因此都得到 2。这是延迟绑定，与是否使用 `lambda` 无关：换成普通 `def` 也可能遇到相同问题。

示例第二组函数使用 `lambda i=i: i`。右边的 `i` 在执行函数定义时求值，成为这个函数的默认参数；调用时读取的是自己的参数，从而固定为 0、1、2。

## 工厂函数提供独立作用域

另一种方式是定义 `make_reader(value)`，在它里面返回读取 `value` 的函数。每次调用工厂都会建立独立的局部绑定，适合需要保存多个值、逻辑较长或需要明确命名的回调。

固定绑定不等于深拷贝对象。默认参数保存的是对象引用；如果捕获的是后来还会修改的列表，函数仍能观察到这个列表的变化。

## nonlocal 解决什么问题

读取外层变量通常不需要声明。要在内层重新绑定外层函数作用域中的名字，需要 `nonlocal`。如果只调用外层列表的 `append()`，改变的是对象内容，不是名字绑定。

把 `global` 当成闭包问题的通用解法会把状态提升到模块级，使不同实例共享数据。应先明确希望共享的范围。

## 实际场景

批量注册按钮回调、为任务创建延迟执行函数、构造测试参数时都容易踩到这个问题。测试不应只调用最后生成的函数，而要逐个验证每个回调绑定了预期参数。

## 面试追问

- 默认参数捕获可变对象能隔离后续修改吗？不能，它固定引用，不自动复制。
- 为什么给 `count` 加一会出现 UnboundLocalError？赋值让它被判定为局部名字，读取发生在局部赋值之前。

## 一分钟回答

闭包在调用时读取捕获的变量绑定。循环创建的回调可能共享同一绑定，所以延迟调用时都读到最后值。可以用默认参数在定义时固定值，或用工厂函数建立独立作用域；还要区分固定引用与复制可变对象。
