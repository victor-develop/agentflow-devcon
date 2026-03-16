import { useCallback, useMemo } from 'react'
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
  ArrowRight,
} from 'lucide-react'
import type { WorkflowStepId, WorkflowStep } from '../types'
import { workflowSteps } from '../mockData'

/* ── Icon map ─────────────────────────────────────────── */
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

const phaseConfig: Record<string, { label: string; color: string; colorVar: string }> = {
  define: { label: 'Define', color: '#06b6d4', colorVar: 'var(--cyan)' },
  design: { label: 'Design', color: '#a855f7', colorVar: 'var(--purple)' },
  develop: { label: 'Develop', color: '#f59e0b', colorVar: 'var(--amber)' },
  verify: { label: 'Verify', color: '#22c55e', colorVar: 'var(--green)' },
}

/* ── Phase Node ───────────────────────────────────────── */
type PhaseNodeData = {
  phase: string
  steps: WorkflowStep[]
  onSelect: (id: WorkflowStepId) => void
}

function PhaseNode({ data }: NodeProps<Node<PhaseNodeData>>) {
  const { phase, steps, onSelect } = data
  const cfg = phaseConfig[phase]
  const completedCount = steps.filter(s => s.status === 'completed').length

  return (
    <div className="phase-node" style={{ '--phase-color': cfg.color } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="phase-handle" />
      <div className="phase-node-header">
        <span className="phase-node-dot" />
        <span className="phase-node-label">{cfg.label}</span>
        <span className="phase-node-count">{completedCount}/{steps.length}</span>
      </div>
      <div className="phase-node-steps">
        {steps.map(step => (
          <button
            key={step.id}
            className={`phase-step-btn step-${step.status}`}
            onClick={() => onSelect(step.id)}
          >
            <span className="phase-step-icon">{stepIcons[step.id]}</span>
            <span className="phase-step-name">{step.label}</span>
            <span className={`phase-step-status tag tag-${step.status}`}>{step.status}</span>
            <ArrowRight size={12} className="phase-step-arrow" />
          </button>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="phase-handle" />
    </div>
  )
}

const nodeTypes: NodeTypes = { phase: PhaseNode }

/* ── Main Component ───────────────────────────────────── */
interface Props {
  onSelect: (id: WorkflowStepId) => void
}

export function StepSelector({ onSelect }: Props) {
  const phases = ['define', 'design', 'develop', 'verify'] as const

  const nodes: Node<PhaseNodeData>[] = useMemo(() => {
    const nodeWidth = 320
    const gapX = 120
    const startX = 80
    const startY = 140

    return phases.map((phase, i) => {
      const steps = workflowSteps.filter(s => s.phase === phase)
      // stagger vertically for visual interest
      const yOffset = i % 2 === 0 ? 0 : 60
      return {
        id: phase,
        type: 'phase',
        position: { x: startX + i * (nodeWidth + gapX), y: startY + yOffset },
        data: { phase, steps, onSelect },
        draggable: true,
      }
    })
  }, [onSelect])

  const edges: Edge[] = useMemo(() => [
    { id: 'e-define-design', source: 'define', target: 'design', type: 'default', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
    { id: 'e-design-develop', source: 'design', target: 'develop', type: 'default', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
    { id: 'e-develop-verify', source: 'develop', target: 'verify', type: 'default', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
  ], [])

  const onNodeDragStop = useCallback(() => {}, [])

  return (
    <div className="step-selector-flow">
      <div className="flow-header">
        <Zap size={28} className="selector-logo" />
        <h1>AgentFlow Dev Console</h1>
        <p>AI-First Development Workflow</p>
      </div>
      <div className="flow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeDragStop={onNodeDragStop}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.5}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          panOnScroll
          zoomOnScroll={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#252535" />
        </ReactFlow>
      </div>

      <style>{`
        .step-selector-flow {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }
        .flow-header {
          text-align: center;
          padding: 32px 20px 16px;
          flex-shrink: 0;
        }
        .flow-header .selector-logo {
          color: var(--accent);
          margin-bottom: 8px;
        }
        .flow-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
          background: linear-gradient(135deg, var(--text-primary), var(--accent-hover));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .flow-header p {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .flow-canvas {
          flex: 1;
          min-height: 0;
        }

        /* React Flow overrides */
        .react-flow__renderer {
          background: transparent !important;
        }
        .react-flow__edge-path {
          stroke-dasharray: 5;
        }
        .react-flow__handle {
          opacity: 0;
          width: 8px;
          height: 8px;
        }

        /* Phase Node */
        .phase-node {
          min-width: 280px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
          transition: box-shadow 0.2s;
        }
        .phase-node:hover {
          box-shadow: 0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px var(--phase-color);
        }

        .phase-node-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
        }
        .phase-node-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--phase-color);
          box-shadow: 0 0 8px var(--phase-color);
        }
        .phase-node-label {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--phase-color);
          flex: 1;
        }
        .phase-node-count {
          font-size: 11px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .phase-node-steps {
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .phase-step-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 13px;
          text-align: left;
          transition: all 0.15s;
          cursor: pointer;
        }
        .phase-step-btn:hover {
          background: var(--bg-hover);
          border-color: var(--phase-color);
        }
        .phase-step-btn.step-completed {
          opacity: 0.7;
        }
        .phase-step-btn.step-completed:hover {
          opacity: 1;
        }

        .phase-step-icon {
          display: flex;
          align-items: center;
          color: var(--phase-color);
          flex-shrink: 0;
        }
        .phase-step-name {
          flex: 1;
          font-weight: 500;
        }
        .phase-step-status {
          font-size: 10px;
          flex-shrink: 0;
        }
        .phase-step-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          opacity: 0;
          transition: all 0.15s;
        }
        .phase-step-btn:hover .phase-step-arrow {
          opacity: 1;
          color: var(--phase-color);
          transform: translateX(2px);
        }

        .phase-handle {
          background: var(--phase-color) !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}
