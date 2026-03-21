# AgentFlow Project — Agent Instructions

## Project Structure

This project uses AgentFlow. All data lives in `.agentflow/`.

## File Layout

- `flow.yaml` — workflow topology (DO NOT modify unless asked)
- `lanes/{phase}/processes/{process}/schema.yaml` — entity schemas
- `lanes/{phase}/processes/{process}/items/*.yaml` — entity instances
- `relations/` — cross-entity relations

## How to Create an Entity

1. Find the target process under `lanes/`
2. Read its `schema.yaml` to understand required fields
3. Create `items/{id}.yaml` with all required fields
4. ID format: `{process-prefix}-{NNN}` (e.g., `problem-001`)

## How to Create a Relation

Create `relations/{fromId}--{type}--{toId}.yaml`:
```yaml
from: problem-001
to: prd-001
type: drives
```

Valid relation types: drives, implements, tests, specifies, contains, depends-on, related

## How to Modify an Entity

1. Read the existing `items/{id}.yaml`
2. Edit only the fields that need to change
3. Keep the `id` field unchanged

## Naming Rules

- IDs: kebab-case (e.g., `notification-button`)
- Files: `{id}.yaml`
- Relations: `{fromId}--{type}--{toId}.yaml`
