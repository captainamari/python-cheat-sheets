---
title: 异常转换时如何保留真正原因？
summary: 把底层异常转换为业务异常时，可以使用 raise NewError(...) from exc 保留因果链。捕获范围应覆盖可处理的错误，清理放进 finally 或上下文管理器，避免吞掉失败。
category: language
difficulty: intermediate
minutes: 9
order: 20
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: exception_chaining.py
objectives:
- 使用特定异常和显式因果链表达错误边界
- 移除 finally 中的返回并验证异常继续传播及资源释放
sources:
- title: 异常转换时如何保留真正原因：官方文档
  url: https://docs.python.org/3.14/tutorial/errors.html#exception-chaining
---

## 核心机制

异常带有类型、消息、回溯和可能的上下文。except 中抛出另一个异常会产生上下文，显式 from 则说明新的异常由哪个错误引起。裸 raise 在处理器中重新抛出当前异常，适合添加日志后继续传播；raise exc 与裸 raise 在回溯呈现上不完全相同，不应为了重抛随意替换。

## 放到工程里

配置解析层可以把 ValueError 转成 ConfigError，并附上配置键，但保留原始异常作为 cause，排障时才能区分格式问题和业务约束。日志通常在真正负责处理失败的边界记录一次，避免每层重复打印同一回溯。异常信息中应提供必要上下文，不把凭证或完整敏感请求直接塞入消息。

## 容易混淆的边界

裸 except 会捕获 KeyboardInterrupt 等通常应该传播的控制异常；except Exception 也仍然可能掩盖程序缺陷。finally 中 return 会覆盖原本的返回或正在传播的异常，是非常隐蔽的成功假象。from None 只控制显示的上下文，不代表根因不存在，更不应该被当成修复错误的方式。

## 面试追问

业务异常转换、原样重抛和资源清理分别应该放在哪里？

- 使用特定异常和显式因果链表达错误边界
- 移除 finally 中的返回并验证异常继续传播及资源释放



## 一分钟回答

我在有语义转换的边界捕获特定异常，用 raise 业务异常 from 原异常保留因果。无法恢复就传播，资源清理交给 finally 或 with。测试不仅断言异常类型，还检查 cause 和清理效果，避免失败被返回值掩盖。
