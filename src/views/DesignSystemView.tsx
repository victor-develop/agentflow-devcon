export function DesignSystemView() {
  const tokens = [
    { name: '--bg-primary', value: '#0a0a0f', type: 'color' },
    { name: '--accent', value: '#6366f1', type: 'color' },
    { name: '--green', value: '#22c55e', type: 'color' },
    { name: '--amber', value: '#f59e0b', type: 'color' },
    { name: '--red', value: '#ef4444', type: 'color' },
    { name: '--cyan', value: '#06b6d4', type: 'color' },
    { name: '--purple', value: '#a855f7', type: 'color' },
  ]

  const typography = [
    { name: 'Heading 1', font: 'Inter', weight: '700', size: '32px' },
    { name: 'Heading 2', font: 'Inter', weight: '600', size: '20px' },
    { name: 'Body', font: 'Inter', weight: '400', size: '14px' },
    { name: 'Caption', font: 'Inter', weight: '500', size: '12px' },
    { name: 'Code', font: 'JetBrains Mono', weight: '400', size: '13px' },
  ]

  return (
    <div>
      <div className="section-title">Color Tokens</div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {tokens.map(t => (
            <div key={t.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', background: 'var(--bg-tertiary)', borderRadius: 8
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6, background: t.value,
                border: '1px solid var(--border)', flexShrink: 0
              }} />
              <div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">Typography Scale</div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Font</th>
              <th>Weight</th>
              <th>Size</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {typography.map(t => (
              <tr key={t.name}>
                <td style={{ color: 'var(--text-primary)' }}>{t.name}</td>
                <td className="mono">{t.font}</td>
                <td>{t.weight}</td>
                <td className="mono">{t.size}</td>
                <td>
                  <span style={{
                    fontFamily: t.font === 'JetBrains Mono' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
                    fontWeight: Number(t.weight),
                    fontSize: t.size,
                  }}>
                    Aa Bb Cc
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">Spacing</div>
      <div className="card">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[4, 8, 12, 16, 20, 24, 32, 48].map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: s, height: s, background: 'var(--accent-glow)',
                border: '1px solid var(--accent)', borderRadius: 2
              }} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s}px</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">Status Badges</div>
      <div className="card">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['draft', 'ready', 'in-progress', 'done', 'implemented', 'agreed', 'passing', 'failing', 'high', 'medium', 'low'].map(s => (
            <span key={s} className={`tag tag-${s}`}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
