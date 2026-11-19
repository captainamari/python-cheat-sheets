---
title: TaskGroup 中一个任务失败，其他任务会怎样？
summary: TaskGroup 为一组异步任务建立共同的生命周期。子任务出现非取消异常时，通常会取消其他子任务、等待它们退出，再以异常组报告失败。清理代码应放在 finally 中，并让取消继续传播。
category: concurrency
difficulty: advanced
minutes: 10
order: 9
roles:
  - Python 后端
  - 测试开发
  - AI 应用
python: CPython 3.12–3.14；版本差异见正文
example: asyncio_cancellation.py
objectives:
  - 解释结构化任务生命周期
  - 正确传播取消并理解超时边界
sources:
  - title: asyncio：任务组与取消
    url: https://docs.python.org/3.14/library/asyncio-task.html#task-groups
  - title: asyncio：在线程中运行
    url: https://docs.python.org/3.14/library/asyncio-task.html#running-in-threads
---

## 任务必须有人负责等待

只调用协程函数不会立刻执行其主体；需要 await 或调度成 Task。TaskGroup 在 `async with` 范围内管理创建的任务，退出时会等待它们完成，使任务的生命周期与调用方的作用域对应。

示例用 Event 明确任务已经开始，然后取消它并等待退出。这样可以确定清理逻辑执行完毕，再打印完成信息。示例不依赖猜测睡眠时间来安排顺序。

## 失败如何传播

TaskGroup 中某个子任务产生非 CancelledError 异常时，会取消其他任务并等待清理，最后通常通过 ExceptionGroup 报告异常。调用方可使用 `except*` 按异常类型处理。KeyboardInterrupt、SystemExit 等有特殊传播行为。

`gather()` 的默认行为与 TaskGroup 不同：一个任务抛错时，其他任务不会因为这个错误自动全部取消。选择 API 时应明确是允许部分任务继续，还是把它们视为一组共同成功或失败的工作。

## 取消是协作式请求

`task.cancel()` 发出取消请求，不等于强制杀死执行单元。CancelledError 通常在可挂起的位置进入协程。代码可以在 finally 中释放资源，然后继续传播取消。

不要随意捕获 BaseException 后返回成功值，也不要把 CancelledError 当成普通重试错误。吞掉取消可能破坏 TaskGroup 或 timeout 的行为。

## 超时与底层工作

`asyncio.timeout()` 可以给一段等待设置期限，但外部副作用未必被撤回。取消 `to_thread()` 的等待不会强制终止已经运行的线程函数；数据库或远端服务也可能已经收到请求。超时、幂等和最终状态核对需要一起设计。

## 一分钟回答

TaskGroup 管理一组任务的创建、等待和失败清理。子任务失败会触发对其他任务的取消并等待退出。取消是协作式的，我会在 finally 中释放资源，让 CancelledError 继续传播，同时区分调用超时和底层操作真正停止。
