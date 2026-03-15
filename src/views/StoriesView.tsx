import { useState } from 'react'
import { ChevronRight, Layers, TestTube, Code2 } from 'lucide-react'
import { mockPRD } from '../mockData'

export function StoriesView() {
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>(
    { 'STORY-001': true }
  )
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    { 'STORY-001-design': true }
  )

  const toggleStory = (id: string) =>
    setExpandedStories(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))

  const statusCounts = {
    draft: mockPRD.stories.filter(s => s.status === 'draft').length,
    ready: mockPRD.stories.filter(s => s.status === 'ready').length,
    'in-progress': mockPRD.stories.filter(s => s.status === 'in-progress').length,
    done: mockPRD.stories.filter(s => s.status === 'done').length,
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{mockPRD.stories.length}</div>
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
          <div className="stat-value" style={{ color: 'var(--text-muted)' }}>{statusCounts.draft}</div>
          <div className="stat-label">Draft</div>
        </div>
      </div>

      {mockPRD.stories.map(story => (
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
            <div style={{ display: 'flex', gap: 8 }}>
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
                  <ChevronRight
                    size={14}
                    className={`expand-icon ${expandedSections[`${story.id}-design`] ? 'expanded' : ''}`}
                  />
                  <Layers size={14} style={{ color: 'var(--purple)' }} />
                  <span className="section-title" style={{ margin: 0 }}>
                    Design Components ({story.designComponents.length})
                  </span>
                </div>
                {expandedSections[`${story.id}-design`] && (
                  <table className="data-table" style={{ marginLeft: 24 }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
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
                  <ChevronRight
                    size={14}
                    className={`expand-icon ${expandedSections[`${story.id}-tests`] ? 'expanded' : ''}`}
                  />
                  <TestTube size={14} style={{ color: 'var(--green)' }} />
                  <span className="section-title" style={{ margin: 0 }}>
                    Test Cases ({story.testCases.length})
                  </span>
                </div>
                {expandedSections[`${story.id}-tests`] && (
                  <table className="data-table" style={{ marginLeft: 24 }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
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
              <div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => toggleSection(`${story.id}-code`)}
                >
                  <ChevronRight
                    size={14}
                    className={`expand-icon ${expandedSections[`${story.id}-code`] ? 'expanded' : ''}`}
                  />
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
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
