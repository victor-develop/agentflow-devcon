import { useState, useCallback, useMemo } from 'react'
import { WorkflowNav } from './components/WorkflowNav'
import { Sidebar } from './components/Sidebar'
import { EntityListView } from './components/EntityListView'
import { ComponentPreview } from './components/ComponentPreview'
import { ProblemView } from './views/ProblemView'
import { PRDView } from './views/PRDView'
import { StoriesView } from './views/StoriesView'
import { DesignSystemView } from './views/DesignSystemView'
import { ComponentsView } from './views/ComponentsView'
import { ContractsView } from './views/ContractsView'
import { PrototypeView } from './views/PrototypeView'
import { E2EView } from './views/E2EView'
import { HarnessView } from './views/HarnessView'
import { DevelopmentView } from './views/DevelopmentView'
import { VerificationView } from './views/VerificationView'
import { StepSelector } from './components/StepSelector'
import { ChatPanel } from './components/ChatPanel'
import { FileExplorer } from './components/FileExplorer'
import { NavigationContext } from './NavigationContext'
import { DATA_MODE } from './data'
import type { WorkflowStepId, DesignComponent } from './types'
import type { Entity } from '@agentflow-devcon/shared'
import { workflowSteps } from './mockData'
import './App.css'


// In mock mode (GitHub Pages demo), use the handcrafted views
// In API mode (CLI server), use generic EntityListView for live data
const mockViewMap: Record<WorkflowStepId, React.FC> = {
  problem: ProblemView,
  prd: PRDView,
  stories: StoriesView,
  design: DesignSystemView,
  components: ComponentsView,
  contracts: ContractsView,
  prototype: PrototypeView,
  e2e: E2EView,
  harness: HarnessView,
  development: DevelopmentView,
  verification: VerificationView,
}

// Map step IDs to process IDs used in .agentflow/
const stepToProcessId: Record<WorkflowStepId, string> = {
  problem: 'problem',
  prd: 'prd',
  stories: 'stories',
  design: 'design-system',
  components: 'components',
  contracts: 'contracts',
  prototype: 'prototype',
  e2e: 'e2e',
  harness: 'harness',
  development: 'development',
  verification: 'verification',
}


function entityToDesignComponent(entity: Entity): DesignComponent & { storyId: string } {
  return {
    id: entity.id,
    name: String(entity.name ?? ''),
    type: (entity.type as DesignComponent['type']) ?? 'component',
    status: (entity.status as DesignComponent['status']) ?? 'draft',
    figmaUrl: entity.figmaUrl ? String(entity.figmaUrl) : undefined,
    storyId: '',
  }
}

function renderComponentPreview(entity: Entity, allEntities: Entity[]) {
  const comp = entityToDesignComponent(entity)
  const children = comp.type === 'page'
    ? allEntities
        .filter(e => e.id !== entity.id && String(e.type) !== 'page')
        .map(entityToDesignComponent)
    : []
  return <ComponentPreview component={comp} childComponents={children} />
}

export default function App() {
  const [activeStep, setActiveStep] = useState<WorkflowStepId | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [targetItemId, setTargetItemId] = useState<string | null>(null)
  const [targetGeneration, setTargetGeneration] = useState(0)

  const navigateTo = useCallback((step: WorkflowStepId, itemId?: string) => {
    setActiveStep(step)
    if (itemId) {
      setTargetItemId(itemId)
      setTargetGeneration(g => g + 1)
    }
  }, [])

  const navCtx = useMemo(() => ({ navigateTo, targetItemId, targetGeneration }), [navigateTo, targetItemId, targetGeneration])

  if (!activeStep) {
    return <>
      <StepSelector onSelect={setActiveStep} />
      <FileExplorer />
    </>
  }

  const currentStep = workflowSteps.find(s => s.id === activeStep)!
  const useApiView = DATA_MODE === 'api'
  const ActiveMockView = mockViewMap[activeStep]

  return (
    <NavigationContext.Provider value={navCtx}>
      <div className="app-layout">
        <WorkflowNav
          steps={workflowSteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
          onHomeClick={() => setActiveStep(null)}
        />
        <div className="app-body">
          <Sidebar
            steps={workflowSteps}
            activeStep={activeStep}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onStepClick={setActiveStep}
          />
          <div className="main-with-chat">
            <main className="main-content">
              <div className="content-header">
                <div className="content-header-left">
                  <span className="phase-badge" data-phase={currentStep.phase}>
                    {currentStep.phase}
                  </span>
                  <h1>{currentStep.label}</h1>
                </div>
                <div className="content-header-right">
                  <span className={`status-indicator status-${currentStep.status}`}>
                    {currentStep.status}
                  </span>
                </div>
              </div>
              <div className="content-body">
                {useApiView
                  ? <EntityListView
                      processId={stepToProcessId[activeStep]}
                      renderItemExtra={activeStep === 'components' ? renderComponentPreview : undefined}
                    />
                  : <ActiveMockView />
                }
              </div>
            </main>
            <ChatPanel activeStep={activeStep} processId={stepToProcessId[activeStep]} />
          </div>
        </div>
        <FileExplorer />
      </div>
    </NavigationContext.Provider>
  )
}
