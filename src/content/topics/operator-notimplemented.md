---
title: NotImplemented 与抛 NotImplementedError 有何不同？
summary: 二元运算方法返回 NotImplemented，表示该操作数组合不由当前实现处理，让解释器尝试其他协议路径。NotImplementedError 是异常，常用于尚未实现的行为，两者不能混用。
category: protocols
difficulty: advanced
minutes: 10
order: 80
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: operator_notimplemented.py
objectives:
- 区分协议返回标记与普通异常
- 返回 NotImplemented 参与反向协作，并测试不支持类型组合
sources:
- title: NotImplemented 与抛 NotImplementedError 有何不同：官方文档
  url: https://docs.python.org/3.14/reference/datamodel.html#emulating-numeric-types
---

## 核心机制

自定义 `__add__`、`__eq__` 等方法时，遇到不支持的另一种类型，可以返回单例 NotImplemented。解释器按相应运算规则尝试反向方法或其他后备行为，最后可能报 TypeError，比较还有自己的回退规则。直接抛出 NotImplementedError 会中断这些正常协作机会，不是告诉解释器“请试另一方”。

## 放到工程里

数值包装器或领域值对象应只处理自己理解的组合，例如 Money 与相同币种 Money 相加，其他类型返回 NotImplemented。币种不同则可能属于类型兼容但业务规则不允许，应选择明确异常。协议不支持与业务数据非法是两种情况，区分后调用者更容易判断失败原因。

## 容易混淆的边界

不要对 NotImplemented 做真假值判断来决定成功与否，不同版本对此有变化，而且它本来就是协议返回标记。也不要无条件返回 False 来处理所有不认识的相等比较，这可能剥夺另一方定义对称比较的机会。验证需要包括正向、反向、子类和不支持类型，而不只测试两个同类实例。

## 面试追问

自定义值对象时，类型不支持与业务规则不允许应该如何分别表达？

- 区分协议返回标记与普通异常
- 返回 NotImplemented 参与反向协作，并测试不支持类型组合



## 一分钟回答

NotImplemented 是运算协议中的协作返回值，NotImplementedError 是立即抛出的异常。我把不支持的类型组合交回解释器，把真实业务错误明确报告。测试覆盖反向运算和比较回退，避免自定义方法破坏其他类型的合作。
