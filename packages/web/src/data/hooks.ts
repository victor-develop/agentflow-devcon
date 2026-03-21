import { useState, useEffect, useCallback, useRef } from 'react'
import { dataClient } from './client'
import { DATA_MODE } from './config'
import type {
  FlowConfig,
  ProcessData,
  Entity,
  EntityRelations,
  SearchResult,
  ChangelogEntry,
  WSMessage,
} from '@agentflow-devcon/shared'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: Error | null }>({
    data: null, loading: true, error: null,
  })
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    fetcher()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }) })
      .catch((error: Error) => { if (!cancelled) setState({ data: null, loading: false, error }) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...state, refetch }
}

// ── WebSocket singleton ──

type WSHandler = (msg: WSMessage) => void
const wsListeners = new Set<WSHandler>()
let wsInstance: WebSocket | null = null
let wsConnecting = false

function ensureWebSocket() {
  if (DATA_MODE === 'mock' || wsInstance || wsConnecting) return
  wsConnecting = true

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${protocol}//${window.location.host}/ws`
  const ws = new WebSocket(url)

  ws.onopen = () => {
    wsInstance = ws
    wsConnecting = false
  }
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as WSMessage
      for (const handler of wsListeners) handler(msg)
    } catch { /* ignore */ }
  }
  ws.onclose = () => {
    wsInstance = null
    wsConnecting = false
    setTimeout(ensureWebSocket, 2000)
  }
  ws.onerror = () => ws.close()
}

function useWSListener(handler: WSHandler) {
  const ref = useRef(handler)
  ref.current = handler

  useEffect(() => {
    ensureWebSocket()
    const wrapped: WSHandler = (msg) => ref.current(msg)
    wsListeners.add(wrapped)
    return () => { wsListeners.delete(wrapped) }
  }, [])
}

// ── Hooks ──

export function useFlowTopology() {
  const state = useAsync<FlowConfig>(() => dataClient.getFlow(), [])

  useWSListener((msg) => {
    if (msg.type === 'flow:updated') state.refetch()
  })

  return state
}

export function useProcessData(processId: string | null) {
  const state = useAsync<ProcessData>(
    () => processId ? dataClient.getProcess(processId) : Promise.resolve({ schema: {} as ProcessData['schema'], items: [] }),
    [processId],
  )

  useWSListener((msg) => {
    if (!processId) return
    if (
      (msg.type === 'item:created' && msg.processId === processId) ||
      (msg.type === 'item:updated' && msg.processId === processId) ||
      (msg.type === 'item:deleted' && msg.processId === processId) ||
      (msg.type === 'schema:updated' && msg.processId === processId)
    ) {
      state.refetch()
    }
  })

  return state
}

export function useEntity(processId: string | null, itemId: string | null) {
  const state = useAsync<Entity>(
    () => processId && itemId ? dataClient.getItem(processId, itemId) : Promise.resolve({ id: '' }),
    [processId, itemId],
  )

  useWSListener((msg) => {
    if (!processId || !itemId) return
    if (msg.type === 'item:updated' && msg.processId === processId && msg.itemId === itemId) {
      state.refetch()
    }
  })

  return state
}

export function useRelations(entityId: string | null) {
  const state = useAsync<EntityRelations>(
    () => entityId ? dataClient.getRelations(entityId) : Promise.resolve({ outgoing: [], incoming: [] }),
    [entityId],
  )

  useWSListener((msg) => {
    if (!entityId) return
    if (msg.type === 'relation:created' || msg.type === 'relation:deleted') {
      state.refetch()
    }
  })

  return state
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
