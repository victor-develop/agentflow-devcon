import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { join, dirname, relative } from 'node:path'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
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

  // ── File explorer endpoints ──

  app.get('/api/files/tree', (c) => {
    return c.json(buildFileTree(agentflowDir, agentflowDir))
  })

  app.get('/api/files/read/*', (c) => {
    const filePath = c.req.path.replace('/api/files/read/', '')
    const fullPath = join(agentflowDir, filePath)
    // Prevent path traversal
    if (!fullPath.startsWith(agentflowDir)) {
      return c.json({ error: 'forbidden' }, 403)
    }
    if (!existsSync(fullPath) || statSync(fullPath).isDirectory()) {
      return c.json({ error: 'not found' }, 404)
    }
    try {
      const content = readFileSync(fullPath, 'utf-8')
      return c.json({ path: filePath, content })
    } catch {
      return c.json({ error: 'read failed' }, 500)
    }
  })

  return { app, project, searchIndex, relationIndex }
}

// ── File tree builder ──

interface FileTreeNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: FileTreeNode[]
}

function buildFileTree(dir: string, root: string): FileTreeNode[] {
  const entries = readdirSync(dir, { withFileTypes: true })
    .filter(e => !e.name.startsWith('.'))
    .sort((a, b) => {
      // Dirs first, then files
      if (a.isDirectory() && !b.isDirectory()) return -1
      if (!a.isDirectory() && b.isDirectory()) return 1
      return a.name.localeCompare(b.name)
    })

  return entries.map(entry => {
    const fullPath = join(dir, entry.name)
    const relPath = relative(root, fullPath)
    if (entry.isDirectory()) {
      return {
        name: entry.name,
        path: relPath,
        type: 'dir' as const,
        children: buildFileTree(fullPath, root),
      }
    }
    return { name: entry.name, path: relPath, type: 'file' as const }
  })
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

import { createInterface } from 'node:readline'

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s
}

interface ClaudeCallbacks {
  onChunk: (text: string) => void
  onDone: () => void
  onError: (err: string) => void
  onActivity: (family: string, phase: string, content: string, toolName?: string) => void
}

function spawnClaude(prompt: string, cwd: string, cb: ClaudeCallbacks) {
  const bin = process.env.CLAUDE_BIN || 'claude'
  const child = spawnChild(bin, [
    '--dangerously-skip-permissions',
    '-p',
    '--verbose',
    '--output-format', 'stream-json',
    prompt,
  ], {
    cwd,
    env: { ...process.env, TERM: 'dumb' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const rl = createInterface({ input: child.stdout! })

  rl.on('line', (line) => {
    if (!line.trim()) return
    let record: Record<string, unknown>
    try { record = JSON.parse(line) } catch { return }

    const type = record.type as string

    if (type === 'assistant') {
      const msg = record.message as { content?: Array<{ type: string; text?: string; name?: string; input?: unknown; thinking?: string }> } | undefined
      if (msg?.content) {
        for (const block of msg.content) {
          if (block.type === 'text' && block.text) {
            cb.onChunk(block.text)
          } else if (block.type === 'tool_use') {
            const toolName = block.name || 'tool'
            const inputStr = block.input ? truncate(JSON.stringify(block.input), 80) : ''
            cb.onActivity('tool', 'started', `${toolName} ${inputStr}`, toolName)
          } else if (block.type === 'thinking' && block.thinking) {
            cb.onActivity('reasoning', 'completed', truncate(block.thinking, 120))
          }
        }
      }
    } else if (type === 'result') {
      const subtype = record.subtype as string | undefined
      if (subtype !== 'success' && record.errors) {
        cb.onError(String(record.errors))
      }
      const cost = record.total_cost_usd as number | undefined
      const duration = record.duration_ms as number | undefined
      const parts: string[] = ['Done']
      if (duration) parts.push(`${(duration / 1000).toFixed(1)}s`)
      if (cost) parts.push(`$${cost.toFixed(4)}`)
      cb.onActivity('status', 'completed', parts.join(' · '))
    } else if (type === 'system') {
      const subtype = record.subtype as string
      if (subtype === 'init') {
        const model = record.model as string | undefined
        if (model) cb.onActivity('status', 'started', `Agent: ${model}`)
      }
    }
  })

  let stderr = ''
  child.stderr!.on('data', (data: Buffer) => { stderr += data.toString('utf-8') })

  child.on('close', (code) => {
    if (code !== 0 && stderr) cb.onError(stderr)
    cb.onDone()
  })

  child.on('error', (err) => {
    cb.onError(`Failed to spawn claude: ${err.message}`)
    cb.onDone()
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

    spawnClaude(fullPrompt, opts.root, {
      onChunk: (text) => broadcast({ type: 'chat:chunk', text }),
      onDone: () => broadcast({ type: 'chat:done' }),
      onError: (err) => broadcast({ type: 'chat:chunk', text: `\n\n**Error:** ${err}` }),
      onActivity: (family, phase, content, toolName) =>
        broadcast({ type: 'chat:activity', family: family as 'tool', phase, content, toolName }),
    })

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
