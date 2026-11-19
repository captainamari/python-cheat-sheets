---
title: 为什么 async 接口仍然可能阻塞其他请求？
summary: async def 不会自动把函数里的同步操作变成异步。协程在事件循环线程里执行，如果调用阻塞 I/O 或长时间计算，其他任务就无法及时获得执行机会。要检查调用链中的具体阻塞点。
category: concurrency
difficulty: intermediate
minutes: 9
order: 10
roles:
  - Python 后端
  - 测试开发
  - AI 应用
python: CPython 3.12–3.14；版本差异见正文
example: asgi_blocking.py
objectives:
  - 定位异步调用链中的同步阻塞
  - 按任务类型选择执行边界
sources:
  - title: FastAPI：并发与 async / await
    url: https://fastapi.tiangolo.com/async/
  - title: asyncio：to_thread
    url: https://docs.python.org/3.14/library/asyncio-task.html#asyncio.to_thread
---

## async 是协作式执行

事件循环调度协程，任务在 await 可挂起的操作时让出执行机会。把函数声明为 async，只是使它成为协程函数；里面的 `time.sleep()`、同步 HTTP 客户端或长计算仍会占住事件循环线程。

示例用 `asyncio.to_thread()` 运行同步 I/O 形式的函数，让事件循环等待它的结果。它说明调用边界如何改变，不代表所有同步函数都应该搬进线程。

## 框架的自动处理有边界

以 FastAPI 为例，框架调用的普通 `def` 路由和某些同步依赖会在线程池执行；但你在 `async def` 路由内部直接调用普通工具函数，该工具函数不会自动被框架转移到线程池。

ASGI 是应用与服务器交互的协议，不是“所有代码天然非阻塞”的保证。还要观察服务器进程数、线程池容量、数据库连接池和下游请求限制。

## 怎样修复

优先使用支持异步的客户端，并复用连接池。短期需要兼容阻塞 I/O 库时，可以评估 to_thread 或框架提供的线程池接口，同时设置并发上限和超时。

纯 Python CPU 密集任务在启用 GIL 的 CPython 中通常应评估进程池或独立任务服务。把它放到线程中虽然改变调度位置，但不等于获得多核计算能力。

## 从现象定位原因

如果一个慢接口让同一进程中的健康检查也变慢，应检查事件循环是否被阻塞。记录每段调用耗时、并发数、连接池等待和事件循环延迟，再用小规模并发实验定位；平均响应时间不足以暴露尾延迟。

修复后同时验证异常、取消和资源回收。线程中的阻塞调用可能在调用方超时之后继续运行，所以不能无上限地提交任务。

## 一分钟回答

async 接口仍可能执行阻塞调用。我要检查整条调用链，区分可 await 的异步 I/O、同步阻塞 I/O 和 CPU 计算。优先选择异步客户端；兼容同步 I/O 时用受控线程池；重计算则评估进程或任务服务，并通过并发与尾延迟验证效果。
