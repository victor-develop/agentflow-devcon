import MiniSearch from 'minisearch'
import type { ProcessSchema, Entity, Relation, RelationType } from '@agentflow-devcon/shared'

export interface RelationIndex {
  outgoing: Map<string, Array<{ to: string; type: RelationType; notes?: string }>>
  incoming: Map<string, Array<{ from: string; type: RelationType; notes?: string }>>
}

export interface ProjectIndex {
  search: MiniSearch
  relationIndex: RelationIndex
}

export function buildSearchIndex(
  schemas: Map<string, ProcessSchema>,
  items: Map<string, Map<string, Entity>>,
): MiniSearch {
  const search = new MiniSearch({
    fields: ['_searchText'],
    storeFields: ['processId', 'title'],
    idField: '_indexId',
  })

  const docs: Array<Record<string, unknown>> = []

  for (const [processId, schema] of schemas) {
    const entityMap = items.get(processId)
    if (!entityMap) continue

    // Collect searchable fields from schema
    const searchableFields = Object.entries(schema.fields ?? {})
      .filter(([, f]) => f.searchable)
      .map(([name]) => name)

    const titleField = schema.display?.listTitle ?? schema.primaryField

    for (const [itemId, entity] of entityMap) {
      const searchText = searchableFields
        .map((f) => String(entity[f] ?? ''))
        .join(' ')

      docs.push({
        _indexId: `${processId}:${itemId}`,
        _searchText: searchText,
        processId,
        title: String(entity[titleField] ?? itemId),
      })
    }
  }

  search.addAll(docs)
  return search
}

export function buildRelationIndex(relations: Relation[]): RelationIndex {
  const outgoing = new Map<string, Array<{ to: string; type: RelationType; notes?: string }>>()
  const incoming = new Map<string, Array<{ from: string; type: RelationType; notes?: string }>>()

  for (const rel of relations) {
    // Outgoing
    if (!outgoing.has(rel.from)) outgoing.set(rel.from, [])
    outgoing.get(rel.from)!.push({ to: rel.to, type: rel.type, notes: rel.notes })

    // Incoming
    if (!incoming.has(rel.to)) incoming.set(rel.to, [])
    incoming.get(rel.to)!.push({ from: rel.from, type: rel.type, notes: rel.notes })
  }

  return { outgoing, incoming }
}
