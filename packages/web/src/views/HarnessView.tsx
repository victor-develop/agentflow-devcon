import { Database, Terminal, RefreshCw } from 'lucide-react'

export function HarnessView() {
  const scripts = [
    {
      name: 'seed-notifications.ts',
      description: 'Generate 10K realistic notification records with varied priorities and channels',
      status: 'ready',
      lastRun: '2 hours ago',
    },
    {
      name: 'seed-users.ts',
      description: 'Create 500 user profiles with randomized preference configurations',
      status: 'ready',
      lastRun: '2 hours ago',
    },
    {
      name: 'simulate-traffic.ts',
      description: 'Replay production-like notification traffic at configurable rate',
      status: 'draft',
      lastRun: 'never',
    },
  ]

  const tools = [
    {
      name: 'Notification Inspector',
      description: 'CLI tool to trace a notification through the routing pipeline',
      icon: <Terminal size={16} />,
      status: 'ready',
    },
    {
      name: 'Test Data Factory',
      description: 'Programmatic test data generation with fixture snapshots',
      icon: <Database size={16} />,
      status: 'in-progress',
    },
    {
      name: 'Feedback Loop Runner',
      description: 'Automated cycle: change → build → test → report for AI agents',
      icon: <RefreshCw size={16} />,
      status: 'draft',
    },
  ]

  return (
    <div>
      <div className="section-title">Test Data Scripts</div>
      {scripts.map(s => (
        <div key={s.name} className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Database size={16} style={{ color: 'var(--cyan)' }} />
              <div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.description}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last: {s.lastRun}</span>
              <span className={`tag tag-${s.status}`}>{s.status}</span>
            </div>
          </div>
        </div>
      ))}

      <div className="section-title" style={{ marginTop: 24 }}>Toolchain</div>
      {tools.map(t => (
        <div key={t.name} className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--amber)' }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.description}</div>
              </div>
            </div>
            <span className={`tag tag-${t.status}`}>{t.status}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
