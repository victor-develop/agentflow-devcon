import { useState, useMemo } from 'react'
import { ChevronRight, Layers, TestTube, Code2 } from 'lucide-react'
import { mockPRD } from '../mockData'
import { ListToolbar, type ViewMode } from '../components/ListToolbar'
import { Pagination } from '../components/Pagination'
import { CommitHistory, HistoryToggle } from '../components/CommitHistory'

type SortKey = 'id' | 'priority' | 'status' | 'title'

const priorityOrder = { high: 0, medium: 1, low: 2 }
const statusOrder = { 'in-progress': 0, ready: 1, draft: 2, done: 3 }

export function StoriesView() {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('id')
  const [viewMode, setViewMode] = useState<ViewMode>('expanded')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({})
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({})

  const allStories = mockPRD.stories

  const toggleFilter = (v: string) => {
    setActiveFilters(prev => prev.includes(v) ? prev.filter(f => f !== v) : [...prev, v])
    setPage(1)
  }

  const filtered = useMemo(() => {
    let items = [...allStories]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(s =>
        s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      )
    }
    if (activeFilters.length > 0) {
      items = items.filter(s => activeFilters.includes(s.status) || activeFilters.includes(s.priority))
    }
    items.sort((a, b) => {
      switch (sort) {
        case 'priority': return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'status': return statusOrder[a.status] - statusOrder[b.status]
        case 'title': return a.title.localeCompare(b.title)
        default: return a.id.localeCompare(b.id)
      }
    })
    return items
  }, [allStories, search, activeFilters, sort])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statusCounts = {
    draft: allStories.filter(s => s.status === 'draft').length,
    ready: allStories.filter(s => s.status === 'ready').length,
    'in-progress': allStories.filter(s => s.status === 'in-progress').length,
    done: allStories.filter(s => s.status === 'done').length,
  }
  const priorityCounts = {
    high: allStories.filter(s => s.priority === 'high').length,
    medium: allStories.filter(s => s.priority === 'medium').length,
    low: allStories.filter(s => s.priority === 'low').length,
  }

  const filters = [
    { label: 'High', value: 'high', count: priorityCounts.high, color: 'var(--red)' },
    { label: 'Medium', value: 'medium', count: priorityCounts.medium, color: 'var(--amber)' },
    { label: 'Low', value: 'low', count: priorityCounts.low },
    { label: 'In Progress', value: 'in-progress', count: statusCounts['in-progress'], color: 'var(--accent)' },
    { label: 'Ready', value: 'ready', count: statusCounts.ready, color: 'var(--cyan)' },
    { label: 'Draft', value: 'draft', count: statusCounts.draft },
    { label: 'Done', value: 'done', count: statusCounts.done, color: 'var(--green)' },
  ]

  const toggleStory = (id: string) =>
    setExpandedStories(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{allStories.length}</div>
          <div className="stat-label">Total Stories</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{statusCounts['in-progress']}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{statusCounts.ready}</div>
          <div className="stat-label">Ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{statusCounts.done}</div>
          <div className="stat-label">Done</div>
        </div>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        filters={filters}
        activeFilters={activeFilters}
        onFilterToggle={toggleFilter}
        sortOptions={[
          { label: 'ID', value: 'id' },
          { label: 'Priority', value: 'priority' },
          { label: 'Status', value: 'status' },
          { label: 'Title', value: 'title' },
        ]}
        activeSort={sort}
        onSortChange={v => setSort(v as SortKey)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={allStories.length}
        filteredCount={filtered.length}
        placeholder="Search stories..."
      />

      {/* Compact mode */}
      {viewMode === 'compact' && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Design</th>
                <th>Tests</th>
                <th>Code</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(story => (
                <tr key={story.id} style={{ cursor: 'pointer' }} onClick={() => { setViewMode('expanded'); setExpandedStories(p => ({ ...p, [story.id]: true })) }}>
                  <td className="mono">{story.id}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{story.title}</td>
                  <td><span className={`tag tag-${story.priority}`}>{story.priority}</span></td>
                  <td><span className={`tag tag-${story.status}`}>{story.status}</span></td>
                  <td>{story.designComponents.length}</td>
                  <td>{story.testCases.length}</td>
                  <td>{story.codeEntries.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expanded mode */}
      {viewMode === 'expanded' && paged.map(story => (
        <div key={story.id} className="card">
          <div className="card-header" onClick={() => toggleStory(story.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ChevronRight
                size={16}
                className={`expand-icon ${expandedStories[story.id] ? 'expanded' : ''}`}
              />
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {story.id}
              </span>
              <h3>{story.title}</h3>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <HistoryToggle itemId={story.id} isOpen={!!showHistory[story.id]} onToggle={() => setShowHistory(p => ({ ...p, [story.id]: !p[story.id] }))} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {story.designComponents.length}d · {story.testCases.length}t · {story.codeEntries.length}c
              </span>
              <span className={`tag tag-${story.priority}`}>{story.priority}</span>
              <span className={`tag tag-${story.status}`}>{story.status}</span>
            </div>
          </div>

          {expandedStories[story.id] && (
            <div className="card-body">
              {/* Design Components */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => toggleSection(`${story.id}-design`)}
                >
                  <ChevronRight size={14} className={`expand-icon ${expandedSections[`${story.id}-design`] ? 'expanded' : ''}`} />
                  <Layers size={14} style={{ color: 'var(--purple)' }} />
                  <span className="section-title" style={{ margin: 0 }}>
                    Design Components ({story.designComponents.length})
                  </span>
                </div>
                {expandedSections[`${story.id}-design`] && (
                  <table className="data-table" style={{ marginLeft: 24 }}>
                    <thead><tr><th>Name</th><th>Type</th><th>Status</th></tr></thead>
                    <tbody>
                      {story.designComponents.map(dc => (
                        <tr key={dc.id}>
                          <td className="mono" style={{ color: 'var(--text-primary)' }}>{dc.name}</td>
                          <td><span className={`type-badge type-${dc.type}`}>{dc.type}</span></td>
                          <td><span className={`tag tag-${dc.status}`}>{dc.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Test Cases */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => toggleSection(`${story.id}-tests`)}
                >
                  <ChevronRight size={14} className={`expand-icon ${expandedSections[`${story.id}-tests`] ? 'expanded' : ''}`} />
                  <TestTube size={14} style={{ color: 'var(--green)' }} />
                  <span className="section-title" style={{ margin: 0 }}>
                    Test Cases ({story.testCases.length})
                  </span>
                </div>
                {expandedSections[`${story.id}-tests`] && (
                  <table className="data-table" style={{ marginLeft: 24 }}>
                    <thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Status</th></tr></thead>
                    <tbody>
                      {story.testCases.map(tc => (
                        <tr key={tc.id}>
                          <td className="mono">{tc.id}</td>
                          <td>{tc.title}</td>
                          <td><span className={`type-badge type-${tc.type}`}>{tc.type}</span></td>
                          <td><span className={`tag tag-${tc.status}`}>{tc.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Code Entries */}
              <div style={{ marginBottom: showHistory[story.id] ? 16 : 0 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => toggleSection(`${story.id}-code`)}
                >
                  <ChevronRight size={14} className={`expand-icon ${expandedSections[`${story.id}-code`] ? 'expanded' : ''}`} />
                  <Code2 size={14} style={{ color: 'var(--amber)' }} />
                  <span className="section-title" style={{ margin: 0 }}>
                    Code Entries ({story.codeEntries.length})
                  </span>
                </div>
                {expandedSections[`${story.id}-code`] && (
                  <div style={{ marginLeft: 24 }}>
                    {story.codeEntries.map(ce => (
                      <div key={ce.id} className="list-item" style={{ gap: 12 }}>
                        <span className={`type-badge type-${ce.type}`}>{ce.type}</span>
                        <span className="code-path">{ce.path}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{ce.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {showHistory[story.id] && (
                <div>
                  <div className="section-title">Commit History</div>
                  <CommitHistory itemId={story.id} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1) }}
      />
    </div>
  )
}
