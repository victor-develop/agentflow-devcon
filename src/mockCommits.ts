import type { CommitEntry } from './types'

// Keyed by item ID (PROB-xxx, PRD-xxx, STORY-xxx, DC-xxx, TC-xxx, API-xxx, CE-xxx)
export const mockCommitHistory: Record<string, CommitEntry[]> = {
  'PROB-001': [
    {
      hash: 'a3f7c21', message: 'Define notification fatigue problem', author: 'PM Agent (Claude)',
      date: '2024-01-15 09:12',
      changes: [
        { field: 'problem', type: 'created', to: 'PROB-001' },
        { field: 'severity', type: 'added', to: 'major' },
        { field: 'statement', type: 'added', to: 'Users receive too many irrelevant notifications...' },
      ],
    },
    {
      hash: 'b8e1d44', message: 'Upgrade severity after P0 incident analysis', author: 'PM Agent (Claude)',
      date: '2024-01-20 14:30',
      changes: [
        { field: 'severity', type: 'changed', from: 'major', to: 'critical' },
        { field: 'evidence', type: 'added', to: 'Incident post-mortem analysis: 15 of 23 missed P0s...' },
      ],
    },
    {
      hash: 'c2d9f67', message: 'Add hypothesis and supporting metrics', author: 'PM Agent (Claude)',
      date: '2024-01-22 11:05',
      changes: [
        { field: 'hypothesis', type: 'added', to: 'By implementing intelligent notification routing...' },
        { field: 'metrics', type: 'added', to: '4 metrics added' },
        { field: 'status', type: 'changed', from: 'draft', to: 'active' },
      ],
    },
    {
      hash: 'e5a3b12', message: 'Link PRD-001', author: 'PM Agent (Claude)',
      date: '2024-01-25 16:44',
      changes: [
        { field: 'prdIds', type: 'added', to: 'PRD-001' },
      ],
    },
  ],
  'PROB-002': [
    {
      hash: 'f1c8e33', message: 'Define observability gap problem', author: 'Ops Lead Agent',
      date: '2024-02-03 10:00',
      changes: [
        { field: 'problem', type: 'created', to: 'PROB-002' },
        { field: 'severity', type: 'added', to: 'major' },
      ],
    },
    {
      hash: 'g7d2a91', message: 'Add Slack outage as evidence', author: 'Ops Lead Agent',
      date: '2024-02-05 09:20',
      changes: [
        { field: 'evidence', type: 'added', to: 'Last outage took 2.5h to identify root cause (Slack token expiry)' },
        { field: 'status', type: 'changed', from: 'draft', to: 'active' },
      ],
    },
  ],
  'PROB-005': [
    {
      hash: 'h9f4c55', message: 'Flag plaintext token storage from security audit', author: 'Security Agent',
      date: '2024-03-01 08:00',
      changes: [
        { field: 'problem', type: 'created', to: 'PROB-005' },
        { field: 'severity', type: 'added', to: 'critical' },
        { field: 'status', type: 'added', to: 'active' },
      ],
    },
  ],
  'PRD-001': [
    {
      hash: 'd4f1a88', message: 'Draft PRD for notification routing', author: 'PM Agent (Claude)',
      date: '2024-01-20 10:30',
      changes: [
        { field: 'prd', type: 'created', to: 'PRD-001' },
        { field: 'goals', type: 'added', to: '4 goals defined' },
        { field: 'nonGoals', type: 'added', to: '3 non-goals defined' },
      ],
    },
    {
      hash: 'e9b2c76', message: 'Add success metrics from stakeholder review', author: 'PM Agent (Claude)',
      date: '2024-01-28 15:12',
      changes: [
        { field: 'successMetrics', type: 'added', to: '4 metrics added' },
        { field: 'status', type: 'changed', from: 'draft', to: 'review' },
      ],
    },
    {
      hash: 'f3a7d19', message: 'Approve PRD after leadership sign-off', author: 'PM Agent (Claude)',
      date: '2024-02-05 09:00',
      changes: [
        { field: 'status', type: 'changed', from: 'review', to: 'approved' },
      ],
    },
    {
      hash: 'a1c4e55', message: 'Link 14 stories from breakdown', author: 'PM Agent (Claude)',
      date: '2024-02-10 13:45',
      changes: [
        { field: 'stories', type: 'added', to: '14 stories linked' },
      ],
    },
  ],
  'PRD-003': [
    {
      hash: 'j2k8m11', message: 'Draft self-serve onboarding PRD', author: 'PM Agent (Claude)',
      date: '2024-02-25 11:00',
      changes: [
        { field: 'prd', type: 'created', to: 'PRD-003' },
        { field: 'status', type: 'added', to: 'draft' },
      ],
    },
    {
      hash: 'k5n9p22', message: 'Submit for review with updated goals', author: 'PM Agent (Claude)',
      date: '2024-03-08 14:20',
      changes: [
        { field: 'goals', type: 'changed', from: '3 goals', to: '4 goals (added audit log)' },
        { field: 'status', type: 'changed', from: 'draft', to: 'review' },
      ],
    },
  ],
  'STORY-001': [
    {
      hash: 'g1h5j33', message: 'Create preferences panel story', author: 'PM Agent (Claude)',
      date: '2024-02-10 14:00',
      changes: [
        { field: 'story', type: 'created', to: 'STORY-001' },
        { field: 'priority', type: 'added', to: 'high' },
      ],
    },
    {
      hash: 'h4i8k44', message: 'Assign 4 design components', author: 'Design Agent',
      date: '2024-02-12 10:30',
      changes: [
        { field: 'designComponents', type: 'added', to: 'PreferencesPage, ChannelToggleCard, QuietHoursScheduler, PriorityMatrix' },
      ],
    },
    {
      hash: 'i7j1l55', message: 'Add 3 test cases', author: 'QA Agent',
      date: '2024-02-15 16:20',
      changes: [
        { field: 'testCases', type: 'added', to: '3 e2e/integration test cases' },
      ],
    },
    {
      hash: 'j2k4m66', message: 'Start implementation', author: 'Dev Agent (Claude)',
      date: '2024-02-20 09:00',
      changes: [
        { field: 'status', type: 'changed', from: 'ready', to: 'in-progress' },
        { field: 'codeEntries', type: 'added', to: 'PreferencesPanel.tsx, preferences.ts, preferences.ts (server)' },
      ],
    },
    {
      hash: 'p8q2r99', message: 'All tests passing, mark done', author: 'Dev Agent (Claude)',
      date: '2024-03-05 17:30',
      changes: [
        { field: 'status', type: 'changed', from: 'in-progress', to: 'done' },
        { field: 'testCases', type: 'changed', from: '1 passing, 2 draft', to: '3 passing' },
      ],
    },
  ],
  'STORY-004': [
    {
      hash: 'k5l8n77', message: 'Create routing engine story from PRD-001', author: 'PM Agent (Claude)',
      date: '2024-02-10 14:30',
      changes: [
        { field: 'story', type: 'created', to: 'STORY-004' },
        { field: 'priority', type: 'added', to: 'high' },
      ],
    },
    {
      hash: 'l8m1o88', message: 'Design routing editor components', author: 'Design Agent',
      date: '2024-02-18 11:15',
      changes: [
        { field: 'designComponents', type: 'added', to: 'RoutingRulesEditor, RuleConditionBuilder, RoutingFlowVisualizer' },
      ],
    },
    {
      hash: 'm1n4p99', message: 'Begin implementation', author: 'Dev Agent (Claude)',
      date: '2024-02-25 09:30',
      changes: [
        { field: 'status', type: 'changed', from: 'ready', to: 'in-progress' },
      ],
    },
  ],
  'STORY-018': [
    {
      hash: 'r1s4t11', message: 'Create Slack integration story', author: 'PM Agent (Claude)',
      date: '2024-02-15 10:00',
      changes: [
        { field: 'story', type: 'created', to: 'STORY-018' },
      ],
    },
    {
      hash: 's4t7u22', message: 'Design Slack setup wizard', author: 'Design Agent',
      date: '2024-02-20 14:00',
      changes: [
        { field: 'designComponents', type: 'added', to: 'SlackSetupWizard, SlackChannelPicker' },
        { field: 'designComponents.status', type: 'changed', from: 'draft', to: 'ready' },
      ],
    },
    {
      hash: 't7u0v33', message: 'Start OAuth implementation', author: 'Dev Agent (Claude)',
      date: '2024-03-01 09:00',
      changes: [
        { field: 'status', type: 'changed', from: 'ready', to: 'in-progress' },
        { field: 'codeEntries', type: 'added', to: 'SlackSetup.tsx, slack.ts' },
      ],
    },
  ],
  'DC-001': [
    {
      hash: 'u3v6w44', message: 'Draft PreferencesPage layout', author: 'Design Agent',
      date: '2024-02-12 10:30',
      changes: [
        { field: 'component', type: 'created', to: 'PreferencesPage' },
        { field: 'type', type: 'added', to: 'page' },
        { field: 'status', type: 'added', to: 'draft' },
      ],
    },
    {
      hash: 'v6w9x55', message: 'Finalize design, mark ready', author: 'Design Agent',
      date: '2024-02-14 16:00',
      changes: [
        { field: 'status', type: 'changed', from: 'draft', to: 'ready' },
      ],
    },
    {
      hash: 'w9x2y66', message: 'Mark implemented after dev completion', author: 'Dev Agent (Claude)',
      date: '2024-03-02 15:20',
      changes: [
        { field: 'status', type: 'changed', from: 'ready', to: 'implemented' },
      ],
    },
  ],
  'API-001': [
    {
      hash: 'x2y5z77', message: 'Draft GET preferences endpoint', author: 'Dev Agent (Claude)',
      date: '2024-02-11 11:00',
      changes: [
        { field: 'contract', type: 'created', to: 'GET /api/v1/preferences' },
        { field: 'status', type: 'added', to: 'draft' },
      ],
    },
    {
      hash: 'y5z8a88', message: 'Agree on response schema with frontend', author: 'Dev Agent (Claude)',
      date: '2024-02-13 14:30',
      changes: [
        { field: 'status', type: 'changed', from: 'draft', to: 'agreed' },
        { field: 'responseSchema', type: 'added', to: 'JSON schema with channels + priorities' },
      ],
    },
    {
      hash: 'z8a1b99', message: 'Implement and verify endpoint', author: 'Dev Agent (Claude)',
      date: '2024-02-28 17:00',
      changes: [
        { field: 'status', type: 'changed', from: 'agreed', to: 'implemented' },
      ],
    },
  ],
  'TC-001': [
    {
      hash: 'c1d4e11', message: 'Draft channel toggle test case', author: 'QA Agent',
      date: '2024-02-15 16:20',
      changes: [
        { field: 'testCase', type: 'created', to: 'TC-001' },
        { field: 'type', type: 'added', to: 'e2e' },
        { field: 'status', type: 'added', to: 'draft' },
      ],
    },
    {
      hash: 'd4e7f22', message: 'Test case reviewed, mark ready', author: 'QA Agent',
      date: '2024-02-18 10:00',
      changes: [
        { field: 'status', type: 'changed', from: 'draft', to: 'ready' },
      ],
    },
    {
      hash: 'e7f0g33', message: 'Test passing after implementation', author: 'Dev Agent (Claude)',
      date: '2024-03-04 14:15',
      changes: [
        { field: 'status', type: 'changed', from: 'ready', to: 'passing' },
      ],
    },
  ],
}

// Helper: get commit history for any item, with fallback
export function getCommitHistory(itemId: string): CommitEntry[] {
  return mockCommitHistory[itemId] || generateFallbackHistory(itemId)
}

function generateFallbackHistory(itemId: string): CommitEntry[] {
  const prefix = itemId.split('-')[0]
  const typeMap: Record<string, string> = {
    PROB: 'problem', PRD: 'PRD', STORY: 'story', DC: 'component',
    TC: 'test case', CE: 'code entry', API: 'contract',
  }
  const itemType = typeMap[prefix] || 'item'
  return [
    {
      hash: itemId.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 7),
      message: `Create ${itemType} ${itemId}`,
      author: 'Agent',
      date: '2024-02-10 10:00',
      changes: [{ field: itemType, type: 'created', to: itemId }],
    },
  ]
}
