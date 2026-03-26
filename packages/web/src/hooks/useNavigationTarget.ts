import { useEffect, useRef } from 'react'
import { useNavigation } from '../NavigationContext'

/**
 * Reacts to cross-view navigation by jumping to the correct page
 * and scrolling/highlighting the target item.
 */
export function useNavigationTarget<T extends { id: string }>(
  allItems: T[],
  filteredItems: T[],
  pageSize: number,
  setPage: (page: number) => void,
  setSearch: (s: string) => void,
  setActiveFilters: (f: string[]) => void,
  setExpanded?: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void,
) {
  const { targetItemId, targetGeneration } = useNavigation()
  const lastHandledGen = useRef(0)

  useEffect(() => {
    if (!targetItemId || targetGeneration <= lastHandledGen.current) return
    lastHandledGen.current = targetGeneration

    // Try in filtered list first
    let idx = filteredItems.findIndex(item => item.id === targetItemId)
    if (idx === -1) {
      // Item filtered out — clear filters and search, find in all items
      const allIdx = allItems.findIndex(item => item.id === targetItemId)
      if (allIdx === -1) return
      setSearch('')
      setActiveFilters([])
      idx = allIdx
    }

    const targetPage = Math.floor(idx / pageSize) + 1
    setPage(targetPage)
    setExpanded?.(prev => ({ ...prev, [targetItemId]: true }))

    // Scroll after DOM updates
    setTimeout(() => {
      const el = document.getElementById(`item-${targetItemId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('highlight-flash')
        setTimeout(() => el.classList.remove('highlight-flash'), 2000)
      }
    }, 50)
  }, [targetItemId, targetGeneration, filteredItems, allItems, pageSize, setPage, setSearch, setActiveFilters, setExpanded])
}
