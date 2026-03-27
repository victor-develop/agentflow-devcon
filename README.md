# AgentFlow Dev Console

[中文文档](./README.ZH.md)

A schema-driven, AI-agent-first development console that turns a folder of YAML files into a full visual workflow — from problem definition through verification.

**[Live Demo (mock data) →](https://victor-develop.github.io/agentflow-devcon/)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Deploy](https://img.shields.io/github/actions/workflow/status/victor-develop/agentflow-devcon/deploy.yml?label=deploy)

## How it works

Point the CLI at any project that has a `.agentflow/` directory. The console reads your YAML schemas, items, and relations, serves a live UI, and watches for file changes in real time.

```bash
npx agentflow-devcon /path/to/your-project
# → http://localhost:4170
```

All data lives in plain YAML files — no database, no lock-in. The embedded AI agent (Claude CLI) edits those files directly, so your workflow state is always just files in a repo.

```
your-project/
└── .agentflow/
    ├── flow.yaml                     # lane/phase topology
    ├── lanes/
    │   ├── define/processes/
    │   │   ├── problem/
    │   │   │   ├── schema.yaml       # entity schema (fields, types, display hints)
    │   │   │   └── items/
    │   │   │       ├── PROB-001.yaml
    │   │   │       └── ...
    │   │   ├── prd/...
    │   │   └── stories/...
    │   ├── design/processes/
    │   │   ├── components/...
    │   │   └── contracts/...
    │   └── develop/processes/...
    └── relations/                    # cross-entity links (from/to/type)
        ├── prob1-drives-prd1.yaml
        ├── prd1-contains-story1.yaml
        └── ...
```

## Features

### Workflow views
- **11 step views** across 4 phases (Define → Design → Develop → Verify), each with search, filter, sort, pagination, and expanded/compact modes
- **Cross-view navigation** — click a story's component ID to jump to Components view, auto-paginating to the correct page and highlighting the item
- **Schema-driven rendering** — fields render based on `display` hints in `schema.yaml` (badge, tag, text, list, preview, etc.)
- **Inline HTML preview** — components with a `preview` display hint render live HTML in sandboxed iframes

### Agent chat
- **Embedded Claude CLI** — chat panel spawns `claude` with `--output-format stream-json`, giving real-time visibility into agent thinking
- **Activity timeline** — tool calls, reasoning, and status events stream inline in the chat as collapsible activity rows
- **Process-aware prompts** — system prompt includes the current schema, existing items, relation rules, and next-ID hints so the agent creates complete, linked entities
- **Persistent sessions** — chat history saved to localStorage per workflow step, with a session switcher to create/switch/delete conversations

### Live sync
- **File watcher** — chokidar watches `.agentflow/` for YAML changes and pushes `item:created`, `item:updated`, `item:deleted`, `schema:updated` events over WebSocket
- **Field-level diffs** — updated items include a `changes` array showing which fields changed (from → to)
- **Instant preview refresh** — iframe previews remount when their content changes

### Other
- **File explorer** — browse and read any file in `.agentflow/` from the UI (floating panel with syntax highlighting)
- **Commit history** — version timeline with field-level diffs per entity
- **Relation graph** — items show their incoming/outgoing relations with clickable cross-links
- **Dark theme** — native dark UI with CSS custom properties and phase-colored accents

## Architecture

pnpm monorepo with three packages:

| Package | Description |
|---------|-------------|
| `packages/shared` | TypeScript types, schemas, WS message definitions |
| `packages/cli` | Hono server + chokidar watcher + Claude CLI bridge |
| `packages/web` | React 19 SPA (Vite, pure CSS, Lucide icons) |

The CLI bundles the web dist and serves it as static files — one process, no separate dev server needed.

## Getting Started

### Prerequisites

The agent chat panel uses Claude CLI under the hood:

```bash
npm install -g @anthropic-ai/claude-code
```

### Option A: Install from source (npm not yet published)

```bash
git clone https://github.com/victor-develop/agentflow-devcon.git
cd agentflow-devcon
pnpm install && pnpm build

# Link globally so you can use it anywhere
cd packages/cli && npm link
```

### Option B: Run directly without linking

```bash
git clone https://github.com/victor-develop/agentflow-devcon.git
cd agentflow-devcon
pnpm install && pnpm build
```

Then use `node packages/cli/dist/index.js` wherever you'd use `agentflow-devcon` below.

---

### Scaffold a new project

```bash
cd /path/to/your-project

# Option 1: Empty scaffold (schemas only, no data)
agentflow-devcon init

# Option 2: AI-powered scaffold — Claude populates the project for you
agentflow-devcon init -p "Build an order management system for multi-channel e-commerce"
```

With `-p`, the CLI creates the directory structure then calls Claude CLI to auto-generate Problems, PRDs, Stories, Components, Contracts, E2E tests, and all their relations based on your description.

### Launch the console

```bash
agentflow-devcon /path/to/your-project
# → http://localhost:4170
```

### Use the agent chat to populate your project

Once the console is running, open any workflow step and use the chat panel to create entities:

> "Create a problem: users can't track orders across multiple sales channels"

The agent will create the YAML item file **and** the relation files automatically. Changes appear in the UI in real time via file watching.

### Typical workflow

```
1. Init        →  agentflow-devcon init
2. Launch      →  agentflow-devcon .
3. Define      →  Chat: "Add problem: ..." → "Create PRD for PROB-001" → "Break into stories"
4. Design      →  Chat: "Add component OrderDashboard for STORY-001" → "Add API contract"
5. Develop     →  Chat: "Create E2E test for STORY-001"
6. Iterate     →  Edit YAML manually or via chat — UI updates live
```

Each step's chat is process-aware: it knows the schema, existing items, relations, and the next available ID. You can also edit the YAML files directly with any editor or AI tool — the console watches for changes.

### Using with Claude Code directly

The scaffolded `.agentflow/AGENTS.md` contains instructions for any AI agent (Claude Code, Cursor, etc.) to understand the file structure. You can point Claude Code at your project and it will know how to create items and relations correctly:

```bash
cd /path/to/your-project
claude  # Claude Code will read AGENTS.md automatically
```

## Mock demo

The [GitHub Pages demo](https://victor-develop.github.io/agentflow-devcon/) runs in mock mode with hardcoded data modeling a **multi-channel OMS (Order Management System)** project — problems, PRDs, stories, components, contracts, tests, and full commit history.

## Contributing

```bash
git clone https://github.com/victor-develop/agentflow-devcon.git
cd agentflow-devcon
pnpm install && pnpm build

# Run against the example OMS project (if available)
node packages/cli/dist/index.js /path/to/agentflow-oms
```

## License

MIT
