import type {
  FlowConfig,
  ProcessData,
  Entity,
  EntityRelations,
  SearchResult,
  ChangelogEntry,
} from '@agentflow-devcon/shared'

const BASE = ''

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export interface ChatRequest {
  processId: string
  message: string
  history?: Array<{ role: 'user' | 'agent'; content: string }>
}

export const apiClient = {
  getFlow: () => fetchJSON<FlowConfig>('/api/flow'),

  getProcess: (processId: string) =>
    fetchJSON<ProcessData>(`/api/processes/${processId}`),

  getItem: (processId: string, itemId: string) =>
    fetchJSON<Entity>(`/api/processes/${processId}/items/${itemId}`),

  getChangelog: (processId: string, itemId: string) =>
    fetchJSON<{ entries: ChangelogEntry[] }>(
      `/api/processes/${processId}/items/${itemId}/changelog`,
    ).then((r) => r.entries),

  getRelations: (entityId: string) =>
    fetchJSON<EntityRelations>(`/api/relations?entity=${entityId}`),

  locate: (itemId: string) =>
    fetchJSON<{ processId: string }>(`/api/locate/${itemId}`),

  search: (query: string) =>
    fetchJSON<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(query)}`).then(
      (r) => r.results,
    ),

  sendChat: async (req: ChatRequest) => {
    const res = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error(`Chat API ${res.status}`)
    return res.json() as Promise<{ ok: boolean }>
  },
}
