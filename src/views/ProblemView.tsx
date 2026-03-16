import { useState, useMemo } from 'react'
import { ChevronRight, Lightbulb, BarChart3 } from 'lucide-react'
import { mockProblems } from '../mockData'
import { ListToolbar, type ViewMode } from '../components/ListToolbar'
import { Pagination } from '../components/Pagination'
import { CommitHistory, HistoryToggle } from '../components/CommitHistory'
import { useNavigation } from '../NavigationContext'

export function ProblemView() {
  const { navigateTo } = useNavigation()
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('expanded')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'PROB-001': true })
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({})

  const toggleFilter = (v: string) => {
    setActiveFilters(prev => prev.includes(v) ? prev.filter(f => f !== v) : [...prev, v])
    setPage(1)
  }

  const filtered = useMemo(() => {
    let items = [...mockProblems]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.statement.toLowerCase().includes(q)
      )
    }
    if (activeFilters.length > 0) {
      items = items.filter(p => activeFilters.includes(p.status) || activeFilters.includes(p.severity))
    }
    return items
  }, [search, activeFilters])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusCounts = { draft: 0, validated: 0, rejected: 0, active: 0 }
  const severityCounts = { critical: 0, major: 0, minor: 0 }
  mockProblems.forEach(p => { statusCounts[p.status]++; severityCounts[p.severity]++ })

  const filters = [
    { label: 'Critical', value: 'critical', count: severityCounts.critical, color: 'var(--red)' },
    { label: 'Major', value: 'major', count: severityCounts.major, color: 'var(--amber)' },
    { label: 'Minor', value: 'minor', count: severityCounts.minor },
    { label: 'Active', value: 'active', count: statusCounts.active, color: 'var(--accent)' },
    { label: 'Validated', value: 'validated', count: statusCounts.validated, color: 'var(--green)' },
    { label: 'Draft', value: 'draft', count: statusCounts.draft },
    { label: 'Rejected', value: 'rejected', count: statusCounts.rejected, color: 'var(--text-muted)' },
  ]

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{mockProblems.length}</div>
          <div className="stat-label">Total Problems</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{statusCounts.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{statusCounts.validated}</div>
          <div className="stat-label">Validated</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--red)' }}>{severityCounts.critical}</div>
          <div className="stat-label">Critical</div>
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
        totalCount={mockProblems.length}
        filteredCount={filtered.length}
        placeholder="Search problems..."
      />

      {viewMode === 'compact' ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>PRDs</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(p => (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => { setViewMode('expanded'); setExpanded(prev => ({ ...prev, [p.id]: true })) }}>
                  <td className="mono">{p.id}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{p.title}</td>
                  <td><span className={`tag tag-${p.severity}`}>{p.severity}</span></td>
                  <td><span className={`tag tag-${p.status}`}>{p.status}</span></td>
                  <td>{p.prdIds.length}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        paged.map(prob => (
          <div key={prob.id} id={`item-${prob.id}`} className="card">
            <div className="card-header" onClick={() => setExpanded(prev => ({ ...prev, [prob.id]: !prev[prob.id] }))}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ChevronRight size={16} className={`expand-icon ${expanded[prob.id] ? 'expanded' : ''}`} />
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{prob.id}</span>
                <h3>{prob.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <HistoryToggle itemId={prob.id} isOpen={!!showHistory[prob.id]} onToggle={() => setShowHistory(p => ({ ...p, [prob.id]: !p[prob.id] }))} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prob.createdAt}</span>
                <span className={`tag tag-${prob.severity}`}>{prob.severity}</span>
                <span className={`tag tag-${prob.status}`}>{prob.status}</span>
              </div>
            </div>

            {expanded[prob.id] && (
              <div className="card-body">
                {/* Metrics */}
                {prob.metrics.length > 0 && (
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    {prob.metrics.map((m, i) => (
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
                )}

                {/* Statement */}
                <div style={{ marginBottom: 16 }}>
                  <div className="section-title">Problem Statement</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 13 }}>{prob.statement}</p>
                </div>

                {/* Hypothesis */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Lightbulb size={14} style={{ color: 'var(--amber)' }} />
                    <span className="section-title" style={{ margin: 0 }}>Hypothesis</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 13 }}>{prob.hypothesis}</p>
                </div>

                {/* Evidence */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <BarChart3 size={14} style={{ color: 'var(--cyan)' }} />
                    <span className="section-title" style={{ margin: 0 }}>Supporting Evidence</span>
                  </div>
                  {prob.evidence.map((e, i) => (
                    <div key={i} className="list-item">
                      <span className="list-bullet" />{e}
                    </div>
                  ))}
                </div>

                {/* Linked PRDs */}
                {prob.prdIds.length > 0 && (
                  <div style={{ marginBottom: showHistory[prob.id] ? 16 : 0 }}>
                    <div className="section-title">Linked PRDs</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {prob.prdIds.map(id => (
                        <span key={id} className="nav-link" onClick={(e) => { e.stopPropagation(); navigateTo('prd', id) }}>{id}</span>
                      ))}
                    </div>
                  </div>
                )}

                {showHistory[prob.id] && (
                  <div>
                    <div className="section-title">Commit History</div>
                    <CommitHistory itemId={prob.id} />
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
