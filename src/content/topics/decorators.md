---
title: 装饰器怎样保留函数行为与元数据？
summary: 装饰器接收可调用对象并返回替代对象。包装函数需要正确转发参数、返回值和异常；functools.wraps 保留常用元数据并设置 __wrapped__，方便调试和内省。
category: protocols
difficulty: intermediate
minutes: 8
order: 5
roles:
  - Python 后端
  - 测试开发
  - AI 应用
python: CPython 3.12–3.14；版本差异见正文
example: decorators.py
objectives:
  - 保持包装前后的调用契约
  - 解释同步和异步装饰器差异
sources:
  - title: functools.wraps
    url: https://docs.python.org/3.14/library/functools.html#functools.wraps
  - title: 函数定义与装饰器
    url: https://docs.python.org/3.14/reference/compound_stmts.html#function-definitions
---

## 装饰发生在定义阶段

`@decorate` 可以理解为定义函数之后执行 `fn = decorate(fn)`。装饰器工厂则先接收配置，再返回真正的装饰器。包装函数在每次业务调用时执行，适合记录耗时、检查权限或增加观测信息。

示例中外层 `traced()` 在装饰阶段返回 `wrapper`；真正调用 `add()` 时，wrapper 转发参数并返回结果。`finally` 确保业务函数抛出异常时仍执行收尾。

## 三种常见行为丢失

忘记 `return` 会让被包装函数总返回 `None`；漏掉关键字参数会破坏原函数签名的使用方式；捕获所有异常却不重新抛出，会把失败伪装成成功。包装器应明确自己增加了什么行为，同时保留原有调用契约。

`wraps` 会复制名称、文档等元数据，并设置 `__wrapped__`。它不会自动帮你转发参数，也不会把错误的业务逻辑变正确。类型标注需要进一步使用 `ParamSpec` 等工具描述参数关系。

## 异步函数需要异步包装

普通 wrapper 调用异步函数只会得到协程对象。如果想统计完整执行时间或处理执行中的异常，应使用 `async def wrapper` 并 `await fn(...)`。否则计时可能只覆盖创建协程的瞬间。

多个装饰器从靠近函数的一层开始应用；调用时先进入最外层包装器。鉴权、缓存和日志的排列会影响哪些调用被缓存、哪些错误被记录，需要明确顺序。

## 工程检查

为装饰器至少验证返回值、位置与关键字参数、业务异常、元数据四个方面。涉及异步时，还要验证取消传播。缓存和重试装饰器改变了副作用执行次数，必须说明幂等要求。

## 一分钟回答

装饰器替换函数绑定，在调用前后增加行为。我会用 wraps 保留元数据，正确转发参数与返回值，并让不属于装饰器职责的异常继续传播。异步函数要 await 后才能观察完整执行；叠加多个装饰器时要检查调用顺序和副作用。
