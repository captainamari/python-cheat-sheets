---
title: 异步上下文管理器怎样处理异常与取消？
summary: asynccontextmanager 用一次 yield 划分异步资源的取得与退出。yield 后的清理应放入 finally；捕获异常却不重新抛出会改变调用者看到的结果，取消也需要按生命周期传播。
category: protocols
difficulty: intermediate
minutes: 9
order: 75
roles:
- Python 后端
- AI 应用
python: CPython 3.12–3.14
example: async_contextmanager.py
objectives:
- 解释单次 yield 两侧的进入与退出协议
- 观察异常后重新传播，并在 finally 处理异步清理
sources:
- title: 异步上下文管理器怎样处理异常与取消：官方文档
  url: https://docs.python.org/3.14/library/contextlib.html#contextlib.asynccontextmanager
---

## 核心机制

装饰器把异步生成器转成异步上下文管理器，进入时运行到 yield，把产出的值交给 as 变量；退出时继续生成器，若主体抛错则把异常送回 yield 位置。因此 yield 周围的 try/except/finally 决定资源如何清理以及异常是否被抑制，生成器必须恰好产出一次。

## 放到工程里

异步连接、锁租约或临时远程会话可以使用该模式，让调用者用 async with 明确拥有资源。获取失败与使用失败是不同路径，只有成功取得的资源才应进入对应清理。清理自身如果需要 await，还要考虑取消和超时预算，不能让退出流程无限挂起，或悄悄把请求取消变成成功返回。

## 容易混淆的边界

记录异常后直接结束生成器，可能让上下文认为异常已被处理；如果只是观察，应重新 raise。不要在 finally 里再次 yield，也不要把多次 yield 当作一组资源逐个借出的接口。重复使用同一个上下文管理器实例可能受其实现限制，常见用法是每次调用工厂创建新的上下文。

## 面试追问

异步上下文的获取失败、主体失败和取消，分别应该怎样验证？

- 解释单次 yield 两侧的进入与退出协议
- 观察异常后重新传播，并在 finally 处理异步清理



## 一分钟回答

我把取得、使用、清理三个阶段分开，asynccontextmanager 用单次 yield 连接它们。清理放在 finally，不能处理的异常继续传播。验证同时覆盖获取失败、主体失败、取消和清理失败，保证资源与异常都能交代清楚。
