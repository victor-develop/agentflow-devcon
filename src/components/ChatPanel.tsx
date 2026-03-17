import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageSquare, ChevronDown, ChevronUp, Send, Paperclip,
  Bot, User, Sparkles, Loader2, GripHorizontal
} from 'lucide-react'
import type { WorkflowStepId } from '../types'

interface ChatMessage {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: string
  action?: { type: string; label: string }
}

/* ── Per-step prompt shortcuts ──────────────────────── */
interface Shortcut {
  label: string
  template: string
}

const stepShortcuts: Record<WorkflowStepId, Shortcut[]> = {
  problem: [
    { label: '+ Problem', template: 'Add a new problem:\n- Title: \n- Severity: major/minor/critical\n- Hypothesis: ' },
    { label: 'Add Evidence', template: 'Add evidence to PROB-___:\n- ' },
    { label: 'Link PRD', template: 'Link PROB-___ to PRD-___' },
    { label: 'Update Status', template: 'Update PROB-___ status to validated/rejected/active' },
  ],
  prd: [
    { label: '+ PRD', template: 'Create a new PRD:\n- Title: \n- Problem: PROB-___\n- Goals:\n  1. ' },
    { label: 'Add Goal', template: 'Add a goal to PRD-___:\n- ' },
    { label: 'Add Non-Goal', template: 'Add a non-goal to PRD-___:\n- ' },
    { label: 'Add Metric', template: 'Add success metric to PRD-___:\n- ' },
    { label: 'Approve', template: 'Move PRD-___ to approved status' },
  ],
  stories: [
    { label: '+ Story', template: 'Create a story under PRD-___:\n- Title: \n- Priority: high/medium/low' },
    { label: 'Update Status', template: 'Move STORY-___ to ready/in-progress/done' },
    { label: 'Add Component', template: 'Add a design component to STORY-___:\n- Name: \n- Type: page/component/pattern' },
    { label: 'Split Story', template: 'Split STORY-___ into smaller stories because: ' },
  ],
  design: [
    { label: '+ Token', template: 'Add a new design token:\n- Category: color/spacing/typography/shadow\n- Name: \n- Value: ' },
    { label: 'Update Scale', template: 'Update the typography/spacing scale:\n- ' },
    { label: 'Review System', template: 'Review the current design system for consistency issues' },
  ],
  components: [
    { label: '+ Component', template: 'Add a new design component:\n- Name: \n- Type: page/component/pattern\n- Story: STORY-___' },
    { label: 'Update Status', template: 'Mark DC-___ as ready/implemented' },
    { label: 'Add Variant', template: 'Add a variant to DC-___:\n- ' },
    { label: 'Review Preview', template: 'Review the preview for DC-___ and suggest improvements' },
  ],
  contracts: [
    { label: '+ REST', template: 'Add a REST endpoint:\n- Method: GET/POST/PUT/DELETE/PATCH\n- Path: /api/v1/\n- Story: STORY-___\n- Description: ' },
    { label: '+ GraphQL', template: 'Add a GraphQL operation:\n- Type: Query/Mutation/Subscription\n- Name: \n- Story: STORY-___\n- Schema:\n```graphql\n\n```' },
    { label: 'Add Schema', template: 'Add request/response schema to API-___:\n```json\n\n```' },
    { label: 'Agree', template: 'Mark API-___ as agreed' },
  ],
  prototype: [
    { label: '+ Screen', template: 'Add a prototype screen:\n- Name: \n- Route: /\n- Components: DC-___, DC-___' },
    { label: 'Update %', template: 'Update prototype completion for ___: ___%' },
    { label: 'Add Preview URL', template: 'Set preview URL for screen ___: https://' },
  ],
  e2e: [
    { label: '+ Test Case', template: 'Add a test case for STORY-___:\n- Title: \n- Type: e2e/integration/unit\n- Steps:\n  1. ' },
    { label: 'Update Status', template: 'Mark TC-___ as ready/passing/failing' },
    { label: 'Add Mock Data', template: 'Add mock data for TC-___:\n```json\n\n```' },
  ],
  harness: [
    { label: '+ Script', template: 'Add a test data script:\n- Name: \n- Purpose: \n- Input: \n- Output: ' },
    { label: '+ Feedback Loop', template: 'Configure AI feedback loop:\n- Trigger: \n- Agent: \n- Validation: ' },
    { label: 'Run Harness', template: 'Run the test harness for STORY-___ and report results' },
  ],
  development: [
    { label: '+ Module', template: 'Add a code module:\n- Path: src/\n- Type: frontend/backend/shared\n- Story: STORY-___\n- Description: ' },
    { label: 'Update Status', template: 'Mark CE-___ implementation as complete' },
    { label: 'Code Review', template: 'Review CE-___ for quality, security, and test coverage' },
  ],
  verification: [
    { label: 'Run Verify', template: 'Run full verification for STORY-___' },
    { label: 'Re-verify', template: 'Re-verify STORY-___ after fixing: ' },
    { label: 'Sign Off', template: 'Sign off STORY-___ as verified and ready for release' },
    { label: 'Report', template: 'Generate a verification report for all stories in PRD-___' },
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

const mockConversations: Record<string, ChatMessage[]> = {
  problem: [
    { id: '1', role: 'system', content: 'Context: Problem Definition — 8 problems tracked', timestamp: '' },
    { id: '2', role: 'user', content: 'We found a new issue — our webhook retry logic has no exponential backoff, causing thundering herd on downstream services during outages.', timestamp: '10:23 AM' },
    { id: '3', role: 'agent', content: 'I\'ll create a new problem entry for this.\n\n**PROB-009: Webhook retry thundering herd**\n- Severity: `major`\n- Status: `draft`\n- Hypothesis: Implementing exponential backoff with jitter will reduce downstream load during outages by 90%.\n\nShall I also add metrics (current retry volume, downstream error rate)?', timestamp: '10:23 AM', action: { type: 'create', label: 'Created PROB-009' } },
    { id: '4', role: 'user', content: 'Yes, and link it to the Integration Hub PRD', timestamp: '10:24 AM' },
    { id: '5', role: 'agent', content: 'Done. Added metrics and linked to PRD-004.\n\n- Retry volume during last outage: **47K req/min**\n- Downstream 5xx rate: **34%**\n- Linked PRD: `PRD-004` (Third-Party Integration Hub)\n\nWant me to also create a story for the backoff implementation?', timestamp: '10:24 AM', action: { type: 'update', label: 'Updated PROB-009 + PRD-004' } },
  ],
  prd: [
    { id: '1', role: 'system', content: 'Context: Product Requirements — 6 PRDs tracked', timestamp: '' },
    { id: '2', role: 'user', content: 'I want to add a new non-goal to PRD-001: we\'re not building a notification template editor', timestamp: '2:15 PM' },
    { id: '3', role: 'agent', content: 'Added to PRD-001 non-goals:\n\n> "Visual notification template editor (use code-based templates)"\n\nPRD-001 now has 4 non-goals. Updated timestamp to today.', timestamp: '2:15 PM', action: { type: 'update', label: 'Updated PRD-001' } },
  ],
  stories: [
    { id: '1', role: 'system', content: 'Context: Story Breakdown — 25 stories across 6 PRDs', timestamp: '' },
    { id: '2', role: 'user', content: 'STORY-004 routing engine is done, all tests passing. Move it to done.', timestamp: '4:30 PM' },
    { id: '3', role: 'agent', content: 'Updated STORY-004 "Notification Routing Engine (Core)":\n- Status: `in-progress` → `done`\n- 3 test cases all `passing`\n- 2 code entries verified\n\nThis was the last blocking story for the routing epic. STORY-005 (templates) and STORY-006 (simulation) are `ready` — want me to move one to `in-progress`?', timestamp: '4:30 PM', action: { type: 'update', label: 'STORY-004 → done' } },
  ],
  contracts: [
    { id: '1', role: 'system', content: 'Context: API Contracts — 29 endpoints tracked', timestamp: '' },
    { id: '2', role: 'user', content: 'Add a PATCH endpoint for partially updating routing rules', timestamp: '11:00 AM' },
    { id: '3', role: 'agent', content: 'Created API-030:\n\n```\nPATCH /api/v1/routing/rules/:id\n```\n\nDescription: Partially update a routing rule (supports condition, action, priority fields)\nStory: `STORY-004`\nStatus: `draft`\n\nWant me to draft the request/response schema?', timestamp: '11:00 AM', action: { type: 'create', label: 'Created API-030' } },
  ],
}

// Default fallback for steps without specific mock conversations
const defaultMessages: ChatMessage[] = [
  { id: '1', role: 'system', content: 'Ready to help with this workflow step.', timestamp: '' },
]

interface Props {
  activeStep: WorkflowStepId
}

export function ChatPanel({ activeStep }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [height, setHeight] = useState(340)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)

  useEffect(() => {
    setMessages(mockConversations[activeStep] || defaultMessages)
  }, [activeStep])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'agent',
        content: `I understand. Let me process that for the **${activeStep}** workflow step.\n\nThis is a prototype — in production, this would route to your configured AI agent (Claude, GPT, etc.) with full context of the current entries and workflow state.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, agentMsg])
      setIsTyping(false)
    }, 1200)
  }

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

  const unreadCount = isOpen ? 0 : (mockConversations[activeStep]?.length || 0)

  return (
    <>
      {/* Toggle bar — always visible */}
      <div className="chat-toggle-bar" onClick={() => { setIsOpen(!isOpen); if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100) }}>
        <div className="chat-toggle-left">
          <MessageSquare size={14} />
          <span className="chat-toggle-title">Agent Chat</span>
          <span className="chat-toggle-hint">{contextHints[activeStep]}</span>
        </div>
        <div className="chat-toggle-right">
          {!isOpen && unreadCount > 0 && (
            <span className="chat-unread">{unreadCount}</span>
          )}
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Chat drawer */}
      {isOpen && (
        <div className="chat-drawer" style={{ height }}>
          {/* Drag handle */}
          <div className="chat-drag-handle" onMouseDown={onDragStart}>
            <GripHorizontal size={16} />
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg chat-msg-${msg.role}`}>
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
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/`([^`]+)`/g, '<code>$1</code>')
                          .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
                          .replace(/\n/g, '<br/>')
                          .replace(/&gt; (.*?)(<br\/>|$)/g, '<blockquote>$1</blockquote>')
                      }} />
                      <div className="chat-msg-meta">
                        <span className="chat-msg-time">{msg.timestamp}</span>
                        {msg.action && (
                          <span className={`chat-msg-action action-${msg.action.type}`}>
                            {msg.action.label}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
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
                      // place cursor at first blank (___) or end
                      const pos = sc.template.indexOf('___')
                      if (pos >= 0) {
                        el.setSelectionRange(pos, pos + 3)
                      } else {
                        el.setSelectionRange(sc.template.length, sc.template.length)
                      }
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
            <button className="chat-attach-btn" title="Attach file">
              <Paperclip size={14} />
            </button>
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message agent about ${activeStep}...`}
              rows={1}
            />
            <button
              className={`chat-send-btn ${input.trim() ? 'active' : ''}`}
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send size={14} />
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
        .chat-toggle-bar:hover {
          background: var(--bg-hover);
        }
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
        .chat-unread {
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: var(--accent);
          color: white;
          padding: 0 5px;
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
        .chat-msg-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .chat-msg-agent {
          align-self: flex-start;
        }
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
        .chat-msg-user .chat-msg-avatar {
          background: var(--accent-glow);
          color: var(--accent);
        }
        .chat-msg-agent .chat-msg-avatar {
          background: var(--green-bg);
          color: var(--green);
        }

        .chat-msg-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
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
        .chat-msg-content blockquote {
          border-left: 2px solid var(--accent);
          padding-left: 10px;
          margin: 4px 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        .chat-msg-content strong {
          color: inherit;
          font-weight: 600;
        }

        .chat-msg-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 4px;
        }
        .chat-msg-time {
          font-size: 10px;
          color: var(--text-muted);
        }
        .chat-msg-action {
          font-size: 10px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 3px;
        }
        .action-create {
          background: var(--green-bg);
          color: var(--green);
        }
        .action-update {
          background: var(--cyan-bg);
          color: var(--cyan);
        }
        .action-delete {
          background: rgba(239,68,68,0.1);
          color: var(--red);
        }

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
        .chat-typing-spinner {
          animation: spin 1s linear infinite;
        }
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
        .chat-shortcut-btn:hover {
          background: var(--accent-dim);
          color: #fff;
        }

        .chat-input-area {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 10px 16px 14px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .chat-attach-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: none;
          color: var(--text-muted);
          flex-shrink: 0;
          transition: all 0.1s;
        }
        .chat-attach-btn:hover {
          background: var(--bg-hover);
          color: var(--text-secondary);
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
        .chat-input::placeholder {
          color: var(--text-muted);
        }
        .chat-input:focus {
          border-color: var(--accent-dim);
        }
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
        .chat-send-btn.active {
          background: var(--accent);
          color: white;
        }
        .chat-send-btn.active:hover {
          background: var(--accent-hover);
        }
        .chat-send-btn:disabled {
          cursor: default;
        }
      `}</style>
    </>
  )
}
