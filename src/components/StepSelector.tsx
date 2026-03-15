import {
  AlertTriangle, FileText, LayoutList, Palette, Component,
  FileCode2, Box, TestTube, Wrench, Code2, ShieldCheck, Zap,
  ArrowRight
} from 'lucide-react'
import type { WorkflowStepId } from '../types'
import { workflowSteps } from '../mockData'

const stepIcons: Record<WorkflowStepId, React.ReactNode> = {
  problem: <AlertTriangle size={24} />,
  prd: <FileText size={24} />,
  stories: <LayoutList size={24} />,
  design: <Palette size={24} />,
  components: <Component size={24} />,
  contracts: <FileCode2 size={24} />,
  prototype: <Box size={24} />,
  e2e: <TestTube size={24} />,
  harness: <Wrench size={24} />,
  development: <Code2 size={24} />,
  verification: <ShieldCheck size={24} />,
}

const phaseColors: Record<string, string> = {
  define: 'var(--cyan)',
  design: 'var(--purple)',
  develop: 'var(--amber)',
  verify: 'var(--green)',
}

interface Props {
  onSelect: (id: WorkflowStepId) => void
}

export function StepSelector({ onSelect }: Props) {
  const phases = ['define', 'design', 'develop', 'verify'] as const
  const phaseLabels: Record<string, string> = {
    define: 'Define',
    design: 'Design',
    develop: 'Develop',
    verify: 'Verify',
  }

  return (
    <div className="step-selector">
      <div className="selector-header">
        <Zap size={32} className="selector-logo" />
        <h1>AgentFlow Dev Console</h1>
        <p>AI-First Development Workflow</p>
        <p className="selector-subtitle">Select a workflow step to begin</p>
      </div>

      <div className="selector-grid">
        {phases.map(phase => (
          <div key={phase} className="selector-phase">
            <div className="selector-phase-header" style={{ color: phaseColors[phase] }}>
              <span className="selector-phase-dot" style={{ background: phaseColors[phase] }} />
              {phaseLabels[phase]}
            </div>
            {workflowSteps
              .filter(s => s.phase === phase)
              .map(step => (
                <button
                  key={step.id}
                  className={`selector-card step-${step.status}`}
                  onClick={() => onSelect(step.id)}
                >
                  <div className="selector-card-icon" style={{ color: phaseColors[phase] }}>
                    {stepIcons[step.id]}
                  </div>
                  <div className="selector-card-content">
                    <div className="selector-card-title">{step.label}</div>
                    <div className="selector-card-desc">{step.description}</div>
                  </div>
                  <div className="selector-card-meta">
                    <span className={`tag tag-${step.status}`}>{step.status}</span>
                    <ArrowRight size={14} className="selector-arrow" />
                  </div>
                </button>
              ))}
          </div>
        ))}
      </div>

      <style>{`
        .step-selector {
          height: 100vh;
          overflow-y: auto;
          background: var(--bg-primary);
          padding: 60px 40px;
        }
        .selector-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .selector-logo {
          color: var(--accent);
          margin-bottom: 16px;
        }
        .selector-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 6px;
          background: linear-gradient(135deg, var(--text-primary), var(--accent-hover));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .selector-header p {
          color: var(--text-secondary);
          font-size: 15px;
        }
        .selector-subtitle {
          margin-top: 4px;
          color: var(--text-muted) !important;
          font-size: 13px !important;
        }
        .selector-grid {
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }
        @media (max-width: 768px) {
          .selector-grid { grid-template-columns: 1fr; }
        }
        .selector-phase-header {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .selector-phase-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .selector-card {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          margin-bottom: 8px;
          text-align: left;
          color: var(--text-primary);
          transition: all 0.15s;
        }
        .selector-card:hover {
          border-color: var(--accent-dim);
          background: var(--bg-hover);
          transform: translateX(4px);
        }
        .selector-card.step-completed {
          opacity: 0.65;
        }
        .selector-card.step-completed:hover { opacity: 1; }
        .selector-card-icon {
          flex-shrink: 0;
          opacity: 0.8;
        }
        .selector-card-content { flex: 1; }
        .selector-card-title {
          font-size: 14px;
          font-weight: 600;
        }
        .selector-card-desc {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .selector-card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .selector-arrow {
          color: var(--text-muted);
          transition: transform 0.15s;
        }
        .selector-card:hover .selector-arrow {
          transform: translateX(3px);
          color: var(--accent);
        }
      `}</style>
    </div>
  )
}
