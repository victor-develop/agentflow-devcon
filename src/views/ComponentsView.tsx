import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { mockPRD } from '../mockData'

export function ComponentsView() {
  const allComponents = mockPRD.stories.flatMap(s =>
    s.designComponents.map(dc => ({ ...dc, storyId: s.id, storyTitle: s.title }))
  )

  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'DC-001': true })

  const byType = {
    page: allComponents.filter(c => c.type === 'page'),
    component: allComponents.filter(c => c.type === 'component'),
    pattern: allComponents.filter(c => c.type === 'pattern'),
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{allComponents.length}</div>
          <div className="stat-label">Total Components</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>
            {allComponents.filter(c => c.status === 'implemented').length}
          </div>
          <div className="stat-label">Implemented</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>
            {allComponents.filter(c => c.status === 'ready').length}
          </div>
          <div className="stat-label">Ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-muted)' }}>
            {allComponents.filter(c => c.status === 'draft').length}
          </div>
          <div className="stat-label">Draft</div>
        </div>
      </div>

      {(Object.entries(byType) as [string, typeof allComponents][]).map(([type, comps]) => (
        comps.length > 0 && (
          <div key={type}>
            <div className="section-title" style={{ textTransform: 'capitalize' }}>{type}s</div>
            {comps.map(c => (
              <div key={c.id} className="card">
                <div className="card-header" onClick={() => setExpanded(p => ({ ...p, [c.id]: !p[c.id] }))}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ChevronRight size={14} className={`expand-icon ${expanded[c.id] ? 'expanded' : ''}`} />
                    <span className={`type-badge type-${c.type}`}>{c.type}</span>
                    <h3>{c.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.storyId}</span>
                    <span className={`tag tag-${c.status}`}>{c.status}</span>
                  </div>
                </div>
                {expanded[c.id] && (
                  <div className="card-body">
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Story: <span style={{ color: 'var(--text-primary)' }}>{c.storyTitle}</span>
                    </div>
                    <div style={{
                      padding: 32, borderRadius: 8, background: 'var(--bg-tertiary)',
                      border: '1px dashed var(--border)', textAlign: 'center',
                      color: 'var(--text-muted)', fontSize: 13,
                    }}>
                      Component preview will render here from design specs
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ))}
    </div>
  )
}
