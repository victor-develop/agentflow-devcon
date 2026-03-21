// ── Flow topology ──

export interface FlowConfig {
  lanes: LaneConfig[]
}

export interface LaneConfig {
  id: string
  label: string
  phase: string
  processes: ProcessRef[]
}

export interface ProcessRef {
  id: string
  label: string
  shortLabel?: string
}

// ── Schema ──

export type FieldType =
  | 'string'
  | 'text'
  | 'enum'
  | 'number'
  | 'boolean'
  | 'list'
  | 'object'
  | 'url'
  | 'date'
  | 'code'

export type DisplayHint =
  | 'heading'
  | 'badge'
  | 'block'
  | 'link'
  | 'iframe-preview'
  | 'code'
  | 'color-swatch'
  | 'metric'
  | 'hidden'

export interface FieldCondition {
  field: string
  eq?: unknown
  neq?: unknown
  in?: unknown[]
}

export interface FieldSchema {
  type: FieldType
  required?: boolean
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  display?: DisplayHint
  values?: string[]
  colorMap?: Record<string, string>
  language?: string
  min?: number
  max?: number
  unit?: string
  items?: FieldSchema
  properties?: Record<string, FieldSchema>
  condition?: FieldCondition
}

export interface ProcessSchema {
  entity: string
  primaryField: string
  display: {
    listTitle: string
    listBadges: string[]
  }
  fields: Record<string, FieldSchema>
}

// ── Entity ──

export type Entity = Record<string, unknown> & { id: string }

// ── Relations ──

export type RelationType =
  | 'drives'
  | 'implements'
  | 'tests'
  | 'specifies'
  | 'contains'
  | 'depends-on'
  | 'related'

export interface Relation {
  from: string
  to: string
  type: RelationType
  notes?: string
  createdAt?: string
}

// ── Changelog ──

export interface FieldChange {
  field: string
  from?: string
  to?: string
  type: 'added' | 'removed' | 'changed' | 'created'
}

export interface ChangelogEntry {
  date: string
  author: string
  message: string
  changes: FieldChange[]
}

// ── WebSocket messages ──

export type WSMessage =
  | { type: 'item:created'; processId: string; itemId: string; data: Entity }
  | { type: 'item:updated'; processId: string; itemId: string; changes: FieldChange[] }
  | { type: 'item:deleted'; processId: string; itemId: string }
  | { type: 'relation:created'; from: string; to: string; relationType: string }
  | { type: 'relation:deleted'; from: string; to: string }
  | { type: 'schema:updated'; processId: string }
  | { type: 'flow:updated' }
  | { type: 'chat:chunk'; text: string }
  | { type: 'chat:done' }

// ── API response types ──

export interface ProcessData {
  schema: ProcessSchema
  items: Entity[]
}

export interface RelationEntry {
  to: string
  type: RelationType
  notes?: string
}

export interface EntityRelations {
  outgoing: RelationEntry[]
  incoming: Array<{ from: string; type: RelationType; notes?: string }>
}

export interface SearchResult {
  id: string
  processId: string
  title: string
  score: number
}
