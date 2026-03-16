import { useState, useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { mockPRD } from '../mockData'
import { ListToolbar, type ViewMode } from '../components/ListToolbar'
import { Pagination } from '../components/Pagination'
import { CommitHistory, HistoryToggle } from '../components/CommitHistory'
import { ComponentPreview } from '../components/ComponentPreview'
import { useNavigation } from '../NavigationContext'

export function ComponentsView() {
  const { navigateTo } = useNavigation()
  const allComponents = useMemo(() =>
    mockPRD.stories.flatMap(s =>
      s.designComponents.map(dc => ({
        ...dc,
        storyId: s.id,
        storyTitle: s.title,
        siblingComponents: s.designComponents.filter(d => d.id !== dc.id),
      }))
    ), []
  )

  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('expanded')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({})

  const toggleFilter = (v: string) => {
    setActiveFilters(prev => prev.includes(v) ? prev.filter(f => f !== v) : [...prev, v])
    setPage(1)
  }

  const filtered = useMemo(() => {
    let items = [...allComponents]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(c =>
        c.name.toLowerCase().includes(q) || c.storyId.toLowerCase().includes(q) || c.storyTitle.toLowerCase().includes(q)
      )
    }
    if (activeFilters.length > 0) {
      items = items.filter(c => activeFilters.includes(c.status) || activeFilters.includes(c.type))
    }
    return items
  }, [allComponents, search, activeFilters])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const typeCounts = { page: 0, component: 0, pattern: 0 }
  const statusCounts = { draft: 0, ready: 0, implemented: 0 }
  allComponents.forEach(c => {
    typeCounts[c.type]++
    statusCounts[c.status]++
  })

  const filters = [
    { label: 'Page', value: 'page', count: typeCounts.page, color: 'var(--accent)' },
    { label: 'Component', value: 'component', count: typeCounts.component, color: 'var(--cyan)' },
    { label: 'Pattern', value: 'pattern', count: typeCounts.pattern, color: 'var(--purple)' },
    { label: 'Implemented', value: 'implemented', count: statusCounts.implemented, color: 'var(--green)' },
    { label: 'Ready', value: 'ready', count: statusCounts.ready, color: 'var(--cyan)' },
    { label: 'Draft', value: 'draft', count: statusCounts.draft },
  ]

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{allComponents.length}</div>
          <div className="stat-label">Total Components</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{statusCounts.implemented}</div>
          <div className="stat-label">Implemented</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{statusCounts.ready}</div>
          <div className="stat-label">Ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-muted)' }}>{statusCounts.draft}</div>
          <div className="stat-label">Draft</div>
        </div>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={filters}
        activeFilters={activeFilters}
        onFilterToggle={toggleFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={allComponents.length}
        filteredCount={filtered.length}
        placeholder="Search components..."
      />

      {viewMode === 'compact' ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Story</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(c => (
                <tr key={c.id}>
                  <td className="mono" style={{ color: 'var(--text-primary)' }}>{c.name}</td>
                  <td><span className={`type-badge type-${c.type}`}>{c.type}</span></td>
                  <td className="mono" style={{ fontSize: 11 }}>{c.storyId}</td>
                  <td><span className={`tag tag-${c.status}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        paged.map(c => (
          <div key={c.id} id={`item-${c.id}`} className="card">
            <div className="card-header" onClick={() => setExpanded(p => ({ ...p, [c.id]: !p[c.id] }))}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ChevronRight size={14} className={`expand-icon ${expanded[c.id] ? 'expanded' : ''}`} />
                <span className={`type-badge type-${c.type}`}>{c.type}</span>
                <h3>{c.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <HistoryToggle itemId={c.id} isOpen={!!showHistory[c.id]} onToggle={() => setShowHistory(p => ({ ...p, [c.id]: !p[c.id] }))} />
                <span className="nav-link mono" style={{ fontSize: 11 }} onClick={(e) => { e.stopPropagation(); navigateTo('stories', c.storyId) }}>{c.storyId}</span>
                <span className={`tag tag-${c.status}`}>{c.status}</span>
              </div>
            </div>
            {expanded[c.id] && (
              <div className="card-body">
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Story: <span className="nav-link" style={{ color: 'var(--text-primary)' }} onClick={() => navigateTo('stories', c.storyId)}>{c.storyTitle}</span>
                </div>
                <ComponentPreview
                  component={c}
                  childComponents={c.type === 'page' ? c.siblingComponents : []}
                />
                {showHistory[c.id] && (
                  <div>
                    <div className="section-title">Commit History</div>
                    <CommitHistory itemId={c.id} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(filtered.length / pageSize)}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1) }}
      />
    </div>
  )
}
