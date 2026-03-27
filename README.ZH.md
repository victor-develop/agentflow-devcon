# AgentFlow Dev Console

[English](./README.md)

Schema 驱动、AI Agent 优先的开发控制台 —— 用一个 YAML 文件夹驱动从问题定义到验收的完整软件工作流。

**[在线 Demo (mock 数据) →](https://victor-develop.github.io/agentflow-devcon/)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Deploy](https://img.shields.io/github/actions/workflow/status/victor-develop/agentflow-devcon/deploy.yml?label=deploy)

## 工作原理

将 CLI 指向任何包含 `.agentflow/` 目录的项目。控制台会读取 YAML schema、实体和关联，启动一个带实时 UI 的 Web 服务，并监听文件变化自动刷新。

```bash
npx agentflow-devcon /path/to/your-project
# → http://localhost:4170
```

所有数据都是纯 YAML 文件 —— 无数据库、无锁定。内置的 AI Agent（Claude CLI）直接编辑这些文件，工作流状态就是仓库里的文件。

```
your-project/
└── .agentflow/
    ├── flow.yaml                     # 泳道/阶段拓扑
    ├── lanes/
    │   ├── define/processes/
    │   │   ├── problem/
    │   │   │   ├── schema.yaml       # 实体 schema（字段、类型、展示提示）
    │   │   │   └── items/
    │   │   │       ├── PROB-001.yaml
    │   │   │       └── ...
    │   │   ├── prd/...
    │   │   └── stories/...
    │   ├── design/processes/
    │   │   ├── components/...
    │   │   └── contracts/...
    │   └── develop/processes/...
    └── relations/                    # 跨实体关联（from/to/type）
        ├── prob1-drives-prd1.yaml
        ├── prd1-contains-story1.yaml
        └── ...
```

## 功能特性

### 工作流视图
- **11 个步骤视图**，横跨 4 个阶段（定义 → 设计 → 开发 → 验证），每个视图都支持搜索、筛选、排序、分页，以及展开/紧凑两种卡片模式
- **跨视图导航** —— 点击 Story 的组件 ID 直接跳转到 Components 视图，自动翻页并高亮目标项
- **Schema 驱动渲染** —— 字段根据 `schema.yaml` 中的 `display` 提示渲染（badge、tag、text、list、preview 等）
- **内联 HTML 预览** —— 带 `preview` display hint 的组件在沙盒 iframe 中渲染实时 HTML

### Agent 对话
- **内嵌 Claude CLI** —— 对话面板使用 `claude --output-format stream-json` 启动 agent，实时展示 agent 的思考过程
- **活动时间线** —— 工具调用、推理和状态事件以可折叠的活动行内联在对话中
- **流程感知提示** —— system prompt 包含当前 schema、已有实体、关联规则和下一个 ID 提示，确保 agent 创建完整的、有关联的实体
- **会话持久化** —— 对话历史按工作流步骤保存在 localStorage，支持创建/切换/删除多个会话

### 实时同步
- **文件监听** —— chokidar 监听 `.agentflow/` 的 YAML 变化，通过 WebSocket 推送 `item:created`、`item:updated`、`item:deleted`、`schema:updated` 事件
- **字段级 diff** —— 更新的实体包含 `changes` 数组，显示哪些字段发生了变化（from → to）
- **即时预览刷新** —— iframe 预览在内容变化时自动重新挂载

### 其他
- **文件浏览器** —— 在 UI 中浏览和查看 `.agentflow/` 下的任意文件（浮动面板，语法高亮）
- **提交历史** —— 每个实体都有版本时间线和字段级 diff
- **关联图谱** —— 实体展示其入站/出站关联，支持点击跳转
- **深色主题** —— 原生深色 UI，CSS 自定义属性 + 阶段颜色

## 架构

pnpm monorepo，三个包：

| 包 | 描述 |
|---|------|
| `packages/shared` | TypeScript 类型、Schema 定义、WebSocket 消息类型 |
| `packages/cli` | Hono 服务 + chokidar 文件监听 + Claude CLI 桥接 |
| `packages/web` | React 19 SPA（Vite、纯 CSS、Lucide 图标） |

CLI 打包了 web 的构建产物并作为静态文件服务 —— 一个进程搞定，不需要单独的开发服务器。

## 快速开始

### 前置条件

Agent 对话面板依赖 Claude CLI：

```bash
npm install -g @anthropic-ai/claude-code
```

### 方式 A：从源码安装（尚未发布 npm）

```bash
git clone https://github.com/victor-develop/agentflow-devcon.git
cd agentflow-devcon
pnpm install && pnpm build

# 全局链接，随处可用
cd packages/cli && npm link
```

### 方式 B：直接运行，不做全局链接

```bash
git clone https://github.com/victor-develop/agentflow-devcon.git
cd agentflow-devcon
pnpm install && pnpm build
```

后续命令中把 `agentflow-devcon` 替换为 `node packages/cli/dist/index.js` 即可。

---

### 初始化新项目

```bash
# 在你的项目中创建 .agentflow/ 目录，包含全部 schema 和工作流拓扑
cd /path/to/your-project
agentflow-devcon init

# 创建的内容：
# .agentflow/
# ├── flow.yaml              ← 工作流拓扑（4 阶段，11 步骤）
# ├── AGENTS.md              ← AI Agent 编辑此项目的说明文档
# ├── lanes/
# │   ├── define/processes/
# │   │   ├── problem/schema.yaml
# │   │   ├── prd/schema.yaml
# │   │   └── stories/schema.yaml
# │   ├── design/processes/
# │   │   ├── components/schema.yaml
# │   │   ├── contracts/schema.yaml
# │   │   └── design-system/schema.yaml
# │   ├── develop/processes/
# │   │   ├── prototype/schema.yaml
# │   │   └── e2e/schema.yaml
# │   └── verify/processes/
# │       ├── harness/schema.yaml
# │       ├── development/schema.yaml
# │       └── verification/schema.yaml
# └── relations/              ← （空目录，创建实体时自动填充）
```

### 启动控制台

```bash
agentflow-devcon /path/to/your-project
# → http://localhost:4170
```

### 用 Agent 对话填充项目

控制台启动后，打开任意工作流步骤，在对话面板中创建实体：

> "创建一个 problem：用户无法跨多个销售渠道追踪订单"

Agent 会自动创建 YAML 实体文件**和**关联文件。变更通过文件监听实时反映在 UI 上。

### 典型工作流

```
1. 初始化     →  agentflow-devcon init
2. 启动       →  agentflow-devcon .
3. 定义       →  对话："添加 problem: ..." → "为 PROB-001 创建 PRD" → "拆分为 stories"
4. 设计       →  对话："为 STORY-001 添加组件 OrderDashboard" → "添加 API 契约"
5. 开发       →  对话："为 STORY-001 创建 E2E 测试"
6. 迭代       →  手动编辑 YAML 或通过对话 —— UI 实时更新
```

每个步骤的对话都有流程感知能力：它知道当前的 schema、已有实体、关联关系和下一个可用 ID。你也可以用任何编辑器或 AI 工具直接编辑 YAML 文件 —— 控制台会监听变化自动更新。

### 配合 Claude Code 直接使用

初始化生成的 `.agentflow/AGENTS.md` 包含了 AI Agent（Claude Code、Cursor 等）理解项目结构所需的全部说明。直接用 Claude Code 打开项目即可：

```bash
cd /path/to/your-project
claude  # Claude Code 会自动读取 AGENTS.md
```

## Mock 演示

[GitHub Pages Demo](https://victor-develop.github.io/agentflow-devcon/) 以 mock 模式运行，展示了一个**多渠道 OMS（订单管理系统）**项目的完整数据 —— 包含问题、PRD、故事、组件、契约、测试用例和完整的提交历史。

## 参与贡献

```bash
git clone https://github.com/victor-develop/agentflow-devcon.git
cd agentflow-devcon
pnpm install && pnpm build

# 用示例 OMS 项目运行（如果有的话）
node packages/cli/dist/index.js /path/to/agentflow-oms
```

## 许可证

MIT
