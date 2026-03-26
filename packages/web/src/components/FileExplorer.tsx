import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  FolderOpen, FolderClosed, FileText, ChevronRight, ChevronDown,
  Activity, Plus, Pencil, Trash2, RefreshCw, X
} from 'lucide-react'
import { DATA_MODE } from '../data/config'
import { apiClient, type FileTreeNode } from '../data/api-client'
import type { WSMessage } from '@agentflow-devcon/shared'

// ── Event log types ──
interface FileEvent {
  id: string
  filePath: string
  changeType: 'add' | 'change' | 'unlink'
  timestamp: Date
}

// ── WS listener for file:changed events ──
type FileChangeHandler = (msg: WSMessage) => void
const fileChangeHandlers = new Set<FileChangeHandler>()
let fileWSSetup = false

function ensureFileWS() {
  if (fileWSSetup || DATA_MODE === 'mock') return
  fileWSSetup = true
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${protocol}//${window.location.host}/ws`
  function connect() {
    const ws = new WebSocket(url)
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage
        for (const h of fileChangeHandlers) h(msg)
      } catch { /* ignore */ }
    }
    ws.onclose = () => setTimeout(connect, 2000)
    ws.onerror = () => ws.close()
  }
  connect()
}

// ── File Tree Node component ──
function TreeNode({
  node,
  depth,
  selectedPath,
  highlightedPaths,
  expandedDirs,
  onSelect,
  onToggleDir,
}: {
  node: FileTreeNode
  depth: number
  selectedPath: string | null
  highlightedPaths: Set<string>
  expandedDirs: Set<string>
  onSelect: (path: string) => void
  onToggleDir: (path: string) => void
}) {
  const isDir = node.type === 'dir'
  const isExpanded = expandedDirs.has(node.path)
  const isSelected = selectedPath === node.path
  const isHighlighted = highlightedPaths.has(node.path)

  return (
    <>
      <div
        className={`fe-tree-node ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => {
          if (isDir) onToggleDir(node.path)
          else onSelect(node.path)
        }}
      >
        <span className="fe-tree-icon">
          {isDir
            ? (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)
            : <FileText size={12} />
          }
        </span>
        {isDir && (
          <span className="fe-tree-folder-icon">
            {isExpanded ? <FolderOpen size={13} /> : <FolderClosed size={13} />}
          </span>
        )}
        <span className="fe-tree-name">{node.name}</span>
      </div>
      {isDir && isExpanded && node.children?.map(child => (
        <TreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          highlightedPaths={highlightedPaths}
          expandedDirs={expandedDirs}
          onSelect={onSelect}
          onToggleDir={onToggleDir}
        />
      ))}
    </>
  )
}

// ── Main FileExplorer component ──
export function FileExplorer() {
  const [isOpen, setIsOpen] = useState(false)
  const [tree, setTree] = useState<FileTreeNode[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const [highlightedPaths, setHighlightedPaths] = useState<Set<string>>(new Set())
  const [events, setEvents] = useState<FileEvent[]>([])
  const [unseenCount, setUnseenCount] = useState(0)
  const isOpenRef = useRef(isOpen)
  isOpenRef.current = isOpen

  // Load file tree
  const loadTree = useCallback(async () => {
    if (DATA_MODE === 'mock') return
    try {
      const data = await apiClient.getFileTree()
      setTree(data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadTree() }, [loadTree])

  // Load file content on selection
  useEffect(() => {
    if (!selectedPath) { setFileContent(null); return }
    let cancelled = false
    setLoadingContent(true)
    apiClient.getFileContent(selectedPath)
      .then(r => { if (!cancelled) setFileContent(r.content) })
      .catch(() => { if (!cancelled) setFileContent('// Failed to load file') })
      .finally(() => { if (!cancelled) setLoadingContent(false) })
    return () => { cancelled = true }
  }, [selectedPath])

  // WS listener: file changes → highlight + event log + reload tree
  useEffect(() => {
    ensureFileWS()
    const handler: FileChangeHandler = (msg) => {
      if (msg.type !== 'file:changed') return

      const { filePath, changeType } = msg

      // Add event
      setEvents(prev => [{
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        filePath,
        changeType,
        timestamp: new Date(),
      }, ...prev].slice(0, 100))

      if (!isOpenRef.current) {
        setUnseenCount(c => c + 1)
      }

      // Expand parent dirs and highlight
      const parts = filePath.split('/')
      const parentPaths: string[] = []
      for (let i = 1; i < parts.length; i++) {
        parentPaths.push(parts.slice(0, i).join('/'))
      }
      setExpandedDirs(prev => {
        const next = new Set(prev)
        for (const p of parentPaths) next.add(p)
        return next
      })
      setHighlightedPaths(prev => new Set(prev).add(filePath))
      setTimeout(() => {
        setHighlightedPaths(prev => {
          const next = new Set(prev)
          next.delete(filePath)
          return next
        })
      }, 2000)

      // Reload tree (file might be new or deleted)
      if (changeType === 'add' || changeType === 'unlink') loadTree()

      // Reload content if viewing this file
      if (filePath === selectedPath && changeType === 'change') {
        apiClient.getFileContent(filePath)
          .then(r => setFileContent(r.content))
          .catch(() => {})
      }
      if (filePath === selectedPath && changeType === 'unlink') {
        setSelectedPath(null)
        setFileContent(null)
      }
    }
    fileChangeHandlers.add(handler)
    return () => { fileChangeHandlers.delete(handler) }
  }, [loadTree, selectedPath])

  const toggleDir = useCallback((path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setUnseenCount(0)
  }, [])

  if (DATA_MODE === 'mock') return null

  const changeIcon = (type: string) => {
    if (type === 'add') return <Plus size={11} />
    if (type === 'change') return <Pencil size={11} />
    return <Trash2 size={11} />
  }

  const changeColor = (type: string) => {
    if (type === 'add') return 'var(--green)'
    if (type === 'change') return 'var(--cyan)'
    return 'var(--red)'
  }

  return createPortal(
    <>
      {/* Tab button */}
      {!isOpen && (
        <button className="fe-tab" onClick={handleOpen}>
          <Activity size={14} />
          <span>Files</span>
          {unseenCount > 0 && <span className="fe-badge">{unseenCount}</span>}
        </button>
      )}

      {/* Full panel */}
      {isOpen && (
        <div className="fe-panel">
          {/* Header */}
          <div className="fe-header">
            <span className="fe-header-title">.agentflow/</span>
            <div className="fe-header-actions">
              <button className="fe-icon-btn" onClick={loadTree} title="Refresh tree">
                <RefreshCw size={13} />
              </button>
              <button className="fe-icon-btn" onClick={() => setIsOpen(false)} title="Close">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="fe-body">
            {/* Left: File tree */}
            <div className="fe-tree-pane">
              <div className="fe-tree-scroll">
                {tree.map(node => (
                  <TreeNode
                    key={node.path}
                    node={node}
                    depth={0}
                    selectedPath={selectedPath}
                    highlightedPaths={highlightedPaths}
                    expandedDirs={expandedDirs}
                    onSelect={setSelectedPath}
                    onToggleDir={toggleDir}
                  />
                ))}
              </div>
            </div>

            {/* Middle: File content */}
            <div className="fe-content-pane">
              {selectedPath ? (
                <>
                  <div className="fe-content-header">
                    <FileText size={13} />
                    <span>{selectedPath}</span>
                  </div>
                  <div className="fe-content-body">
                    {loadingContent
                      ? <div className="fe-content-loading">Loading...</div>
                      : <pre className="fe-content-pre">{fileContent}</pre>
                    }
                  </div>
                </>
              ) : (
                <div className="fe-content-empty">
                  <FileText size={24} />
                  <span>Select a file to view its content</span>
                </div>
              )}
            </div>

            {/* Right: Event log */}
            <div className="fe-events-pane">
              <div className="fe-events-header">
                <span>Changes</span>
                <span className="fe-events-count">{events.length}</span>
                {events.length > 0 && (
                  <button className="fe-events-clear" onClick={() => setEvents([])}>Clear</button>
                )}
              </div>
              <div className="fe-events-scroll">
                {events.length === 0 ? (
                  <div className="fe-events-empty">Watching for changes...</div>
                ) : (
                  events.map(ev => (
                    <div
                      key={ev.id}
                      className="fe-event-row"
                      onClick={() => {
                        if (ev.changeType !== 'unlink') setSelectedPath(ev.filePath)
                      }}
                    >
                      <span className="fe-event-icon" style={{ color: changeColor(ev.changeType) }}>
                        {changeIcon(ev.changeType)}
                      </span>
                      <span className="fe-event-path" title={ev.filePath}>
                        {ev.filePath.split('/').pop()}
                      </span>
                      <span className="fe-event-time">
                        <TimeAgo date={ev.timestamp} />
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <style>{`
            .fe-panel {
              position: fixed;
              right: 0; top: 48px; bottom: 0;
              width: min(90vw, 1100px);
              background: var(--bg-primary);
              border-left: 1px solid var(--border);
              display: flex;
              flex-direction: column;
              z-index: 40;
              animation: feSlideIn 0.2s ease;
            }
            @keyframes feSlideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }

            .fe-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 10px 16px;
              border-bottom: 1px solid var(--border);
              flex-shrink: 0;
            }
            .fe-header-title {
              font-size: 13px;
              font-weight: 600;
              color: var(--text-primary);
              font-family: 'JetBrains Mono', monospace;
            }
            .fe-header-actions { display: flex; gap: 4px; }
            .fe-icon-btn {
              width: 28px; height: 28px;
              display: flex; align-items: center; justify-content: center;
              border: none; border-radius: 6px;
              background: none; color: var(--text-muted);
              cursor: pointer; font-family: inherit;
            }
            .fe-icon-btn:hover { background: var(--bg-hover); color: var(--text-secondary); }

            .fe-body {
              flex: 1;
              display: flex;
              overflow: hidden;
            }

            /* ── Tree pane ── */
            .fe-tree-pane {
              width: 240px;
              min-width: 180px;
              border-right: 1px solid var(--border);
              display: flex;
              flex-direction: column;
              flex-shrink: 0;
            }
            .fe-tree-scroll {
              flex: 1;
              overflow-y: auto;
              padding: 4px 0;
            }
            .fe-tree-node {
              display: flex;
              align-items: center;
              gap: 4px;
              padding: 4px 8px;
              cursor: pointer;
              font-size: 12px;
              color: var(--text-secondary);
              transition: background 0.1s;
              white-space: nowrap;
              user-select: none;
            }
            .fe-tree-node:hover { background: var(--bg-hover); }
            .fe-tree-node.selected {
              background: var(--accent-glow);
              color: var(--accent);
            }
            .fe-tree-node.highlighted {
              animation: feHighlight 2s ease;
            }
            @keyframes feHighlight {
              0% { background: var(--accent-dim); color: white; }
              70% { background: var(--accent-dim); color: white; }
              100% { background: transparent; }
            }
            .fe-tree-icon {
              display: flex; align-items: center;
              color: var(--text-muted);
              flex-shrink: 0;
            }
            .fe-tree-folder-icon {
              display: flex; align-items: center;
              color: var(--amber);
              flex-shrink: 0;
            }
            .fe-tree-name {
              overflow: hidden;
              text-overflow: ellipsis;
            }

            /* ── Content pane ── */
            .fe-content-pane {
              flex: 1;
              display: flex;
              flex-direction: column;
              min-width: 0;
              border-right: 1px solid var(--border);
            }
            .fe-content-header {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 8px 16px;
              border-bottom: 1px solid var(--border);
              font-size: 12px;
              font-family: 'JetBrains Mono', monospace;
              color: var(--text-secondary);
              flex-shrink: 0;
            }
            .fe-content-body {
              flex: 1;
              overflow: auto;
              padding: 0;
            }
            .fe-content-pre {
              margin: 0;
              padding: 16px;
              font-family: 'JetBrains Mono', monospace;
              font-size: 12px;
              line-height: 1.6;
              color: var(--text-primary);
              white-space: pre-wrap;
              word-break: break-word;
            }
            .fe-content-empty {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 12px;
              color: var(--text-muted);
              font-size: 13px;
            }
            .fe-content-loading {
              padding: 24px;
              color: var(--text-muted);
              font-size: 12px;
            }

            /* ── Events pane ── */
            .fe-events-pane {
              width: 220px;
              min-width: 160px;
              display: flex;
              flex-direction: column;
              flex-shrink: 0;
            }
            .fe-events-header {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 8px 12px;
              border-bottom: 1px solid var(--border);
              font-size: 12px;
              font-weight: 600;
              color: var(--text-primary);
              flex-shrink: 0;
            }
            .fe-events-count {
              font-size: 10px; font-weight: 500;
              color: var(--text-muted);
              background: var(--bg-tertiary);
              padding: 1px 6px; border-radius: 8px;
            }
            .fe-events-clear {
              margin-left: auto;
              font-size: 10px; color: var(--text-muted);
              background: none; border: none; cursor: pointer;
              font-family: inherit; padding: 2px 6px; border-radius: 4px;
            }
            .fe-events-clear:hover { background: var(--bg-hover); }
            .fe-events-scroll {
              flex: 1;
              overflow-y: auto;
              padding: 4px 0;
            }
            .fe-events-empty {
              padding: 24px 12px;
              text-align: center;
              font-size: 11px;
              color: var(--text-muted);
            }
            .fe-event-row {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 5px 12px;
              font-size: 11px;
              cursor: pointer;
              transition: background 0.1s;
              animation: feEventIn 0.2s ease;
            }
            @keyframes feEventIn {
              from { opacity: 0; transform: translateX(8px); }
              to { opacity: 1; transform: translateX(0); }
            }
            .fe-event-row:hover { background: var(--bg-hover); }
            .fe-event-icon {
              display: flex; align-items: center;
              flex-shrink: 0;
            }
            .fe-event-path {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: var(--text-secondary);
            }
            .fe-event-time {
              font-size: 10px;
              color: var(--text-muted);
              flex-shrink: 0;
            }
          `}</style>
        </div>
      )}

      {/* Styles always rendered so .fe-tab works when panel is closed */}
      <style>{`
        .fe-tab {
          position: fixed;
          right: 12px;
          top: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          z-index: 50;
          transition: all 0.15s;
          font-family: inherit;
        }
        .fe-tab:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .fe-badge {
          min-width: 18px; height: 18px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 9px;
          background: var(--accent); color: white;
          font-size: 10px; font-weight: 700; padding: 0 5px;
        }
      `}</style>
    </>,
    document.body,
  )
}

function TimeAgo({ date }: { date: Date }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(interval)
  }, [])
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) return <>now</>
  if (seconds < 60) return <>{seconds}s</>
  const minutes = Math.floor(seconds / 60)
  return <>{minutes}m</>
}
