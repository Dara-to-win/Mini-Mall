# Mini Mall

微型电商项目，用于学习和演示全栈 Web 开发。

## 技术栈

| 层面   | 选型                       | 版本                                      |
| ------ | -------------------------- | ----------------------------------------- |
| 框架   | Next.js (App Router)       | 16.x                                      |
| 语言   | TypeScript                 | 5.x (strict)                              |
| 样式   | TailwindCSS                | 4.x (CSS-first,`@import "tailwindcss"`) |
| 数据库 | SQLite                     | —                                        |
| ORM    | Prisma                     | 7.x                                       |
| 认证   | Auth.js (NextAuth v5 beta) | 5.0.0-beta                                |
| 密码   | bcryptjs                   | 3.x                                       |

## 目录结构

```
mini_mall/
├── prisma/
│   ├── schema.prisma          # 数据模型定义
│   └── dev.db                 # SQLite 数据库文件（自动生成）
├── prisma.config.ts           # Prisma 配置
├── src/
│   ├── app/                   # Next.js App Router 页面
│   │   ├── globals.css        # 全局样式 + TailwindCSS
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页（商品列表）
│   │   ├── products/          # 商品相关页面
│   │   ├── cart/              # 购物车页面
│   │   ├── checkout/          # 结算页面
│   │   ├── orders/            # 订单页面
│   │   ├── login/             # 登录页面
│   │   ├── register/          # 注册页面
│   │   ├── admin/             # 管理后台
│   │   └── api/auth/          # NextAuth API 路由
│   ├── components/            # 可复用 React 组件
│   │   └── admin/             # 管理后台组件
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 客户端单例
│   │   ├── auth.ts            # NextAuth 配置
│   │   └── utils.ts           # 工具函数
│   ├── generated/prisma/      # Prisma Client（自动生成）
│   └── types/                 # TypeScript 类型定义
├── .env                       # 环境变量（DATABASE_URL 等）
├── package.json
└── tsconfig.json
```

## 数据模型

**User**

- `id`, `email` (unique), `password`, `name`, `role` ("user" | "admin")
- 关联：`orders` (一对多), `cartItems` (一对多)

**Category**

- `id`, `name` (unique), `slug` (unique)
- 关联：`products` (一对多)

**Product**

- `id`, `name`, `description`, `price`, `image`, `stock`, `categoryId`
- 关联：`category` (多对一), `cartItems`, `orderItems`

**CartItem**

- `id`, `userId`, `productId`, `quantity`
- 复合唯一键：`[userId, productId]`
- 关联：`user`, `product`

**Order**

- `id`, `userId`, `status` ("pending" | "paid" | "shipped" | "completed" | "cancelled"), `total`
- 关联：`user`, `items` (一对多)

**OrderItem**

- `id`, `orderId`, `productId`, `quantity`, `price` (下单时单价快照)
- 关联：`order`, `product`

## 路由设计

### 用户端

| 路由               | 功能                             |
| ------------------ | -------------------------------- |
| `/`              | 首页，商品列表 + 分类筛选 + 搜索 |
| `/products/[id]` | 商品详情                         |
| `/cart`          | 购物车                           |
| `/checkout`      | 结算下单（模拟支付）             |
| `/orders`        | 我的订单                         |
| `/login`         | 登录                             |
| `/register`      | 注册                             |

### 管理后台

| 路由                          | 功能            |
| ----------------------------- | --------------- |
| `/admin`                    | 管理首页        |
| `/admin/products`           | 商品列表 + CRUD |
| `/admin/products/new`       | 新增商品        |
| `/admin/products/[id]/edit` | 编辑商品        |
| `/admin/categories`         | 分类管理        |
| `/admin/orders`             | 订单管理        |

## 常用命令

```bash
npm run dev          # 启动开发服务器 (Turbopack)
npm run build        # 生产构建
npm run lint         # ESLint 检查
npx prisma db push   # 将 schema 推送到数据库
npx prisma generate  # 重新生成 Prisma Client
npx prisma studio    # 打开 Prisma 数据库管理界面
```

## 架构约定

1. **Server Components 优先**：数据查询直接在 Server Component 中通过 `prisma` 调用，无需 API 路由中转
2. **Server Actions**：表单提交、数据变更使用 Server Actions，定义在 `"use server"` 文件中
3. **认证保护**：用户端受保护路由通过 NextAuth 中间件实现，管理端额外校验 `role === "admin"`
4. **模拟支付**：下单即为"已支付"，无需集成真实支付网关
5. **路径别名**：`@/*` 映射到 `./src/*`
6. **Prisma 导入**：从 `@/generated/prisma` 导入 `PrismaClient`

## 实施进度

- [X] 步骤 1：创建项目 + Prisma + 数据库
- [ ] 步骤 2：搭建认证系统
- [ ] 步骤 3：商品浏览
- [ ] 步骤 4：购物车功能
- [ ] 步骤 5：下单流程
- [ ] 步骤 6：后台管理

<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
