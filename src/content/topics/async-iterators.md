---
title: async for 为什么不自动让每项并发？
summary: async for 按异步迭代协议逐项等待，适合流式读取，但循环体默认仍顺序执行。是否并发、最多多少任务在途、何时关闭数据源，都需要单独设计。
category: protocols
difficulty: intermediate
minutes: 9
order: 73
roles:
- Python 后端
- AI 应用
python: CPython 3.12–3.14
example: async_iterators.py
objectives:
- 区分异步取值协议与并发处理策略
- 增加有界调度并在提前退出或取消时明确关闭数据源
sources:
- title: async for 为什么不自动让每项并发：官方文档
  url: https://docs.python.org/3.14/reference/expressions.html#asynchronous-generator-functions
---

## 核心机制

异步可迭代对象通过 `__aiter__` 提供异步迭代器，`__anext__` 返回可等待对象，结束时抛 StopAsyncIteration。async for 把这些步骤组织成循环，每次获取下一项都可能等待 I/O。异步生成器用 async def 和 yield 同时表达按需产出与异步等待，而不是先把全部结果收集成列表。

## 放到工程里

读取分页 API、模型流式输出或异步数据库结果时，顺序消费常能自然形成背压，因为下一项只有在调用方继续迭代时才被请求。若每项处理需要并发，应使用有界队列或受控任务集合，避免在循环里无界 create_task。并发消费还必须定义结果顺序与失败传播策略。

## 容易混淆的边界

循环提前 break 后，拥有外部资源的异步生成器应明确关闭，可以配合 contextlib.aclosing，让清理在当前任务上下文中完成。异步生成器不能用非空 return 返回最终值，也不能直接 yield from。不要把普通迭代器直接用于 async for，异步协议需要真实的可等待取值方法。

## 面试追问

消费异步生成器时，为什么正常耗尽和提前 break 都需要考虑资源生命周期？

- 区分异步取值协议与并发处理策略
- 增加有界调度并在提前退出或取消时明确关闭数据源



## 一分钟回答

async for 解决异步逐项取值，不自动提供并发处理。我先确定消费速度、容量和关闭责任，再决定是否增加 worker。验证要覆盖流耗尽、提前退出、取消和下游变慢，确保资源不会留在后台。
