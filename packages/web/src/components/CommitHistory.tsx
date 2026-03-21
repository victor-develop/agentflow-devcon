import { useState } from 'react'
import { GitCommitHorizontal, ChevronRight, Plus, Minus, ArrowRight } from 'lucide-react'
import { getCommitHistory } from '../mockCommits'
import type { FieldChange } from '../types'

interface Props {
  itemId: string
}

function ChangeIcon({ type }: { type: FieldChange['type'] }) {
  switch (type) {
    case 'added': case 'created': return <Plus size={10} />
    case 'removed': return <Minus size={10} />
    case 'changed': return <ArrowRight size={10} />
  }
}

function changeColor(type: FieldChange['type']) {
  switch (type) {
    case 'added': case 'created': return 'var(--green)'
    case 'removed': return 'var(--red)'
    case 'changed': return 'var(--cyan)'
  }
}

export function CommitHistory({ itemId }: Props) {
  const commits = getCommitHistory(itemId)
  const [expandedCommit, setExpandedCommit] = useState<string | null>(null)

  if (commits.length === 0) return null

  return (
    <div className="commit-history">
      <div className="commit-timeline">
        {commits.map((commit, i) => (
          <div key={commit.hash} className="commit-entry">
            {/* Timeline line */}
            <div className="commit-timeline-track">
              <div className={`commit-dot ${i === 0 ? 'latest' : ''}`}>
                <GitCommitHorizontal size={12} />
              </div>
              {i < commits.length - 1 && <div className="commit-line" />}
            </div>

            {/* Content */}
            <div className="commit-content">
              <div
                className="commit-header"
                onClick={() => setExpandedCommit(expandedCommit === commit.hash ? null : commit.hash)}
              >
                <div className="commit-header-left">
                  <span className="commit-hash">{commit.hash}</span>
                  <span className="commit-message">{commit.message}</span>
                </div>
                <div className="commit-header-right">
                  <span className="commit-author">{commit.author}</span>
                  <span className="commit-date">{commit.date}</span>
                  {commit.changes.length > 0 && (
                    <ChevronRight
                      size={12}
                      className={`expand-icon ${expandedCommit === commit.hash ? 'expanded' : ''}`}
                    />
                  )}
                </div>
              </div>

              {expandedCommit === commit.hash && commit.changes.length > 0 && (
                <div className="commit-changes">
                  {commit.changes.map((change, j) => (
                    <div key={j} className="commit-change">
                      <span className="change-icon" style={{ color: changeColor(change.type) }}>
                        <ChangeIcon type={change.type} />
                      </span>
                      <span className="change-field">{change.field}</span>
                      {change.type === 'changed' && change.from && (
                        <>
                          <span className="change-from">{change.from}</span>
                          <ArrowRight size={10} className="change-arrow" />
                        </>
                      )}
                      {change.to && (
                        <span className={`change-to ${change.type === 'removed' ? 'removed' : ''}`}>
                          {change.to}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .commit-history {
          margin-top: 12px;
        }
        .commit-timeline {
          display: flex;
          flex-direction: column;
        }
        .commit-entry {
          display: flex;
          gap: 12px;
          min-height: 36px;
        }
        .commit-timeline-track {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
          flex-shrink: 0;
        }
        .commit-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          color: var(--text-muted);
          flex-shrink: 0;
          z-index: 1;
        }
        .commit-dot.latest {
          background: var(--accent-glow);
          color: var(--accent);
        }
        .commit-line {
          width: 1px;
          flex: 1;
          background: var(--border);
          min-height: 8px;
        }
        .commit-content {
          flex: 1;
          min-width: 0;
          padding-bottom: 10px;
        }
        .commit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          cursor: pointer;
          padding: 4px 8px;
          margin: -4px -8px;
          border-radius: 6px;
          transition: background 0.1s;
        }
        .commit-header:hover {
          background: var(--bg-hover);
        }
        .commit-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .commit-hash {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--accent-hover);
          background: var(--accent-glow);
          padding: 1px 6px;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .commit-message {
          font-size: 12px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .commit-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .commit-author {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .commit-date {
          font-size: 11px;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }
        .commit-changes {
          margin-top: 6px;
          padding: 8px 10px;
          background: var(--bg-tertiary);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .commit-change {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          line-height: 1.4;
        }
        .change-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          width: 14px;
          height: 14px;
          border-radius: 3px;
          justify-content: center;
        }
        .change-field {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }
        .change-from {
          color: var(--text-muted);
          text-decoration: line-through;
          font-size: 11px;
        }
        .change-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .change-to {
          color: var(--text-primary);
          font-size: 11px;
        }
        .change-to.removed {
          color: var(--red);
          text-decoration: line-through;
        }
      `}</style>
    </div>
  )
}

/* Inline trigger button */
export function HistoryToggle({ itemId, isOpen, onToggle }: { itemId: string; isOpen: boolean; onToggle: () => void }) {
  const commits = getCommitHistory(itemId)
  return (
    <button
      className="history-toggle"
      onClick={e => { e.stopPropagation(); onToggle() }}
      title={`${commits.length} commits`}
    >
      <GitCommitHorizontal size={12} />
      <span>{commits.length}</span>
      <style>{`
        .history-toggle {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: ${isOpen ? 'var(--accent-glow)' : 'var(--bg-tertiary)'};
          border: 1px solid ${isOpen ? 'var(--accent-dim)' : 'var(--border)'};
          border-radius: 4px;
          color: ${isOpen ? 'var(--accent)' : 'var(--text-muted)'};
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          transition: all 0.1s;
        }
        .history-toggle:hover {
          background: var(--accent-glow);
          border-color: var(--accent-dim);
          color: var(--accent);
        }
      `}</style>
    </button>
  )
}
