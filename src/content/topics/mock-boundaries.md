---
title: mock 应该替换定义位置，还是实际查找位置？
summary: patch 应作用于被测代码实际查找名字的位置。测试替身用来控制外部边界，断言则验证返回值、调用参数和失败处理。过度 mock 内部步骤会让测试与实现细节耦合。
category: testing
difficulty: intermediate
minutes: 8
order: 12
roles:
  - Python 后端
  - 测试开发
  - AI 应用
python: CPython 3.12–3.14；版本差异见正文
example: mock_boundaries.py
objectives:
  - 选择正确的替换位置与测试边界
  - 验证失败路径与测试隔离
sources:
  - title: unittest.mock：在哪里 patch
    url: https://docs.python.org/3.14/library/unittest.mock.html#where-to-patch
  - title: pytest：fixture 与清理
    url: https://docs.pytest.org/en/stable/how-to/fixtures.html
---

## 先找到名字在哪里被读取

假设业务模块使用 `from provider import fetch`，它已经把 fetch 绑定到自身命名空间。此时替换 provider.fetch，不一定改变业务模块已经持有的绑定；应 patch 业务模块中的 fetch。

如果业务模块通过 `import provider` 后调用 `provider.fetch()`，查找路径又不同。关键不是记住某个固定字符串，而是沿着被测代码的名字查找过程定位替换点。

## 让外部边界可控

示例通过参数注入 fetcher，测试时传入 Mock。这种方式让依赖显式化，无须修改全局绑定。测试验证返回值，也验证请求参数，防止“随便返回一个正确字符串就算通过”。

`spec` 或 `autospec` 可以限制替身接口，减少拼错方法名和参数变化时测试仍然通过的情况。不过它们不会替代真实服务契约验证。

## 覆盖失败路径

除了正常返回，还应使用 side_effect 模拟超时、连接失败或不合法响应，验证业务是否正确分类异常。需要重试时，检查调用次数与最终结果，而不是只断言发生了调用。

异步边界使用 AsyncMock，并区分“被调用”和“被 await”。测试异步任务还应确保测试结束时没有遗留后台任务。

## fixture 的生命周期

fixture 负责准备和回收资源。较大的作用域可以减少创建成本，但也可能共享可变状态。用 yield 后的收尾清理资源，并让用例不依赖执行顺序。真实数据库、文件和网络替身应按测试层级选择。

## 避免测试只复述实现

把每个私有函数都 mock 后逐一检查调用顺序，容易阻碍重构。更有价值的断言是业务输出、输入参数、持久化结果和错误行为。外部适配器再用少量契约或集成测试验证真实协议。

## 一分钟回答

patch 的原则是在名字被查找的位置替换。我优先让外部依赖显式可注入，单元测试控制返回值和失败，断言业务结果与关键参数；接口替身需要约束，真实适配器则通过契约或集成测试补足。fixture 的共享范围和清理同样影响隔离。
