---
title: JSON 往返为什么不一定保留 Python 类型？
summary: JSON 只有有限的数据类型，Python 的元组、非字符串键、Decimal 和日期等不能原样往返。接口应定义明确的 JSON 模型，校验输入，并拒绝非标准的 NaN 或 Infinity 输出。
category: data
difficulty: basic
minutes: 7
order: 50
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: json_boundaries.py
objectives:
- 区分 JSON 数据模型与 Python 内部对象模型
- 显式转换字段并校验结构、键类型和非有限数字
sources:
- title: JSON 往返为什么不一定保留 Python 类型：官方文档
  url: https://docs.python.org/3.14/library/json.html
---

## 核心机制

JSON 对象的键是字符串，数组没有元组与列表的区分。Python 编码器会把某些类型转换成 JSON 兼容形式，因此 loads(dumps(value)) 不必等于原始 Python 结构。默认编码还可能允许非标准的 NaN 和 Infinity，与严格 JSON 消费者的预期不同，需要通过 allow_nan=False 等策略限制。

## 放到工程里

跨服务接口先定义字段、缺省值、数值范围和日期格式，再将内部对象转换成该模型。金额通常用十进制字符串或最小单位整数，时间用带偏移的规范字符串。接收 JSON 后也要继续校验结构；成功解析只能证明语法正确，不能证明字段齐全、类型合理或业务约束满足。

## 容易混淆的边界

不要用 default=str 把所有未知对象都吞成字符串，这会让错误数据悄悄改变契约。重复键默认解析可能保留后者，安全敏感配置需要考虑显式拒绝。大型或不可信输入还需要限制体积与嵌套复杂度。序列化不是深拷贝协议，也不是可执行对象的持久化通用方案。

## 面试追问

为金额和时间字段设计 JSON 契约时，如何避免隐式类型变化？

- 区分 JSON 数据模型与 Python 内部对象模型
- 显式转换字段并校验结构、键类型和非有限数字



## 一分钟回答

JSON 是跨语言数据模型，不是 Python 对象快照。我会定义传输字段，显式处理金额、时间和键类型，严格控制非有限数字，并在解析后做结构校验。往返测试应按契约比较，而非假定所有 Python 类型都能复原。
