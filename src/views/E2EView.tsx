import { useState, useMemo } from 'react'
import { mockPRD } from '../mockData'
import { ListToolbar, type ViewMode } from '../components/ListToolbar'
import { Pagination } from '../components/Pagination'
import { CommitHistory, HistoryToggle } from '../components/CommitHistory'

export function E2EView() {
  const allTests = useMemo(() =>
    mockPRD.stories.flatMap(s =>
      s.testCases.map(tc => ({ ...tc, storyId: s.id, storyTitle: s.title }))
    ), []
  )

  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('compact')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({})

  const toggleFilter = (v: string) => {
    setActiveFilters(prev => prev.includes(v) ? prev.filter(f => f !== v) : [...prev, v])
    setPage(1)
  }

  const filtered = useMemo(() => {
    let items = [...allTests]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(t =>
        t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.storyId.toLowerCase().includes(q)
      )
    }
    if (activeFilters.length > 0) {
      items = items.filter(t => activeFilters.includes(t.status) || activeFilters.includes(t.type))
    }
    return items
  }, [allTests, search, activeFilters])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const typeCounts = { e2e: 0, integration: 0, unit: 0 }
  const statusCounts = { draft: 0, ready: 0, passing: 0, failing: 0 }
  allTests.forEach(t => {
    typeCounts[t.type]++
    statusCounts[t.status]++
  })

  const filters = [
    { label: 'E2E', value: 'e2e', count: typeCounts.e2e, color: 'var(--green)' },
    { label: 'Integration', value: 'integration', count: typeCounts.integration, color: 'var(--amber)' },
    { label: 'Unit', value: 'unit', count: typeCounts.unit, color: 'var(--cyan)' },
    { label: 'Passing', value: 'passing', count: statusCounts.passing, color: 'var(--green)' },
    { label: 'Ready', value: 'ready', count: statusCounts.ready, color: 'var(--cyan)' },
    { label: 'Draft', value: 'draft', count: statusCounts.draft },
    { label: 'Failing', value: 'failing', count: statusCounts.failing, color: 'var(--red)' },
  ]

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{allTests.length}</div>
          <div className="stat-label">Total Test Cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{statusCounts.passing}</div>
          <div className="stat-label">Passing</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{statusCounts.ready}</div>
          <div className="stat-label">Ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--red)' }}>{statusCounts.failing}</div>
          <div className="stat-label">Failing</div>
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
        totalCount={allTests.length}
        filteredCount={filtered.length}
        placeholder="Search test cases..."
      />

      {viewMode === 'compact' ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Story</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(tc => (
                <tr key={tc.id}>
                  <td className="mono">{tc.id}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{tc.title}</td>
                  <td><span className={`type-badge type-${tc.type}`}>{tc.type}</span></td>
                  <td className="mono" style={{ fontSize: 11 }}>{tc.storyId}</td>
                  <td><span className={`tag tag-${tc.status}`}>{tc.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        paged.map(tc => (
          <div key={tc.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tc.id}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{tc.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <HistoryToggle itemId={tc.id} isOpen={!!showHistory[tc.id]} onToggle={() => setShowHistory(p => ({ ...p, [tc.id]: !p[tc.id] }))} />
                <span className={`type-badge type-${tc.type}`}>{tc.type}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tc.storyId}</span>
                <span className={`tag tag-${tc.status}`}>{tc.status}</span>
              </div>
            </div>
            {showHistory[tc.id] && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                <div className="section-title">Commit History</div>
                <CommitHistory itemId={tc.id} />
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
