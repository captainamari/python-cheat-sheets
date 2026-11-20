---
title: send 为什么要先启动生成器？
summary: send 把值送到生成器暂停的 yield 表达式，并继续执行到下一次产出。尚未启动的生成器没有可接收非 None 值的暂停点，需要先 next 或 send(None)。
category: protocols
difficulty: advanced
minutes: 10
order: 72
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: generator_send.py
objectives:
- 解释 yield 表达式接收值与 send 返回值的两个方向
- 先 next 或 send(None) 启动，并明确关闭与耗尽行为
sources:
- title: send 为什么要先启动生成器：官方文档
  url: https://docs.python.org/3.14/reference/expressions.html#generator-iterator-methods
---

## 核心机制

执行生成器函数只创建对象，函数体尚未运行。第一次 next 让代码走到首个 yield 并暂停；之后 send(value) 使这个 yield 表达式的结果成为 value，生成器继续向下执行。send 的返回值则是下一次 yield 的产物，所以发送进去的值与返回出来的值是两个方向。

## 放到工程里

这种协议可以表达小型状态机、交互式解析器或教学中的累加器，但接口需要说明启动、输入、产出和停止规则。调用方如果只需要常规迭代，就不应该被迫理解复杂的双向状态。业务中采用显式类和方法往往更容易调试，生成器适合状态天然围绕暂停点组织的场景。

## 容易混淆的边界

向刚创建的生成器发送非 None 会抛 TypeError；生成器结束后继续发送会遇到 StopIteration。close 会触发关闭协议，清理应放在 finally，并避免在处理 GeneratorExit 时再次 yield。不要依赖对象被回收时才清理文件或连接，拥有生成器的一方应明确负责关闭。

## 面试追问

用生成器实现状态机时，应该怎样向调用方说明生命周期？

- 解释 yield 表达式接收值与 send 返回值的两个方向
- 先 next 或 send(None) 启动，并明确关闭与耗尽行为



## 一分钟回答

生成器 send 是双向协议：先启动到 yield，再把输入送入该表达式，返回下一项输出。我会在接口中写清状态与关闭责任，并测试未启动、正常输入、耗尽和提前关闭，避免调用方凭偶然顺序使用它。
