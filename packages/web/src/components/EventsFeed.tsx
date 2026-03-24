import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Activity, ChevronLeft, ChevronRight, Plus, Pencil, Trash2,
  GitBranch, FileCode, RefreshCw, Zap
} from 'lucide-react'
import { DATA_MODE } from '../data/config'
import type { WSMessage } from '@agentflow-devcon/shared'

interface FeedEvent {
  id: string
  type: WSMessage['type']
  title: string
  detail: string
  timestamp: Date
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  'item:created': <Plus size={12} />,
  'item:updated': <Pencil size={12} />,
  'item:deleted': <Trash2 size={12} />,
  'relation:created': <GitBranch size={12} />,
  'relation:deleted': <GitBranch size={12} />,
  'schema:updated': <FileCode size={12} />,
  'flow:updated': <RefreshCw size={12} />,
  'chat:chunk': <Zap size={12} />,
  'chat:done': <Zap size={12} />,
}

const EVENT_COLORS: Record<string, string> = {
  'item:created': 'var(--green)',
  'item:updated': 'var(--cyan)',
  'item:deleted': 'var(--red)',
  'relation:created': 'var(--purple)',
  'relation:deleted': 'var(--red)',
  'schema:updated': 'var(--amber)',
  'flow:updated': 'var(--amber)',
}

function formatEvent(msg: WSMessage): { title: string; detail: string } | null {
  switch (msg.type) {
    case 'item:created':
      return { title: 'Item Created', detail: `${msg.itemId} in ${msg.processId}` }
    case 'item:updated':
      return {
        title: 'Item Updated',
        detail: `${msg.itemId} — ${msg.changes.map(c => c.field).join(', ')}`,
      }
    case 'item:deleted':
      return { title: 'Item Deleted', detail: `${msg.itemId} from ${msg.processId}` }
    case 'relation:created':
      return { title: 'Relation Added', detail: `${msg.from} → ${msg.to} (${msg.relationType})` }
    case 'relation:deleted':
      return { title: 'Relation Removed', detail: `${msg.from} → ${msg.to}` }
    case 'schema:updated':
      return { title: 'Schema Updated', detail: msg.processId }
    case 'flow:updated':
      return { title: 'Flow Updated', detail: 'flow.yaml changed' }
    default:
      return null
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Global event collector — WS listener that persists across renders
type EventHandler = (msg: WSMessage) => void
const feedHandlers = new Set<EventHandler>()
let feedWSSetup = false

function ensureFeedWS() {
  if (feedWSSetup || DATA_MODE === 'mock') return
  feedWSSetup = true

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${protocol}//${window.location.host}/ws`

  function connect() {
    const ws = new WebSocket(url)
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage
        // Skip chat events — those go to ChatPanel
        if (msg.type === 'chat:chunk' || msg.type === 'chat:done') return
        for (const h of feedHandlers) h(msg)
      } catch { /* ignore */ }
    }
    ws.onclose = () => setTimeout(connect, 2000)
    ws.onerror = () => ws.close()
  }
  connect()
}

const MAX_EVENTS = 100

export function EventsFeed() {
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [unseenCount, setUnseenCount] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const isOpenRef = useRef(isOpen)
  isOpenRef.current = isOpen

  useEffect(() => {
    if (DATA_MODE === 'mock') return
    ensureFeedWS()

    const handler: EventHandler = (msg) => {
      const formatted = formatEvent(msg)
      if (!formatted) return

      const newEvent: FeedEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: msg.type,
        title: formatted.title,
        detail: formatted.detail,
        timestamp: new Date(),
      }

      setEvents(prev => [newEvent, ...prev].slice(0, MAX_EVENTS))
      if (!isOpenRef.current) {
        setUnseenCount(c => c + 1)
      }
    }

    feedHandlers.add(handler)
    return () => { feedHandlers.delete(handler) }
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setUnseenCount(0)
  }, [])

  if (DATA_MODE === 'mock') return null

  return (
    <>
      {/* Collapsed tab */}
      {!isOpen && (
        <button className="ef-tab" onClick={handleOpen}>
          <Activity size={14} />
          <span>Events</span>
          {unseenCount > 0 && <span className="ef-badge">{unseenCount}</span>}
          <ChevronLeft size={12} />
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="ef-panel">
          <div className="ef-header">
            <div className="ef-header-left">
              <Activity size={14} />
              <span>Live Events</span>
              <span className="ef-count">{events.length}</span>
            </div>
            <div className="ef-header-right">
              {events.length > 0 && (
                <button className="ef-clear" onClick={() => setEvents([])}>Clear</button>
              )}
              <button className="ef-close" onClick={() => setIsOpen(false)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="ef-list" ref={listRef}>
            {events.length === 0 ? (
              <div className="ef-empty">
                <Zap size={20} />
                <span>Watching for changes...</span>
                <span className="ef-empty-hint">Edit a YAML file in .agentflow/ to see events</span>
              </div>
            ) : (
              events.map(ev => (
                <div key={ev.id} className="ef-event" data-type={ev.type}>
                  <div
                    className="ef-event-icon"
                    style={{ color: EVENT_COLORS[ev.type] ?? 'var(--text-muted)' }}
                  >
                    {EVENT_ICONS[ev.type]}
                  </div>
                  <div className="ef-event-body">
                    <div className="ef-event-title">{ev.title}</div>
                    <div className="ef-event-detail">{ev.detail}</div>
                  </div>
                  <div className="ef-event-time">
                    <TimeAgo date={ev.timestamp} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .ef-tab {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-right: none;
          border-radius: 8px 0 0 8px;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          z-index: 50;
          transition: all 0.15s;
          font-family: inherit;
        }
        .ef-tab:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          padding-right: 16px;
        }
        .ef-badge {
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: var(--accent);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 0 5px;
        }

        .ef-panel {
          position: fixed;
          right: 0;
          top: 48px;
          bottom: 0;
          width: 320px;
          background: var(--bg-primary);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 40;
          animation: efSlideIn 0.2s ease;
        }
        @keyframes efSlideIn {
          from { transform: translateX(320px); }
          to { transform: translateX(0); }
        }

        .ef-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .ef-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .ef-count {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          padding: 1px 6px;
          border-radius: 8px;
        }
        .ef-header-right {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ef-clear {
          font-size: 11px;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: inherit;
        }
        .ef-clear:hover { background: var(--bg-hover); color: var(--text-secondary); }
        .ef-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          background: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .ef-close:hover { background: var(--bg-hover); }

        .ef-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .ef-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 48px 24px;
          color: var(--text-muted);
          text-align: center;
        }
        .ef-empty-hint {
          font-size: 11px;
          opacity: 0.6;
        }

        .ef-event {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 16px;
          transition: background 0.1s;
          animation: efFadeIn 0.2s ease;
        }
        @keyframes efFadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .ef-event:hover { background: var(--bg-hover); }

        .ef-event-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
          background: var(--bg-tertiary);
        }

        .ef-event-body {
          flex: 1;
          min-width: 0;
        }
        .ef-event-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }
        .ef-event-detail {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.3;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ef-event-time {
          font-size: 10px;
          color: var(--text-muted);
          white-space: nowrap;
          flex-shrink: 0;
          margin-top: 2px;
        }
      `}</style>
    </>
  )
}

// Auto-updating time display
function TimeAgo({ date }: { date: Date }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(interval)
  }, [])
  return <>{timeAgo(date)}</>
}
