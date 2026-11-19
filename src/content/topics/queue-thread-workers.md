---
title: 线程队列的结束信号怎样设计？
summary: queue.Queue 可以在线程间安全传递条目，task_done/join 管理未完成计数；工作线程退出仍需独立协议。使用哨兵时，要让每个消费者都能收到结束信号并配对完成确认。
category: concurrency
difficulty: intermediate
minutes: 9
order: 99
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: queue_thread_workers.py
objectives:
- 区分队列账目完成与线程停止
- 为所有消费者设计结束协议并配对 task_done 和线程 join
sources:
- title: 线程队列的结束信号怎样设计：官方文档
  url: https://docs.python.org/3.14/library/queue.html
---

## 核心机制

put 增加队列条目与未完成计数，get 取走条目但不代表处理完成，task_done 才减少账目。join 等待计数归零，不会替你自动 join 工作线程。哨兵是应用层约定的特殊对象或值，消费者识别后退出，但哨兵本身也进入了队列账目，需要正确处理。

## 放到工程里

固定 worker 数量加有界队列可以限制排队内存，生产者在容量满时等待。启动、停止与失败处理应由同一个调度层负责：每个 worker 的异常要被记录，消费者全部退出后不能让生产者永久阻塞。多个消费者通常需要相应数量的哨兵，或使用兼容目标版本的明确关闭机制。

## 容易混淆的边界

只调用 queue.join 不能保证线程已经退出，必须分别等待线程结束。task_done 表示处理账目完成，不代表业务成功，异常结果需要另存。本站兼容 Python 3.12，因此示例使用哨兵，不依赖较新版本增加的队列关闭 API；也不要用 qsize 的瞬时值替代真正的完成协议。

## 面试追问

为什么处理失败也可能需要调用 task_done，同时另行记录业务失败？

- 区分队列账目完成与线程停止
- 为所有消费者设计结束协议并配对 task_done 和线程 join



## 一分钟回答

我把传递任务、确认完成和停止线程分成三层。每次成功 get 都在 finally 配对 task_done，哨兵通知退出，最后 join 队列和线程。测试覆盖任务失败、多个 worker 和正常关闭，确保没有永久等待或遗留线程。
