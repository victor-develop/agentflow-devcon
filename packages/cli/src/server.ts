import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { join } from 'node:path'
import type { Server } from 'node:http'
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

  return { app, project, searchIndex, relationIndex }
}

export async function startServer(opts: ServerOptions): Promise<Server> {
  const { app, project } = createApp(opts.root)
  const agentflowDir = join(opts.root, '.agentflow')

  const server = serve({
    fetch: app.fetch,
    port: opts.port,
  })

  // WebSocket
  const { broadcast } = setupWebSocket(server as Server)

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
