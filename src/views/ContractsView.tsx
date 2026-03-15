import { useState, useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { mockContracts, mockPRD } from '../mockData'
import { ListToolbar, type ViewMode } from '../components/ListToolbar'
import { Pagination } from '../components/Pagination'

export function ContractsView() {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('expanded')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const storyMap = Object.fromEntries(mockPRD.stories.map(s => [s.id, s.title]))

  const toggleFilter = (v: string) => {
    setActiveFilters(prev => prev.includes(v) ? prev.filter(f => f !== v) : [...prev, v])
    setPage(1)
  }

  const filtered = useMemo(() => {
    let items = [...mockContracts]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(c =>
        c.endpoint.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.method.toLowerCase().includes(q) ||
        c.storyId.toLowerCase().includes(q)
      )
    }
    if (activeFilters.length > 0) {
      items = items.filter(c => activeFilters.includes(c.status) || activeFilters.includes(c.method))
    }
    return items
  }, [search, activeFilters])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const methodCounts = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0 }
  const statusCounts = { draft: 0, agreed: 0, implemented: 0 }
  mockContracts.forEach(c => { methodCounts[c.method]++; statusCounts[c.status]++ })

  const filters = [
    { label: 'GET', value: 'GET', count: methodCounts.GET, color: 'var(--green)' },
    { label: 'POST', value: 'POST', count: methodCounts.POST, color: 'var(--accent)' },
    { label: 'PUT', value: 'PUT', count: methodCounts.PUT, color: 'var(--amber)' },
    { label: 'DELETE', value: 'DELETE', count: methodCounts.DELETE, color: 'var(--red)' },
    { label: 'Implemented', value: 'implemented', count: statusCounts.implemented, color: 'var(--green)' },
    { label: 'Agreed', value: 'agreed', count: statusCounts.agreed, color: 'var(--cyan)' },
    { label: 'Draft', value: 'draft', count: statusCounts.draft },
  ]

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{mockContracts.length}</div>
          <div className="stat-label">Total Endpoints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{statusCounts.implemented}</div>
          <div className="stat-label">Implemented</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{statusCounts.agreed}</div>
          <div className="stat-label">Agreed</div>
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
        totalCount={mockContracts.length}
        filteredCount={filtered.length}
        placeholder="Search endpoints..."
      />

      {viewMode === 'compact' ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Description</th>
                <th>Story</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(c => (
                <tr key={c.id}>
                  <td><span className={`method-badge method-${c.method}`}>{c.method}</span></td>
                  <td className="mono" style={{ color: 'var(--text-primary)', fontSize: 12 }}>{c.endpoint}</td>
                  <td>{c.description}</td>
                  <td className="mono" style={{ fontSize: 11 }}>{c.storyId}</td>
                  <td><span className={`tag tag-${c.status}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        paged.map(contract => (
          <div key={contract.id} className="card">
            <div className="card-header" onClick={() => setExpanded(p => ({ ...p, [contract.id]: !p[contract.id] }))}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ChevronRight size={14} className={`expand-icon ${expanded[contract.id] ? 'expanded' : ''}`} />
                <span className={`method-badge method-${contract.method}`}>{contract.method}</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  {contract.endpoint}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{contract.storyId}</span>
                <span className={`tag tag-${contract.status}`}>{contract.status}</span>
              </div>
            </div>
            {expanded[contract.id] && (
              <div className="card-body">
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {contract.description}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Story: <span className="mono">{contract.storyId}</span> — {storyMap[contract.storyId] || 'Unknown'}
                </div>
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
