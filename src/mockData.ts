import type { WorkflowStep, PRD, ApiContract } from './types'

export const workflowSteps: WorkflowStep[] = [
  {
    id: 'problem',
    label: 'Problem Definition',
    shortLabel: 'Problem',
    description: 'Define the core problem and hypothesis',
    status: 'completed',
    phase: 'define',
  },
  {
    id: 'prd',
    label: 'Product Requirements',
    shortLabel: 'PRD',
    description: 'Product requirements document',
    status: 'completed',
    phase: 'define',
  },
  {
    id: 'stories',
    label: 'Story Breakdown',
    shortLabel: 'Stories',
    description: 'Break PRD into implementable stories',
    status: 'completed',
    phase: 'define',
  },
  {
    id: 'design',
    label: 'Design System',
    shortLabel: 'Design Sys',
    description: 'Create or refine the design system',
    status: 'active',
    phase: 'design',
  },
  {
    id: 'components',
    label: 'Design Components',
    shortLabel: 'Components',
    description: 'Design individual components',
    status: 'active',
    phase: 'design',
  },
  {
    id: 'contracts',
    label: 'API Contracts',
    shortLabel: 'Contracts',
    description: 'Frontend-backend API contract design',
    status: 'pending',
    phase: 'design',
  },
  {
    id: 'prototype',
    label: 'Prototype',
    shortLabel: 'Prototype',
    description: 'Frontend prototype development',
    status: 'pending',
    phase: 'develop',
  },
  {
    id: 'e2e',
    label: 'E2E Test Cases',
    shortLabel: 'E2E Tests',
    description: 'Test cases with mock data',
    status: 'pending',
    phase: 'develop',
  },
  {
    id: 'harness',
    label: 'Harness Engineering',
    shortLabel: 'Harness',
    description: 'Test data scripts and toolchain for AI feedback loops',
    status: 'pending',
    phase: 'verify',
  },
  {
    id: 'development',
    label: 'Production Code',
    shortLabel: 'Code',
    description: 'Production-grade code development',
    status: 'pending',
    phase: 'verify',
  },
  {
    id: 'verification',
    label: 'Verification',
    shortLabel: 'Verify',
    description: 'AI-driven verification using harness toolchain',
    status: 'pending',
    phase: 'verify',
  },
]

export const mockPRD: PRD = {
  title: 'Intelligent Notification Routing System',
  problem:
    'Users receive too many irrelevant notifications across multiple channels, leading to notification fatigue and missed critical alerts. Current systems lack the ability to intelligently route notifications based on user context, urgency, and preferences.',
  goals: [
    'Reduce notification volume by 60% through intelligent deduplication and batching',
    'Route critical alerts to the most appropriate channel based on user context',
    'Provide a unified notification preferences dashboard',
    'Support rule-based and ML-based routing strategies',
  ],
  nonGoals: [
    'Building a notification delivery infrastructure (use existing providers)',
    'Real-time chat or messaging features',
    'Email marketing or campaign management',
  ],
  successMetrics: [
    'Notification open rate increases from 12% to 40%',
    'Critical alert response time decreases by 50%',
    'User-reported notification fatigue score drops below 3/10',
    'Zero missed P0 alerts in production',
  ],
  stories: [
    {
      id: 'STORY-001',
      title: 'User Notification Preferences Panel',
      status: 'in-progress',
      priority: 'high',
      designComponents: [
        { id: 'DC-001', name: 'PreferencesPage', type: 'page', status: 'ready' },
        { id: 'DC-002', name: 'ChannelToggleCard', type: 'component', status: 'implemented' },
        { id: 'DC-003', name: 'QuietHoursScheduler', type: 'component', status: 'draft' },
        { id: 'DC-004', name: 'PriorityMatrix', type: 'component', status: 'draft' },
      ],
      testCases: [
        { id: 'TC-001', title: 'User can toggle notification channels on/off', type: 'e2e', status: 'ready' },
        { id: 'TC-002', title: 'Quiet hours prevent non-critical notifications', type: 'e2e', status: 'draft' },
        { id: 'TC-003', title: 'Priority overrides respect channel preferences', type: 'integration', status: 'draft' },
      ],
      codeEntries: [
        { id: 'CE-001', path: 'src/features/preferences/PreferencesPanel.tsx', type: 'frontend', description: 'Main preferences panel component' },
        { id: 'CE-002', path: 'src/api/preferences.ts', type: 'frontend', description: 'Preferences API client' },
        { id: 'CE-003', path: 'server/routes/preferences.ts', type: 'backend', description: 'Preferences REST endpoints' },
      ],
    },
    {
      id: 'STORY-002',
      title: 'Notification Routing Engine',
      status: 'ready',
      priority: 'high',
      designComponents: [
        { id: 'DC-005', name: 'RoutingRulesEditor', type: 'page', status: 'ready' },
        { id: 'DC-006', name: 'RuleConditionBuilder', type: 'component', status: 'ready' },
        { id: 'DC-007', name: 'RoutingFlowVisualizer', type: 'component', status: 'draft' },
      ],
      testCases: [
        { id: 'TC-004', title: 'Rule-based routing applies correct channel', type: 'e2e', status: 'ready' },
        { id: 'TC-005', title: 'Fallback routing when primary channel unavailable', type: 'integration', status: 'draft' },
      ],
      codeEntries: [
        { id: 'CE-004', path: 'src/features/routing/RoutingEditor.tsx', type: 'frontend', description: 'Routing rules editor' },
        { id: 'CE-005', path: 'server/engine/router.ts', type: 'backend', description: 'Core routing engine' },
      ],
    },
    {
      id: 'STORY-003',
      title: 'Notification Analytics Dashboard',
      status: 'draft',
      priority: 'medium',
      designComponents: [
        { id: 'DC-008', name: 'AnalyticsDashboard', type: 'page', status: 'draft' },
        { id: 'DC-009', name: 'DeliveryFunnelChart', type: 'component', status: 'draft' },
        { id: 'DC-010', name: 'ChannelPerformanceGrid', type: 'component', status: 'draft' },
      ],
      testCases: [
        { id: 'TC-006', title: 'Dashboard shows correct delivery stats', type: 'e2e', status: 'draft' },
      ],
      codeEntries: [
        { id: 'CE-006', path: 'src/features/analytics/Dashboard.tsx', type: 'frontend', description: 'Analytics dashboard' },
      ],
    },
    {
      id: 'STORY-004',
      title: 'Smart Batching and Deduplication',
      status: 'draft',
      priority: 'medium',
      designComponents: [
        { id: 'DC-011', name: 'BatchConfigPanel', type: 'component', status: 'draft' },
      ],
      testCases: [
        { id: 'TC-007', title: 'Duplicate notifications are merged within time window', type: 'integration', status: 'draft' },
        { id: 'TC-008', title: 'Batched digest delivered at scheduled time', type: 'e2e', status: 'draft' },
      ],
      codeEntries: [
        { id: 'CE-007', path: 'server/engine/batcher.ts', type: 'backend', description: 'Batching engine' },
        { id: 'CE-008', path: 'server/engine/dedup.ts', type: 'backend', description: 'Deduplication logic' },
      ],
    },
  ],
}

export const mockContracts: ApiContract[] = [
  {
    id: 'API-001',
    method: 'GET',
    endpoint: '/api/v1/preferences',
    description: 'Fetch user notification preferences',
    status: 'implemented',
    storyId: 'STORY-001',
  },
  {
    id: 'API-002',
    method: 'PUT',
    endpoint: '/api/v1/preferences',
    description: 'Update user notification preferences',
    status: 'agreed',
    storyId: 'STORY-001',
  },
  {
    id: 'API-003',
    method: 'GET',
    endpoint: '/api/v1/routing/rules',
    description: 'List routing rules',
    status: 'agreed',
    storyId: 'STORY-002',
  },
  {
    id: 'API-004',
    method: 'POST',
    endpoint: '/api/v1/routing/rules',
    description: 'Create a routing rule',
    status: 'draft',
    storyId: 'STORY-002',
  },
  {
    id: 'API-005',
    method: 'GET',
    endpoint: '/api/v1/analytics/delivery',
    description: 'Delivery analytics summary',
    status: 'draft',
    storyId: 'STORY-003',
  },
  {
    id: 'API-006',
    method: 'POST',
    endpoint: '/api/v1/notifications/batch',
    description: 'Submit notification batch',
    status: 'draft',
    storyId: 'STORY-004',
  },
]
