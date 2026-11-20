---
title: Event 为什么不是通知计数器？
summary: asyncio.Event 表达一个可设置、清除的状态，set 会唤醒等待者，但连续 set 不会累计多次事件。需要保存每个消息或次数时应使用队列或计数状态，而不是依赖通知本身。
category: concurrency
difficulty: intermediate
minutes: 9
order: 91
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: async_event.py
objectives:
- 区分布尔状态通知与消息或计数保存
- 任务使用队列，明确清除责任并验证上游失败与取消
sources:
- title: Event 为什么不是通知计数器：官方文档
  url: https://docs.python.org/3.14/library/asyncio-sync.html#event
---

## 核心机制

Event 内部维护布尔标志，初始为假。wait 在标志为假时等待，为真时立即返回；set 使其为真并通知等待任务，clear 恢复为假。连续两次 set 与一次 set 的最终标志相同，因此没有“两次通知就消费两次”的队列语义，也不会保存不同通知携带的数据。

## 放到工程里

服务启动完成、允许开始处理或请求停止等单一条件适合 Event。生产者不断产出任务时，应把任务放入 Queue，让每项都有独立位置和完成记录。若需要等待状态达到某个数值，Condition 加谓词或显式计数更合适；同步原语的选择取决于要保存的事实，而不只是是否能让代码暂停。

## 容易混淆的边界

clear 的责任必须明确，多个消费者同时清除共享事件可能让通知语义难以推断。Event 不是线程安全对象，其他线程要通过事件循环支持的安全入口通知，而不是直接修改它。等待仍需结合超时与取消，防止上游失败后没有任何任务会再 set，却让消费者永久等待。

## 面试追问

什么时候使用 Event，什么时候应该改用 Queue 或 Condition？

- 区分布尔状态通知与消息或计数保存
- 任务使用队列，明确清除责任并验证上游失败与取消



## 一分钟回答

Event 保存的是状态而不是历史通知。我用它表示已就绪或停止信号，消息流用队列，计数条件用显式状态。测试覆盖先 set 后 wait、多次 set、clear 后再次等待，以及上游失败时的退出路径。
