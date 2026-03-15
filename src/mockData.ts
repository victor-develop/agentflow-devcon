import type { WorkflowStep, PRD, ApiContract, Story, Problem } from './types'

export const workflowSteps: WorkflowStep[] = [
  { id: 'problem', label: 'Problem Definition', shortLabel: 'Problem', description: 'Define the core problem and hypothesis', status: 'completed', phase: 'define' },
  { id: 'prd', label: 'Product Requirements', shortLabel: 'PRD', description: 'Product requirements document', status: 'completed', phase: 'define' },
  { id: 'stories', label: 'Story Breakdown', shortLabel: 'Stories', description: 'Break PRD into implementable stories', status: 'completed', phase: 'define' },
  { id: 'design', label: 'Design System', shortLabel: 'Design Sys', description: 'Create or refine the design system', status: 'active', phase: 'design' },
  { id: 'components', label: 'Design Components', shortLabel: 'Components', description: 'Design individual components', status: 'active', phase: 'design' },
  { id: 'contracts', label: 'API Contracts', shortLabel: 'Contracts', description: 'Frontend-backend API contract design', status: 'pending', phase: 'design' },
  { id: 'prototype', label: 'Prototype', shortLabel: 'Prototype', description: 'Frontend prototype development', status: 'pending', phase: 'develop' },
  { id: 'e2e', label: 'E2E Test Cases', shortLabel: 'E2E Tests', description: 'Test cases with mock data', status: 'pending', phase: 'develop' },
  { id: 'harness', label: 'Harness Engineering', shortLabel: 'Harness', description: 'Test data scripts and toolchain for AI feedback loops', status: 'pending', phase: 'verify' },
  { id: 'development', label: 'Production Code', shortLabel: 'Code', description: 'Production-grade code development', status: 'pending', phase: 'verify' },
  { id: 'verification', label: 'Verification', shortLabel: 'Verify', description: 'AI-driven verification using harness toolchain', status: 'pending', phase: 'verify' },
]

// ─── Helpers ──────────────────────────────────────────────
let _dcId = 0, _tcId = 0, _ceId = 0
const dc = (name: string, type: 'page'|'component'|'pattern', status: 'draft'|'ready'|'implemented') =>
  ({ id: `DC-${String(++_dcId).padStart(3,'0')}`, name, type, status })
const tc = (title: string, type: 'e2e'|'integration'|'unit', status: 'draft'|'ready'|'passing'|'failing') =>
  ({ id: `TC-${String(++_tcId).padStart(3,'0')}`, title, type, status })
const ce = (path: string, type: 'frontend'|'backend'|'shared', description: string) =>
  ({ id: `CE-${String(++_ceId).padStart(3,'0')}`, path, type, description })

const stories: Story[] = [
  // ── Epic 1: Preferences ──
  {
    id: 'STORY-001', title: 'User Notification Preferences Panel', status: 'done', priority: 'high',
    designComponents: [
      dc('PreferencesPage', 'page', 'implemented'), dc('ChannelToggleCard', 'component', 'implemented'),
      dc('QuietHoursScheduler', 'component', 'implemented'), dc('PriorityMatrix', 'component', 'implemented'),
    ],
    testCases: [
      tc('User can toggle notification channels on/off', 'e2e', 'passing'),
      tc('Quiet hours prevent non-critical notifications', 'e2e', 'passing'),
      tc('Priority overrides respect channel preferences', 'integration', 'passing'),
    ],
    codeEntries: [
      ce('src/features/preferences/PreferencesPanel.tsx', 'frontend', 'Main preferences panel component'),
      ce('src/api/preferences.ts', 'frontend', 'Preferences API client'),
      ce('server/routes/preferences.ts', 'backend', 'Preferences REST endpoints'),
    ],
  },
  {
    id: 'STORY-002', title: 'Channel-specific settings (Email, Push, SMS, Slack)', status: 'done', priority: 'high',
    designComponents: [
      dc('ChannelSettingsPage', 'page', 'implemented'), dc('EmailConfigForm', 'component', 'implemented'),
      dc('PushTokenManager', 'component', 'implemented'),
    ],
    testCases: [
      tc('Email settings save and persist correctly', 'e2e', 'passing'),
      tc('Push token registration works cross-browser', 'e2e', 'passing'),
      tc('SMS opt-in requires phone verification', 'integration', 'passing'),
    ],
    codeEntries: [
      ce('src/features/preferences/ChannelSettings.tsx', 'frontend', 'Per-channel settings UI'),
      ce('server/routes/channels.ts', 'backend', 'Channel config endpoints'),
    ],
  },
  {
    id: 'STORY-003', title: 'Preference import/export (JSON)', status: 'in-progress', priority: 'low',
    designComponents: [ dc('ImportExportDialog', 'component', 'ready') ],
    testCases: [
      tc('Export generates valid JSON', 'unit', 'passing'),
      tc('Import validates schema before applying', 'unit', 'ready'),
    ],
    codeEntries: [
      ce('src/features/preferences/ImportExport.tsx', 'frontend', 'Import/export dialog'),
      ce('server/utils/preferencesIO.ts', 'backend', 'Serialization logic'),
    ],
  },
  // ── Epic 2: Routing Engine ──
  {
    id: 'STORY-004', title: 'Notification Routing Engine (Core)', status: 'in-progress', priority: 'high',
    designComponents: [
      dc('RoutingRulesEditor', 'page', 'ready'), dc('RuleConditionBuilder', 'component', 'ready'),
      dc('RoutingFlowVisualizer', 'component', 'draft'),
    ],
    testCases: [
      tc('Rule-based routing applies correct channel', 'e2e', 'ready'),
      tc('Fallback routing when primary channel unavailable', 'integration', 'draft'),
      tc('Rule evaluation order follows priority', 'unit', 'ready'),
    ],
    codeEntries: [
      ce('src/features/routing/RoutingEditor.tsx', 'frontend', 'Routing rules editor'),
      ce('server/engine/router.ts', 'backend', 'Core routing engine'),
    ],
  },
  {
    id: 'STORY-005', title: 'Routing rule templates library', status: 'ready', priority: 'medium',
    designComponents: [
      dc('TemplateGallery', 'page', 'ready'), dc('TemplateCard', 'component', 'ready'),
    ],
    testCases: [
      tc('Template can be applied to create a new rule', 'e2e', 'draft'),
      tc('Custom templates can be saved', 'integration', 'draft'),
    ],
    codeEntries: [
      ce('src/features/routing/TemplateGallery.tsx', 'frontend', 'Template browser'),
      ce('server/routes/templates.ts', 'backend', 'Template CRUD'),
    ],
  },
  {
    id: 'STORY-006', title: 'Routing rule dry-run / simulation', status: 'ready', priority: 'medium',
    designComponents: [ dc('SimulationPanel', 'component', 'draft'), dc('SimulationResultCard', 'component', 'draft') ],
    testCases: [
      tc('Simulation returns expected channel for sample notification', 'e2e', 'draft'),
    ],
    codeEntries: [
      ce('src/features/routing/Simulation.tsx', 'frontend', 'Dry-run UI'),
      ce('server/engine/simulator.ts', 'backend', 'Simulation engine'),
    ],
  },
  {
    id: 'STORY-007', title: 'Routing rule versioning and rollback', status: 'draft', priority: 'low',
    designComponents: [ dc('VersionHistory', 'component', 'draft') ],
    testCases: [ tc('Rollback restores previous rule set', 'integration', 'draft') ],
    codeEntries: [ ce('server/engine/versions.ts', 'backend', 'Version management') ],
  },
  // ── Epic 3: Analytics ──
  {
    id: 'STORY-008', title: 'Notification Analytics Dashboard', status: 'in-progress', priority: 'high',
    designComponents: [
      dc('AnalyticsDashboard', 'page', 'ready'), dc('DeliveryFunnelChart', 'component', 'ready'),
      dc('ChannelPerformanceGrid', 'component', 'draft'), dc('TimeSeriesChart', 'component', 'draft'),
    ],
    testCases: [
      tc('Dashboard shows correct delivery stats', 'e2e', 'ready'),
      tc('Date range filter works correctly', 'e2e', 'draft'),
      tc('Chart renders with 100K+ data points', 'integration', 'draft'),
    ],
    codeEntries: [
      ce('src/features/analytics/Dashboard.tsx', 'frontend', 'Analytics dashboard'),
      ce('src/features/analytics/Charts.tsx', 'frontend', 'Chart components'),
      ce('server/routes/analytics.ts', 'backend', 'Analytics endpoints'),
    ],
  },
  {
    id: 'STORY-009', title: 'Per-channel delivery metrics', status: 'ready', priority: 'medium',
    designComponents: [ dc('ChannelMetricsPanel', 'component', 'draft') ],
    testCases: [ tc('Metrics aggregate per-channel correctly', 'unit', 'draft') ],
    codeEntries: [ ce('server/analytics/channelMetrics.ts', 'backend', 'Channel aggregation') ],
  },
  {
    id: 'STORY-010', title: 'User engagement heatmap', status: 'draft', priority: 'low',
    designComponents: [ dc('EngagementHeatmap', 'component', 'draft') ],
    testCases: [ tc('Heatmap renders hourly engagement data', 'e2e', 'draft') ],
    codeEntries: [ ce('src/features/analytics/Heatmap.tsx', 'frontend', 'Heatmap component') ],
  },
  {
    id: 'STORY-011', title: 'Export analytics reports (CSV/PDF)', status: 'draft', priority: 'low',
    designComponents: [ dc('ExportReportDialog', 'component', 'draft') ],
    testCases: [ tc('CSV export matches dashboard data', 'integration', 'draft') ],
    codeEntries: [
      ce('src/features/analytics/ExportDialog.tsx', 'frontend', 'Export dialog'),
      ce('server/analytics/exportReport.ts', 'backend', 'Report generation'),
    ],
  },
  // ── Epic 4: Batching & Dedup ──
  {
    id: 'STORY-012', title: 'Smart Batching Engine', status: 'ready', priority: 'high',
    designComponents: [ dc('BatchConfigPanel', 'component', 'ready') ],
    testCases: [
      tc('Batched digest delivered at scheduled time', 'e2e', 'draft'),
      tc('Batch window is configurable per-user', 'integration', 'draft'),
    ],
    codeEntries: [
      ce('server/engine/batcher.ts', 'backend', 'Batching engine'),
      ce('src/features/batching/BatchConfig.tsx', 'frontend', 'Batch config UI'),
    ],
  },
  {
    id: 'STORY-013', title: 'Deduplication logic (content-hash based)', status: 'ready', priority: 'high',
    designComponents: [ dc('DedupRulesPanel', 'component', 'draft') ],
    testCases: [
      tc('Duplicate notifications merged within time window', 'integration', 'ready'),
      tc('Near-duplicate detection with similarity threshold', 'unit', 'draft'),
    ],
    codeEntries: [ ce('server/engine/dedup.ts', 'backend', 'Deduplication logic') ],
  },
  {
    id: 'STORY-014', title: 'Digest email template', status: 'draft', priority: 'medium',
    designComponents: [ dc('DigestEmailPreview', 'component', 'draft'), dc('DigestTemplateEditor', 'component', 'draft') ],
    testCases: [ tc('Digest email renders all batched items', 'e2e', 'draft') ],
    codeEntries: [ ce('server/templates/digestEmail.ts', 'backend', 'Email template') ],
  },
  // ── Epic 5: Multi-tenant & Admin ──
  {
    id: 'STORY-015', title: 'Multi-tenant workspace isolation', status: 'draft', priority: 'high',
    designComponents: [ dc('WorkspaceSwitcher', 'component', 'draft') ],
    testCases: [
      tc('Tenant A cannot see Tenant B notifications', 'e2e', 'draft'),
      tc('Workspace creation provisions all defaults', 'integration', 'draft'),
    ],
    codeEntries: [
      ce('server/middleware/tenantIsolation.ts', 'backend', 'Tenant isolation middleware'),
      ce('src/features/admin/WorkspaceSwitcher.tsx', 'frontend', 'Workspace picker'),
    ],
  },
  {
    id: 'STORY-016', title: 'Admin user management panel', status: 'draft', priority: 'medium',
    designComponents: [
      dc('AdminUsersPage', 'page', 'draft'), dc('UserRoleEditor', 'component', 'draft'),
    ],
    testCases: [
      tc('Admin can invite new users', 'e2e', 'draft'),
      tc('Role change takes effect immediately', 'integration', 'draft'),
    ],
    codeEntries: [
      ce('src/features/admin/UsersPage.tsx', 'frontend', 'Admin users page'),
      ce('server/routes/admin/users.ts', 'backend', 'Admin user endpoints'),
    ],
  },
  {
    id: 'STORY-017', title: 'Audit log for configuration changes', status: 'draft', priority: 'medium',
    designComponents: [ dc('AuditLogTable', 'component', 'draft') ],
    testCases: [ tc('All rule changes appear in audit log', 'integration', 'draft') ],
    codeEntries: [ ce('server/routes/admin/audit.ts', 'backend', 'Audit log endpoints') ],
  },
  // ── Epic 6: Integrations ──
  {
    id: 'STORY-018', title: 'Slack integration (OAuth + delivery)', status: 'in-progress', priority: 'high',
    designComponents: [
      dc('SlackSetupWizard', 'page', 'ready'), dc('SlackChannelPicker', 'component', 'ready'),
    ],
    testCases: [
      tc('OAuth flow completes and stores token', 'e2e', 'ready'),
      tc('Notifications delivered to correct Slack channel', 'e2e', 'draft'),
      tc('Token refresh handles expiry', 'integration', 'ready'),
    ],
    codeEntries: [
      ce('src/features/integrations/SlackSetup.tsx', 'frontend', 'Slack setup wizard'),
      ce('server/integrations/slack.ts', 'backend', 'Slack delivery provider'),
    ],
  },
  {
    id: 'STORY-019', title: 'Webhook outbound delivery', status: 'ready', priority: 'medium',
    designComponents: [ dc('WebhookConfigPanel', 'component', 'ready') ],
    testCases: [
      tc('Webhook delivers with correct payload schema', 'e2e', 'ready'),
      tc('Retry on 5xx with exponential backoff', 'integration', 'draft'),
    ],
    codeEntries: [
      ce('src/features/integrations/WebhookConfig.tsx', 'frontend', 'Webhook config'),
      ce('server/integrations/webhook.ts', 'backend', 'Webhook delivery'),
    ],
  },
  {
    id: 'STORY-020', title: 'PagerDuty integration', status: 'draft', priority: 'medium',
    designComponents: [ dc('PagerDutySetup', 'component', 'draft') ],
    testCases: [ tc('P0 alert triggers PagerDuty incident', 'e2e', 'draft') ],
    codeEntries: [ ce('server/integrations/pagerduty.ts', 'backend', 'PagerDuty provider') ],
  },
  {
    id: 'STORY-021', title: 'Microsoft Teams integration', status: 'draft', priority: 'low',
    designComponents: [ dc('TeamsSetupWizard', 'page', 'draft') ],
    testCases: [ tc('Teams connector posts formatted card', 'e2e', 'draft') ],
    codeEntries: [ ce('server/integrations/teams.ts', 'backend', 'Teams provider') ],
  },
  // ── Epic 7: ML & Smart Features ──
  {
    id: 'STORY-022', title: 'ML-based priority prediction model', status: 'draft', priority: 'high',
    designComponents: [ dc('MLModelDashboard', 'page', 'draft'), dc('PredictionConfidenceBadge', 'component', 'draft') ],
    testCases: [
      tc('Model predicts correct priority for known patterns', 'unit', 'draft'),
      tc('Prediction latency under 50ms p99', 'integration', 'draft'),
    ],
    codeEntries: [
      ce('server/ml/priorityPredictor.ts', 'backend', 'Priority prediction model'),
      ce('server/ml/training/pipeline.ts', 'backend', 'Training pipeline'),
    ],
  },
  {
    id: 'STORY-023', title: 'User activity context signals', status: 'draft', priority: 'medium',
    designComponents: [ dc('ActivitySignalDebugger', 'component', 'draft') ],
    testCases: [ tc('Online/away status updates within 30s', 'integration', 'draft') ],
    codeEntries: [ ce('server/context/activityTracker.ts', 'backend', 'Activity signal collector') ],
  },
  {
    id: 'STORY-024', title: 'Smart channel recommendation (per notification)', status: 'draft', priority: 'medium',
    designComponents: [ dc('ChannelRecommendationTooltip', 'component', 'draft') ],
    testCases: [ tc('Recommendation matches user behavior patterns', 'unit', 'draft') ],
    codeEntries: [ ce('server/ml/channelRecommender.ts', 'backend', 'Channel recommendation') ],
  },
  {
    id: 'STORY-025', title: 'Feedback loop for ML model retraining', status: 'draft', priority: 'low',
    designComponents: [ dc('FeedbackCollector', 'component', 'draft') ],
    testCases: [ tc('User feedback propagates to training dataset', 'integration', 'draft') ],
    codeEntries: [
      ce('src/features/feedback/FeedbackWidget.tsx', 'frontend', 'Feedback collection widget'),
      ce('server/ml/feedbackPipeline.ts', 'backend', 'Feedback-to-training pipeline'),
    ],
  },
]

// ─── Problems ─────────────────────────────────────────────
export const mockProblems: Problem[] = [
  {
    id: 'PROB-001',
    title: 'Notification fatigue and missed critical alerts',
    status: 'active',
    severity: 'critical',
    statement: 'Users receive too many irrelevant notifications across multiple channels, leading to notification fatigue and missed critical alerts. Current systems lack the ability to intelligently route notifications based on user context, urgency, and preferences.',
    hypothesis: 'By implementing intelligent notification routing with ML-based prioritization and user-context-aware channel selection, we can reduce notification volume by 60% while increasing the open rate of critical alerts by 3x.',
    evidence: [
      'User survey (n=2,400): 68% report "too many irrelevant notifications"',
      'Incident post-mortem analysis: 15 of 23 missed P0s were due to channel mismatch',
      'Competitor benchmark: Slack\'s intelligent notifications show 52% open rate',
      'Internal prototype (rule-based only) showed 40% volume reduction in pilot group',
    ],
    metrics: [
      { label: 'Users report fatigue', value: '68%', color: 'var(--red)' },
      { label: 'Current open rate', value: '12%', color: 'var(--amber)' },
      { label: 'Avg P0 response time', value: '4.2min', color: 'var(--cyan)' },
      { label: 'Missed P0s last Q', value: '23', color: 'var(--accent)' },
    ],
    prdIds: ['PRD-001'],
    createdAt: '2024-01-15',
  },
  {
    id: 'PROB-002',
    title: 'No visibility into notification delivery pipeline',
    status: 'active',
    severity: 'major',
    statement: 'Operations teams have no real-time visibility into notification delivery success rates, latency, or failure patterns. Debugging delivery issues requires manual log parsing across 4 different systems.',
    hypothesis: 'A unified analytics dashboard with per-channel metrics and delivery funnel visualization will reduce mean-time-to-diagnose delivery issues from 45min to under 5min.',
    evidence: [
      'Ops team spends avg 3h/week debugging notification delivery issues',
      'Last outage took 2.5h to identify root cause (Slack token expiry)',
      'No alerting exists for degraded delivery rates',
    ],
    metrics: [
      { label: 'Debug time / week', value: '3h', color: 'var(--red)' },
      { label: 'Last outage MTTD', value: '2.5h', color: 'var(--amber)' },
      { label: 'Channels monitored', value: '0/4', color: 'var(--red)' },
    ],
    prdIds: ['PRD-002'],
    createdAt: '2024-02-03',
  },
  {
    id: 'PROB-003',
    title: 'Manual notification configuration does not scale',
    status: 'validated',
    severity: 'major',
    statement: 'Each new team or workspace requires manual configuration of routing rules, channel integrations, and user preferences. Onboarding a new team takes 2-3 days of engineering time.',
    hypothesis: 'Pre-built routing templates and automated workspace provisioning will reduce team onboarding from 2-3 days to under 30 minutes.',
    evidence: [
      '12 new teams onboarded last quarter, each requiring 2-3 days setup',
      'Configuration drift between workspaces causes inconsistent behavior',
      'No self-serve configuration — all changes go through eng team',
    ],
    metrics: [
      { label: 'Onboarding time', value: '2-3d', color: 'var(--red)' },
      { label: 'Teams last Q', value: '12', color: 'var(--amber)' },
      { label: 'Self-serve configs', value: '0%', color: 'var(--red)' },
    ],
    prdIds: ['PRD-003'],
    createdAt: '2024-02-20',
  },
  {
    id: 'PROB-004',
    title: 'Duplicate notifications across channels',
    status: 'validated',
    severity: 'major',
    statement: 'Users frequently receive the same notification on multiple channels simultaneously (email + push + Slack), with no deduplication or batching logic. This amplifies fatigue and erodes trust in the notification system.',
    hypothesis: 'Content-hash based deduplication and configurable batching windows will eliminate 90%+ of duplicate notifications while preserving delivery guarantees for critical alerts.',
    evidence: [
      'Analysis of 1M notifications: 34% are duplicates across channels',
      'User complaints about duplicates are the #2 support ticket category',
      'No batching logic exists — every event triggers immediate delivery to all channels',
    ],
    metrics: [
      { label: 'Duplicate rate', value: '34%', color: 'var(--red)' },
      { label: 'Support tickets / mo', value: '156', color: 'var(--amber)' },
      { label: 'Batching logic', value: 'None', color: 'var(--red)' },
    ],
    prdIds: ['PRD-001'],
    createdAt: '2024-01-28',
  },
  {
    id: 'PROB-005',
    title: 'Security: session tokens stored in plaintext',
    status: 'active',
    severity: 'critical',
    statement: 'Integration OAuth tokens (Slack, Teams, PagerDuty) are stored in plaintext in the database. A database breach would expose all connected third-party accounts.',
    hypothesis: 'Migrating to encrypted-at-rest token storage with per-workspace encryption keys will eliminate the plaintext exposure risk without impacting delivery latency.',
    evidence: [
      'Security audit flagged plaintext token storage as P0',
      'SOC2 compliance requires encryption at rest for all credentials',
      '4 integration providers affected: Slack, Teams, PagerDuty, Webhooks',
    ],
    metrics: [
      { label: 'Exposed tokens', value: '847', color: 'var(--red)' },
      { label: 'Compliance gap', value: 'SOC2', color: 'var(--red)' },
      { label: 'Providers affected', value: '4', color: 'var(--amber)' },
    ],
    prdIds: [],
    createdAt: '2024-03-01',
  },
  {
    id: 'PROB-006',
    title: 'No mobile push notification support',
    status: 'draft',
    severity: 'major',
    statement: 'The platform only supports email, Slack, and webhook delivery. Mobile push notifications (iOS/Android) are not available, despite 62% of users accessing the product from mobile devices.',
    hypothesis: 'Adding FCM/APNs push delivery as a first-class channel will increase critical alert response rates by 40% for mobile-primary users.',
    evidence: [
      '62% of DAUs access from mobile at least once daily',
      'Mobile users have 3x slower response to critical alerts (email-only delivery)',
      'Top feature request in last 2 quarterly surveys',
    ],
    metrics: [
      { label: 'Mobile DAU', value: '62%', color: 'var(--cyan)' },
      { label: 'Mobile response lag', value: '3x', color: 'var(--amber)' },
      { label: 'Feature request rank', value: '#1', color: 'var(--accent)' },
    ],
    prdIds: [],
    createdAt: '2024-03-05',
  },
  {
    id: 'PROB-007',
    title: 'Alert escalation has no automated path',
    status: 'draft',
    severity: 'minor',
    statement: 'When a P0 alert is not acknowledged within the SLA window, there is no automated escalation. On-call engineers must manually ping managers, leading to delayed incident response.',
    hypothesis: 'Automated escalation chains (notify → remind → escalate to manager → page secondary on-call) will reduce P0 acknowledgment SLA breaches from 18% to under 2%.',
    evidence: [
      '18% of P0 alerts breach the 5-min acknowledgment SLA',
      'Manual escalation adds avg 12min to incident response',
      '3 P1 incidents last quarter were caused by unacknowledged P0s',
    ],
    metrics: [
      { label: 'SLA breach rate', value: '18%', color: 'var(--red)' },
      { label: 'Escalation delay', value: '12min', color: 'var(--amber)' },
      { label: 'Incidents from missed P0', value: '3', color: 'var(--red)' },
    ],
    prdIds: [],
    createdAt: '2024-03-08',
  },
  {
    id: 'PROB-008',
    title: 'Notification content is not localized',
    status: 'rejected',
    severity: 'minor',
    statement: 'All notifications are sent in English regardless of user locale preference. International users (28% of base) report lower engagement and confusion with technical English content.',
    hypothesis: 'Locale-aware notification templates with i18n support will increase international user engagement by 25%.',
    evidence: [
      '28% of users have non-English locale set',
      'International user notification open rate is 8% vs 14% for English users',
      'Support tickets in non-English increase after notification campaigns',
    ],
    metrics: [
      { label: 'Intl users', value: '28%', color: 'var(--cyan)' },
      { label: 'Intl open rate', value: '8%', color: 'var(--amber)' },
    ],
    prdIds: [],
    createdAt: '2024-02-10',
  },
]

// ─── PRDs ─────────────────────────────────────────────────
export const mockPRDs: PRD[] = [
  {
    id: 'PRD-001',
    title: 'Intelligent Notification Routing System',
    status: 'approved',
    problemId: 'PROB-001',
    problem: 'Users receive too many irrelevant notifications across multiple channels, leading to notification fatigue and missed critical alerts.',
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
    stories: stories.slice(0, 14),
    createdAt: '2024-01-20',
    updatedAt: '2024-03-10',
  },
  {
    id: 'PRD-002',
    title: 'Notification Analytics & Observability',
    status: 'approved',
    problemId: 'PROB-002',
    problem: 'No visibility into notification delivery pipeline — debugging requires manual log parsing across 4 systems.',
    goals: [
      'Real-time delivery analytics dashboard with per-channel breakdown',
      'Automated alerting on delivery rate degradation',
      'Exportable reports for stakeholder review',
    ],
    nonGoals: [
      'Log aggregation infrastructure (use existing ELK stack)',
      'User-facing notification history UI',
    ],
    successMetrics: [
      'MTTD for delivery issues drops from 45min to under 5min',
      'Zero undetected delivery outages lasting more than 10min',
      'Ops team saves 3h/week on delivery debugging',
    ],
    stories: stories.slice(7, 11),
    createdAt: '2024-02-08',
    updatedAt: '2024-03-05',
  },
  {
    id: 'PRD-003',
    title: 'Self-Serve Workspace Onboarding',
    status: 'review',
    problemId: 'PROB-003',
    problem: 'Manual notification configuration does not scale — onboarding a new team takes 2-3 days of engineering time.',
    goals: [
      'Self-serve workspace creation with sensible defaults',
      'Pre-built routing rule templates for common use cases',
      'Admin panel for user and role management',
      'Audit log for all configuration changes',
    ],
    nonGoals: [
      'Billing or subscription management',
      'Custom domain support',
    ],
    successMetrics: [
      'Team onboarding time drops from 2-3 days to under 30 minutes',
      '100% of configuration changes tracked in audit log',
      'Zero engineering tickets for routine workspace setup',
    ],
    stories: stories.slice(14, 17),
    createdAt: '2024-02-25',
    updatedAt: '2024-03-12',
  },
  {
    id: 'PRD-004',
    title: 'Third-Party Integration Hub',
    status: 'approved',
    problemId: 'PROB-001',
    problem: 'Adding new delivery channels requires custom engineering for each provider. No standardized integration framework exists.',
    goals: [
      'OAuth-based Slack integration with channel picker',
      'Outbound webhook support with retry logic',
      'PagerDuty integration for critical alert escalation',
      'Microsoft Teams connector',
    ],
    nonGoals: [
      'Inbound webhook processing',
      'Custom integration SDK for external developers',
    ],
    successMetrics: [
      'All 4 integrations live within 6 weeks',
      'Integration setup under 5 minutes per provider',
      'Webhook delivery success rate above 99.5%',
    ],
    stories: stories.slice(17, 21),
    createdAt: '2024-02-15',
    updatedAt: '2024-03-08',
  },
  {
    id: 'PRD-005',
    title: 'ML-Powered Smart Routing',
    status: 'draft',
    problemId: 'PROB-001',
    problem: 'Rule-based routing cannot adapt to individual user behavior patterns. One-size-fits-all rules miss optimization opportunities.',
    goals: [
      'ML model for priority prediction based on notification content and context',
      'User activity signals (online/away/DND) as routing input',
      'Per-notification channel recommendation',
      'Feedback loop for continuous model improvement',
    ],
    nonGoals: [
      'Natural language generation for notification content',
      'Autonomous rule creation (human-in-the-loop required)',
    ],
    successMetrics: [
      'ML-routed notifications have 20% higher open rate than rule-based',
      'Prediction latency under 50ms p99',
      'Model accuracy above 85% on priority classification',
    ],
    stories: stories.slice(21, 25),
    createdAt: '2024-03-01',
    updatedAt: '2024-03-14',
  },
  {
    id: 'PRD-006',
    title: 'Token Encryption & Credential Security',
    status: 'draft',
    problemId: 'PROB-005',
    problem: 'Integration OAuth tokens are stored in plaintext. A database breach would expose all connected third-party accounts.',
    goals: [
      'Encrypt all OAuth tokens at rest with per-workspace keys',
      'Implement key rotation without service disruption',
      'Audit trail for all credential access',
    ],
    nonGoals: [
      'Client-side encryption',
      'Hardware security module (HSM) integration',
    ],
    successMetrics: [
      'Zero plaintext tokens in database within 2 weeks of launch',
      'Key rotation completes in under 60 seconds',
      'Pass SOC2 Type II audit for credential management',
    ],
    stories: [],
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05',
  },
]

// Backward compat
export const mockPRD = mockPRDs[0]

export const mockContracts: ApiContract[] = [
  { id: 'API-001', method: 'GET', endpoint: '/api/v1/preferences', description: 'Fetch user notification preferences', status: 'implemented', storyId: 'STORY-001' },
  { id: 'API-002', method: 'PUT', endpoint: '/api/v1/preferences', description: 'Update user notification preferences', status: 'implemented', storyId: 'STORY-001' },
  { id: 'API-003', method: 'GET', endpoint: '/api/v1/preferences/channels', description: 'List available channels and their configs', status: 'implemented', storyId: 'STORY-002' },
  { id: 'API-004', method: 'PUT', endpoint: '/api/v1/preferences/channels/:id', description: 'Update channel-specific settings', status: 'agreed', storyId: 'STORY-002' },
  { id: 'API-005', method: 'POST', endpoint: '/api/v1/preferences/import', description: 'Import preferences from JSON', status: 'agreed', storyId: 'STORY-003' },
  { id: 'API-006', method: 'GET', endpoint: '/api/v1/preferences/export', description: 'Export preferences as JSON', status: 'agreed', storyId: 'STORY-003' },
  { id: 'API-007', method: 'GET', endpoint: '/api/v1/routing/rules', description: 'List routing rules', status: 'agreed', storyId: 'STORY-004' },
  { id: 'API-008', method: 'POST', endpoint: '/api/v1/routing/rules', description: 'Create a routing rule', status: 'agreed', storyId: 'STORY-004' },
  { id: 'API-009', method: 'PUT', endpoint: '/api/v1/routing/rules/:id', description: 'Update a routing rule', status: 'draft', storyId: 'STORY-004' },
  { id: 'API-010', method: 'DELETE', endpoint: '/api/v1/routing/rules/:id', description: 'Delete a routing rule', status: 'draft', storyId: 'STORY-004' },
  { id: 'API-011', method: 'GET', endpoint: '/api/v1/routing/templates', description: 'List routing rule templates', status: 'draft', storyId: 'STORY-005' },
  { id: 'API-012', method: 'POST', endpoint: '/api/v1/routing/simulate', description: 'Simulate routing for a notification payload', status: 'draft', storyId: 'STORY-006' },
  { id: 'API-013', method: 'GET', endpoint: '/api/v1/routing/rules/:id/versions', description: 'Get version history for a rule', status: 'draft', storyId: 'STORY-007' },
  { id: 'API-014', method: 'POST', endpoint: '/api/v1/routing/rules/:id/rollback', description: 'Rollback a rule to a previous version', status: 'draft', storyId: 'STORY-007' },
  { id: 'API-015', method: 'GET', endpoint: '/api/v1/analytics/delivery', description: 'Delivery analytics summary', status: 'agreed', storyId: 'STORY-008' },
  { id: 'API-016', method: 'GET', endpoint: '/api/v1/analytics/channels', description: 'Per-channel delivery metrics', status: 'draft', storyId: 'STORY-009' },
  { id: 'API-017', method: 'GET', endpoint: '/api/v1/analytics/engagement', description: 'User engagement heatmap data', status: 'draft', storyId: 'STORY-010' },
  { id: 'API-018', method: 'POST', endpoint: '/api/v1/analytics/export', description: 'Export analytics report (CSV/PDF)', status: 'draft', storyId: 'STORY-011' },
  { id: 'API-019', method: 'POST', endpoint: '/api/v1/notifications/batch', description: 'Submit notification batch', status: 'draft', storyId: 'STORY-012' },
  { id: 'API-020', method: 'GET', endpoint: '/api/v1/dedup/rules', description: 'List deduplication rules', status: 'draft', storyId: 'STORY-013' },
  { id: 'API-021', method: 'GET', endpoint: '/api/v1/admin/workspaces', description: 'List workspaces', status: 'draft', storyId: 'STORY-015' },
  { id: 'API-022', method: 'GET', endpoint: '/api/v1/admin/users', description: 'List workspace users', status: 'draft', storyId: 'STORY-016' },
  { id: 'API-023', method: 'GET', endpoint: '/api/v1/admin/audit', description: 'Fetch audit log entries', status: 'draft', storyId: 'STORY-017' },
  { id: 'API-024', method: 'POST', endpoint: '/api/v1/integrations/slack/auth', description: 'Initiate Slack OAuth', status: 'agreed', storyId: 'STORY-018' },
  { id: 'API-025', method: 'POST', endpoint: '/api/v1/integrations/webhook', description: 'Register outbound webhook', status: 'agreed', storyId: 'STORY-019' },
  { id: 'API-026', method: 'POST', endpoint: '/api/v1/integrations/pagerduty', description: 'Configure PagerDuty integration', status: 'draft', storyId: 'STORY-020' },
  { id: 'API-027', method: 'POST', endpoint: '/api/v1/integrations/teams', description: 'Configure Teams connector', status: 'draft', storyId: 'STORY-021' },
  { id: 'API-028', method: 'POST', endpoint: '/api/v1/ml/predict', description: 'Get priority prediction for a notification', status: 'draft', storyId: 'STORY-022' },
  { id: 'API-029', method: 'POST', endpoint: '/api/v1/ml/feedback', description: 'Submit user feedback for ML retraining', status: 'draft', storyId: 'STORY-025' },
]
