import { Box, ExternalLink } from 'lucide-react'

export function PrototypeView() {
  const screens = [
    { name: 'Preferences Panel', route: '/preferences', status: 'in-progress', completion: 65 },
    { name: 'Routing Rules Editor', route: '/routing', status: 'draft', completion: 20 },
    { name: 'Analytics Dashboard', route: '/analytics', status: 'draft', completion: 0 },
    { name: 'Batch Config', route: '/batch', status: 'draft', completion: 0 },
  ]

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{screens.length}</div>
          <div className="stat-label">Prototype Screens</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>1</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>0</div>
          <div className="stat-label">Ready for Review</div>
        </div>
      </div>

      {screens.map(screen => (
        <div key={screen.route} className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Box size={16} style={{ color: 'var(--amber)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{screen.name}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{screen.route}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={`tag tag-${screen.status}`}>{screen.status}</span>
              {screen.completion > 0 && (
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', background: 'var(--accent-glow)',
                  border: '1px solid var(--accent-dim)', borderRadius: 6,
                  color: 'var(--accent)', fontSize: 12, fontWeight: 500,
                }}>
                  <ExternalLink size={12} /> Preview
                </button>
              )}
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${screen.completion}%`,
                background: screen.completion > 50 ? 'var(--green)' : 'var(--accent)',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {screen.completion}% complete
          </div>
        </div>
      ))}
    </div>
  )
}
