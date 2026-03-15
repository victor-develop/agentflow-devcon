import { useState } from 'react'
import { ChevronRight, Target, XCircle, TrendingUp } from 'lucide-react'
import { mockPRD } from '../mockData'

export function PRDView() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    goals: true,
    nonGoals: false,
    metrics: true,
    stories: true,
  })

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      <div className="card">
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{mockPRD.title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{mockPRD.problem}</p>
      </div>

      {/* Goals */}
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
                <span className="list-bullet" style={{ background: 'var(--green)' }} />
                {g}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Non-Goals */}
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
                <span className="list-bullet" style={{ background: 'var(--text-muted)' }} />
                {g}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Metrics */}
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
                <span className="list-bullet" style={{ background: 'var(--cyan)' }} />
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stories summary */}
      <div className="card">
        <div className="card-header" onClick={() => toggle('stories')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3>Stories</h3>
            <span className="tag tag-in-progress">{mockPRD.stories.length}</span>
          </div>
          <ChevronRight size={16} className={`expand-icon ${expanded.stories ? 'expanded' : ''}`} />
        </div>
        {expanded.stories && (
          <div className="card-body">
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
                {mockPRD.stories.map(story => (
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
          </div>
        )}
      </div>
    </div>
  )
}
