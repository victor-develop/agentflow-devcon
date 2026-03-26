import { watch } from 'chokidar'
import { relative } from 'node:path'
import { readFileSync } from 'node:fs'
import { parse as parseYAML } from 'yaml'
import type { WSMessage, Entity, FieldChange } from '@agentflow-devcon/shared'
import type { ParsedProject } from './parser.js'

export interface WatcherCallbacks {
  onMessage: (msg: WSMessage) => void
}

export function startWatcher(
  agentflowDir: string,
  project: ParsedProject,
  callbacks: WatcherCallbacks,
) {
  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

  const watcher = watch(agentflowDir, {
    ignoreInitial: true,
    persistent: true,
    recursive: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 20 },
  })

  function handleChange(filePath: string) {
    // Debounce per file
    const existing = debounceTimers.get(filePath)
    if (existing) clearTimeout(existing)

    debounceTimers.set(filePath, setTimeout(() => {
      debounceTimers.delete(filePath)
      processChange(filePath)
    }, 50))
  }

  function processChange(filePath: string) {
    const rel = relative(agentflowDir, filePath)

    // flow.yaml
    if (rel === 'flow.yaml') {
      callbacks.onMessage({ type: 'flow:updated' })
      return
    }

    // schema.yaml
    const schemaMatch = rel.match(/^lanes\/[\w-]+\/processes\/([\w-]+)\/schema\.yaml$/)
    if (schemaMatch) {
      const processId = schemaMatch[1]
      try {
        const content = readFileSync(filePath, 'utf-8')
        const schema = parseYAML(content)
        project.schemas.set(processId, schema)
      } catch { /* ignore parse errors */ }
      callbacks.onMessage({ type: 'schema:updated', processId })
      return
    }

    // items
    const itemMatch = rel.match(/^lanes\/[\w-]+\/processes\/([\w-]+)\/items\/([\w-]+)\.yaml$/)
    if (itemMatch) {
      const [, processId, itemId] = itemMatch
      try {
        const content = readFileSync(filePath, 'utf-8')
        const newItem = parseYAML(content) as Entity

        const entityMap = project.items.get(processId) ?? new Map<string, Entity>()
        const oldItem = entityMap.get(itemId)

        if (oldItem) {
          const changes = diffFields(oldItem, newItem)
          entityMap.set(itemId, newItem)
          project.items.set(processId, entityMap)
          callbacks.onMessage({ type: 'item:updated', processId, itemId, changes })
        } else {
          entityMap.set(itemId, newItem)
          project.items.set(processId, entityMap)
          callbacks.onMessage({ type: 'item:created', processId, itemId, data: newItem })
        }
      } catch { /* ignore parse errors */ }
      return
    }

    // relations
    if (rel.startsWith('relations/')) {
      try {
        const content = readFileSync(filePath, 'utf-8')
        const relation = parseYAML(content) as { from: string; to: string; type: string }
        callbacks.onMessage({
          type: 'relation:created',
          from: relation.from,
          to: relation.to,
          relationType: relation.type,
        })
      } catch { /* ignore parse errors */ }
    }
  }

  function handleUnlink(filePath: string) {
    const rel = relative(agentflowDir, filePath)

    const itemMatch = rel.match(/^lanes\/[\w-]+\/processes\/([\w-]+)\/items\/([\w-]+)\.yaml$/)
    if (itemMatch) {
      const [, processId, itemId] = itemMatch
      const entityMap = project.items.get(processId)
      entityMap?.delete(itemId)
      callbacks.onMessage({ type: 'item:deleted', processId, itemId })
    }
  }

  watcher.on('change', (path) => {
    if (!path.endsWith('.yaml')) return
    callbacks.onMessage({ type: 'file:changed', filePath: relative(agentflowDir, path), changeType: 'change' })
    handleChange(path)
  })
  watcher.on('add', (path) => {
    if (!path.endsWith('.yaml')) return
    callbacks.onMessage({ type: 'file:changed', filePath: relative(agentflowDir, path), changeType: 'add' })
    handleChange(path)
  })
  watcher.on('unlink', (path) => {
    if (!path.endsWith('.yaml')) return
    callbacks.onMessage({ type: 'file:changed', filePath: relative(agentflowDir, path), changeType: 'unlink' })
    handleUnlink(path)
  })

  return watcher
}

function diffFields(oldItem: Entity, newItem: Entity): FieldChange[] {
  const changes: FieldChange[] = []
  const allKeys = new Set([...Object.keys(oldItem), ...Object.keys(newItem)])

  for (const key of allKeys) {
    if (key === 'id') continue
    const oldVal = oldItem[key]
    const newVal = newItem[key]

    if (oldVal === undefined && newVal !== undefined) {
      changes.push({ field: key, to: String(newVal), type: 'added' })
    } else if (oldVal !== undefined && newVal === undefined) {
      changes.push({ field: key, from: String(oldVal), type: 'removed' })
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, from: String(oldVal), to: String(newVal), type: 'changed' })
    }
  }

  return changes
}
