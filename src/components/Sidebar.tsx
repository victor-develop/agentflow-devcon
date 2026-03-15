import {
  AlertTriangle, FileText, LayoutList, Palette, Component,
  FileCode2, Box, TestTube, Wrench, Code2, ShieldCheck,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import type { WorkflowStep, WorkflowStepId } from '../types'

const stepIcons: Record<WorkflowStepId, React.ReactNode> = {
  problem: <AlertTriangle size={16} />,
  prd: <FileText size={16} />,
  stories: <LayoutList size={16} />,
  design: <Palette size={16} />,
  components: <Component size={16} />,
  contracts: <FileCode2 size={16} />,
  prototype: <Box size={16} />,
  e2e: <TestTube size={16} />,
  harness: <Wrench size={16} />,
  development: <Code2 size={16} />,
  verification: <ShieldCheck size={16} />,
}

interface Props {
  steps: WorkflowStep[]
  activeStep: WorkflowStepId
  collapsed: boolean
  onToggle: () => void
  onStepClick: (id: WorkflowStepId) => void
}

export function Sidebar({ steps, activeStep, collapsed, onToggle, onStepClick }: Props) {
  const phases = ['define', 'design', 'develop', 'verify'] as const
  const phaseLabels: Record<string, string> = {
    define: 'Define',
    design: 'Design',
    develop: 'Develop',
    verify: 'Verify',
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
      <div className="sidebar-nav">
        {phases.map(phase => {
          const phaseSteps = steps.filter(s => s.phase === phase)
          return (
            <div key={phase} className="sidebar-phase">
              {!collapsed && (
                <div className="sidebar-phase-label" data-phase={phase}>
                  {phaseLabels[phase]}
                </div>
              )}
              {phaseSteps.map(step => (
                <button
                  key={step.id}
                  className={`sidebar-item ${step.id === activeStep ? 'active' : ''} item-${step.status}`}
                  onClick={() => onStepClick(step.id)}
                  title={step.label}
                >
                  <span className="sidebar-icon">{stepIcons[step.id]}</span>
                  {!collapsed && <span className="sidebar-label">{step.label}</span>}
                  {!collapsed && (
                    <span className={`sidebar-dot dot-${step.status}`} />
                  )}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      <style>{`
        .sidebar {
          width: 240px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.2s;
          overflow: hidden;
        }
        .sidebar.collapsed {
          width: 52px;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-toggle {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }
        .sidebar-toggle:hover {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }
        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .sidebar-phase {
          margin-bottom: 8px;
        }
        .sidebar-phase-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 6px 10px 4px;
          color: var(--text-muted);
        }
        .sidebar-phase-label[data-phase="define"] { color: var(--cyan); }
        .sidebar-phase-label[data-phase="design"] { color: var(--purple); }
        .sidebar-phase-label[data-phase="develop"] { color: var(--amber); }
        .sidebar-phase-label[data-phase="verify"] { color: var(--green); }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 7px 10px;
          border: none;
          border-radius: 6px;
          background: none;
          color: var(--text-secondary);
          font-size: 13px;
          text-align: left;
          transition: all 0.1s;
        }
        .sidebar.collapsed .sidebar-item {
          justify-content: center;
          padding: 8px;
        }
        .sidebar-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .sidebar-item.active {
          background: var(--accent-glow);
          color: var(--accent-hover);
        }
        .sidebar-item.item-completed {
          color: var(--text-muted);
        }
        .sidebar-item.item-completed.active {
          color: var(--accent-hover);
        }
        .sidebar-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .sidebar-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-completed { background: var(--green); }
        .dot-active { background: var(--accent); animation: pulse 2s infinite; }
        .dot-pending { background: var(--text-muted); opacity: 0.4; }
      `}</style>
    </aside>
  )
}
