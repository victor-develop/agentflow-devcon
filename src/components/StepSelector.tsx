import { useMemo } from 'react'
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  Background,
  BackgroundVariant,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  AlertTriangle, FileText, LayoutList, Palette, Component,
  FileCode2, Box, TestTube, Wrench, Code2, ShieldCheck, Zap,
  ArrowRight, CheckCircle2, Clock, Circle,
} from 'lucide-react'
import type { WorkflowStepId, WorkflowStep } from '../types'
import { workflowSteps } from '../mockData'

/* ── Icon map ─────────────────────────────────────────── */
const stepIcons: Record<WorkflowStepId, React.ReactNode> = {
  problem: <AlertTriangle size={18} />,
  prd: <FileText size={18} />,
  stories: <LayoutList size={18} />,
  design: <Palette size={18} />,
  components: <Component size={18} />,
  contracts: <FileCode2 size={18} />,
  prototype: <Box size={18} />,
  e2e: <TestTube size={18} />,
  harness: <Wrench size={18} />,
  development: <Code2 size={18} />,
  verification: <ShieldCheck size={18} />,
}

const statusIcon = (status: string) => {
  if (status === 'completed') return <CheckCircle2 size={14} />
  if (status === 'active') return <Clock size={14} />
  return <Circle size={14} />
}

const phaseConfig: Record<string, { label: string; color: string; desc: string }> = {
  define: { label: 'Define', color: '#06b6d4', desc: 'Problem & requirements' },
  design: { label: 'Design', color: '#a855f7', desc: 'System & components' },
  develop: { label: 'Develop', color: '#f59e0b', desc: 'Build & test' },
  verify: { label: 'Verify', color: '#22c55e', desc: 'Validate & ship' },
}

/* ── Lane Node (Kanban Column) ────────────────────────── */
type LaneNodeData = {
  phase: string
  steps: WorkflowStep[]
  onSelect: (id: WorkflowStepId) => void
}

function LaneNode({ data }: NodeProps<Node<LaneNodeData>>) {
  const { phase, steps, onSelect } = data
  const cfg = phaseConfig[phase]
  const completedCount = steps.filter(s => s.status === 'completed').length
  const pct = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="kanban-lane" style={{ '--lane-color': cfg.color } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="lane-handle" />

      {/* Lane Header */}
      <div className="lane-header">
        <div className="lane-header-top">
          <span className="lane-dot" />
          <span className="lane-title">{cfg.label}</span>
          <span className="lane-count">{completedCount}/{steps.length}</span>
        </div>
        <div className="lane-desc">{cfg.desc}</div>
        <div className="lane-progress">
          <div className="lane-progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Step Cards */}
      <div className="lane-cards">
        {steps.map(step => (
          <button
            key={step.id}
            className={`kanban-card card-${step.status}`}
            onClick={() => onSelect(step.id)}
          >
            <div className="kanban-card-top">
              <span className="kanban-card-icon">{stepIcons[step.id]}</span>
              <span className="kanban-card-title">{step.label}</span>
            </div>
            <div className="kanban-card-desc">{step.description}</div>
            <div className="kanban-card-footer">
              <span className={`kanban-status status-${step.status}`}>
                {statusIcon(step.status)}
                {step.status}
              </span>
              <ArrowRight size={14} className="kanban-card-arrow" />
            </div>
          </button>
        ))}
      </div>

      <Handle type="source" position={Position.Right} className="lane-handle" />
    </div>
  )
}

const nodeTypes: NodeTypes = { lane: LaneNode }

/* ── Main Component ───────────────────────────────────── */
interface Props {
  onSelect: (id: WorkflowStepId) => void
}

export function StepSelector({ onSelect }: Props) {
  const phases = ['define', 'design', 'develop', 'verify'] as const

  const nodes: Node<LaneNodeData>[] = useMemo(() => {
    const laneWidth = 280
    const gapX = 100
    const startX = 60
    const startY = 20

    return phases.map((phase, i) => ({
      id: phase,
      type: 'lane',
      position: { x: startX + i * (laneWidth + gapX), y: startY },
      data: { phase, steps: workflowSteps.filter(s => s.phase === phase), onSelect },
      draggable: true,
    }))
  }, [onSelect])

  const edges: Edge[] = useMemo(() => [
    { id: 'e1', source: 'define', target: 'design', type: 'default', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
    { id: 'e2', source: 'design', target: 'develop', type: 'default', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
    { id: 'e3', source: 'develop', target: 'verify', type: 'default', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  ], [])

  return (
    <div className="kanban-flow">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <Zap size={24} className="kanban-logo" />
          <div>
            <h1>AgentFlow Dev Console</h1>
            <p>AI-First Development Workflow</p>
          </div>
        </div>
      </div>
      <div className="kanban-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.4}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          panOnScroll
          zoomOnScroll={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1a1a2e" />
        </ReactFlow>
      </div>

      <style>{`
        .kanban-flow {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        /* ── Header ── */
        .kanban-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
          flex-shrink: 0;
        }
        .kanban-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .kanban-logo { color: var(--accent); }
        .kanban-header h1 {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--text-primary), var(--accent-hover));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
        }
        .kanban-header p {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* ── Canvas ── */
        .kanban-canvas {
          flex: 1;
          min-height: 0;
        }
        .react-flow__renderer { background: transparent !important; }
        .react-flow__handle { opacity: 0; width: 6px; height: 6px; }

        /* ── Lane ── */
        .kanban-lane {
          width: 280px;
          background: rgba(20, 20, 30, 0.85);
          border: 1px solid var(--border);
          border-top: 3px solid var(--lane-color);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
        }
        .kanban-lane:hover {
          border-color: color-mix(in srgb, var(--lane-color) 40%, var(--border));
        }

        /* ── Lane Header ── */
        .lane-header {
          padding: 16px 16px 12px;
          border-bottom: 1px solid var(--border);
        }
        .lane-header-top {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .lane-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--lane-color);
          box-shadow: 0 0 10px var(--lane-color);
        }
        .lane-title {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--lane-color);
          flex: 1;
        }
        .lane-count {
          font-size: 12px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          background: rgba(255,255,255,0.05);
          padding: 2px 8px;
          border-radius: 10px;
        }
        .lane-desc {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .lane-progress {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }
        .lane-progress-bar {
          height: 100%;
          background: var(--lane-color);
          border-radius: 2px;
          transition: width 0.4s ease;
        }

        /* ── Cards ── */
        .lane-cards {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .kanban-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          padding: 12px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          text-align: left;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s;
        }
        .kanban-card:hover {
          background: var(--bg-hover);
          border-color: var(--lane-color);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .kanban-card.card-completed { opacity: 0.65; }
        .kanban-card.card-completed:hover { opacity: 1; }

        .kanban-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .kanban-card-icon {
          display: flex;
          color: var(--lane-color);
          flex-shrink: 0;
        }
        .kanban-card-title {
          font-size: 13px;
          font-weight: 600;
          flex: 1;
        }
        .kanban-card-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .kanban-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .kanban-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .kanban-status.status-completed { color: var(--green); }
        .kanban-status.status-active { color: var(--accent); }
        .kanban-status.status-pending { color: var(--text-muted); }

        .kanban-card-arrow {
          color: var(--text-muted);
          opacity: 0;
          transition: all 0.15s;
        }
        .kanban-card:hover .kanban-card-arrow {
          opacity: 1;
          color: var(--lane-color);
          transform: translateX(2px);
        }

        .lane-handle {
          background: var(--lane-color) !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}
