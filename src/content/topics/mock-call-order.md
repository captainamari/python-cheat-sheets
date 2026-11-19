---
title: Mock 调用顺序：怎样验证跨依赖流程？
summary: attach_mock 把多个依赖的调用汇入同一个父 Mock；完整调用列表适合验证严格流程，assert_has_calls 则允许前后存在额外调用。
category: testing
difficulty: intermediate
minutes: 9
order: 112
roles:
- 测试开发
python: CPython 3.12–3.14
example: mock_call_order.py
objectives:
- 用 attach_mock 汇总跨依赖顺序，按约束比较调用列表
- 区分精确顺序、局部顺序与异步完成关系
sources:
- title: Mock 调用顺序：怎样验证跨依赖流程：官方文档
  url: https://docs.python.org/3.14/library/unittest.mock.html#attaching-mocks-as-attributes
---

## 核心机制

单独检查两个 Mock 都被调用过，不能证明先后顺序。把它们通过 attach_mock 绑定到同一父对象后，父对象的 mock_calls 会记录带名称的调用序列。示例把保存和通知挂到 parent，先执行保存再发送通知，最后比较精确列表。这里断言的不是实现细节中的每一步，而是“通知前必须完成持久化”这种可观察的业务顺序。

## 放到工程里

外部副作用流程可验证参数、次数和必要顺序，例如先提交再发送成功事件。若业务允许额外的日志或统计调用，就不要把这些实现细节都塞进严格列表；应针对真正的依赖建立断言。assert_has_calls 默认要求指定调用按顺序连续出现，但列表前后允许其他调用，any_order=True 则不要求顺序。选择方法前要先写清楚验收约束。

## 容易混淆的边界

调用顺序记录只说明 Mock 被调用的顺序，不自动证明异步操作已完成；协程还需使用 AsyncMock 的 await 断言或可控事件验证完成关系。精确比较也会受到链式调用记录影响，应该让测试关注稳定接口。不要为了让用例通过而给被测代码增加没有业务意义的固定顺序，测试应该表达真实需求。

## 面试追问

怎样测试“保存成功后才能通知”，又避免把所有内部实现顺序都锁死？

- 用 attach_mock 汇总跨依赖顺序，按约束比较调用列表
- 区分精确顺序、局部顺序与异步完成关系



## 一分钟回答

我用共同父 Mock 收集跨依赖调用，再按业务需要选择精确列表或局部顺序断言。调用过不等于顺序正确，调用开始也不等于异步完成。只有提交前后等真正影响结果的顺序才应该成为测试契约。
