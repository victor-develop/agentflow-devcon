# AgentFlow Dev Console — Agent Instructions

## Project Overview
AI Agent First Development Console — a tool installed in any AI-first git repo to orchestrate
the full development workflow from problem definition through verification.

## Workflow Steps (in order)
1. **Problem Definition** — Define the core problem and hypothesis
2. **PRD** — Product Requirements Document
3. **Story Breakdown** — Break PRD into implementable stories
4. **Design System** — Create or refine design tokens, typography, spacing
5. **Design Components** — Design individual UI components per story
6. **API Contracts** — Frontend-backend API contract design
7. **Prototype** — Frontend prototype with mock data
8. **E2E Test Cases** — Test case preparation and confirmation (frontend + mock)
9. **Harness Engineering** — Test data scripts, toolchain for AI feedback loops
10. **Production Code** — Production-grade code development
11. **Verification** — AI-driven verification using harness toolchain

## Progress Tracking
Track progress in `agents.progress.md`. Update it after completing each phase of work.

Format:
```markdown
## Phase: [phase name]
- **Status**: [not started | in progress | done]
- **Date**: [YYYY-MM-DD]
- **Summary**: [what was done]
- **Next**: [what comes next]
```

## Tech Stack
- React + TypeScript + Vite
- Lucide React (icons)
- Pure CSS (no framework — custom design system)
- GitHub Pages for deployment

## File Structure
```
src/
  App.tsx          — main layout with workflow nav + sidebar + content area
  App.css          — shared styles (cards, tags, tables, stats)
  index.css        — design tokens and reset
  types.ts         — TypeScript interfaces
  mockData.ts      — mock PRD, stories, contracts for prototype
  components/
    WorkflowNav.tsx   — top horizontal workflow step navigation
    Sidebar.tsx       — left sidebar with phase-grouped steps
    StepSelector.tsx  — landing page to pick a workflow step
  views/
    ProblemView.tsx      — problem statement + hypothesis + evidence
    PRDView.tsx          — PRD with expandable goals/metrics/stories
    StoriesView.tsx      — stories with nested design/test/code sections
    DesignSystemView.tsx — color tokens, typography, spacing, badges
    ComponentsView.tsx   — design components grouped by type
    ContractsView.tsx    — API endpoint contracts with schemas
    PrototypeView.tsx    — prototype screens with progress
    E2EView.tsx          — test case overview
    HarnessView.tsx      — test data scripts and toolchain
    DevelopmentView.tsx  — code module index
    VerificationView.tsx — verification run history
```
