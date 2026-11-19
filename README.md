# Python Cheat Sheets

面向 Python 工程师的中文学习与面试站点。每个知识点提供直接回答、原理讲解、可运行示例、面试追问和练习。

S2 包含 **60 个知识点、240 道练习、3 条学习路线**。覆盖语言与对象、函数与协议、运行时、并发与异步、数据与事务、测试工程。每篇配有独立 Python 示例与四类练习。

![首页视觉](docs/assets/s1-home.jpg)

页面采用「迭代成形」视觉：暖白、炭黑和陶土色，以可复现的算法曲线作为首页主图。主图在构建时生成 SVG，不需要额外客户端库；点击「探索这幅画」可以在独立 p5.js 画布调整种子、线束、起伏、扭转与颜色，并下载 PNG。设计理念和维护入口见 [视觉说明](docs/algorithmic-philosophy.md)。

## 使用方式

- **阅读**：短答建立上下文，运行示例，再读原理和面试回答。
- **练习**：单选和代码输出自动判分；排障和口述展示要点后自评。
- **记录**：已阅读、客观题累计成绩、最近开放题自评分开保存；不会因做完练习就自动认定掌握。
- **复习**：收藏知识点；按客观错题、开放题巩固或到期安排重练，答对后移出错题队列。
- **备份**：导出 JSON，在其他设备预览后确认导入；替换记录，不重复累加成绩。
- **搜索**：支持中文概念、英文 API 和正文内容；每个知识点有固定链接。

学习记录保存在当前浏览器的 localStorage。不同设备不会自动同步，清除网站数据会移除记录。保存当前练习顺序、已提交答案和当前题目，未提交输入不保存。S1 阅读与累计成绩自动兼容；逐题记录从 S2 开始。导入前保留一份原始快照，可在学习记录页下载。

## 本地开发

需要 Node.js 24、npm 及 Python 3.12 或更高版本。

```bash
npm ci
npm run dev
```

开发地址通常为 `http://localhost:4321/python-cheat-sheets/`，以终端输出为准。内容与样式支持热更新。搜索索引在构建时生成，需要通过生产预览验证：

```bash
npm run build
npm run preview
```

开发、预览命令使用 `--ignore-lock` 保持前台执行，便于 CI 和进程管理器管理生命周期。

## 验证

```bash
npm run check          # Astro / TypeScript
npm test               # 组卷、评分、恢复、本地存储边界
npm run test:examples  # 60 个独立 Python 示例与预期输出
npm run test:outputs   # 60 道输出题实际执行验证
npm run build          # 内容校验、静态页面、中文搜索索引
npm run test:site      # 内部链接、部署 base、页面结构
npx playwright install chromium
npm run test:e2e       # 桌面与手机端关键使用流程
```

CI 使用 Python 3.12、3.13、3.14 验证示例。浏览器测试覆盖阅读、四类练习、刷新恢复、搜索、分类、收藏、错题纠正、自评分离、S1 迁移、导出与重复导入、取消与坏文件、存储失败。桌面与手机尺寸均运行。

## 内容维护

| 路径                           | 用途                                  |
| ------------------------------ | ------------------------------------- |
| `src/content/topics/*.md`      | 正文和元数据，文件名为稳定知识点 ID   |
| `src/content/questions/*.yaml` | 四类练习，与知识点 ID 关联            |
| `src/content/paths/*.yaml`     | 学习路线，仅引用已有知识点            |
| `examples/*.py` / `*.out`      | 页面示例的唯一代码源与预期输出        |
| `src/lib/`                     | 内容结构、组卷评分和进度逻辑          |
| `src/pages/`                   | 静态页面与局部客户端交互              |
| `tests/`                       | 行为测试、Python 示例测试与端到端测试 |

添加内容请阅读 [内容规范](docs/content-guide.md)。技术方案见 [架构说明](docs/architecture.md)，本阶段交付见 [S2 验收记录](docs/s2-acceptance.md)（[S1 历史记录](docs/s1-acceptance.md)）。

## 发布到 GitHub Pages

仓库默认部署路径为 `/python-cheat-sheets/`。第一次发布前，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。需要仓库管理员完成此设置。

合并到 `main` 后，`Deploy GitHub Pages` 工作流完成校验、构建并上传 Pages 产物。也可以手动运行该工作流。PR 只运行 CI，不发布、不自动合并。

预期发布地址为 `https://captainamari.github.io/python-cheat-sheets/`；是否已上线以 Actions 中部署结果为准。自定义域名时，需同步调整 `astro.config.mjs` 的 `site` / `base` 以及部署路径测试。

## 参考

学习流程参考 [cyfcyfff/java-bagu-site](https://github.com/cyfcyfff/java-bagu-site)。本站代码、正文、练习和示例独立编写，未复制其文章、图片或实现。每个知识点的官方参考链接位于文章末尾。
