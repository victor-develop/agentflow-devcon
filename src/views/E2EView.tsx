import { mockPRD } from '../mockData'

export function E2EView() {
  const allTests = mockPRD.stories.flatMap(s =>
    s.testCases.map(tc => ({ ...tc, storyId: s.id, storyTitle: s.title }))
  )

  const statusCounts = {
    ready: allTests.filter(t => t.status === 'ready').length,
    draft: allTests.filter(t => t.status === 'draft').length,
    passing: allTests.filter(t => t.status === 'passing').length,
    failing: allTests.filter(t => t.status === 'failing').length,
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{allTests.length}</div>
          <div className="stat-label">Total Test Cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>{statusCounts.ready}</div>
          <div className="stat-label">Ready</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{statusCounts.passing}</div>
          <div className="stat-label">Passing</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--red)' }}>{statusCounts.failing}</div>
          <div className="stat-label">Failing</div>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Story</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allTests.map(tc => (
              <tr key={tc.id}>
                <td className="mono">{tc.id}</td>
                <td style={{ color: 'var(--text-primary)' }}>{tc.title}</td>
                <td><span className={`type-badge type-${tc.type}`}>{tc.type}</span></td>
                <td className="mono" style={{ fontSize: 11 }}>{tc.storyId}</td>
                <td><span className={`tag tag-${tc.status}`}>{tc.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
