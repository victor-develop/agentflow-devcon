import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface Props {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage, totalPages, pageSize, totalItems,
  onPageChange, onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: Props) {
  if (totalItems <= pageSizeOptions[0]) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="pagination-select"
          >
            {pageSizeOptions.map(s => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        )}
        <span className="pagination-range">{start}–{end} of {totalItems}</span>
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          title="First"
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="pagination-dots">...</span>
          ) : (
            <button
              key={p}
              className={`pagination-btn pagination-page ${p === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next"
        >
          <ChevronRight size={14} />
        </button>
        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Last"
        >
          <ChevronsRight size={14} />
        </button>
      </div>

      <style>{`
        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          margin-top: 8px;
          border-top: 1px solid var(--border);
        }
        .pagination-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pagination-range {
          font-size: 12px;
          color: var(--text-muted);
        }
        .pagination-select {
          padding: 4px 8px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-secondary);
          font-size: 12px;
          font-family: inherit;
          outline: none;
          cursor: pointer;
        }
        .pagination-select:focus {
          border-color: var(--accent-dim);
        }
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          padding: 0 4px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-secondary);
          font-size: 12px;
          font-family: inherit;
          transition: all 0.1s;
        }
        .pagination-btn:hover:not(:disabled) {
          background: var(--bg-hover);
          border-color: var(--text-muted);
        }
        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: default;
        }
        .pagination-page.active {
          background: var(--accent-glow);
          border-color: var(--accent-dim);
          color: var(--accent);
          font-weight: 600;
        }
        .pagination-dots {
          color: var(--text-muted);
          font-size: 12px;
          padding: 0 2px;
        }
      `}</style>
    </div>
  )
}
