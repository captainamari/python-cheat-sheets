---
title: setUp 失败后怎样保证资源仍被清理？
summary: 测试资源应在获取成功后立即登记清理。unittest 的 addCleanup 即使 setUp 后续失败也会运行，而 tearDown 通常只在 setUp 成功后调用；多个清理动作按后进先出执行。
category: testing
difficulty: intermediate
minutes: 9
order: 57
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: fixture_cleanup.py
objectives:
- 区分 setUp 失败时 tearDown 与 cleanup 的执行边界
- 获取资源后立即登记清理，验证失败分支与逆序释放
sources:
- title: setUp 失败后怎样保证资源仍被清理：官方文档
  url: https://docs.python.org/3.14/library/unittest.html#unittest.TestCase.addCleanup
---

## 核心机制

一个测试先创建临时目录，再打开连接，如果第二步失败，tearDown 可能没有机会执行。addCleanup 把已取得资源的释放动作登记到测试用例，框架在相应结束路径调用它们。后登记的动作先执行，符合连接先关、目录后删等依赖关系，避免清理时资源顺序颠倒。

## 放到工程里

测试基类可以把创建资源与登记清理封装成同一个辅助方法，让子类难以忘记恢复。环境变量、补丁、临时文件和日志处理器都需要生命周期管理。patcher.start 后应立即 addCleanup(patcher.stop)，使后续准备步骤失败时，补丁不会泄漏到下一条测试。

## 容易混淆的边界

清理函数自身也可能失败，错误应该保留可诊断信息，不能全部吞掉。共享类级资源与方法级资源的寿命不同，不能把每条测试会修改的状态当作只初始化一次的全局夹具。并行执行时，固定路径、端口和环境修改还可能发生跨用例冲突，需要独立命名或隔离执行。

## 面试追问

一个测试夹具依赖目录、连接与补丁时，如何设计清理顺序和隔离范围？

- 区分 setUp 失败时 tearDown 与 cleanup 的执行边界
- 获取资源后立即登记清理，验证失败分支与逆序释放



## 一分钟回答

我按获取顺序立即登记释放，并利用后进先出的清理链处理依赖。setUp 失败路径要专门测试，因为仅靠 tearDown 不够。夹具还要明确作用域，避免临时目录、补丁和环境状态污染后续用例。
