import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageSquare, ChevronDown, ChevronUp, Send,
  Bot, User, Sparkles, Loader2, GripHorizontal,
  Terminal, Zap, FileCode, AlertCircle
} from 'lucide-react'
import { DATA_MODE } from '../data/config'
import { apiClient } from '../data/api-client'
import type { WSMessage } from '@agentflow-devcon/shared'
import type { WorkflowStepId } from '../types'

interface ChatMessage {
  id: string
  role: 'user' | 'agent' | 'system' | 'activity'
  content: string
  timestamp: string
  family?: string
  phase?: string
  toolName?: string
}

/* ── Per-step prompt shortcuts ──────────────────────── */
interface Shortcut { label: string; template: string }

const stepShortcuts: Record<WorkflowStepId, Shortcut[]> = {
  problem: [
    { label: '+ Problem', template: 'Add a new problem:\n- Title: \n- Severity: major/minor/critical\n- Hypothesis: ' },
    { label: 'Add Evidence', template: 'Add evidence to PROB-___:\n- ' },
    { label: 'Update Status', template: 'Update PROB-___ status to validated/rejected/active' },
  ],
  prd: [
    { label: '+ PRD', template: 'Create a new PRD:\n- Title: \n- Problem: PROB-___\n- Goals:\n  1. ' },
    { label: 'Add Goal', template: 'Add a goal to PRD-___:\n- ' },
    { label: 'Approve', template: 'Move PRD-___ to approved status' },
  ],
  stories: [
    { label: '+ Story', template: 'Create a story under PRD-___:\n- Title: \n- Priority: high/medium/low' },
    { label: 'Update Status', template: 'Move STORY-___ to ready/in-progress/done' },
  ],
  design: [
    { label: '+ Token', template: 'Add a new design token:\n- Category: color/spacing/typography/shadow\n- Name: \n- Value: ' },
  ],
  components: [
    { label: '+ Component', template: 'Add a new design component:\n- Name: \n- Type: page/component/pattern' },
    { label: 'Update Status', template: 'Mark DC-___ as ready/implemented' },
  ],
  contracts: [
    { label: '+ REST', template: 'Add a REST endpoint:\n- Method: GET/POST/PUT/DELETE\n- Path: /api/v1/\n- Description: ' },
    { label: '+ GraphQL', template: 'Add a GraphQL operation:\n- Type: Query/Mutation\n- Name: ' },
  ],
  prototype: [
    { label: '+ Screen', template: 'Add a prototype screen:\n- Name: \n- Route: /' },
  ],
  e2e: [
    { label: '+ Test Case', template: 'Add a test case:\n- Title: \n- Type: e2e/integration/unit\n- Steps:\n  1. ' },
  ],
  harness: [
    { label: '+ Script', template: 'Add a test data script:\n- Name: \n- Purpose: ' },
  ],
  development: [
    { label: '+ Module', template: 'Add a code module:\n- Path: src/\n- Type: frontend/backend/shared' },
  ],
  verification: [
    { label: 'Run Verify', template: 'Run full verification for STORY-___' },
  ],
}

const contextHints: Record<WorkflowStepId, string> = {
  problem: 'I can help define problems, add evidence, set severity, or link PRDs.',
  prd: 'I can create PRDs, add goals/non-goals, define success metrics, or link stories.',
  stories: 'I can break down PRDs into stories, set priorities, or update status.',
  design: 'I can create or refine design tokens, typography scales, and spacing systems.',
  components: 'I can add design components, assign them to stories, or update their status.',
  contracts: 'I can define API endpoints, set request/response schemas, or update contract status.',
  prototype: 'I can track prototype screens, update completion, or link to preview URLs.',
  e2e: 'I can create test cases, assign them to stories, or update test status.',
  harness: 'I can set up test data scripts, configure toolchain, or create feedback loops.',
  development: 'I can track code modules, link them to stories, or update implementation status.',
  verification: 'I can run verification, review test results, or trigger re-verification.',
}

/* ── Mock fallback for demo mode ── */
const mockRespond = (step: string) =>
  `This is a prototype — in production, this would route to your configured AI agent with full context of the **${step}** workflow state.`

interface Props {
  activeStep: WorkflowStepId
  processId?: string
}

// Global WS listener registry for chat chunks
type ChunkHandler = (msg: WSMessage) => void
const chatWSHandlers = new Set<ChunkHandler>()

// Hook into the singleton WS (same one hooks.ts uses)
let chatWSSetup = false
function ensureChatWS() {
  if (chatWSSetup || DATA_MODE === 'mock') return
  chatWSSetup = true

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${protocol}//${window.location.host}/ws`

  function connect() {
    const ws = new WebSocket(url)
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage
        if (msg.type === 'chat:chunk' || msg.type === 'chat:done' || msg.type === 'chat:activity') {
          for (const h of chatWSHandlers) h(msg)
        }
      } catch { /* ignore */ }
    }
    ws.onclose = () => setTimeout(connect, 2000)
    ws.onerror = () => ws.close()
  }
  connect()
}

export function ChatPanel({ activeStep, processId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [height, setHeight] = useState(340)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const streamBufferRef = useRef('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)

  // Reset messages when step changes
  useEffect(() => {
    setMessages([{
      id: 'sys-0',
      role: 'system',
      content: contextHints[activeStep],
      timestamp: '',
    }])
    setIsStreaming(false)
    streamBufferRef.current = ''
  }, [activeStep])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  // Register WS handler for streaming chunks
  useEffect(() => {
    ensureChatWS()

    const handler: ChunkHandler = (msg) => {
      if (msg.type === 'chat:chunk') {
        streamBufferRef.current += msg.text
        // Update the last agent message in-place
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.role === 'agent') {
            return [
              ...prev.slice(0, -1),
              { ...last, content: streamBufferRef.current },
            ]
          }
          // First chunk — create agent message
          return [
            ...prev,
            {
              id: String(Date.now()),
              role: 'agent',
              content: streamBufferRef.current,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]
        })
      } else if (msg.type === 'chat:activity') {
        setMessages(prev => {
          // Replace last activity of same family, or append new
          const last = prev[prev.length - 1]
          const actMsg: ChatMessage = {
            id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            role: 'activity',
            content: msg.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            family: msg.family,
            phase: msg.phase,
            toolName: msg.toolName,
          }
          // Collapse consecutive tool-started into one row
          if (last?.role === 'activity' && last.family === msg.family && msg.phase === 'started') {
            return [...prev.slice(0, -1), actMsg]
          }
          return [...prev, actMsg]
        })
      } else if (msg.type === 'chat:done') {
        setIsStreaming(false)
      }
    }

    chatWSHandlers.add(handler)
    return () => { chatWSHandlers.delete(handler) }
  }, [])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)
    streamBufferRef.current = ''

    if (DATA_MODE === 'mock' || !processId) {
      // Mock mode fallback
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: String(Date.now() + 1),
          role: 'agent',
          content: mockRespond(activeStep),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }])
        setIsStreaming(false)
      }, 800)
      return
    }

    // Build history for context (skip system messages)
    const history = newMessages
      .filter(m => m.role === 'user' || m.role === 'agent')
      .slice(0, -1) // exclude the message we're about to send
      .map(m => ({ role: m.role as 'user' | 'agent', content: m.content }))

    try {
      await apiClient.sendChat({
        processId,
        message: input.trim(),
        history,
      })
    } catch (err) {
      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        role: 'agent',
        content: `**Error:** Failed to reach agent. Is \`claude\` CLI installed?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }])
      setIsStreaming(false)
    }
  }, [input, isStreaming, messages, activeStep, processId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startH: height }
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const delta = dragRef.current.startY - ev.clientY
      setHeight(Math.max(200, Math.min(window.innerHeight - 140, dragRef.current.startH + delta)))
    }
    const onUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [height])

  return (
    <>
      {/* Toggle bar */}
      <div className="chat-toggle-bar" onClick={() => { setIsOpen(!isOpen); if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100) }}>
        <div className="chat-toggle-left">
          <MessageSquare size={14} />
          <span className="chat-toggle-title">Agent Chat</span>
          <span className="chat-toggle-hint">{contextHints[activeStep]}</span>
        </div>
        <div className="chat-toggle-right">
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Chat drawer */}
      {isOpen && (
        <div className="chat-drawer" style={{ height }}>
          <div className="chat-drag-handle" onMouseDown={onDragStart}>
            <GripHorizontal size={16} />
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg chat-msg-${msg.role}`}>
                {msg.role === 'activity' ? (
                  <div className="chat-activity-row">
                    <span className="chat-activity-icon">
                      {msg.family === 'tool' ? <Terminal size={11} /> :
                       msg.family === 'reasoning' ? <Zap size={11} /> :
                       msg.family === 'file' ? <FileCode size={11} /> :
                       msg.family === 'error' ? <AlertCircle size={11} /> :
                       <Sparkles size={11} />}
                    </span>
                    <span className="chat-activity-text">{msg.content}</span>
                    {msg.phase === 'started' && <Loader2 size={10} className="chat-typing-spinner" />}
                  </div>
                ) : (
                <>
                {msg.role !== 'system' && (
                  <div className="chat-msg-avatar">
                    {msg.role === 'agent' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                )}
                <div className="chat-msg-body">
                  {msg.role === 'system' ? (
                    <div className="chat-msg-system">
                      <Sparkles size={12} /> {msg.content}
                    </div>
                  ) : (
                    <>
                      <div className="chat-msg-content" dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/`([^`]+)`/g, '<code>$1</code>')
                          .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
                          .replace(/\n/g, '<br/>')
                      }} />
                      {msg.timestamp && (
                        <div className="chat-msg-meta">
                          <span className="chat-msg-time">{msg.timestamp}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                </>
                )}
              </div>
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== 'agent' && (
              <div className="chat-msg chat-msg-agent">
                <div className="chat-msg-avatar"><Bot size={14} /></div>
                <div className="chat-msg-body">
                  <div className="chat-typing">
                    <Loader2 size={14} className="chat-typing-spinner" />
                    Agent is thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Shortcuts */}
          <div className="chat-shortcuts">
            {stepShortcuts[activeStep]?.map(sc => (
              <button
                key={sc.label}
                className="chat-shortcut-btn"
                onClick={() => {
                  setInput(sc.template)
                  setTimeout(() => {
                    const el = inputRef.current
                    if (el) {
                      el.focus()
                      const pos = sc.template.indexOf('___')
                      if (pos >= 0) el.setSelectionRange(pos, pos + 3)
                      else el.setSelectionRange(sc.template.length, sc.template.length)
                      el.style.height = 'auto'
                      el.style.height = el.scrollHeight + 'px'
                    }
                  }, 0)
                }}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message agent about ${activeStep}...`}
              rows={1}
              disabled={isStreaming}
            />
            <button
              className={`chat-send-btn ${input.trim() && !isStreaming ? 'active' : ''}`}
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? <Loader2 size={14} className="chat-typing-spinner" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .chat-toggle-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 20px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          cursor: pointer;
          user-select: none;
          flex-shrink: 0;
          transition: background 0.1s;
        }
        .chat-toggle-bar:hover { background: var(--bg-hover); }
        .chat-toggle-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
        }
        .chat-toggle-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .chat-toggle-hint {
          font-size: 12px;
          color: var(--text-muted);
          max-width: 500px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .chat-toggle-right {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }
        .chat-drawer {
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
          overflow: hidden;
        }
        .chat-drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px 0;
          cursor: row-resize;
          color: var(--text-muted);
          opacity: 0.4;
          transition: opacity 0.1s;
        }
        .chat-drag-handle:hover { opacity: 1; }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chat-msg {
          display: flex;
          gap: 10px;
          max-width: 85%;
          animation: chatFadeIn 0.2s ease;
        }
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-msg-user { align-self: flex-end; flex-direction: row-reverse; }
        .chat-msg-agent { align-self: flex-start; }
        .chat-msg-system {
          align-self: center;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
          padding: 4px 12px;
          background: var(--bg-tertiary);
          border-radius: 12px;
          max-width: 100%;
        }
        .chat-msg-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .chat-msg-user .chat-msg-avatar { background: var(--accent-glow); color: var(--accent); }
        .chat-msg-agent .chat-msg-avatar { background: var(--green-bg); color: var(--green); }
        .chat-msg-body { display: flex; flex-direction: column; gap: 4px; }
        .chat-msg-content {
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-primary);
          padding: 10px 14px;
          border-radius: 12px;
          word-break: break-word;
        }
        .chat-msg-user .chat-msg-content {
          background: var(--accent-dim);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .chat-msg-agent .chat-msg-content {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }
        .chat-msg-content code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          background: rgba(0,0,0,0.2);
          padding: 1px 5px;
          border-radius: 3px;
        }
        .chat-msg-agent .chat-msg-content code {
          background: var(--bg-tertiary);
          color: var(--accent-hover);
        }
        .chat-msg-content pre {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          background: var(--bg-tertiary);
          padding: 8px 10px;
          border-radius: 6px;
          margin: 6px 0;
          overflow-x: auto;
          color: var(--text-secondary);
        }
        .chat-msg-content strong { color: inherit; font-weight: 600; }
        .chat-msg-meta { display: flex; align-items: center; gap: 8px; padding: 0 4px; }
        .chat-msg-time { font-size: 10px; color: var(--text-muted); }
        .chat-typing {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
          padding: 8px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          border-bottom-left-radius: 4px;
        }
        .chat-typing-spinner { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .chat-shortcuts {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px 0;
          overflow-x: auto;
          flex-shrink: 0;
        }
        .chat-shortcuts::-webkit-scrollbar { display: none; }
        .chat-shortcut-btn {
          flex-shrink: 0;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          color: var(--accent);
          background: var(--accent-glow);
          border: 1px solid var(--accent-dim);
          border-radius: 14px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .chat-shortcut-btn:hover { background: var(--accent-dim); color: #fff; }
        .chat-input-area {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 10px 16px 14px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .chat-input {
          flex: 1;
          padding: 8px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 13px;
          font-family: inherit;
          line-height: 1.4;
          resize: none;
          outline: none;
          max-height: 120px;
          transition: border-color 0.15s;
        }
        .chat-input::placeholder { color: var(--text-muted); }
        .chat-input:focus { border-color: var(--accent-dim); }
        .chat-input:disabled { opacity: 0.6; }
        .chat-send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: var(--bg-tertiary);
          color: var(--text-muted);
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .chat-send-btn.active { background: var(--accent); color: white; }
        .chat-send-btn.active:hover { background: var(--accent-hover); }
        .chat-send-btn:disabled { cursor: default; }
        .chat-activity-row {
          display: flex;
          align-items: center;
          gap: 6px;
          align-self: flex-start;
          padding: 3px 10px;
          border-radius: 10px;
          background: var(--bg-tertiary);
          font-size: 11px;
          color: var(--text-muted);
          animation: chatFadeIn 0.15s ease;
          max-width: 100%;
        }
        .chat-activity-icon {
          display: flex;
          align-items: center;
          color: var(--cyan);
          flex-shrink: 0;
        }
        .chat-activity-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </>
  )
}
