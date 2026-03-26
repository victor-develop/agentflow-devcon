import { useState, useMemo, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import { ListToolbar, type ViewMode } from './ListToolbar'
import { Pagination } from './Pagination'
import { CommitHistory, HistoryToggle } from './CommitHistory'
import { useProcessData, useRelations, DATA_MODE } from '../data'
import { useNavigation } from '../NavigationContext'
import { apiClient } from '../data/api-client'
import type { WorkflowStepId } from '../types'
import type {
  FieldSchema,
  Entity,
} from '@agentflow-devcon/shared'

const processToStep: Record<string, WorkflowStepId> = {
  problem: 'problem',
  prd: 'prd',
  stories: 'stories',
  'design-system': 'design',
  components: 'components',
  contracts: 'contracts',
  prototype: 'prototype',
  e2e: 'e2e',
  harness: 'harness',
  development: 'development',
  verification: 'verification',
}

// ── Color maps ──

const DEFAULT_COLOR_MAP: Record<string, string> = {
  green: 'var(--green)',
  red: 'var(--red)',
  amber: 'var(--amber)',
  cyan: 'var(--cyan)',
  purple: 'var(--purple)',
  pink: 'var(--pink)',
  accent: 'var(--accent)',
  muted: 'var(--text-muted)',
}

function resolveColor(colorName?: string): string | undefined {
  if (!colorName) return undefined
  return DEFAULT_COLOR_MAP[colorName] ?? colorName
}

// ── Field renderers by display hint ──

function renderField(
  name: string,
  field: FieldSchema,
  value: unknown,
  entity: Entity,
): React.ReactNode {
  if (value === undefined || value === null) return null

  // Condition check
  if (field.condition) {
    if (!shouldRender(field, entity)) return null
  }

  switch (field.display) {
    case 'heading':
      return null // heading rendered in card header
    case 'badge':
      return renderBadge(name, field, value)
    case 'block':
      return (
        <div style={{ marginBottom: 16 }}>
          <div className="section-title">{formatLabel(name)}</div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 13 }}>
            {String(value)}
          </p>
        </div>
      )
    case 'link':
      return (
        <div style={{ marginBottom: 16 }}>
          <div className="section-title">{formatLabel(name)}</div>
          <a href={String(value)} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontSize: 13 }}>
            {String(value)}
          </a>
        </div>
      )
    case 'code':
      return (
        <div style={{ marginBottom: 16 }}>
          <div className="section-title">{formatLabel(name)}</div>
          <pre style={{
            background: 'var(--bg-tertiary)', padding: 12, borderRadius: 8,
            fontSize: 12, overflow: 'auto', lineHeight: 1.5,
          }}>
            {String(value)}
          </pre>
        </div>
      )
    case 'preview':
      return renderPreview(name, value)
    case 'color-swatch':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: String(value), border: '1px solid var(--border)',
          }} />
          <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{String(value)}</span>
        </div>
      )
    case 'metric':
      return renderMetricList(name, value)
    case 'hidden':
      return null
    default:
      return renderDefaultField(name, field, value)
  }
}

function renderBadge(_name: string, field: FieldSchema, value: unknown): React.ReactNode {
  const colorName = field.colorMap?.[String(value)]
  const color = resolveColor(colorName)
  return (
    <span
      className="tag"
      style={color ? { borderColor: color, color } : undefined}
    >
      {String(value)}
    </span>
  )
}

function renderMetricList(name: string, value: unknown): React.ReactNode {
  if (!Array.isArray(value)) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-title">{formatLabel(name)}</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {value.map((m: { label?: string; value?: string; color?: string }, i: number) => (
          <div key={i} style={{
            padding: '8px 14px', background: 'var(--bg-tertiary)', borderRadius: 8,
            display: 'flex', flexDirection: 'column', gap: 2, minWidth: 120,
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: m.color || 'var(--text-primary)' }}>
              {m.value}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return h
}

function renderPreview(_name: string, value: unknown): React.ReactNode {
  const html = String(value ?? '')
  if (!html) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-title">Preview</div>
      <iframe
        key={hashCode(html)}
        srcDoc={html}
        sandbox="allow-scripts"
        style={{
          width: '100%',
          height: 280,
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: '#fff',
        }}
      />
    </div>
  )
}

function renderDefaultField(name: string, field: FieldSchema, value: unknown): React.ReactNode {
  if (field.type === 'list' && Array.isArray(value)) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div className="section-title">{formatLabel(name)}</div>
        {value.map((item, i) => (
          <div key={i} className="list-item">
            <span className="list-bullet" />
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </div>
        ))}
      </div>
    )
  }
  if (field.type === 'boolean') {
    return (
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatLabel(name)}: </span>
        <span className="tag">{value ? 'Yes' : 'No'}</span>
      </div>
    )
  }
  // Fallback: string/number/date
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-title">{formatLabel(name)}</div>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{String(value)}</span>
    </div>
  )
}

function shouldRender(field: FieldSchema, entity: Entity): boolean {
  if (!field.condition) return true
  const { field: depField, eq, neq } = field.condition
  const val = entity[depField]
  if (eq !== undefined) return val === eq
  if (neq !== undefined) return val !== neq
  if (field.condition.in) return (field.condition.in as unknown[]).includes(val)
  return true
}

function formatLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

// ── Main component ──

interface Props {
  processId: string
  renderItemExtra?: (entity: Entity, allEntities: Entity[]) => React.ReactNode
}

export function EntityListView({ processId, renderItemExtra }: Props) {
  const { data, loading } = useProcessData(processId)

  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('expanded')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({})

  const schema = data?.schema
  const items = data?.items ?? []

  // Build filters from filterable fields
  const filters = useMemo(() => {
    if (!schema) return []
    const result: Array<{ label: string; value: string; count: number; color?: string }> = []
    for (const [fieldName, field] of Object.entries(schema.fields)) {
      if (!field.filterable || !field.values) continue
      const counts = new Map<string, number>()
      for (const v of field.values) counts.set(v, 0)
      for (const item of items) {
        const val = String(item[fieldName] ?? '')
        if (counts.has(val)) counts.set(val, (counts.get(val) ?? 0) + 1)
      }
      for (const [val, count] of counts) {
        const color = resolveColor(field.colorMap?.[val])
        result.push({ label: val, value: `${fieldName}:${val}`, count, color })
      }
    }
    return result
  }, [schema, items])

  // Filter + search
  const filtered = useMemo(() => {
    if (!schema) return items
    let result = [...items]

    if (search) {
      const q = search.toLowerCase()
      const searchableFields = Object.entries(schema.fields)
        .filter(([, f]) => f.searchable)
        .map(([name]) => name)
      result = result.filter((item) =>
        searchableFields.some((f) =>
          String(item[f] ?? '').toLowerCase().includes(q)
        ) || String(item.id).toLowerCase().includes(q)
      )
    }

    if (activeFilters.length > 0) {
      result = result.filter((item) =>
        activeFilters.some((filter) => {
          const [field, val] = filter.split(':')
          return String(item[field]) === val
        })
      )
    }

    return result
  }, [schema, items, search, activeFilters])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  if (loading) return <div style={{ padding: 20, color: 'var(--text-muted)' }}>Loading...</div>
  if (!schema) return <div style={{ padding: 20, color: 'var(--text-muted)' }}>No schema found for {processId}</div>

  const titleField = schema.display?.listTitle ?? schema.primaryField
  const badgeFields = schema.display?.listBadges ?? []
  const bodyFields = Object.entries(schema.fields).filter(
    ([name, field]) =>
      field.display !== 'heading' &&
      field.display !== 'hidden' &&
      !badgeFields.includes(name),
  )

  // Auto-expand first item
  if (paged.length > 0 && Object.keys(expanded).length === 0) {
    expanded[paged[0].id] = true
  }

  const toggleFilter = (v: string) => {
    setActiveFilters((prev) => prev.includes(v) ? prev.filter((f) => f !== v) : [...prev, v])
    setPage(1)
  }

  return (
    <div>
      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{items.length}</div>
          <div className="stat-label">Total {schema.entity}s</div>
        </div>
        {badgeFields.slice(0, 3).map((fieldName) => {
          const field = schema.fields[fieldName]
          if (!field?.values) return null
          // Show first non-zero value as stat
          const mainValue = field.values[field.values.length > 1 ? 1 : 0]
          const count = items.filter((i) => String(i[fieldName]) === mainValue).length
          const color = resolveColor(field.colorMap?.[mainValue])
          return (
            <div key={fieldName} className="stat-card">
              <div className="stat-value" style={color ? { color } : undefined}>{count}</div>
              <div className="stat-label">{formatLabel(mainValue)}</div>
            </div>
          )
        })}
      </div>

      <ListToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        filters={filters}
        activeFilters={activeFilters}
        onFilterToggle={toggleFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={items.length}
        filteredCount={filtered.length}
        placeholder={`Search ${schema.entity.toLowerCase()}s...`}
      />

      {viewMode === 'compact' ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{formatLabel(titleField)}</th>
                {badgeFields.map((f) => <th key={f}>{formatLabel(f)}</th>)}
              </tr>
            </thead>
            <tbody>
              {paged.map((item) => (
                <tr key={item.id} style={{ cursor: 'pointer' }}
                  onClick={() => { setViewMode('expanded'); setExpanded((prev) => ({ ...prev, [item.id]: true })) }}>
                  <td className="mono">{item.id}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{String(item[titleField] ?? '')}</td>
                  {badgeFields.map((f) => (
                    <td key={f}>{renderBadge(f, schema.fields[f], item[f])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        paged.map((item) => (
          <div key={item.id} id={`item-${item.id}`} className="card">
            <div className="card-header"
              onClick={() => setExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ChevronRight size={16} className={`expand-icon ${expanded[item.id] ? 'expanded' : ''}`} />
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.id}</span>
                <h3>{String(item[titleField] ?? '')}</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <HistoryToggle
                  itemId={item.id}
                  isOpen={!!showHistory[item.id]}
                  onToggle={() => setShowHistory((p) => ({ ...p, [item.id]: !p[item.id] }))}
                />
                {badgeFields.map((f) => (
                  <span key={f}>{renderBadge(f, schema.fields[f], item[f])}</span>
                ))}
              </div>
            </div>

            {expanded[item.id] && (
              <div className="card-body">
                {bodyFields.map(([name, field]) =>
                  <div key={name}>{renderField(name, field, item[name], item)}</div>
                )}

                {renderItemExtra?.(item, items)}

                <RelatedItems entityId={item.id} />

                {showHistory[item.id] && (
                  <div>
                    <div className="section-title">Commit History</div>
                    <CommitHistory itemId={item.id} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
      />
    </div>
  )
}

// ── Related Items (from relations API) ──

function RelationLink({ itemId, label }: { itemId: string; label: string }) {
  const { navigateTo } = useNavigation()

  const handleClick = useCallback(async () => {
    if (DATA_MODE === 'mock') return
    try {
      const { processId } = await apiClient.locate(itemId)
      const step = processToStep[processId]
      if (step) navigateTo(step, itemId)
    } catch {
      // item not found — ignore
    }
  }, [itemId, navigateTo])

  return (
    <span
      className="nav-link"
      style={{ marginRight: 8, cursor: 'pointer' }}
      onClick={handleClick}
    >
      {label}
    </span>
  )
}

function RelatedItems({ entityId }: { entityId: string }) {
  const { data } = useRelations(entityId)

  if (!data || (data.outgoing.length === 0 && data.incoming.length === 0)) return null

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="section-title">Related Items</div>
      {data.outgoing.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {data.outgoing.map((rel, i) => (
            <RelationLink key={i} itemId={rel.to} label={`→ ${rel.type}: ${rel.to}`} />
          ))}
        </div>
      )}
      {data.incoming.length > 0 && (
        <div>
          {data.incoming.map((rel, i) => (
            <RelationLink key={i} itemId={rel.from} label={`← ${rel.type}: ${rel.from}`} />
          ))}
        </div>
      )}
    </div>
  )
}
