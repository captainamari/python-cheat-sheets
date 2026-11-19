---
title: classmethod 与 staticmethod 如何选择？
summary: 实例方法自动绑定实例，classmethod 绑定实际访问的类，staticmethod 不自动注入实例或类。替代构造器通常使用 classmethod 并通过 cls 构造，才能自然支持子类。
category: protocols
difficulty: basic
minutes: 7
order: 77
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: class_static_method.py
objectives:
- 区分实例、类与无接收者的三种绑定方式
- 替代构造器使用 cls 并测试子类类型与构造签名
sources:
- title: classmethod 与 staticmethod 如何选择：官方文档
  url: https://docs.python.org/3.14/library/functions.html#classmethod
---

## 核心机制

方法绑定由描述符协议完成。实例方法的第一个参数通常命名 self，类方法通常命名 cls，名称只是约定，绑定方式由声明决定。通过子类访问继承的 classmethod 时，cls 是该子类；staticmethod 则像放在类命名空间中的普通函数，不获得自动绑定的接收者。

## 放到工程里

from_dict 或 parse 之类替代构造器可以先校验输入，再返回 cls(...)，让继承保留构造扩展能力。完全不依赖实例或类的辅助转换函数可以放在模块级；只有确实属于类型公开接口时再用 staticmethod，避免把所有工具函数都塞进某个类里作为目录。

## 容易混淆的边界

类方法中写死 Base(...) 会让子类调用仍得到基类对象，表面上继承了工厂，实际上丢失子类语义。静态方法也不会自动获得 self，不能靠命名第一个参数为 self 改变这一点。工厂还需要保证子类构造签名兼容，cls 不是让任意继承层次都自动正确的万能机制。

## 面试追问

为什么完全不依赖类状态的工具函数有时更适合放在模块级？

- 区分实例、类与无接收者的三种绑定方式
- 替代构造器使用 cls 并测试子类类型与构造签名



## 一分钟回答

我按行为依赖决定绑定：需要实例用实例方法，需要实际类型用 classmethod，无绑定辅助行为才考虑 staticmethod。工厂通过 cls 构造，并测试子类返回类型与签名契约，避免继承入口悄悄退回基类。
