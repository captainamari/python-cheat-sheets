---
title: AsyncMock 被调用和被 await 有何区别？
summary: AsyncMock 模拟异步函数，调用得到可等待对象。调用次数与等待次数分别记录，因此验证异步交互通常需要 assert_awaited，而不是只检查 assert_called。
category: testing
difficulty: intermediate
minutes: 9
order: 56
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: async_mock.py
objectives:
- 区分调用计数与等待计数
- 在正确位置 await 并断言等待参数及实际返回值
sources:
- title: AsyncMock 被调用和被 await 有何区别：官方文档
  url: https://docs.python.org/3.14/library/unittest.mock.html#unittest.mock.AsyncMock
---

## 核心机制

普通异步函数被调用时创建协程，只有被等待或调度后才执行函数体。AsyncMock 对应这种分离：call_count 记录调用，await_count 记录结果被等待。return_value 是等待之后得到的值，side_effect 也可以在等待阶段抛出异常或产生结果。

## 放到工程里

测试异步服务时，可以替换下游 async 方法，验证 await 参数、成功映射与取消或超时传播。若业务代码遗漏 await，assert_called_once 仍可能通过，但结果根本没有被消费。需要断言实际返回值和 assert_awaited_once_with，必要时检查取消后资源释放，而不仅是替身的计数。

## 容易混淆的边界

把同步 Mock 塞给需要 await 的调用点可能抛 TypeError，反过来把 AsyncMock 用在同步接口上又可能产生未等待协程。替身类型应匹配真实接口；异步上下文管理和异步迭代还涉及 `__aenter__`、`__aexit__`、`__aiter__` 等不同协议，不能只设置普通 return_value 就认为全部模拟完成。

## 面试追问

异步函数、异步上下文管理器和异步迭代器的替身为什么不能混为一谈？

- 区分调用计数与等待计数
- 在正确位置 await 并断言等待参数及实际返回值



## 一分钟回答

调用异步函数与等待它是两个阶段。AsyncMock 分别记录，我会验证等待次数和参数，并检查结果与失败路径。漏 await 的问题要从实际业务输出和 await 断言发现，不能只看方法被触发。
