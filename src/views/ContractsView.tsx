import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { mockContracts, mockPRD } from '../mockData'

export function ContractsView() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'API-001': true })

  const storyMap = Object.fromEntries(mockPRD.stories.map(s => [s.id, s.title]))

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{mockContracts.length}</div>
          <div className="stat-label">Total Endpoints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>
            {mockContracts.filter(c => c.status === 'implemented').length}
          </div>
          <div className="stat-label">Implemented</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>
            {mockContracts.filter(c => c.status === 'agreed').length}
          </div>
          <div className="stat-label">Agreed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-muted)' }}>
            {mockContracts.filter(c => c.status === 'draft').length}
          </div>
          <div className="stat-label">Draft</div>
        </div>
      </div>

      {mockContracts.map(contract => (
        <div key={contract.id} className="card">
          <div className="card-header" onClick={() => setExpanded(p => ({ ...p, [contract.id]: !p[contract.id] }))}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ChevronRight size={14} className={`expand-icon ${expanded[contract.id] ? 'expanded' : ''}`} />
              <span className={`method-badge method-${contract.method}`}>{contract.method}</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                {contract.endpoint}
              </span>
            </div>
            <span className={`tag tag-${contract.status}`}>{contract.status}</span>
          </div>
          {expanded[contract.id] && (
            <div className="card-body">
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {contract.description}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Story: <span className="mono">{contract.storyId}</span> — {storyMap[contract.storyId]}
              </div>
              {contract.id === 'API-001' && (
                <div style={{ marginTop: 12 }}>
                  <div className="section-title">Response Schema</div>
                  <pre style={{
                    background: 'var(--bg-tertiary)', padding: 16, borderRadius: 8,
                    fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)',
                    fontFamily: "'JetBrains Mono', monospace", overflow: 'auto',
                  }}>{`{
  "userId": "string",
  "channels": {
    "email": { "enabled": true, "quietHours": null },
    "push": { "enabled": true, "quietHours": { "start": "22:00", "end": "08:00" } },
    "sms": { "enabled": false, "quietHours": null },
    "slack": { "enabled": true, "quietHours": null }
  },
  "priorities": {
    "p0": { "override": true, "channels": ["push", "sms", "slack"] },
    "p1": { "override": false, "channels": ["push", "slack"] },
    "p2": { "override": false, "channels": ["email"] }
  }
}`}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
