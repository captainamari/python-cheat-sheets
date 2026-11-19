---
title: 一次转账怎样做到要么全部成功，要么全部撤销？
summary: 把相关读写放在同一个事务中，并让失败触发回滚。事务边界、约束与参数化 SQL 分别解决原子性、数据规则和参数传递问题；连接的提交行为必须根据驱动配置明确说明。
category: data
difficulty: intermediate
minutes: 10
order: 11
roles:
  - Python 后端
  - 测试开发
  - AI 应用
python: CPython 3.12–3.14；版本差异见正文
example: sqlite_transactions.py
objectives:
  - 明确事务、幂等与资源关闭的职责
  - 通过故障注入验证数据一致性
sources:
  - title: sqlite3：事务控制
    url: https://docs.python.org/3.14/library/sqlite3.html#transaction-control
  - title: sqlite3：连接上下文管理器
    url: https://docs.python.org/3.14/library/sqlite3.html#how-to-use-the-connection-context-manager
---

## 两条成功 SQL 不等于一次成功业务

转账包括扣减和增加两个动作。第一条成功而第二条失败时，如果已经独立提交，就会留下不一致状态。示例把两条更新放进同一事务，在中途故意抛错，检查两个账户余额都恢复原值。

示例显式选择 `isolation_level="DEFERRED"` 和 `LEGACY_TRANSACTION_CONTROL`，使使用的事务控制模式清楚可见。Python sqlite3 从 3.12 起提供 autocommit 参数，不能把不同配置下的行为混在一起讲。

## 连接上下文的职责

在示例的事务配置下，`with connection` 在正常退出时提交事务，在异常时回滚。它不会自动关闭连接，所以外层仍使用 try/finally 关闭。也不要以为 `with` 在所有 autocommit 配置下都能自动建立你期望的事务。

约束可以在数据库层阻止非法余额，但完整业务还应验证更新行数、账户存在性和金额范围。金额示例使用整数分，避免把二进制浮点误差引入余额计算。

## 处理重试与重复请求

事务保证一次尝试的原子性，不自动避免同一请求被执行两次。调用方超时重试时，可以用唯一业务键记录已处理请求，并在同一事务内登记业务键与完成余额变更。

对并发操作，要结合数据库的锁与隔离机制设计。SQLite 的写入并发特性与服务端数据库不同，不能把某个数据库中的结论直接推广到其他数据库。

## 参数化 SQL

使用 `?` 占位符绑定值，不要把用户输入通过字符串插值拼入 SQL。参数绑定处理的是值，不是动态表名和列名；动态标识符应来自受控映射。

## 一分钟回答

我会先确定一次业务操作的事务边界，把相关更新放在同一事务里，失败时回滚；通过约束和更新行数检查业务规则。对于重复请求，再用唯一业务键实现幂等。事务、幂等和连接关闭各有职责，需要分别验证。
