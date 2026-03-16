import { CheckCircle2, Circle, Zap } from 'lucide-react'
import type { WorkflowStep, WorkflowStepId } from '../types'

interface Props {
  steps: WorkflowStep[]
  activeStep: WorkflowStepId
  onStepClick: (id: WorkflowStepId) => void
  onHomeClick: () => void
}

const phaseColors: Record<string, string> = {
  define: 'var(--cyan)',
  design: 'var(--purple)',
  develop: 'var(--amber)',
  verify: 'var(--green)',
}

export function WorkflowNav({ steps, activeStep, onStepClick, onHomeClick }: Props) {
  return (
    <nav className="workflow-nav">
      <div className="nav-brand" onClick={onHomeClick} style={{ cursor: 'pointer' }} title="Back to Home">
        <Zap size={18} className="brand-icon" />
        <span className="brand-text">AgentFlow</span>
        <span className="brand-badge">DevCon</span>
      </div>
      <div className="nav-steps">
        {steps.map((step, i) => {
          const isActive = step.id === activeStep
          const showPhaseDivider = i > 0 && steps[i - 1].phase !== step.phase
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              {showPhaseDivider && <div className="phase-divider" />}
              {i > 0 && !showPhaseDivider && <div className="step-connector" />}
              <button
                className={`nav-step ${isActive ? 'active' : ''} step-${step.status}`}
                onClick={() => onStepClick(step.id)}
                title={step.label}
              >
                <span className="step-icon">
                  {step.status === 'completed' ? (
                    <CheckCircle2 size={14} />
                  ) : step.status === 'active' ? (
                    <span className="pulse-dot" style={{ background: phaseColors[step.phase] }} />
                  ) : (
                    <Circle size={14} />
                  )}
                </span>
                <span className="step-label">{step.shortLabel}</span>
              </button>
            </div>
          )
        })}
      </div>
      <div className="nav-right">
        <span className="nav-project">notification-routing</span>
      </div>

      <style>{`
        .workflow-nav {
          display: flex;
          align-items: center;
          height: 48px;
          padding: 0 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          gap: 8px;
          overflow-x: auto;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          padding-right: 16px;
          border-right: 1px solid var(--border);
          margin-right: 8px;
        }
        .brand-icon { color: var(--accent); }
        .brand-text {
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
        }
        .brand-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
          background: var(--accent-glow);
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .nav-steps {
          display: flex;
          align-items: center;
          gap: 0;
          flex: 1;
          overflow-x: auto;
        }
        .nav-steps::-webkit-scrollbar { display: none; }
        .step-connector {
          width: 12px;
          height: 1px;
          background: var(--border);
          flex-shrink: 0;
        }
        .phase-divider {
          width: 2px;
          height: 20px;
          background: var(--border);
          margin: 0 10px;
          flex-shrink: 0;
          border-radius: 1px;
        }
        .nav-step {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border: 1px solid transparent;
          border-radius: 6px;
          background: none;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .nav-step:hover {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }
        .nav-step.active {
          background: var(--accent-glow);
          border-color: var(--accent-dim);
          color: var(--accent-hover);
        }
        .nav-step.step-completed {
          color: var(--green-dim);
        }
        .nav-step.step-completed.active {
          color: var(--accent-hover);
        }
        .step-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px transparent; }
        }
        .nav-right {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          margin-left: auto;
          padding-left: 16px;
          border-left: 1px solid var(--border);
        }
        .nav-project {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--text-muted);
        }
      `}</style>
    </nav>
  )
}
