---
title: 断言选择：比较什么就写清什么
summary: 断言应对应验收语义：相等、同一对象、近似数值、无序多重集合和异常分别使用合适的方法，失败信息也会更有用。
category: testing
difficulty: basic
minutes: 7
order: 114
roles:
- 测试开发
python: CPython 3.12–3.14
example: unittest_assertions.py
objectives:
- 用 assertCountEqual 保留重复次数，区分相等和身份
- 明确数值容差与合同字段，选择能定位失败的具体断言
sources:
- title: 断言选择：比较什么就写清什么：官方文档
  url: https://docs.python.org/3.14/library/unittest.html#assert-methods
---

## 核心机制

assertEqual 检查值相等，assertIs 检查对象身份，不能因为两个列表内容相同就期待它们是同一实例。assertCountEqual 忽略顺序但保留元素出现次数，比把列表都转成集合更适合无序结果；后者会掩盖重复项。assertAlmostEqual 按小数位或 delta 比较差值，和采用相对容差的 math.isclose 不是完全相同的契约。选择前先确定业务允许的误差。

## 放到工程里

API 测试可以先断言响应状态，再对关键字段的类型、必填值和业务关系做细分检查。失败信息应指出哪个字段与期望不符，而不是只给 assertTrue(actual == expected) 的布尔结果。示例展示值相等但身份不同，以及无序比较保留重复次数。对于动态时间或生成编号，验证格式和关系比硬编码整个响应更稳定。

## 容易混淆的边界

过度宽松的断言会隐藏错误，过度完整的快照又可能把无关字段变化当成故障。应根据接口合同选择可观察行为。Python 普通 assert 在优化运行模式下可能被移除，不适合承担产品输入校验；unittest 的断言方法不依赖这一语法。异常断言也要缩小作用域，避免把准备阶段的异常错认成目标调用的正确行为。

## 面试追问

怎样设计既不过松也不过度绑定实现的测试断言？

- 用 assertCountEqual 保留重复次数，区分相等和身份
- 明确数值容差与合同字段，选择能定位失败的具体断言



## 一分钟回答

我先写清比较语义，再选断言。值与身份分开，无序结果保留重复次数，数值误差说明绝对或相对容差。用具体断言改善失败定位，并围绕接口合同检查结果，避免只断言一个模糊布尔值。
