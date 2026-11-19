---
title: reset_mock：清空记录不等于恢复行为
summary: reset_mock 默认清除调用历史，不清除 return_value 或 side_effect；复用 Mock 时必须区分观察记录和行为配置。
category: testing
difficulty: intermediate
minutes: 9
order: 113
roles:
- 测试开发
python: CPython 3.12–3.14
example: mock_reset.py
objectives:
- 区分调用记录与 return_value、side_effect，显式清除或新建 Mock
- 解释可迭代 side_effect 被消费后不会因默认重置而倒回
sources:
- title: reset_mock：清空记录不等于恢复行为：官方文档
  url: https://docs.python.org/3.14/library/unittest.mock.html#unittest.mock.Mock.reset_mock
---

## 核心机制

Mock 同时包含行为配置与交互记录。call_count、call_args_list 等属于记录，return_value 与 side_effect 决定下一次调用会发生什么。reset_mock 默认重置前者，并递归处理子 Mock，但保留后者。因此一个已配置 side_effect=ValueError 的对象，清空调用次数后仍然会抛同样的异常。示例先返回固定结果，再重置并确认配置仍在，最后显式清除异常行为。

## 放到工程里

测试多个阶段时，先记录并断言上一阶段，再决定是否重置观察记录。如果不同场景需要完全不同的依赖行为，创建新 Mock 通常更清楚。使用可迭代 side_effect 模拟连续响应时，迭代器会被消费，reset_mock 不会自动把它倒回开头；需要重新赋予序列或重新构造对象。这个区别常解释“单独跑通过，整批跑失败”的测试污染。

## 容易混淆的边界

reset_mock(return_value=True) 会重新生成默认返回 Mock，而不是把返回值设为 None；side_effect=True 则清除副作用配置。自定义属性也不会因为默认重置而全部恢复。AsyncMock 还维护 await 次数与参数记录，需要按对应接口检查。不要把 reset_mock 当成任意测试状态的通用回滚函数，外部数据库、环境和单例缓存仍需独立清理。

## 面试追问

测试中复用 Mock 有哪些状态风险，reset_mock 的边界在哪里？

- 区分调用记录与 return_value、side_effect，显式清除或新建 Mock
- 解释可迭代 side_effect 被消费后不会因默认重置而倒回



## 一分钟回答

Mock 重置分成调用记录和行为配置。默认 reset_mock 只清记录，保留返回值和副作用；要清行为需显式参数，可迭代副作用还要重新初始化。场景差异大时我选择新建 Mock，减少隐藏共享状态。
