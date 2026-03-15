import { mockPRD } from '../mockData'

export function DevelopmentView() {
  const allCode = mockPRD.stories.flatMap(s =>
    s.codeEntries.map(ce => ({ ...ce, storyId: s.id, storyTitle: s.title }))
  )

  const frontendCount = allCode.filter(c => c.type === 'frontend').length
  const backendCount = allCode.filter(c => c.type === 'backend').length

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{allCode.length}</div>
          <div className="stat-label">Code Modules</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{frontendCount}</div>
          <div className="stat-label">Frontend</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{backendCount}</div>
          <div className="stat-label">Backend</div>
        </div>
      </div>

      <div className="section-title">Frontend Modules</div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Path</th>
              <th>Description</th>
              <th>Story</th>
            </tr>
          </thead>
          <tbody>
            {allCode.filter(c => c.type === 'frontend').map(ce => (
              <tr key={ce.id}>
                <td><span className="code-path">{ce.path}</span></td>
                <td>{ce.description}</td>
                <td className="mono" style={{ fontSize: 11 }}>{ce.storyId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">Backend Modules</div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Path</th>
              <th>Description</th>
              <th>Story</th>
            </tr>
          </thead>
          <tbody>
            {allCode.filter(c => c.type === 'backend').map(ce => (
              <tr key={ce.id}>
                <td><span className="code-path">{ce.path}</span></td>
                <td>{ce.description}</td>
                <td className="mono" style={{ fontSize: 11 }}>{ce.storyId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
