---
title: autospec 能发现哪些测试替身失真？
summary: autospec 根据真实对象的接口创建替身，能检查调用签名；spec_set 进一步限制不存在属性的设置。它们减少替身与真实接口脱节，但不验证业务行为或外部服务契约。
category: testing
difficulty: intermediate
minutes: 9
order: 54
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: mock_autospec.py
objectives:
- 区分接口形状约束与真实行为验证
- 使用 autospec 检查签名并保留关键业务结果断言
sources:
- title: autospec 能发现哪些测试替身失真：官方文档
  url: https://docs.python.org/3.14/library/unittest.mock.html#autospeccing
---

## 核心机制

普通 Mock 会按访问动态创建子属性，方法拼写错了也可能不立即失败。create_autospec 使用被替代对象的规格，函数调用时检查位置、关键字和必填参数。spec 限制可访问成员，spec_set 对设置不存在的属性也施加限制；签名检查与属性限制是相关但不同的能力。

## 放到工程里

重构客户端接口时，autospec 能让仍调用旧签名的单元测试暴露问题，而不是被过于宽松的替身放行。对于动态生成属性的对象，规格可能不完整，需要提供稳定接口或显式测试适配器。测试仍应断言输入、返回映射和失败路径，而非只因为 mock 被调用就认定功能正确。

## 容易混淆的边界

autospec 不会自动运行真实校验，也不会证明网络协议与服务器一致。若真实对象的属性访问有副作用，规格检查时也需要理解它可能触发哪些读取。大量配置 mock 的嵌套返回值往往提示依赖边界过深，可以用较小的假实现表达状态，再用集成测试覆盖真实客户端。

## 面试追问

什么时候使用 autospec，什么时候需要假实现或真实集成测试？

- 区分接口形状约束与真实行为验证
- 使用 autospec 检查签名并保留关键业务结果断言



## 一分钟回答

我用 autospec 约束签名，用 spec_set 限制错误属性，减少接口变更时的假通过。它们只保护接口形状，真实行为仍靠契约与集成测试。替身越接近边界越容易维护，测试断言应围绕业务结果和关键交互。
