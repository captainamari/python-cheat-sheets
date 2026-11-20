---
title: 路径边界：为什么 startswith 不够？
summary: 路径归属应按路径组件判断；resolve 后配合 relative_to 能识别常见越界，但检查与打开之间的竞态需要更强的系统级约束。
category: data
difficulty: advanced
minutes: 10
order: 109
roles:
- Python 后端
- 测试开发
- AI 应用
python: CPython 3.12–3.14
example: pathlib_containment.py
objectives:
- 使用解析后的路径组件检查，覆盖 .. 和相邻目录前缀
- 说明检查到打开的竞态，需要目录权限或平台级原子约束
sources:
- title: 路径边界：为什么 startswith 不够：官方文档
  url: https://docs.python.org/3.14/library/pathlib.html
---

## 核心机制

字符串前缀比较不理解目录组件，/data/root-other 会被 startswith("/data/root") 错认成 root 内部。Path.resolve 会规范化路径并解析已有符号链接，relative_to 则按组件计算相对路径，不属于基目录时抛 ValueError。is_relative_to 只做词法判断，不会自行访问文件系统或处理符号链接；因此判断前是否 resolve，以及路径是否存在，都要根据用途明确。

## 放到工程里

静态文件工具可先解析固定根目录，把用户提供的相对路径与根目录组合，再解析目标并检查相对关系。示例比较普通子路径和带 .. 的越界路径，使用临时目录避免依赖机器布局。若要求文件必须存在，可使用 resolve(strict=True) 并显式处理找不到文件的情况。错误信息只需说明请求无效，日志则记录必要的诊断上下文。

## 容易混淆的边界

一次 resolve 加检查不是完整的文件访问安全边界。攻击者能同时替换目录或符号链接时，检查后打开可能访问不同对象，这是 TOCTOU 问题。高风险场景应结合受控目录权限、目录文件描述符、平台支持的相对打开和不跟随链接策略。Windows 驱动器、大小写和路径分隔符也不能用一套手写字符串替换规则概括。

## 面试追问

如何设计限定目录内的文件访问，哪些风险不能靠 Path.resolve 一次解决？

- 使用解析后的路径组件检查，覆盖 .. 和相邻目录前缀
- 说明检查到打开的竞态，需要目录权限或平台级原子约束



## 一分钟回答

我按路径组件验证归属，而不是比较字符串前缀。resolve 后 relative_to 能处理常见越界和已有链接，但它不是原子访问授权。需要防止并发替换时，应把约束落实到目录权限和系统打开操作，并分别验证不同平台。
