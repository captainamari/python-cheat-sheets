---
title: 有界队列怎样形成背压？
summary: 有界队列通过限制待处理条目，让生产者在消费者跟不上时等待。容量限制的是排队条目，不自动限制已经创建的任务总数；消费者还要正确配对 task_done 与 join。
category: concurrency
difficulty: intermediate
minutes: 9
order: 44
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: bounded_queue.py
objectives:
- 区分条目出队与处理账目完成
- 在对应 finally 中配对 task_done，并另外记录失败结果
sources:
- title: 有界队列怎样形成背压：官方文档
  url: https://docs.python.org/3.14/library/asyncio-queue.html
---

## 核心机制

asyncio.Queue(maxsize=n) 在正容量达到上限时让 await put 等待空位，形成从消费者到生产者的反馈。get 取走条目，task_done 表示该条目的处理已结束，join 等待未完成计数归零。取走和完成是两个不同事件，队列为空不等于所有处理都已经结束。

## 放到工程里

大批文档入库或并发测试调度可以使用固定数量 worker 加有界输入队列，让内存随容量而非总任务数增长。生产者应直接等待 put，不要为每个 put 都 create_task，否则等待中的任务本身仍会无界累积。结束时要设计哨兵、取消或其他关闭协议，并等待 worker 清理。

## 容易混淆的边界

消费者在异常分支漏掉 task_done 会使 join 一直等待；多调用则会报错。task_done 表示队列账目完成，不代表业务成功，失败结果需要单独保存或进入重试机制。为了兼容 Python 3.12，示例不依赖较新版本的 Queue.shutdown；跨线程也不能直接把 asyncio.Queue 当线程安全队列。

## 面试追问

为什么有界队列外再无界创建 put 任务仍然可能耗尽内存？

- 区分条目出队与处理账目完成
- 在对应 finally 中配对 task_done，并另外记录失败结果



## 一分钟回答

背压要求生产者真正等待容量，固定 worker 控制处理中数量，有界队列控制排队数量。每次成功 get 都应在对应处理结束后配对 task_done，失败和关闭另有明确协议。我会验证慢消费者、异常和正常退出。
