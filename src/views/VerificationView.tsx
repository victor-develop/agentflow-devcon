import { ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react'

export function VerificationView() {
  const runs = [
    {
      id: 'RUN-042',
      timestamp: '2024-03-15 14:23',
      agent: 'Claude Opus',
      story: 'STORY-001',
      passed: 8,
      failed: 2,
      pending: 3,
      status: 'partial',
    },
    {
      id: 'RUN-041',
      timestamp: '2024-03-15 11:05',
      agent: 'Claude Opus',
      story: 'STORY-001',
      passed: 6,
      failed: 4,
      pending: 3,
      status: 'partial',
    },
    {
      id: 'RUN-040',
      timestamp: '2024-03-14 19:30',
      agent: 'Claude Sonnet',
      story: 'STORY-002',
      passed: 3,
      failed: 0,
      pending: 5,
      status: 'passing',
    },
  ]

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{runs.length}</div>
          <div className="stat-label">Verification Runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--green)' }}>
            {runs.reduce((a, r) => a + r.passed, 0)}
          </div>
          <div className="stat-label">Tests Passed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--red)' }}>
            {runs.reduce((a, r) => a + r.failed, 0)}
          </div>
          <div className="stat-label">Tests Failed</div>
        </div>
      </div>

      <div className="section-title">Recent Verification Runs</div>
      {runs.map(run => (
        <div key={run.id} className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <ShieldCheck
                size={20}
                style={{ color: run.status === 'passing' ? 'var(--green)' : 'var(--amber)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {run.id}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {run.story}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {run.agent} · {run.timestamp}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: 13 }}>
                <CheckCircle2 size={14} /> {run.passed}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--red)', fontSize: 13 }}>
                <XCircle size={14} /> {run.failed}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                <Clock size={14} /> {run.pending}
              </div>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{
                width: `${(run.passed / (run.passed + run.failed + run.pending)) * 100}%`,
                background: 'var(--green)', borderRadius: '2px 0 0 2px',
              }} />
              <div style={{
                width: `${(run.failed / (run.passed + run.failed + run.pending)) * 100}%`,
                background: 'var(--red)',
              }} />
              <div style={{
                width: `${(run.pending / (run.passed + run.failed + run.pending)) * 100}%`,
                background: 'var(--text-muted)', borderRadius: '0 2px 2px 0',
              }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
