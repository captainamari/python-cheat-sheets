---
title: JSON 与 Decimal：保留精度还是保留类型？
summary: json.loads 可用 parse_float=Decimal 接收十进制数；序列化 Decimal 需要明确协议，转换成字符串会保留文本精度，同时改变 JSON 类型。
category: data
difficulty: intermediate
minutes: 9
order: 106
roles:
- Python 后端
- AI 应用
python: CPython 3.12–3.14
example: json_decimal.py
objectives:
- 在 json.loads 入口指定 parse_float=Decimal，避免先经过 float
- 明确输出协议中的字符串或整数表示，并验证对端恢复规则
sources:
- title: JSON 与 Decimal：保留精度还是保留类型：官方文档
  url: https://docs.python.org/3.14/library/json.html
---

## 核心机制

JSON 只有数字、字符串、布尔值、null、数组和对象等类型，没有 Python Decimal 类型。默认解码带小数点的数字会得到 float，parse_float=Decimal 则把原始数字文本交给 Decimal 构造器，避免先经过二进制浮点数。它不改变整数的解码方式，也不约束对端实现的精度。编码时标准 json 模块不会自动决定 Decimal 应该成为字符串还是数字，这个选择必须由应用协议定义。

## 放到工程里

金额接口可以约定金额用十进制字符串、币种单独提供，或者用最小货币单位的整数。示例将两个 JSON 小数直接解析为 Decimal 相加，再显式把 total 转为字符串编码；接收方据合同恢复金额类型。这样代码清楚标注了转换位置。若必须输出 JSON 数字，应采用经过评估的编码方案，并同时验证上下游的舍入、范围和精度规则，不能只检查本地回环。

## 容易混淆的边界

把已经得到的 float 再转换为 Decimal，不能恢复最初的十进制意图。default=str 虽然方便，却会把很多不支持的对象一起变成字符串，掩盖类型错误；最好只处理明确支持的类型。NaN 和 Infinity 还涉及标准兼容性，严格输出可设置 allow_nan=False。精度协议、舍入策略和缺失值语义应该放在边界文档里，不应由调用者猜测。

## 面试追问

如何设计一个跨语言金额 JSON 接口，区分精度与类型两个问题？

- 在 json.loads 入口指定 parse_float=Decimal，避免先经过 float
- 明确输出协议中的字符串或整数表示，并验证对端恢复规则



## 一分钟回答

我用 parse_float=Decimal 在解码入口保留十进制文本，输出时显式选择字符串或最小单位整数。保留精度不等于保留跨语言类型，协议必须写清楚。避免先转 float，也避免用 default=str 静默吞掉所有类型问题。
