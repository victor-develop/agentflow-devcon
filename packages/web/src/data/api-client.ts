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

  search: (query: string) =>
    fetchJSON<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(query)}`).then(
      (r) => r.results,
    ),
}
