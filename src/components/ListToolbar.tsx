import { useState } from 'react'
import { Search, SlidersHorizontal, LayoutList, LayoutGrid, ArrowUpDown } from 'lucide-react'

export type ViewMode = 'expanded' | 'compact'
export type SortOption = { label: string; value: string }
export type FilterChip = { label: string; value: string; count: number; color?: string }

interface Props {
  search: string
  onSearchChange: (v: string) => void
  filters: FilterChip[]
  activeFilters: string[]
  onFilterToggle: (value: string) => void
  sortOptions?: SortOption[]
  activeSort?: string
  onSortChange?: (value: string) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  totalCount: number
  filteredCount: number
  placeholder?: string
}

export function ListToolbar({
  search, onSearchChange,
  filters, activeFilters, onFilterToggle,
  sortOptions, activeSort, onSortChange,
  viewMode, onViewModeChange,
  totalCount, filteredCount,
  placeholder = 'Search...',
}: Props) {
  const [showSort, setShowSort] = useState(false)

  return (
    <div className="list-toolbar">
      <div className="toolbar-row">
        <div className="toolbar-search">
          <Search size={14} className="toolbar-search-icon" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="toolbar-search-input"
          />
          {search && (
            <button className="toolbar-clear" onClick={() => onSearchChange('')}>
              &times;
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          <span className="toolbar-count">
            {filteredCount === totalCount
              ? `${totalCount} items`
              : `${filteredCount} of ${totalCount}`}
          </span>

          {sortOptions && onSortChange && (
            <div className="toolbar-sort-wrap">
              <button
                className="toolbar-btn"
                onClick={() => setShowSort(!showSort)}
                title="Sort"
              >
                <ArrowUpDown size={14} />
              </button>
              {showSort && (
                <div className="toolbar-dropdown">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`toolbar-dropdown-item ${activeSort === opt.value ? 'active' : ''}`}
                      onClick={() => { onSortChange(opt.value); setShowSort(false) }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode && onViewModeChange && (
            <div className="toolbar-view-toggle">
              <button
                className={`toolbar-btn ${viewMode === 'expanded' ? 'active' : ''}`}
                onClick={() => onViewModeChange('expanded')}
                title="Expanded view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                className={`toolbar-btn ${viewMode === 'compact' ? 'active' : ''}`}
                onClick={() => onViewModeChange('compact')}
                title="Compact view"
              >
                <LayoutList size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {filters.length > 0 && (
        <div className="toolbar-filters">
          <SlidersHorizontal size={12} className="toolbar-filter-icon" />
          {filters.map(f => (
            <button
              key={f.value}
              className={`toolbar-chip ${activeFilters.includes(f.value) ? 'active' : ''}`}
              onClick={() => onFilterToggle(f.value)}
              style={activeFilters.includes(f.value) && f.color
                ? { borderColor: f.color, background: `${f.color}15`, color: f.color }
                : undefined
              }
            >
              {f.label}
              <span className="toolbar-chip-count">{f.count}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        .list-toolbar {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .toolbar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .toolbar-search {
          flex: 1;
          position: relative;
          max-width: 400px;
        }
        .toolbar-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .toolbar-search-input {
          width: 100%;
          padding: 7px 32px 7px 32px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
        }
        .toolbar-search-input::placeholder {
          color: var(--text-muted);
        }
        .toolbar-search-input:focus {
          border-color: var(--accent-dim);
        }
        .toolbar-clear {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 16px;
          padding: 2px 6px;
          border-radius: 4px;
          line-height: 1;
        }
        .toolbar-clear:hover { color: var(--text-primary); }
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }
        .toolbar-count {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-muted);
          transition: all 0.1s;
        }
        .toolbar-btn:hover {
          background: var(--bg-hover);
          color: var(--text-secondary);
        }
        .toolbar-btn.active {
          background: var(--accent-glow);
          border-color: var(--accent-dim);
          color: var(--accent);
        }
        .toolbar-view-toggle {
          display: flex;
          gap: 2px;
          background: var(--bg-tertiary);
          border-radius: 6px;
          padding: 2px;
        }
        .toolbar-view-toggle .toolbar-btn {
          border: none;
          background: transparent;
          border-radius: 4px;
        }
        .toolbar-view-toggle .toolbar-btn.active {
          background: var(--accent-glow);
        }
        .toolbar-sort-wrap {
          position: relative;
        }
        .toolbar-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 4px;
          z-index: 100;
          min-width: 160px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .toolbar-dropdown-item {
          display: block;
          width: 100%;
          padding: 7px 12px;
          background: none;
          border: none;
          border-radius: 4px;
          color: var(--text-secondary);
          font-size: 13px;
          text-align: left;
          font-family: inherit;
        }
        .toolbar-dropdown-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .toolbar-dropdown-item.active {
          color: var(--accent);
          background: var(--accent-glow);
        }
        .toolbar-filters {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .toolbar-filter-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .toolbar-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          color: var(--text-secondary);
          font-size: 12px;
          font-family: inherit;
          transition: all 0.1s;
        }
        .toolbar-chip:hover {
          background: var(--bg-hover);
          border-color: var(--text-muted);
        }
        .toolbar-chip.active {
          background: var(--accent-glow);
          border-color: var(--accent-dim);
          color: var(--accent);
        }
        .toolbar-chip-count {
          font-size: 10px;
          font-weight: 600;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--bg-tertiary);
        }
        .toolbar-chip.active .toolbar-chip-count {
          background: rgba(99,102,241,0.2);
        }
      `}</style>
    </div>
  )
}
