import { useState, useMemo } from 'react'
import { ChevronRight, Target, XCircle, TrendingUp, FileText } from 'lucide-react'
import { mockPRDs } from '../mockData'
import { ListToolbar, type ViewMode } from '../components/ListToolbar'
import { Pagination } from '../components/Pagination'
import { CommitHistory, HistoryToggle } from '../components/CommitHistory'

export function PRDView() {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('expanded')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'PRD-001': true })
  const [sections, setSections] = useState<Record<string, boolean>>({ 'PRD-001-goals': true, 'PRD-001-metrics': true })
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({})

  const toggleFilter = (v: string) => {
    setActiveFilters(prev => prev.includes(v) ? prev.filter(f => f !== v) : [...prev, v])
    setPage(1)
  }
  const toggleSection = (key: string) => setSections(prev => ({ ...prev, [key]: !prev[key] }))

  const filtered = useMemo(() => {
    let items = [...mockPRDs]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.problem.toLowerCase().includes(q)
      )
    }
    if (activeFilters.length > 0) {
      items = items.filter(p => activeFilters.includes(p.status))
    }
    return items
  }, [search, activeFilters])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusCounts = { draft: 0, review: 0, approved: 0, archived: 0 }
  mockPRDs.forEach(p => statusCounts[p.status]++)

  const filters = [
    { label: 'Approved', value: 'approved', count: statusCounts.approved, color: 'var(--green)' },
    { label: 'In Review', value: 'review', count: statusCounts.review, color: 'var(--amber)' },
    { label: 'Draft', value: 'draft', count: statusCounts.draft },
    { label: 'Archived', value: 'archived', count: statusCounts.archived, color: 'var(--text-muted)' },
  ]

  const totalStories = mockPRDs.reduce((a, p) => a + p.stories.length, 0)

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{mockPRDs.length}</div>
          <div className="stat-label">Total PRDs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{statusCounts.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{statusCounts.review}</div>
          <div className="stat-label">In Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{totalStories}</div>
          <div className="stat-label">Total Stories</div>
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
        totalCount={mockPRDs.length}
        filteredCount={filtered.length}
        placeholder="Search PRDs..."
      />

      {viewMode === 'compact' ? (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Problem</th>
                <th>Status</th>
                <th>Stories</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(prd => (
                <tr key={prd.id} style={{ cursor: 'pointer' }} onClick={() => { setViewMode('expanded'); setExpanded(prev => ({ ...prev, [prd.id]: true })) }}>
                  <td className="mono">{prd.id}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{prd.title}</td>
                  <td className="mono" style={{ fontSize: 11 }}>{prd.problemId}</td>
                  <td><span className={`tag tag-${prd.status}`}>{prd.status}</span></td>
                  <td>{prd.stories.length}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{prd.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        paged.map(prd => (
          <div key={prd.id} className="card">
            <div className="card-header" onClick={() => setExpanded(prev => ({ ...prev, [prd.id]: !prev[prd.id] }))}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ChevronRight size={16} className={`expand-icon ${expanded[prd.id] ? 'expanded' : ''}`} />
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{prd.id}</span>
                <h3>{prd.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <HistoryToggle itemId={prd.id} isOpen={!!showHistory[prd.id]} onToggle={() => setShowHistory(p => ({ ...p, [prd.id]: !p[prd.id] }))} />
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prd.problemId}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prd.stories.length} stories</span>
                <span className={`tag tag-${prd.status}`}>{prd.status}</span>
              </div>
            </div>

            {expanded[prd.id] && (
              <div className="card-body">
                {/* Problem summary */}
                <div style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <FileText size={12} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Problem — {prd.problemId}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{prd.problem}</p>
                </div>

                {/* Goals */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}
                    onClick={() => toggleSection(`${prd.id}-goals`)}
                  >
                    <ChevronRight size={14} className={`expand-icon ${sections[`${prd.id}-goals`] ? 'expanded' : ''}`} />
                    <Target size={14} style={{ color: 'var(--green)' }} />
                    <span className="section-title" style={{ margin: 0 }}>Goals ({prd.goals.length})</span>
                  </div>
                  {sections[`${prd.id}-goals`] && (
                    <div style={{ marginLeft: 24 }}>
                      {prd.goals.map((g, i) => (
                        <div key={i} className="list-item">
                          <span className="list-bullet" style={{ background: 'var(--green)' }} />{g}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Non-Goals */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}
                    onClick={() => toggleSection(`${prd.id}-nongoals`)}
                  >
                    <ChevronRight size={14} className={`expand-icon ${sections[`${prd.id}-nongoals`] ? 'expanded' : ''}`} />
                    <XCircle size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="section-title" style={{ margin: 0 }}>Non-Goals ({prd.nonGoals.length})</span>
                  </div>
                  {sections[`${prd.id}-nongoals`] && (
                    <div style={{ marginLeft: 24 }}>
                      {prd.nonGoals.map((g, i) => (
                        <div key={i} className="list-item">
                          <span className="list-bullet" style={{ background: 'var(--text-muted)' }} />{g}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Success Metrics */}
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}
                    onClick={() => toggleSection(`${prd.id}-metrics`)}
                  >
                    <ChevronRight size={14} className={`expand-icon ${sections[`${prd.id}-metrics`] ? 'expanded' : ''}`} />
                    <TrendingUp size={14} style={{ color: 'var(--cyan)' }} />
                    <span className="section-title" style={{ margin: 0 }}>Success Metrics ({prd.successMetrics.length})</span>
                  </div>
                  {sections[`${prd.id}-metrics`] && (
                    <div style={{ marginLeft: 24 }}>
                      {prd.successMetrics.map((m, i) => (
                        <div key={i} className="list-item">
                          <span className="list-bullet" style={{ background: 'var(--cyan)' }} />{m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stories summary */}
                {prd.stories.length > 0 && (
                  <div>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}
                      onClick={() => toggleSection(`${prd.id}-stories`)}
                    >
                      <ChevronRight size={14} className={`expand-icon ${sections[`${prd.id}-stories`] ? 'expanded' : ''}`} />
                      <span className="section-title" style={{ margin: 0 }}>Stories ({prd.stories.length})</span>
                    </div>
                    {sections[`${prd.id}-stories`] && (
                      <table className="data-table" style={{ marginLeft: 24 }}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Priority</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prd.stories.map(story => (
                            <tr key={story.id}>
                              <td className="mono">{story.id}</td>
                              <td style={{ color: 'var(--text-primary)' }}>{story.title}</td>
                              <td><span className={`tag tag-${story.priority}`}>{story.priority}</span></td>
                              <td><span className={`tag tag-${story.status}`}>{story.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {showHistory[prd.id] && (
                  <div>
                    <div className="section-title">Commit History</div>
                    <CommitHistory itemId={prd.id} />
                  </div>
                )}

                {/* Meta */}
                <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Created: {prd.createdAt}</span>
                  <span>Updated: {prd.updatedAt}</span>
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
