import { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  MarkerType,
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
import { Layers, Puzzle } from 'lucide-react'
import type { DesignComponent } from '../types'

/* ── Custom node: Page (root) ──────────────────────────── */

type PageNodeData = {
  label: string
  status: string
  childCount: number
}

function PageNode({ data }: NodeProps<Node<PageNodeData>>) {
  return (
    <div style={{
      padding: '14px 24px',
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
      border: '2px solid var(--accent)',
      minWidth: 180,
      textAlign: 'center',
      boxShadow: '0 0 20px rgba(99,102,241,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
        <Layers size={16} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{data.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span className={`tag tag-${data.status}`} style={{ fontSize: 10 }}>{data.status}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{data.childCount} components</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--accent)', width: 8, height: 8, border: '2px solid var(--bg-primary)' }}
      />
    </div>
  )
}

/* ── Custom node: Child component ──────────────────────── */

type ChildNodeData = {
  label: string
  type: string
  status: string
  hasPreview: boolean
}

function ChildNode({ data }: NodeProps<Node<ChildNodeData>>) {
  const typeColors: Record<string, string> = {
    component: 'var(--cyan)',
    pattern: 'var(--purple)',
    page: 'var(--accent)',
  }
  const color = typeColors[data.type] || 'var(--text-muted)'

  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: 10,
      background: 'var(--bg-tertiary)',
      border: `1.5px solid ${color}`,
      minWidth: 150,
      textAlign: 'center',
      boxShadow: `0 0 12px ${color}22`,
      cursor: 'pointer',
    }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color, width: 6, height: 6, border: '2px solid var(--bg-primary)' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
        <Puzzle size={12} style={{ color }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{data.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span className={`type-badge type-${data.type}`} style={{ fontSize: 9 }}>{data.type}</span>
        <span className={`tag tag-${data.status}`} style={{ fontSize: 9 }}>{data.status}</span>
      </div>
    </div>
  )
}

/* ── Node types registry ───────────────────────────────── */

const nodeTypes: NodeTypes = {
  pageNode: PageNode,
  childNode: ChildNode,
}

/* ── Main component ────────────────────────────────────── */

interface Props {
  component: DesignComponent
  childComponents: DesignComponent[]
  onNodeClick?: (componentId: string) => void
}

export function ComponentTreeCanvas({ component, childComponents, onNodeClick }: Props) {
  const { nodes, edges } = useMemo(() => {
    const cols = childComponents.length
    const spacing = 200
    const totalWidth = (cols - 1) * spacing
    const startX = -totalWidth / 2

    const pageNode: Node<PageNodeData> = {
      id: 'page',
      type: 'pageNode',
      position: { x: 0, y: 0 },
      data: {
        label: component.name,
        status: component.status,
        childCount: childComponents.length,
      },
      draggable: true,
    }

    const childNodes: Node<ChildNodeData>[] = childComponents.map((ch, i) => ({
      id: ch.id,
      type: 'childNode',
      position: { x: startX + i * spacing, y: 160 },
      data: {
        label: ch.name,
        type: ch.type,
        status: ch.status,
        hasPreview: true,
      },
      draggable: true,
    }))

    const edgeList: Edge[] = childComponents.map(ch => ({
      id: `page-${ch.id}`,
      source: 'page',
      target: ch.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'var(--accent)', strokeWidth: 2, opacity: 0.6 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--accent)',
        width: 16,
        height: 16,
      },
    }))

    return { nodes: [pageNode, ...childNodes], edges: edgeList }
  }, [component, childComponents])

  const onInit = useCallback((instance: { fitView: (opts?: object) => void }) => {
    setTimeout(() => instance.fitView({ padding: 0.3 }), 50)
  }, [])

  const handleNodeClick = useCallback((_: unknown, node: Node) => {
    if (node.id !== 'page' && onNodeClick) {
      onNodeClick(node.id)
    }
  }, [onNodeClick])

  if (childComponents.length === 0) return null

  return (
    <div style={{
      height: 320,
      borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid var(--border)',
      background: 'var(--bg-primary)',
      marginBottom: 12,
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        panOnScroll
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
      </ReactFlow>
    </div>
  )
}
