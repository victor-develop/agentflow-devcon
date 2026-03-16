# AgentFlow Dev Console

An AI-first development workflow console that orchestrates the full software lifecycle — from problem definition through verification — in a structured, visual interface.

**[Live Demo →](https://victor-develop.github.io/agentflow-devcon/)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Deploy](https://img.shields.io/github/actions/workflow/status/victor-develop/agentflow-devcon/deploy.yml?label=deploy)

## What is this?

AgentFlow Dev Console provides a structured kanban-style workflow for AI-assisted software development. It breaks the dev lifecycle into **4 phases / 11 steps**, each with dedicated views, data models, and an integrated AI chat panel.

```
Define          Design            Develop             Verify
─────────────   ──────────────    ──────────────────  ──────────────────
1. Problems     4. Design System  6. API Contracts    9.  Test Harness
2. PRD          5. Components     7. Prototype        10. Production Code
3. Stories                        8. E2E Tests        11. Verification
```

## Features

- **11 Workflow Views** — Each step has a dedicated view with search, filter, sort, pagination, and expanded/compact card modes
- **Context-Aware AI Chat** — Drawer-style chat panel with step-specific hints and mock agent conversations
- **Cross-View Navigation** — Click a story's component to jump directly to the Components view with it highlighted
- **Commit History** — Version timeline with field-level diffs (from → to) integrated into every entity
- **API Contract Browser** — REST & GraphQL endpoint schemas with request/response previews
- **Component Preview** — Design component cards with type, status, and Figma link support
- **Design System Viewer** — Color tokens, typography scale, and spacing documentation
- **Dark Theme** — Native dark UI with CSS custom properties and phase-colored accents

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite 8 |
| Icons | Lucide React |
| Styling | Pure CSS (custom properties) |
| Fonts | Inter + JetBrains Mono |
| Deployment | GitHub Pages via Actions |

No external state management, no CSS framework — intentionally minimal dependencies.

## Getting Started

```bash
# Clone
git clone https://github.com/victor-develop/agentflow-devcon.git
cd agentflow-devcon

# Install
npm install

# Dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview build locally
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI (ChatPanel, Sidebar, ListToolbar, etc.)
├── views/               # 11 workflow step views
├── App.tsx              # Layout & routing
├── NavigationContext.tsx # Cross-view navigation state
├── types.ts             # TypeScript interfaces
├── mockData.ts          # Sample data (notification-routing project)
├── mockCommits.ts       # Mock version history
└── index.css            # Design tokens & theme
```

## Mock Data

The console ships with realistic mock data modeling a **notification routing** system:

- 8 problems, 6 PRDs, 25 stories
- ~40 design components, ~50 test cases, ~30 code modules
- 29 API contracts (REST + GraphQL)
- Full commit history across all entities

## Roadmap

- [ ] Backend integration (replace mock data with API)
- [ ] Real AI agent integration via chat panel
- [ ] Authentication & collaboration
- [ ] Export (PRDs, test plans, code stubs)
- [ ] Real-time sync

## License

MIT
