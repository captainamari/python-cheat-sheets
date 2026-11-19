---
title: 线程池里的 local 为什么不是请求级隔离？
summary: threading.local 为每个线程提供独立属性，但线程池会复用线程，先前任务留下的值可能被后续任务看到。请求级状态需要在入口设置、退出清理，异步任务还应考虑 ContextVar。
category: concurrency
difficulty: intermediate
minutes: 9
order: 98
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: thread_local.py
objectives:
- 区分线程生命周期与请求或任务生命周期
- 入口设置并在 finally 恢复，使用单 worker 验证复用污染
sources:
- title: 线程池里的 local 为什么不是请求级隔离：官方文档
  url: https://docs.python.org/3.14/library/threading.html#thread-local-data
---

## 核心机制

同一个 local 对象在不同线程访问时关联不同的属性字典，因此适合保存线程绑定资源。线程结束与请求结束却不是同一个事件：池中的工作线程可能处理许多任务，线程局部值会随着线程继续存在。把 local 当作每次函数调用自动清空的字典，会导致跨请求上下文泄漏。

## 放到工程里

同步工作池需要关联请求 ID 时，可以在任务开始保存旧值、设置新值，finally 恢复或删除，防止异常路径遗留状态。线程专用连接则应有单独的创建、复用与关闭策略。单线程事件循环内并发协程共享线程，local 不能按任务区分，通常改用 ContextVar 或显式参数。

## 容易混淆的边界

同一 local 对象不意味着所有属性对象都是深拷贝，保存的值本身仍可能指向外部共享资源。把线程局部数据随意传给其他线程也不会自动变得安全。测试应使用固定单 worker 重复提交任务，稳定暴露状态残留，而不是依赖随机调度碰巧让两个请求落在同一线程。

## 面试追问

为什么 threading.local 不适合单线程异步服务的每个请求上下文？

- 区分线程生命周期与请求或任务生命周期
- 入口设置并在 finally 恢复，使用单 worker 验证复用污染



## 一分钟回答

local 隔离线程，不隔离线程上的每个任务。我按资源和请求各自生命周期设置与清理状态，异步调用链另选上下文机制。验证覆盖线程复用和异常退出，确保上一任务不会污染下一任务的日志或权限信息。
