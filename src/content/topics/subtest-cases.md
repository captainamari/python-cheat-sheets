---
title: subTest 适合怎样的参数化测试？
summary: subTest 为同一测试方法中的多个输入提供独立失败上下文，某组断言失败后可以继续其他组。它不会为每个子测试重新运行 setUp，也不自动隔离可变状态。
category: testing
difficulty: basic
minutes: 7
order: 58
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: subtest_cases.py
objectives:
- 说明子测试报告隔离不等于夹具和状态隔离
- 把每组可变状态在循环内新建并选择独立输入场景
sources:
- title: subTest 适合怎样的参数化测试：官方文档
  url: https://docs.python.org/3.14/library/unittest.html#distinguishing-test-iterations-using-subtests
---

## 核心机制

普通循环中一次断言失败会结束当前测试方法，后续输入无法继续检查。with self.subTest(...) 让框架记录当前参数的失败并继续循环，报告能指出具体哪组数据有问题。子测试仍属于同一个测试方法，方法级夹具和局部可变对象可以被所有迭代共享。

## 放到工程里

纯函数的边界输入、解析规则和格式化组合适合使用 subTest，参数名称应体现业务含义，如 empty、negative 或 invalid_date。每组需要独立对象时，应在循环内部创建，而不是依赖 setUp 为每组重置。用例之间生命周期差异很大时，拆成独立方法通常更清晰。

## 容易混淆的边界

不要把一个完整多阶段业务流程拆成互相依赖的子测试，然后在前一步失败后继续使用无效状态。subTest 让报告更全面，不保证后续步骤仍然有意义。也不能只统计方法数推断覆盖了多少场景；测试设计应记录输入类别、边界和关键不变量，而非追求数量本身。

## 面试追问

什么时候应该用 subTest，什么时候应该拆成多个独立测试方法？

- 说明子测试报告隔离不等于夹具和状态隔离
- 把每组可变状态在循环内新建并选择独立输入场景



## 一分钟回答

subTest 适合重复结构、独立输入的断言，让一次运行暴露多组失败。它不重建夹具，我会在每组内部重置状态，并用参数名帮助定位。互相依赖或资源生命周期不同的流程，应拆成独立测试。
