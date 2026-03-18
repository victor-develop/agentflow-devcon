import { useState, type ReactNode } from 'react'
import { Layers, ToggleLeft, Clock, Grid3x3, Mail, Upload, GitBranch, BarChart3, TrendingUp, Table2, LineChart, Timer, Shield, Search, Zap, Send, Bell, Gauge, MessageSquare, Settings, Puzzle, Network, Eye } from 'lucide-react'
import type { DesignComponent } from '../types'
import { ComponentTreeCanvas } from './ComponentTreeCanvas'

const s = {
  wire: {
    borderRadius: 8,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    padding: 16,
    fontSize: 12,
  } as const,
  label: {
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: 6,
  },
  sampleBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    fontSize: 9,
    padding: '2px 6px',
    borderRadius: 4,
    background: 'var(--accent)',
    color: '#000',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  box: (color: string) => ({
    borderRadius: 6,
    border: `1px solid ${color}`,
    background: `${color}11`,
    padding: '8px 12px',
    fontSize: 11,
  }),
  row: { display: 'flex', gap: 8, alignItems: 'center' as const },
  grid: { display: 'grid', gap: 8 },
}

// ─── Wireframe building blocks ─────────────────────────────

function WireToggle({ label, on }: { label: string; on: boolean }) {
  return (
    <div style={{ ...s.row, justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <div style={{ width: 32, height: 18, borderRadius: 9, background: on ? 'var(--green)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', padding: 2 }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: '#fff', marginLeft: on ? 14 : 0, transition: '0.2s' }} />
      </div>
    </div>
  )
}

function WireInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={s.label}>{label}</div>
      <div style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 11, color: 'var(--text-muted)' }}>
        {placeholder}
      </div>
    </div>
  )
}

function WireButton({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <div style={{
      display: 'inline-block', padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600,
      background: primary ? 'var(--accent)' : 'var(--bg-secondary)',
      color: primary ? '#000' : 'var(--text-secondary)',
      border: primary ? 'none' : '1px solid var(--border)',
    }}>
      {label}
    </div>
  )
}

function WireBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ ...s.row, justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: 10, color }}>{value}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-secondary)' }}>
        <div style={{ height: 4, borderRadius: 2, background: color, width: `${value}%` }} />
      </div>
    </div>
  )
}

function WireChartBars() {
  const bars = [65, 82, 45, 91, 73, 58, 88]
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 48 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 2, background: i === 3 ? 'var(--green)' : 'var(--accent)', opacity: 0.7 }} />
      ))}
    </div>
  )
}

function WireNav({ items, active }: { items: string[]; active: number }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 12 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: '6px 14px', fontSize: 11, fontWeight: i === active ? 600 : 400,
          color: i === active ? 'var(--accent)' : 'var(--text-muted)',
          borderBottom: i === active ? '2px solid var(--accent)' : '2px solid transparent',
          marginBottom: -2,
        }}>
          {item}
        </div>
      ))}
    </div>
  )
}

function ChildComponentChip({ name, status, onClick }: { name: string; type: string; status: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
        borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 11,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = 'var(--accent)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <Puzzle size={10} style={{ color: 'var(--cyan)' }} />
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{name}</span>
      <span className={`tag tag-${status}`} style={{ fontSize: 9, padding: '1px 5px' }}>{status}</span>
    </div>
  )
}

// ─── Component-specific previews ───────────────────────────

const previews: Record<string, () => ReactNode> = {
  ChannelToggleCard: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><ToggleLeft size={14} style={{ color: 'var(--cyan)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Notification Channels</span></div>
      <WireToggle label="Email" on={true} />
      <WireToggle label="Push Notifications" on={true} />
      <WireToggle label="Slack" on={false} />
      <WireToggle label="SMS" on={false} />
    </div>
  ),
  QuietHoursScheduler: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Clock size={14} style={{ color: 'var(--purple)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Quiet Hours</span></div>
      <div style={{ ...s.row, gap: 12, marginBottom: 8 }}>
        <WireInput label="From" placeholder="22:00" />
        <WireInput label="To" placeholder="08:00" />
      </div>
      <WireToggle label="Allow critical alerts" on={true} />
    </div>
  ),
  PriorityMatrix: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Grid3x3 size={14} style={{ color: 'var(--amber)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Priority Matrix</span></div>
      <div style={{ ...s.grid, gridTemplateColumns: '1fr 1fr 1fr', fontSize: 10 }}>
        <div style={s.box('var(--red)')}>P0 Critical<br /><strong>All channels</strong></div>
        <div style={s.box('var(--amber)')}>P1 High<br /><strong>Push + Email</strong></div>
        <div style={s.box('var(--text-muted)')}>P2 Normal<br /><strong>Email only</strong></div>
      </div>
    </div>
  ),
  EmailConfigForm: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Mail size={14} style={{ color: 'var(--cyan)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Email Configuration</span></div>
      <WireInput label="Email Address" placeholder="user@company.com" />
      <WireInput label="Digest Frequency" placeholder="Daily at 09:00" />
      <WireToggle label="HTML format" on={true} />
      <div style={{ marginTop: 8 }}><WireButton label="Send Test Email" primary /></div>
    </div>
  ),
  PushTokenManager: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Bell size={14} style={{ color: 'var(--green)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Push Tokens</span></div>
      {['Chrome — MacOS (active)', 'Safari — iPhone 15 (active)', 'Firefox — Windows (expired)'].map((d, i) => (
        <div key={i} style={{ ...s.row, justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d}</span>
          <span style={{ fontSize: 10, color: i === 2 ? 'var(--red)' : 'var(--green)' }}>{i === 2 ? 'expired' : 'active'}</span>
        </div>
      ))}
    </div>
  ),
  ImportExportDialog: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Upload size={14} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Import / Export</span></div>
      <div style={{ ...s.grid, gridTemplateColumns: '1fr 1fr', marginBottom: 8 }}>
        <div style={{ ...s.box('var(--accent)'), textAlign: 'center', cursor: 'pointer' }}>Export JSON</div>
        <div style={{ ...s.box('var(--cyan)'), textAlign: 'center', cursor: 'pointer' }}>Import JSON</div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Drag & drop JSON file or click Import</div>
    </div>
  ),
  RuleConditionBuilder: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><GitBranch size={14} style={{ color: 'var(--cyan)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Rule Condition</span></div>
      <div style={{ ...s.box('var(--cyan)'), marginBottom: 6 }}>
        <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>IF</span> priority = <span style={{ color: 'var(--accent)' }}>critical</span>
      </div>
      <div style={{ ...s.box('var(--green)'), marginBottom: 6 }}>
        <span style={{ color: 'var(--green)', fontWeight: 600 }}>AND</span> user.status = <span style={{ color: 'var(--accent)' }}>online</span>
      </div>
      <div style={{ ...s.box('var(--purple)') }}>
        <span style={{ color: 'var(--purple)', fontWeight: 600 }}>THEN</span> route to <span style={{ color: 'var(--accent)' }}>push + slack</span>
      </div>
    </div>
  ),
  RoutingFlowVisualizer: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Zap size={14} style={{ color: 'var(--amber)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Routing Flow</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {['Ingest', 'Classify', 'Route', 'Deliver'].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ padding: '6px 12px', borderRadius: 6, background: i < 3 ? 'var(--accent)' : 'var(--bg-secondary)', fontSize: 10, fontWeight: 600, color: i < 3 ? '#000' : 'var(--text-muted)' }}>
              {step}
            </div>
            {i < 3 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
          </div>
        ))}
      </div>
    </div>
  ),
  TemplateCard: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Layers size={14} style={{ color: 'var(--purple)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Rule Template</span></div>
      <div style={{ ...s.box('var(--purple)'), marginBottom: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>On-Call Escalation</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Route P0/P1 to PagerDuty, escalate after 5min</div>
      </div>
      <div style={{ ...s.row, gap: 6 }}>
        <WireButton label="Preview" />
        <WireButton label="Apply Template" primary />
      </div>
    </div>
  ),
  SimulationPanel: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Search size={14} style={{ color: 'var(--cyan)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Dry Run</span></div>
      <WireInput label="Notification Type" placeholder="deployment_failed" />
      <WireInput label="Priority" placeholder="critical" />
      <div style={{ marginTop: 8, ...s.box('var(--green)') }}>
        Result: <strong>Push + Slack #oncall</strong> (2 rules matched)
      </div>
    </div>
  ),
  SimulationResultCard: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Gauge size={14} style={{ color: 'var(--green)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Simulation Result</span></div>
      <WireBar value={95} color="var(--green)" label="Routing confidence" />
      <WireBar value={78} color="var(--cyan)" label="Channel match score" />
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Matched rules: R-001, R-004 | Delivery: Push</div>
    </div>
  ),
  VersionHistory: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><GitBranch size={14} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Version History</span></div>
      {['v3 — Added priority override (current)', 'v2 — Changed channel to Slack', 'v1 — Initial rule created'].map((v, i) => (
        <div key={i} style={{ ...s.row, padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 11, color: i === 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {i === 0 && <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--green)' }} />}
          {v}
        </div>
      ))}
    </div>
  ),
  DeliveryFunnelChart: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><BarChart3 size={14} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Delivery Funnel</span></div>
      {[{ l: 'Sent', v: 100, c: 'var(--accent)' }, { l: 'Delivered', v: 94, c: 'var(--cyan)' }, { l: 'Opened', v: 42, c: 'var(--green)' }, { l: 'Clicked', v: 18, c: 'var(--purple)' }].map(b => (
        <WireBar key={b.l} value={b.v} color={b.c} label={b.l} />
      ))}
    </div>
  ),
  ChannelPerformanceGrid: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Table2 size={14} style={{ color: 'var(--cyan)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Channel Performance</span></div>
      <div style={{ ...s.grid, gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[{ ch: 'Email', rate: '94%', c: 'var(--green)' }, { ch: 'Push', rate: '99%', c: 'var(--green)' }, { ch: 'Slack', rate: '87%', c: 'var(--amber)' }, { ch: 'SMS', rate: '91%', c: 'var(--green)' }].map(x => (
          <div key={x.ch} style={s.box(x.c)}>
            <div style={{ fontWeight: 600 }}>{x.ch}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: x.c }}>{x.rate}</div>
          </div>
        ))}
      </div>
    </div>
  ),
  TimeSeriesChart: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><LineChart size={14} style={{ color: 'var(--purple)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Notifications Over Time</span></div>
      <WireChartBars />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
    </div>
  ),
  ChannelMetricsPanel: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><TrendingUp size={14} style={{ color: 'var(--green)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Channel Metrics</span></div>
      <WireBar value={94} color="var(--green)" label="Email delivery rate" />
      <WireBar value={99} color="var(--green)" label="Push delivery rate" />
      <WireBar value={87} color="var(--amber)" label="Slack delivery rate" />
    </div>
  ),
  EngagementHeatmap: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Grid3x3 size={14} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Engagement Heatmap</span></div>
      <div style={{ ...s.grid, gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {Array.from({ length: 28 }, (_, i) => {
          const intensity = [0.1, 0.3, 0.5, 0.7, 0.9][Math.floor(Math.random() * 5)]
          return <div key={i} style={{ aspectRatio: '1', borderRadius: 2, background: `rgba(99, 102, 241, ${intensity})` }} />
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
    </div>
  ),
  ExportReportDialog: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Upload size={14} style={{ color: 'var(--amber)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Export Report</span></div>
      <WireInput label="Date Range" placeholder="Mar 1 — Mar 15, 2024" />
      <div style={{ ...s.row, gap: 6, marginTop: 8 }}>
        <WireButton label="CSV" />
        <WireButton label="PDF" primary />
      </div>
    </div>
  ),
  BatchConfigPanel: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Timer size={14} style={{ color: 'var(--cyan)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Batch Configuration</span></div>
      <WireInput label="Batch Window" placeholder="15 minutes" />
      <WireInput label="Max Batch Size" placeholder="50 notifications" />
      <WireToggle label="Auto-batch similar notifications" on={true} />
    </div>
  ),
  DedupRulesPanel: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Shield size={14} style={{ color: 'var(--green)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Dedup Rules</span></div>
      <div style={{ ...s.box('var(--green)'), marginBottom: 6, fontSize: 10 }}>Content hash match → merge within <strong>5min</strong> window</div>
      <div style={{ ...s.box('var(--amber)'), fontSize: 10 }}>Similar title (85% match) → merge within <strong>15min</strong> window</div>
    </div>
  ),
  DigestEmailPreview: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Mail size={14} style={{ color: 'var(--purple)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Digest Preview</span></div>
      <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Daily Digest — 12 notifications</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          <div>• 3 critical alerts (acknowledged)</div>
          <div>• 5 deployment notifications</div>
          <div>• 4 team updates</div>
        </div>
      </div>
    </div>
  ),
  DigestTemplateEditor: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Settings size={14} style={{ color: 'var(--amber)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Template Editor</span></div>
      <div style={{ padding: 8, borderRadius: 6, background: '#000', fontFamily: 'monospace', fontSize: 10, color: 'var(--green)', lineHeight: 1.6 }}>
        {'{{#each items}}'}<br />
        {'  <div class="item">'}<br />
        {'    {{title}} — {{priority}}'}<br />
        {'  </div>'}<br />
        {'{{/each}}'}
      </div>
    </div>
  ),
  WorkspaceSwitcher: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Layers size={14} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Workspace</span></div>
      {['Engineering (current)', 'Marketing', 'Support'].map((w, i) => (
        <div key={i} style={{ ...s.row, justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 11, color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
          {w}
          {i === 0 && <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--green)' }} />}
        </div>
      ))}
    </div>
  ),
  UserRoleEditor: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Shield size={14} style={{ color: 'var(--purple)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>User Role</span></div>
      <WireInput label="User" placeholder="jane@company.com" />
      <div style={{ ...s.row, gap: 6, marginTop: 8 }}>
        {['Viewer', 'Editor', 'Admin'].map((r, i) => (
          <div key={r} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: i === 1 ? 600 : 400, background: i === 1 ? 'var(--accent)' : 'var(--bg-secondary)', color: i === 1 ? '#000' : 'var(--text-muted)', border: i === 1 ? 'none' : '1px solid var(--border)' }}>
            {r}
          </div>
        ))}
      </div>
    </div>
  ),
  AuditLogTable: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Table2 size={14} style={{ color: 'var(--amber)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Audit Log</span></div>
      {[{ a: 'jane', act: 'Updated routing rule R-004', t: '2m ago' }, { a: 'bot', act: 'Auto-rotated Slack token', t: '1h ago' }, { a: 'admin', act: 'Added user mike@co.com', t: '3h ago' }].map((e, i) => (
        <div key={i} style={{ ...s.row, justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 10 }}>
          <span><strong style={{ color: 'var(--accent)' }}>{e.a}</strong> {e.act}</span>
          <span style={{ color: 'var(--text-muted)' }}>{e.t}</span>
        </div>
      ))}
    </div>
  ),
  SlackChannelPicker: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><MessageSquare size={14} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Slack Channels</span></div>
      {['#oncall-alerts', '#deployments', '#team-updates'].map((ch, i) => (
        <div key={i} style={{ ...s.row, justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{ch}</span>
          <WireToggle label="" on={i < 2} />
        </div>
      ))}
    </div>
  ),
  WebhookConfigPanel: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Send size={14} style={{ color: 'var(--green)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Webhook Config</span></div>
      <WireInput label="URL" placeholder="https://api.example.com/webhooks/notify" />
      <WireInput label="Secret" placeholder="whsec_••••••••" />
      <div style={{ ...s.row, gap: 6, marginTop: 8 }}>
        <WireButton label="Test Webhook" primary />
        <span style={{ fontSize: 10, color: 'var(--green)' }}>Last ping: 200 OK</span>
      </div>
    </div>
  ),
  PagerDutySetup: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Bell size={14} style={{ color: 'var(--red)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>PagerDuty</span></div>
      <WireInput label="Integration Key" placeholder="pd-key-••••••••" />
      <WireInput label="Escalation Policy" placeholder="Default Engineering" />
      <WireToggle label="Auto-create incidents for P0" on={true} />
    </div>
  ),
  PredictionConfidenceBadge: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Zap size={14} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>ML Confidence</span></div>
      <div style={{ ...s.row, gap: 12 }}>
        <div style={{ ...s.box('var(--green)'), textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>92%</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Confidence</div>
        </div>
        <div style={{ ...s.box('var(--cyan)'), textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--cyan)' }}>P1</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Predicted</div>
        </div>
      </div>
    </div>
  ),
  ActivitySignalDebugger: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Gauge size={14} style={{ color: 'var(--green)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Activity Signals</span></div>
      {[{ sig: 'Desktop', st: 'online', c: 'var(--green)' }, { sig: 'Mobile', st: 'away (5min)', c: 'var(--amber)' }, { sig: 'Calendar', st: 'in meeting', c: 'var(--red)' }].map(x => (
        <div key={x.sig} style={{ ...s.row, justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{x.sig}</span>
          <span style={{ color: x.c, fontWeight: 600, fontSize: 10 }}>{x.st}</span>
        </div>
      ))}
    </div>
  ),
  ChannelRecommendationTooltip: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><Zap size={14} style={{ color: 'var(--purple)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Channel Recommendation</span></div>
      <div style={{ ...s.box('var(--purple)'), fontSize: 10 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Recommended: Push Notification</div>
        <div style={{ color: 'var(--text-muted)' }}>User is on mobile, high engagement with push (82% open rate)</div>
      </div>
    </div>
  ),
  FeedbackCollector: () => (
    <div>
      <div style={{ ...s.row, marginBottom: 10 }}><MessageSquare size={14} style={{ color: 'var(--green)' }} /><span style={{ fontSize: 12, fontWeight: 600 }}>Was this helpful?</span></div>
      <div style={{ ...s.row, gap: 8, marginBottom: 8 }}>
        <div style={{ ...s.box('var(--green)'), textAlign: 'center', flex: 1, cursor: 'pointer' }}>Relevant</div>
        <div style={{ ...s.box('var(--red)'), textAlign: 'center', flex: 1, cursor: 'pointer' }}>Not useful</div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Your feedback improves routing accuracy</div>
    </div>
  ),
}

// ─── Page-level previews (with nav + layout) ───────────────

const pagePreviews: Record<string, (children: DesignComponent[]) => ReactNode> = {
  PreferencesPage: (children) => (
    <div>
      <WireNav items={['Channels', 'Quiet Hours', 'Priority']} active={0} />
      <div style={{ ...s.grid, gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {children.map(ch => (
          <div key={ch.id} style={s.box('var(--border)')}>
            <div style={{ ...s.row, marginBottom: 4 }}>
              <Puzzle size={10} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontWeight: 600, fontSize: 10 }}>{ch.name}</span>
            </div>
            {previews[ch.name] ? previews[ch.name]() : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Component slot</div>}
          </div>
        ))}
      </div>
    </div>
  ),
  ChannelSettingsPage: (children) => (
    <div>
      <WireNav items={['Email', 'Push', 'Slack', 'SMS']} active={0} />
      <div style={{ ...s.grid, gap: 12 }}>
        {children.map(ch => (
          <div key={ch.id} style={s.box('var(--border)')}>
            <div style={{ ...s.row, marginBottom: 4 }}>
              <Puzzle size={10} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontWeight: 600, fontSize: 10 }}>{ch.name}</span>
            </div>
            {previews[ch.name] ? previews[ch.name]() : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Component slot</div>}
          </div>
        ))}
      </div>
    </div>
  ),
  RoutingRulesEditor: (children) => (
    <div>
      <div style={{ ...s.row, justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Routing Rules</span>
        <WireButton label="+ New Rule" primary />
      </div>
      <div style={{ ...s.grid, gap: 10 }}>
        {children.map(ch => (
          <div key={ch.id} style={s.box('var(--border)')}>
            <div style={{ ...s.row, marginBottom: 4 }}>
              <Puzzle size={10} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontWeight: 600, fontSize: 10 }}>{ch.name}</span>
            </div>
            {previews[ch.name] ? previews[ch.name]() : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Component slot</div>}
          </div>
        ))}
      </div>
    </div>
  ),
  TemplateGallery: (children) => (
    <div>
      <div style={{ ...s.row, justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Templates</span>
        <WireInput label="" placeholder="Search templates..." />
      </div>
      <div style={{ ...s.grid, gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {children.length > 0 ? children.map(ch => (
          <div key={ch.id} style={s.box('var(--border)')}>
            <div style={{ ...s.row, marginBottom: 4 }}>
              <Puzzle size={10} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontWeight: 600, fontSize: 10 }}>{ch.name}</span>
            </div>
            {previews[ch.name] ? previews[ch.name]() : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Component slot</div>}
          </div>
        )) : (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 16 }}>
            Template cards appear here
          </div>
        )}
      </div>
    </div>
  ),
  AnalyticsDashboard: (children) => (
    <div>
      <WireNav items={['Overview', 'Channels', 'Engagement', 'Export']} active={0} />
      <div style={{ ...s.grid, gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {children.map(ch => (
          <div key={ch.id} style={s.box('var(--border)')}>
            <div style={{ ...s.row, marginBottom: 4 }}>
              <Puzzle size={10} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontWeight: 600, fontSize: 10 }}>{ch.name}</span>
            </div>
            {previews[ch.name] ? previews[ch.name]() : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Component slot</div>}
          </div>
        ))}
      </div>
    </div>
  ),
  AdminUsersPage: (children) => (
    <div>
      <div style={{ ...s.row, justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Users & Roles</span>
        <WireButton label="+ Invite User" primary />
      </div>
      <div style={{ ...s.grid, gap: 10 }}>
        {children.map(ch => (
          <div key={ch.id} style={s.box('var(--border)')}>
            <div style={{ ...s.row, marginBottom: 4 }}>
              <Puzzle size={10} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontWeight: 600, fontSize: 10 }}>{ch.name}</span>
            </div>
            {previews[ch.name] ? previews[ch.name]() : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Component slot</div>}
          </div>
        ))}
      </div>
    </div>
  ),
  SlackSetupWizard: (children) => (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
        {['Connect', 'Select Channels', 'Test'].map((step, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '6px 0', fontSize: 10, fontWeight: i === 1 ? 600 : 400, color: i <= 1 ? 'var(--accent)' : 'var(--text-muted)', borderBottom: `2px solid ${i <= 1 ? 'var(--accent)' : 'var(--border)'}` }}>
            Step {i + 1}: {step}
          </div>
        ))}
      </div>
      <div style={{ ...s.grid, gap: 10 }}>
        {children.map(ch => (
          <div key={ch.id} style={s.box('var(--border)')}>
            <div style={{ ...s.row, marginBottom: 4 }}>
              <Puzzle size={10} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontWeight: 600, fontSize: 10 }}>{ch.name}</span>
            </div>
            {previews[ch.name] ? previews[ch.name]() : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Component slot</div>}
          </div>
        ))}
      </div>
    </div>
  ),
  TeamsSetupWizard: () => (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
        {['Authorize', 'Map Channels', 'Verify'].map((step, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '6px 0', fontSize: 10, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? 'var(--accent)' : 'var(--text-muted)', borderBottom: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}` }}>
            Step {i + 1}: {step}
          </div>
        ))}
      </div>
      <WireInput label="Tenant ID" placeholder="xxxxxxxx-xxxx-xxxx-xxxx" />
      <WireButton label="Connect to Teams" primary />
    </div>
  ),
  MLModelDashboard: (children) => (
    <div>
      <WireNav items={['Model Status', 'Training', 'Metrics']} active={0} />
      <div style={{ ...s.grid, gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={s.box('var(--green)')}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Model v2.3</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>Active</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Accuracy: 87.3%</div>
        </div>
        <div style={s.box('var(--cyan)')}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Predictions today</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cyan)' }}>12,847</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>p99 latency: 38ms</div>
        </div>
        {children.map(ch => (
          <div key={ch.id} style={s.box('var(--border)')}>
            <div style={{ ...s.row, marginBottom: 4 }}>
              <Puzzle size={10} style={{ color: 'var(--cyan)' }} />
              <span style={{ fontWeight: 600, fontSize: 10 }}>{ch.name}</span>
            </div>
            {previews[ch.name] ? previews[ch.name]() : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Component slot</div>}
          </div>
        ))}
      </div>
    </div>
  ),
}

// ─── Main export ───────────────────────────────────────────

interface Props {
  component: DesignComponent & { storyId: string }
  childComponents?: DesignComponent[]
  onComponentClick?: (componentId: string) => void
}

export function ComponentPreview({ component, childComponents = [], onComponentClick }: Props) {
  const isPage = component.type === 'page'
  const renderPage = pagePreviews[component.name]
  const renderComponent = previews[component.name]
  const [viewMode, setViewMode] = useState<'preview' | 'tree'>('preview')

  return (
    <div style={{ position: 'relative', ...s.wire }}>
      <div style={s.sampleBadge}>SAMPLE</div>

      {isPage && childComponents.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          <button
            onClick={() => setViewMode('preview')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500,
              border: '1px solid var(--border)', cursor: 'pointer',
              background: viewMode === 'preview' ? 'var(--accent)' : 'var(--bg-secondary)',
              color: viewMode === 'preview' ? '#000' : 'var(--text-secondary)',
            }}
          >
            <Eye size={12} /> Preview
          </button>
          <button
            onClick={() => setViewMode('tree')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 500,
              border: '1px solid var(--border)', cursor: 'pointer',
              background: viewMode === 'tree' ? 'var(--accent)' : 'var(--bg-secondary)',
              color: viewMode === 'tree' ? '#000' : 'var(--text-secondary)',
            }}
          >
            <Network size={12} /> Component Tree
          </button>
        </div>
      )}

      {isPage && viewMode === 'tree' && childComponents.length > 0 ? (
        <ComponentTreeCanvas component={component} childComponents={childComponents} onNodeClick={onComponentClick} />
      ) : isPage && renderPage ? (
        <div>
          {renderPage(childComponents)}
          {childComponents.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ ...s.label, marginBottom: 8 }}>Embedded Components</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {childComponents.map(ch => (
                  <ChildComponentChip key={ch.id} name={ch.name} type={ch.type} status={ch.status} onClick={() => onComponentClick?.(ch.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : renderComponent ? (
        renderComponent()
      ) : (
        <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
          <Layers size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
          <div>{component.name}</div>
          <div style={{ fontSize: 10 }}>Preview not yet designed</div>
        </div>
      )}
    </div>
  )
}
