import { mockPRD } from '../mockData'

export function ProblemView() {
  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--red)' }}>68%</div>
          <div className="stat-label">Users report notification fatigue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--amber)' }}>12%</div>
          <div className="stat-label">Current notification open rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>4.2min</div>
          <div className="stat-label">Avg P0 alert response time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>23</div>
          <div className="stat-label">Missed P0 alerts last quarter</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Problem Statement</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{mockPRD.problem}</p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Hypothesis</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          By implementing intelligent notification routing with ML-based prioritization and user-context-aware
          channel selection, we can reduce notification volume by 60% while increasing the open rate of
          critical alerts by 3x. Users who receive fewer but more relevant notifications will report
          lower fatigue scores and respond faster to urgent alerts.
        </p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Supporting Evidence</h3>
        <div className="list-item">
          <span className="list-bullet" />
          User survey (n=2,400): 68% report "too many irrelevant notifications"
        </div>
        <div className="list-item">
          <span className="list-bullet" />
          Incident post-mortem analysis: 15 of 23 missed P0s were due to channel mismatch
        </div>
        <div className="list-item">
          <span className="list-bullet" />
          Competitor benchmark: Slack's intelligent notifications show 52% open rate
        </div>
        <div className="list-item">
          <span className="list-bullet" />
          Internal prototype (rule-based only) showed 40% volume reduction in pilot group
        </div>
      </div>
    </div>
  )
}
