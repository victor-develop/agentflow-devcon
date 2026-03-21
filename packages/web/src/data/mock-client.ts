/**
 * Mock adapter — wraps existing mockData.ts to match the API client interface.
 * Used for GitHub Pages demo mode (no CLI server).
 */
import type {
  FlowConfig,
  LaneConfig,
  ProcessData,
  Entity,
  EntityRelations,
  SearchResult,
  ChangelogEntry,
  ProcessSchema,
} from '@agentflow-devcon/shared'
import { workflowSteps, mockProblems, mockPRDs, mockContracts } from '../mockData'
import { mockCommitHistory } from '../mockCommits'

// Build a minimal FlowConfig from workflowSteps
function buildMockFlow(): FlowConfig {
  const phaseMap = new Map<string, LaneConfig>()

  for (const step of workflowSteps) {
    if (!phaseMap.has(step.phase)) {
      phaseMap.set(step.phase, {
        id: step.phase,
        label: step.phase.charAt(0).toUpperCase() + step.phase.slice(1),
        phase: step.phase,
        processes: [],
      })
    }
    phaseMap.get(step.phase)!.processes.push({
      id: step.id,
      label: step.label,
      shortLabel: step.shortLabel,
    })
  }

  return { lanes: Array.from(phaseMap.values()) }
}

// Minimal schema stubs for mock mode
const mockSchemas: Record<string, ProcessSchema> = {
  problem: {
    entity: 'Problem',
    primaryField: 'title',
    display: { listTitle: 'title', listBadges: ['status', 'severity'] },
    fields: {
      title: { type: 'string', searchable: true, display: 'heading' },
      status: { type: 'enum', values: ['draft', 'validated', 'rejected', 'active'], filterable: true, display: 'badge' },
      severity: { type: 'enum', values: ['critical', 'major', 'minor'], filterable: true, display: 'badge' },
      statement: { type: 'text', searchable: true, display: 'block' },
    },
  },
  stories: {
    entity: 'Story',
    primaryField: 'title',
    display: { listTitle: 'title', listBadges: ['status', 'priority'] },
    fields: {
      title: { type: 'string', searchable: true, display: 'heading' },
      status: { type: 'enum', values: ['draft', 'ready', 'in-progress', 'done'], filterable: true, display: 'badge' },
      priority: { type: 'enum', values: ['high', 'medium', 'low'], filterable: true, display: 'badge' },
    },
  },
  contracts: {
    entity: 'ApiContract',
    primaryField: 'endpoint',
    display: { listTitle: 'endpoint', listBadges: ['protocol', 'method', 'status'] },
    fields: {
      endpoint: { type: 'string', searchable: true, display: 'heading' },
      protocol: { type: 'enum', values: ['rest', 'graphql'], filterable: true, display: 'badge' },
      method: { type: 'enum', values: ['GET', 'POST', 'PUT', 'DELETE', 'QUERY', 'MUTATION'], filterable: true, display: 'badge' },
      status: { type: 'enum', values: ['draft', 'agreed', 'implemented'], filterable: true, display: 'badge' },
    },
  },
}

// Extract stories from PRDs (they're nested in mock data)
const allStories = mockPRDs.flatMap((prd) => prd.stories)

function getItems(processId: string): Entity[] {
  switch (processId) {
    case 'problem': return mockProblems as unknown as Entity[]
    case 'stories': return allStories as unknown as Entity[]
    case 'contracts': return mockContracts as unknown as Entity[]
    case 'prd': return mockPRDs as unknown as Entity[]
    default: return []
  }
}

export const mockClient = {
  getFlow: async (): Promise<FlowConfig> => buildMockFlow(),

  getProcess: async (processId: string): Promise<ProcessData> => ({
    schema: mockSchemas[processId] ?? {
      entity: processId,
      primaryField: 'title',
      display: { listTitle: 'title', listBadges: [] },
      fields: {},
    },
    items: getItems(processId),
  }),

  getItem: async (processId: string, itemId: string): Promise<Entity> => {
    const items = getItems(processId)
    return items.find((i) => i.id === itemId) ?? { id: itemId }
  },

  getChangelog: async (_processId: string, itemId: string): Promise<ChangelogEntry[]> => {
    const commits = mockCommitHistory[itemId] ?? Object.values(mockCommitHistory)[0] ?? []
    return commits.map((c) => ({
      date: c.date,
      author: c.author,
      message: c.message,
      changes: c.changes,
    }))
  },

  getRelations: async (_entityId: string): Promise<EntityRelations> => ({
    outgoing: [],
    incoming: [],
  }),

  search: async (query: string): Promise<SearchResult[]> => {
    const q = query.toLowerCase()
    const results: SearchResult[] = []
    for (const [processId, items] of Object.entries({ problem: mockProblems, stories: allStories, contracts: mockContracts })) {
      for (const item of items) {
        const title = ('title' in item ? item.title : 'endpoint' in item ? item.endpoint : '') as string
        if (title.toLowerCase().includes(q)) {
          results.push({ id: item.id, processId, title, score: 1 })
        }
      }
    }
    return results
  },
}
