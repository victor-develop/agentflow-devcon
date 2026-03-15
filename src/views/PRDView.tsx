import { useState, useMemo } from 'react'
import { ChevronRight, Target, XCircle, TrendingUp } from 'lucide-react'
import { mockPRD } from '../mockData'
import { ListToolbar } from '../components/ListToolbar'
import { Pagination } from '../components/Pagination'

export function PRDView() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    goals: true, nonGoals: false, metrics: true, stories: true,
  })
  const [storySearch, setStorySearch] = useState('')
  const [storyFilters, setStoryFilters] = useState<string[]>([])
  const [storyPage, setStoryPage] = useState(1)
  const storyPageSize = 10

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const allStories = mockPRD.stories

  const filteredStories = useMemo(() => {
    let items = [...allStories]
    if (storySearch) {
      const q = storySearch.toLowerCase()
      items = items.filter(s => s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
    }
    if (storyFilters.length > 0) {
      items = items.filter(s => storyFilters.includes(s.status) || storyFilters.includes(s.priority))
    }
    return items
  }, [allStories, storySearch, storyFilters])

  const pagedStories = filteredStories.slice((storyPage - 1) * storyPageSize, storyPage * storyPageSize)

  const toggleStoryFilter = (v: string) => {
    setStoryFilters(prev => prev.includes(v) ? prev.filter(f => f !== v) : [...prev, v])
    setStoryPage(1)
  }

  const statusCounts = {
    draft: allStories.filter(s => s.status === 'draft').length,
    ready: allStories.filter(s => s.status === 'ready').length,
    'in-progress': allStories.filter(s => s.status === 'in-progress').length,
    done: allStories.filter(s => s.status === 'done').length,
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{mockPRD.title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{mockPRD.problem}</p>
      </div>

      <div className="card">
        <div className="card-header" onClick={() => toggle('goals')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Target size={16} style={{ color: 'var(--green)' }} />
            <h3>Goals</h3>
            <span className="tag tag-done">{mockPRD.goals.length}</span>
          </div>
          <ChevronRight size={16} className={`expand-icon ${expanded.goals ? 'expanded' : ''}`} />
        </div>
        {expanded.goals && (
          <div className="card-body">
            {mockPRD.goals.map((g, i) => (
              <div key={i} className="list-item">
                <span className="list-bullet" style={{ background: 'var(--green)' }} />{g}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header" onClick={() => toggle('nonGoals')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <XCircle size={16} style={{ color: 'var(--text-muted)' }} />
            <h3>Non-Goals</h3>
            <span className="tag tag-draft">{mockPRD.nonGoals.length}</span>
          </div>
          <ChevronRight size={16} className={`expand-icon ${expanded.nonGoals ? 'expanded' : ''}`} />
        </div>
        {expanded.nonGoals && (
          <div className="card-body">
            {mockPRD.nonGoals.map((g, i) => (
              <div key={i} className="list-item">
                <span className="list-bullet" style={{ background: 'var(--text-muted)' }} />{g}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header" onClick={() => toggle('metrics')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={16} style={{ color: 'var(--cyan)' }} />
            <h3>Success Metrics</h3>
            <span className="tag tag-ready">{mockPRD.successMetrics.length}</span>
          </div>
          <ChevronRight size={16} className={`expand-icon ${expanded.metrics ? 'expanded' : ''}`} />
        </div>
        {expanded.metrics && (
          <div className="card-body">
            {mockPRD.successMetrics.map((m, i) => (
              <div key={i} className="list-item">
                <span className="list-bullet" style={{ background: 'var(--cyan)' }} />{m}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stories section with search/filter */}
      <div className="card">
        <div className="card-header" onClick={() => toggle('stories')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3>Stories</h3>
            <span className="tag tag-in-progress">{allStories.length}</span>
          </div>
          <ChevronRight size={16} className={`expand-icon ${expanded.stories ? 'expanded' : ''}`} />
        </div>
        {expanded.stories && (
          <div className="card-body">
            <ListToolbar
              search={storySearch}
              onSearchChange={v => { setStorySearch(v); setStoryPage(1) }}
              filters={[
                { label: 'In Progress', value: 'in-progress', count: statusCounts['in-progress'], color: 'var(--accent)' },
                { label: 'Ready', value: 'ready', count: statusCounts.ready, color: 'var(--cyan)' },
                { label: 'Draft', value: 'draft', count: statusCounts.draft },
                { label: 'Done', value: 'done', count: statusCounts.done, color: 'var(--green)' },
              ]}
              activeFilters={storyFilters}
              onFilterToggle={toggleStoryFilter}
              totalCount={allStories.length}
              filteredCount={filteredStories.length}
              placeholder="Search stories..."
            />
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Components</th>
                  <th>Tests</th>
                </tr>
              </thead>
              <tbody>
                {pagedStories.map(story => (
                  <tr key={story.id}>
                    <td className="mono">{story.id}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{story.title}</td>
                    <td><span className={`tag tag-${story.priority}`}>{story.priority}</span></td>
                    <td><span className={`tag tag-${story.status}`}>{story.status}</span></td>
                    <td>{story.designComponents.length}</td>
                    <td>{story.testCases.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={storyPage}
              totalPages={Math.ceil(filteredStories.length / storyPageSize)}
              pageSize={storyPageSize}
              totalItems={filteredStories.length}
              onPageChange={setStoryPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
