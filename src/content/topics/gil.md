---
title: 有 GIL 的 Python 线程还能做什么？
summary: 在启用 GIL 的 CPython 中，一个解释器通常同一时刻只有一个线程执行 Python 字节码。线程仍适合重叠等待 I/O；是否能利用多核，还取决于构建方式、扩展是否释放 GIL，以及具体工作负载。
category: runtime
difficulty: advanced
minutes: 10
order: 8
roles:
  - Python 后端
  - 测试开发
  - AI 应用
python: CPython 3.12–3.14；版本差异见正文
example: gil.py
objectives:
  - 按运行环境解释 GIL 的影响
  - 根据工作负载选择并发模型
sources:
  - title: CPython free threading
    url: https://docs.python.org/3.14/howto/free-threading-python.html
  - title: threading：GIL 与性能
    url: https://docs.python.org/3.14/library/threading.html#gil-and-performance-considerations
  - title: concurrent.futures
    url: https://docs.python.org/3.14/library/concurrent.futures.html
---

## 先限定讨论环境

GIL 是 CPython 的实现机制，不是 Python 语言对所有解释器的统一规定。讨论性能时应注明 Python 版本、是否为 free-threaded 构建，以及 GIL 在运行时是否启用。

CPython 3.13 起提供可选的 free-threaded 构建。它允许在禁用 GIL 时并行执行线程，但扩展兼容性和数据同步仍需要评估。某些未适配的扩展可能使 GIL 重新启用，不能仅凭版本号判断运行方式。

## I/O 等待与 CPU 运算

启用 GIL 时，纯 Python 的 CPU 密集计算通常不能通过增加线程获得多核并行收益。I/O 操作等待期间可以释放 GIL，让其他线程工作，所以线程适合一定数量的阻塞网络或文件任务。部分本地扩展也会在计算阶段释放 GIL，应按实际实现判断。

示例只展示 ThreadPoolExecutor 的接口、结果顺序和资源退出，不把一次运行耗时当成性能证据。`map()` 按输入顺序产生结果，即使任务完成顺序不同。

| 工作负载            | 可以评估的方案   | 要检查的成本                 |
| ------------------- | ---------------- | ---------------------------- |
| 阻塞 I/O            | 线程池           | 连接数、线程数、超时         |
| 异步 I/O            | asyncio          | 库是否异步、是否阻塞事件循环 |
| 纯 Python CPU 计算  | 进程池           | 序列化、启动、内存           |
| 释放 GIL 的扩展计算 | 线程或库内部并行 | 扩展行为、线程过量竞争       |

## GIL 不等于业务线程安全

“检查余额，再扣减”是多个步骤，线程可能在步骤之间切换。即使某个容器操作在某个实现中有保护，也不能推导整段业务操作原子化。共享状态仍需要锁、消息传递或事务等同步方式。

切换到 free-threaded 构建后，应重新验证代码与扩展，尤其不要依赖旧环境中偶然没有暴露的竞争条件。

## 一分钟回答

我先说明是在启用 GIL 的 CPython 中讨论。线程可以重叠 I/O 等待，但纯 Python CPU 任务通常要评估进程池或其他并行方案。GIL 不保证业务原子性。free-threaded 构建改变了执行条件，所以要结合构建、扩展兼容性和基准测试选择。
