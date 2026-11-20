---
title: SQLite 约束：把数据规则放在哪里？
summary: NOT NULL、CHECK、UNIQUE 与外键约束保护不同的不变量；SQLite 外键检查需要在每个连接上显式启用并验证。
category: data
difficulty: intermediate
minutes: 9
order: 102
roles:
- Python 后端
- 测试开发
python: CPython 3.12–3.14
example: sqlite_constraints.py
objectives:
- 在事务外对每个连接启用外键并查询开关验证
- 区分 CHECK 与 NOT NULL，并测试合法和非法写入
sources:
- title: SQLite 约束：把数据规则放在哪里：官方文档
  url: https://www.sqlite.org/foreignkeys.html
- title: SQLite CHECK 与 NOT NULL 约束
  url: https://www.sqlite.org/lang_createtable.html#check_constraints
---

## 核心机制

应用校验能提供友好反馈，数据库约束则在实际写入边界执行。NOT NULL 拒绝缺失值，CHECK 拒绝结果为零的表达式；CHECK 的结果为 NULL 时不会拒绝，所以 CHECK(amount > 0) 不能替代 NOT NULL。UNIQUE 防止重复键，外键维护引用关系。SQLite 的外键开关属于连接配置，通常需要在事务外执行 PRAGMA foreign_keys=ON，并读取其结果确认，而不是只在建表语句里声明 REFERENCES。

## 放到工程里

订单写入可以把金额非空且大于零、请求编号唯一、客户必须存在分别编码成约束。示例先打开外键，插入不存在的父记录会抛 IntegrityError，随后插入合法父子记录。处理此类异常时应返回有意义的业务冲突，避免把所有约束失败都当成可重试的网络故障。迁移上线前先检查历史数据是否违反新规则；否则建表成功并不代表旧数据能直接迁入。

## 容易混淆的边界

连接上下文负责提交或回滚，不负责关闭连接。PRAGMA foreign_keys 在多语句事务中切换不会产生期待效果，因此连接初始化顺序很重要。约束还不能自动表达所有跨行业务规则，例如账户余额与多笔流水的整体一致性仍需合适的事务边界。测试必须覆盖真实连接初始化路径，不能只在测试专用连接上启用外键而漏掉产品代码。

## 面试追问

应用校验和数据库约束如何分工，SQLite 连接配置有哪些容易遗漏的地方？

- 在事务外对每个连接启用外键并查询开关验证
- 区分 CHECK 与 NOT NULL，并测试合法和非法写入



## 一分钟回答

我把不可违反的记录规则放到数据库约束，同时保留应用层校验。SQLite 每个连接显式开启并验证外键，CHECK 配合 NOT NULL 使用，唯一键承担并发写入时的最后防线。约束异常按业务语义处理。
