import { useState, useEffect, useCallback } from 'react'
import { dataClient } from './client'
import type {
  FlowConfig,
  ProcessData,
  Entity,
  EntityRelations,
  SearchResult,
  ChangelogEntry,
} from '@agentflow-devcon/shared'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    fetcher()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }) })
      .catch((error: Error) => { if (!cancelled) setState({ data: null, loading: false, error }) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

export function useFlowTopology() {
  return useAsync<FlowConfig>(() => dataClient.getFlow(), [])
}

export function useProcessData(processId: string | null) {
  return useAsync<ProcessData>(
    () => processId ? dataClient.getProcess(processId) : Promise.resolve({ schema: {} as ProcessData['schema'], items: [] }),
    [processId],
  )
}

export function useEntity(processId: string | null, itemId: string | null) {
  return useAsync<Entity>(
    () => processId && itemId ? dataClient.getItem(processId, itemId) : Promise.resolve({ id: '' }),
    [processId, itemId],
  )
}

export function useRelations(entityId: string | null) {
  return useAsync<EntityRelations>(
    () => entityId ? dataClient.getRelations(entityId) : Promise.resolve({ outgoing: [], incoming: [] }),
    [entityId],
  )
}

export function useChangelog(processId: string | null, itemId: string | null) {
  return useAsync<ChangelogEntry[]>(
    () => processId && itemId ? dataClient.getChangelog(processId, itemId) : Promise.resolve([]),
    [processId, itemId],
  )
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const r = await dataClient.search(query)
      setResults(r)
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, search }
}
