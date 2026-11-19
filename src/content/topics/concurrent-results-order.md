---
title: 并发结果顺序应该跟提交还是完成？
summary: Executor.map 通常按输入顺序产出结果，as_completed 按完成情况交付 Future。两者服务不同需求：稳定关联依赖业务 ID，及时处理需要避免被前面慢任务挡住。
category: concurrency
difficulty: intermediate
minutes: 9
order: 100
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: concurrent_results_order.py
objectives:
- 区分提交、完成与展示三种顺序
- 维护 Future 到业务 ID 的映射，并测试可控乱序与失败项
sources:
- title: 并发结果顺序应该跟提交还是完成：官方文档
  url: https://docs.python.org/3.14/library/concurrent.futures.html#concurrent.futures.as_completed
---

## 核心机制

并发执行顺序、完成顺序和结果展示顺序是三个概念。map 即使后面任务先完成，也会按输入位置依次给调用者结果；as_completed 则让已完成 Future 先被消费。多个 Future 在开始迭代前都已完成时，不应依赖它们之间的细微顺序作为稳定业务规则。

## 放到工程里

批量测试报告可以实时按完成顺序显示进度，最后再按用例 ID 或输入序号整理结果。需要把 Future 映射到原任务，捕获异常时才能报告正确对象。若直接 zip 输入列表与 as_completed 的结果，就可能把某个任务的输出贴到另一个输入上，形成难以发现的数据错配。

## 容易混淆的边界

按输入顺序消费可能产生队首阻塞，但换成完成顺序并不自动解决提交数量过大、超时和取消问题。每个任务失败仍需取回异常，结果集合是否允许部分成功要明确。示例用同步事件控制快慢关系，避免依赖 sleep 或机器速度来猜测哪个任务先结束。

## 面试追问

实时进度与最终稳定报告怎样同时支持不同的结果顺序？

- 区分提交、完成与展示三种顺序
- 维护 Future 到业务 ID 的映射，并测试可控乱序与失败项



## 一分钟回答

我根据需求选择结果消费顺序，并始终保存任务身份。实时进度用完成顺序，稳定报告再显式排序。测试构造可控快慢任务和失败项，确认结果不会错配，也不会因一个慢任务掩盖其他已完成工作。
