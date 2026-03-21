import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'
import { parse as parseYAML } from 'yaml'
import type { FlowConfig, ProcessSchema, Entity, Relation } from '@agentflow-devcon/shared'

export interface ParsedProject {
  flow: FlowConfig
  schemas: Map<string, ProcessSchema>
  items: Map<string, Map<string, Entity>>
  relations: Relation[]
  /** processId → lane directory path mapping */
  processPaths: Map<string, string>
}

/**
 * Scan .agentflow/ directory and build full in-memory index.
 */
export function parseProject(agentflowDir: string): ParsedProject {
  const flow = parseFlow(agentflowDir)
  const schemas = new Map<string, ProcessSchema>()
  const items = new Map<string, Map<string, Entity>>()
  const processPaths = new Map<string, string>()

  // Walk lanes → processes
  for (const lane of flow.lanes) {
    const laneDir = join(agentflowDir, 'lanes', lane.id)
    if (!existsSync(laneDir)) continue

    for (const proc of lane.processes) {
      const processDir = join(laneDir, 'processes', proc.id)
      if (!existsSync(processDir)) continue

      processPaths.set(proc.id, processDir)

      // Parse schema
      const schemaPath = join(processDir, 'schema.yaml')
      if (existsSync(schemaPath)) {
        const schema = parseYAMLFile<ProcessSchema>(schemaPath)
        if (schema) schemas.set(proc.id, schema)
      }

      // Parse items
      const itemsDir = join(processDir, 'items')
      if (existsSync(itemsDir)) {
        const entityMap = new Map<string, Entity>()
        for (const file of readdirSync(itemsDir)) {
          if (!file.endsWith('.yaml') || file.includes('.changelog.')) continue
          const entity = parseYAMLFile<Entity>(join(itemsDir, file))
          if (entity?.id) {
            entityMap.set(entity.id, entity)
          }
        }
        items.set(proc.id, entityMap)
      }
    }
  }

  // Parse relations
  const relations = parseRelations(agentflowDir)

  return { flow, schemas, items, relations, processPaths }
}

function parseFlow(agentflowDir: string): FlowConfig {
  const flowPath = join(agentflowDir, 'flow.yaml')
  if (!existsSync(flowPath)) {
    return { lanes: [] }
  }
  return parseYAMLFile<FlowConfig>(flowPath) ?? { lanes: [] }
}

function parseRelations(agentflowDir: string): Relation[] {
  const relDir = join(agentflowDir, 'relations')
  if (!existsSync(relDir)) return []

  const relations: Relation[] = []
  for (const file of readdirSync(relDir)) {
    if (!file.endsWith('.yaml')) continue
    const rel = parseYAMLFile<Relation>(join(relDir, file))
    if (rel?.from && rel?.to && rel?.type) {
      relations.push(rel)
    }
  }
  return relations
}

function parseYAMLFile<T>(path: string): T | null {
  try {
    const content = readFileSync(path, 'utf-8')
    return parseYAML(content) as T
  } catch {
    console.warn(`Failed to parse: ${path}`)
    return null
  }
}
