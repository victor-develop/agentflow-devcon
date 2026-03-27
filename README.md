# AgentFlow Dev Console

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

### With an existing `.agentflow/` project

```bash
npx agentflow-devcon /path/to/your-project
```

### Development

```bash
git clone https://github.com/victor-develop/agentflow-devcon.git
cd agentflow-devcon
pnpm install
pnpm build

# Run against a project
node packages/cli/dist/index.js /path/to/your-project
```

### Agent chat requires Claude CLI

The chat panel shells out to `claude` CLI. Install it and ensure it's on your PATH:

```bash
# https://docs.anthropic.com/en/docs/claude-code
npm install -g @anthropic-ai/claude-code
```

## Mock demo

The [GitHub Pages demo](https://victor-develop.github.io/agentflow-devcon/) runs in mock mode with hardcoded data modeling a **multi-channel OMS (Order Management System)** project — problems, PRDs, stories, components, contracts, tests, and full commit history.

## License

MIT
