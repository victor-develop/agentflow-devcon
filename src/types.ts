export type WorkflowStepId =
  | 'problem'
  | 'prd'
  | 'stories'
  | 'design'
  | 'components'
  | 'contracts'
  | 'prototype'
  | 'e2e'
  | 'harness'
  | 'development'
  | 'verification'

export type StepStatus = 'pending' | 'active' | 'completed'

export interface WorkflowStep {
  id: WorkflowStepId
  label: string
  shortLabel: string
  description: string
  status: StepStatus
  phase: 'define' | 'design' | 'develop' | 'verify'
}

export interface Story {
  id: string
  title: string
  status: 'draft' | 'ready' | 'in-progress' | 'done'
  priority: 'high' | 'medium' | 'low'
  designComponents: DesignComponent[]
  testCases: TestCase[]
  codeEntries: CodeEntry[]
}

export interface DesignComponent {
  id: string
  name: string
  type: 'page' | 'component' | 'pattern'
  status: 'draft' | 'ready' | 'implemented'
  figmaUrl?: string
}

export interface TestCase {
  id: string
  title: string
  type: 'e2e' | 'integration' | 'unit'
  status: 'draft' | 'ready' | 'passing' | 'failing'
}

export interface CodeEntry {
  id: string
  path: string
  type: 'frontend' | 'backend' | 'shared'
  description: string
}

export interface ApiContract {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  description: string
  status: 'draft' | 'agreed' | 'implemented'
  storyId: string
}

export interface PRD {
  title: string
  problem: string
  goals: string[]
  nonGoals: string[]
  successMetrics: string[]
  stories: Story[]
}
