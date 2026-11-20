---
title: __getattr__ 与 __getattribute__ 怎么分工？
summary: __getattribute__ 参与普通属性访问，__getattr__ 通常只在正常查找抛出 AttributeError 后作为后备。重写访问钩子要避免递归，并准确区分属性缺失与属性计算失败。
category: runtime
difficulty: intermediate
minutes: 9
order: 82
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: attribute_hooks.py
objectives:
- 区分全量访问钩子与属性缺失后备
- 使用基础查找读取内部状态并对未知字段抛 AttributeError
sources:
- title: __getattr__ 与 __getattribute__ 怎么分工：官方文档
  url: https://docs.python.org/3.14/reference/datamodel.html#customizing-attribute-access
---

## 核心机制

普通 obj.name 查找通常经过 `__getattribute__`，它负责默认描述符、实例字典和类属性等流程。若最终以 AttributeError 失败，`__getattr__` 可以提供动态后备值。钩子内部再次写 self.name 可能重新进入同一个钩子，产生无限递归；必要时调用 object.`__getattribute__` 或合适的 super 实现。

## 放到工程里

延迟属性、兼容旧字段名和轻量代理可以使用后备查找，但最好只处理明确允许的名称。未知属性应抛 AttributeError，让 hasattr、getattr 默认值和外部工具正确理解对象。若把所有未知属性都返回 None，拼写错误会被静默隐藏，调试和类型提示都会失去可靠边界。

## 容易混淆的边界

property 内部因为程序错误抛 AttributeError，也可能触发后备查找，导致真正错误被伪装成字段缺失。应缩小捕获范围并保留根因。特殊方法的隐式调用还有类型级查找规则，重写普通访问钩子不等于透明代理了 len、运算符或迭代协议。

## 面试追问

为什么 property 内部的 AttributeError 可能让后备属性逻辑掩盖真实错误？

- 区分全量访问钩子与属性缺失后备
- 使用基础查找读取内部状态并对未知字段抛 AttributeError



## 一分钟回答

我优先用 `__getattr__` 处理少量明确的缺失别名，只有必要时才改写全量访问。内部访问避免递归，未知字段正确抛错。测试包含现有属性、缺失属性、property 内部失败和真实协议调用，避免后备逻辑吞掉缺陷。
