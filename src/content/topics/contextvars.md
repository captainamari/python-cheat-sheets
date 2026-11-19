---
title: ContextVar 如何隔离并发请求上下文？
summary: ContextVar 保存上下文局部状态，适合请求 ID 等跨调用链信息。新任务通常复制创建时的上下文；变量绑定隔离不等于嵌套可变对象深拷贝，使用后还应恢复 token。
category: concurrency
difficulty: intermediate
minutes: 9
order: 42
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: contextvars.py
objectives:
- 区分上下文绑定隔离与对象深拷贝
- 每个入口设置独立值并在 finally 中用 token 恢复
sources:
- title: ContextVar 如何隔离并发请求上下文：官方文档
  url: https://docs.python.org/3.14/library/contextvars.html
---

## 核心机制

一个事件循环线程里可以交错运行多个任务，threading.local 无法按任务区分请求。ContextVar 将值绑定到当前上下文，set 返回 token，reset 可以恢复之前的绑定。任务创建时通常捕获当前上下文，之后父任务重新设置变量，不会简单覆盖已经创建的子任务绑定。

## 放到工程里

日志关联 ID、租户标识等适合在请求入口设置、在 finally 中恢复。核心业务参数仍应显式传递，避免所有依赖都隐藏在上下文里。跨线程或执行器边界需要确认上下文如何传播；asyncio.to_thread 会传播当前上下文，但不能把所有线程池提交方式都视为拥有相同保证。

## 容易混淆的边界

ContextVar 中放一个默认列表并在多任务里 append，仍可能修改共享的列表对象。隔离的是变量到对象的绑定，不是自动深拷贝对象。优先保存不可变值或在入口设置新容器。本文用 token.reset 模式兼容 3.12–3.14，不依赖较新版本才支持的 token 上下文管理用法。

## 面试追问

为什么线程局部变量不适合直接充当单线程异步服务的请求上下文？

- 区分上下文绑定隔离与对象深拷贝
- 每个入口设置独立值并在 finally 中用 token 恢复



## 一分钟回答

ContextVar 适合异步调用链的局部上下文。入口设置、finally 恢复，新任务继承创建时的绑定；共享可变值仍需避免。我会测试两个并发请求的日志 ID 不串，并检查跨线程边界的传播规则。
