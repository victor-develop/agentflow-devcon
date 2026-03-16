import { useState, useMemo } from 'react'
import { mockPRD } from '../mockData'
import { ListToolbar } from '../components/ListToolbar'
import { Pagination } from '../components/Pagination'
import { CommitHistory, HistoryToggle } from '../components/CommitHistory'

export function DevelopmentView() {
  const allCode = useMemo(() =>
    mockPRD.stories.flatMap(s =>
      s.codeEntries.map(ce => ({ ...ce, storyId: s.id, storyTitle: s.title }))
    ), []
  )

  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({})

  const toggleFilter = (v: string) => {
    setActiveFilters(prev => prev.includes(v) ? prev.filter(f => f !== v) : [...prev, v])
    setPage(1)
  }

  const filtered = useMemo(() => {
    let items = [...allCode]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(c =>
        c.path.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.storyId.toLowerCase().includes(q)
      )
    }
    if (activeFilters.length > 0) {
      items = items.filter(c => activeFilters.includes(c.type))
    }
    return items
  }, [allCode, search, activeFilters])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const frontendCount = allCode.filter(c => c.type === 'frontend').length
  const backendCount = allCode.filter(c => c.type === 'backend').length
  const sharedCount = allCode.filter(c => c.type === 'shared').length

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{allCode.length}</div>
          <div className="stat-label">Code Modules</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{frontendCount}</div>
          <div className="stat-label">Frontend</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{backendCount}</div>
          <div className="stat-label">Backend</div>
        </div>
        {sharedCount > 0 && (
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--amber)' }}>{sharedCount}</div>
            <div className="stat-label">Shared</div>
          </div>
        )}
      </div>

      <ListToolbar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={[
          { label: 'Frontend', value: 'frontend', count: frontendCount, color: 'var(--cyan)' },
          { label: 'Backend', value: 'backend', count: backendCount, color: 'var(--purple)' },
          ...(sharedCount > 0 ? [{ label: 'Shared', value: 'shared', count: sharedCount, color: 'var(--amber)' }] : []),
        ]}
        activeFilters={activeFilters}
        onFilterToggle={toggleFilter}
        totalCount={allCode.length}
        filteredCount={filtered.length}
        placeholder="Search code modules..."
      />

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Path</th>
              <th>Description</th>
              <th>Story</th>
              <th style={{ width: 60 }}>History</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(ce => (
              <>
                <tr key={ce.id}>
                  <td><span className={`type-badge type-${ce.type}`}>{ce.type}</span></td>
                  <td><span className="code-path">{ce.path}</span></td>
                  <td>{ce.description}</td>
                  <td className="mono" style={{ fontSize: 11 }}>{ce.storyId}</td>
                  <td><HistoryToggle itemId={ce.id} isOpen={!!showHistory[ce.id]} onToggle={() => setShowHistory(p => ({ ...p, [ce.id]: !p[ce.id] }))} /></td>
                </tr>
                {showHistory[ce.id] && (
                  <tr key={`${ce.id}-history`}>
                    <td colSpan={5} style={{ padding: '8px 16px' }}>
                      <CommitHistory itemId={ce.id} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

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
