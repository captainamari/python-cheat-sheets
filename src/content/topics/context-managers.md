---
title: with 怎样保证资源释放？异常会被吞掉吗？
summary: 上下文管理器把进入与退出逻辑绑定到一个代码块。进入成功后，无论正常结束还是抛出异常，退出逻辑都会执行；是否抑制异常由 __exit__ 的返回值或生成器上下文管理器的异常处理决定。
category: protocols
difficulty: intermediate
minutes: 8
order: 7
roles:
  - Python 后端
  - 测试开发
  - AI 应用
python: CPython 3.12–3.14；版本差异见正文
example: context_managers.py
objectives:
  - 正确管理成功与失败路径中的资源
  - 区分清理资源与抑制异常
sources:
  - title: with 语句
    url: https://docs.python.org/3.14/reference/compound_stmts.html#the-with-statement
  - title: contextlib
    url: https://docs.python.org/3.14/library/contextlib.html
---

## 协议中的两个阶段

`with manager as value` 先调用 `__enter__()`，将返回值绑定给 `value`。代码块结束时调用 `__exit__()`，并把异常信息交给它。如果进入阶段本身失败，当前管理器的退出方法不会负责补救尚未完成的进入过程，因此进入逻辑也要处理部分初始化失败。

示例使用 `contextlib.contextmanager`。`yield` 前相当于进入，yield 的值交给 as 后的名字；代码块里的异常会在 yield 处重新抛入生成器。将清理放在 `finally` 中，就能覆盖正常和异常路径。

## 清理与吞异常是不同决定

类实现的 `__exit__()` 返回真值会抑制异常；返回假值或 `None` 让异常继续传播。生成器实现中，如果捕获异常后既不重新抛出也不抛出新异常，就可能把失败吞掉。

清理成功不代表业务成功。数据库连接归还、临时文件删除、锁释放都可以在失败时执行，同时保留原始错误让上层决定重试或报错。

## 多资源与动态数量

多个嵌套上下文按进入的相反顺序退出。若资源数量由运行时决定，可以使用 `ExitStack` 统一登记清理，而不是手写多层 try/finally。异步资源对应 `async with` 和异步退出协议。

不要承诺进程被强制终止时仍一定执行 finally。正常的异常传播与进程被杀死、机器断电属于不同边界。

## 工程应用

测试里可以用上下文管理器临时修改环境变量并恢复，服务里可以用它管理连接和锁。对于一个“拿到资源后开始工作”的函数，要验证进入失败、业务失败和退出失败，并确保异常信息可定位。

## 一分钟回答

with 用进入和退出协议管理代码块生命周期。进入成功后，退出逻辑会在正常结束或异常传播时执行；释放资源并不要求吞掉异常。contextmanager 通常在 yield 前获取资源，在 finally 中释放；异常是否被抑制要明确设计。
