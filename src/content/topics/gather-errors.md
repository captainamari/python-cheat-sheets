---
title: gather 报错后其他任务会自动停止吗？
summary: gather 默认会把先遇到的异常传播给等待者，但不会仅因此自动取消其他已提交任务。return_exceptions=True 将异常放入结果列表，调用者必须逐项检查，不能把它们当成功值。
category: concurrency
difficulty: intermediate
minutes: 9
order: 40
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: gather_errors.py
objectives:
- 区分子任务失败、gather 取消与运行器退出清理
- 逐项建立成功失败结果并明确剩余任务的生命周期
sources:
- title: gather 报错后其他任务会自动停止吗：官方文档
  url: https://docs.python.org/3.14/library/asyncio-task.html#running-tasks-concurrently
---

## 核心机制

gather 把多个可等待对象组合起来，返回结果的顺序对应输入顺序，而不是完成顺序。默认模式中某个任务失败，等待 gather 的代码会收到异常，其余任务仍可能继续执行。若 gather 本身被取消，则会向未完成的子任务传播取消；这与某个子任务普通失败是不同路径。

## 放到工程里

批量查询允许部分失败时，可以使用 return_exceptions=True 汇总，再把每项转换成清晰的成功或失败记录。结果应携带输入 ID，避免排序或过滤后失去对应关系。任务之间具有共同成功条件时，TaskGroup 的失败取消边界通常更直接，选择依据是业务生命周期而非哪个函数名字熟悉。

## 容易混淆的边界

在捕获异常后才对已经完成的 gather 调用 cancel，不一定会取消那些仍运行的任务。若用独立任务管理，应保存引用并明确取消和等待。asyncio.run 退出时的清理可能让小演示看起来“gather 自动取消了其他任务”，但那是顶层运行器结束造成的，不能据此推断长期服务行为。

## 面试追问

为什么短脚本中看到剩余任务被取消，不足以证明 gather 具有失败全取消语义？

- 区分子任务失败、gather 取消与运行器退出清理
- 逐项建立成功失败结果并明确剩余任务的生命周期



## 一分钟回答

gather 聚合结果并保留输入顺序，默认传播异常不等于同组其他任务都停止。允许部分成功时逐项检查异常；需要共同生命周期时使用任务组或明确取消等待。验证应保持事件循环运行，观察剩余任务，而不只看脚本退出。
