import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { join, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { spawn as spawnChild } from 'node:child_process'
import type { Server } from 'node:http'
import type { WSMessage, ProcessSchema, Entity } from '@agentflow-devcon/shared'

const __dirname = dirname(fileURLToPath(import.meta.url))
import { parseProject, type ParsedProject } from './parser.js'
import { buildSearchIndex, buildRelationIndex, type ProjectIndex } from './indexer.js'
import { readChangelog } from './changelog.js'
import { setupWebSocket } from './ws.js'
import { startWatcher } from './watcher.js'

export interface ServerOptions {
  root: string
  port: number
  webDistDir?: string
}

export function createApp(root: string) {
  const agentflowDir = join(root, '.agentflow')

  // Parse project on startup
  const project = parseProject(agentflowDir)
  const searchIndex = buildSearchIndex(project.schemas, project.items)
  const relationIndex = buildRelationIndex(project.relations)

  const app = new Hono()

  // ── API routes ──

  app.get('/api/flow', (c) => {
    return c.json(project.flow)
  })

  app.get('/api/processes', (c) => {
    const processes: Array<{ id: string; entity: string }> = []
    for (const [id, schema] of project.schemas) {
      processes.push({ id, entity: schema.entity })
    }
    return c.json(processes)
  })

  app.get('/api/processes/:processId', (c) => {
    const { processId } = c.req.param()
    const schema = project.schemas.get(processId)
    if (!schema) return c.json({ error: 'not found' }, 404)
    const entityMap = project.items.get(processId)
    const items = entityMap ? Array.from(entityMap.values()) : []
    return c.json({ schema, items })
  })

  app.get('/api/processes/:processId/schema', (c) => {
    const { processId } = c.req.param()
    const schema = project.schemas.get(processId)
    if (!schema) return c.json({ error: 'not found' }, 404)
    return c.json(schema)
  })

  app.get('/api/processes/:processId/items/:itemId', (c) => {
    const { processId, itemId } = c.req.param()
    const entityMap = project.items.get(processId)
    const entity = entityMap?.get(itemId)
    if (!entity) return c.json({ error: 'not found' }, 404)
    return c.json(entity)
  })

  app.get('/api/processes/:processId/items/:itemId/changelog', (c) => {
    const { processId, itemId } = c.req.param()
    const processDir = project.processPaths.get(processId)
    if (!processDir) return c.json({ error: 'not found' }, 404)
    const entries = readChangelog(processDir, itemId)
    return c.json({ entries })
  })

  app.get('/api/relations', (c) => {
    const entity = c.req.query('entity')
    if (!entity) return c.json({ error: 'entity query param required' }, 400)
    return c.json({
      outgoing: relationIndex.outgoing.get(entity) ?? [],
      incoming: relationIndex.incoming.get(entity) ?? [],
    })
  })

  app.get('/api/search', (c) => {
    const q = c.req.query('q')
    if (!q) return c.json({ results: [] })
    const results = searchIndex.search(q, { prefix: true, fuzzy: 0.2 }).map((r) => ({
      id: r.id,
      processId: r.processId,
      title: r.title,
      score: r.score,
    }))
    return c.json({ results })
  })

  // Given an item ID, find which processId it belongs to
  app.get('/api/locate/:itemId', (c) => {
    const { itemId } = c.req.param()
    for (const [processId, entityMap] of project.items) {
      if (entityMap.has(itemId)) {
        return c.json({ processId })
      }
    }
    return c.json({ error: 'not found' }, 404)
  })

  return { app, project, searchIndex, relationIndex }
}

// ── Chat helpers ──

interface ChatMessage {
  role: 'user' | 'agent'
  content: string
}

function buildSystemPrompt(
  processId: string,
  project: ParsedProject,
): string {
  const schema = project.schemas.get(processId)
  const entityMap = project.items.get(processId)
  const items = entityMap ? Array.from(entityMap.values()) : []

  const parts: string[] = [
    `You are an AI assistant embedded in AgentFlow DevConsole.`,
    `You help the user manage workflow items by editing YAML files in the .agentflow/ directory.`,
    `Current process: "${processId}"`,
  ]

  if (schema) {
    parts.push(`\nSchema:\n\`\`\`yaml\n${schemaToYaml(schema)}\n\`\`\``)
  }

  if (items.length > 0) {
    const summary = items.map(
      (it) => `- ${it.id}: ${it[schema?.primaryField ?? 'title'] ?? it.id}`
    ).join('\n')
    parts.push(`\nExisting items (${items.length}):\n${summary}`)
  }

  parts.push(
    `\nKeep responses concise. When the user asks to create/update/delete items, ` +
    `describe the YAML changes needed. If the user asks a question, answer it directly.`
  )

  return parts.join('\n')
}

function schemaToYaml(schema: ProcessSchema): string {
  const lines: string[] = [`entity: ${schema.entity}`, `primaryField: ${schema.primaryField}`]
  lines.push(`fields:`)
  for (const [name, field] of Object.entries(schema.fields)) {
    const attrs = [`type: ${field.type}`]
    if (field.values) attrs.push(`values: [${field.values.join(', ')}]`)
    if (field.required) attrs.push(`required: true`)
    lines.push(`  ${name}: { ${attrs.join(', ')} }`)
  }
  return lines.join('\n')
}

function spawnClaude(
  prompt: string,
  cwd: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
) {
  const bin = process.env.CLAUDE_BIN || 'claude'
  const child = spawnChild(bin, ['--dangerously-skip-permissions', '-p', prompt], {
    cwd,
    env: { ...process.env, TERM: 'dumb' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout!.on('data', (data: Buffer) => {
    onChunk(data.toString('utf-8'))
  })

  let stderr = ''
  child.stderr!.on('data', (data: Buffer) => {
    stderr += data.toString('utf-8')
  })

  child.on('close', (code) => {
    if (code !== 0 && stderr) {
      onError(stderr)
    }
    onDone()
  })

  child.on('error', (err) => {
    onError(`Failed to spawn claude: ${err.message}`)
    onDone()
  })

  return child
}

export async function startServer(opts: ServerOptions): Promise<Server> {
  const { app, project } = createApp(opts.root)
  const agentflowDir = join(opts.root, '.agentflow')

  // Serve bundled frontend (production / npx mode)
  const webDistDir = opts.webDistDir ?? join(__dirname, '..', 'web-dist')
  if (existsSync(webDistDir)) {
    app.use('/*', serveStatic({ root: webDistDir }))
  }

  const server = serve({
    fetch: app.fetch,
    port: opts.port,
  })

  // WebSocket
  const { broadcast } = setupWebSocket(server as Server)

  // ── Chat endpoint (needs broadcast) ──
  app.post('/api/chat', async (c) => {
    const body = await c.req.json<{
      processId: string
      message: string
      history?: ChatMessage[]
    }>()
    const { processId, message, history } = body

    if (!processId || !message) {
      return c.json({ error: 'processId and message required' }, 400)
    }

    const systemPrompt = buildSystemPrompt(processId, project)

    // Build the full prompt with conversation history
    const conversationParts: string[] = [systemPrompt, '']
    if (history?.length) {
      for (const msg of history) {
        conversationParts.push(
          msg.role === 'user' ? `User: ${msg.content}` : `Assistant: ${msg.content}`
        )
      }
    }
    conversationParts.push(`User: ${message}`)
    const fullPrompt = conversationParts.join('\n')

    spawnClaude(
      fullPrompt,
      opts.root,
      (text) => broadcast({ type: 'chat:chunk', text }),
      () => broadcast({ type: 'chat:done' }),
      (err) => broadcast({ type: 'chat:chunk', text: `\n\n**Error:** ${err}` }),
    )

    return c.json({ ok: true })
  })

  // File watcher → broadcast changes
  startWatcher(agentflowDir, project, {
    onMessage: (msg) => broadcast(msg),
  })

  console.log(`  AgentFlow DevConsole`)
  console.log(`  ➜ http://localhost:${opts.port}`)
  console.log(`  ➜ Project: ${opts.root}`)
  console.log(`  ➜ Watching .agentflow/ for changes`)

  return server as Server
}
