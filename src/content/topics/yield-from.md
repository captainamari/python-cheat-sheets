---
title: yield from 除了转发元素还做了什么？
summary: yield from 将生成器协议委托给子迭代器，不只是简写 for/yield。它还能转发 send、throw 和 close 等交互，并接收子生成器 return 携带的最终值。
category: protocols
difficulty: advanced
minutes: 10
order: 71
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: yield_from.py
objectives:
- 区分逐项 yield 与结束时 return 的协议位置
- 用 yield from 接收最终值，并测试耗尽和提前关闭
sources:
- title: yield from 除了转发元素还做了什么：官方文档
  url: https://docs.python.org/3.14/reference/expressions.html#yield-expressions
---

## 核心机制

子生成器 yield 产生逐项值，return 则结束迭代并把最终结果放进 StopIteration.value。外层 result = yield from child() 可以获取这个结束值，再继续自己的逻辑。普通 for 循环只消费元素，通常不会把子生成器的最终返回值交给循环体，也不会完整表达双向协议转发。

## 放到工程里

分层解析器或分阶段流式处理可以把一个子流程交给另一个生成器，同时保留最终统计结果。若只是拼接几个普通可迭代对象，itertools.chain 可能更清楚；若需要双向发送或统一关闭，则应认真定义委托关系。调用方还要明确谁负责消费完毕，谁负责提前终止时的资源释放。

## 容易混淆的边界

不要把生成器 return 的值误认为最后一个 yield 元素，list(generator) 不会自动包含它。子迭代器未必支持所有高级交互，向普通列表迭代器 send 非 None 值会遇到协议限制。异步生成器不支持直接使用 yield from，应采用 async for 等异步协议组织转发。

## 面试追问

什么时候 yield from 比普通 for/yield 更合适，异步生成器又有什么限制？

- 区分逐项 yield 与结束时 return 的协议位置
- 用 yield from 接收最终值，并测试耗尽和提前关闭



## 一分钟回答

yield from 委托的是迭代协议，可以接收子生成器的最终返回值，并处理相应交互。选择它之前先区分单纯拼接与双向协作。验证应覆盖正常耗尽、返回值、提前关闭和异常传播，而不只看列表中的元素。
