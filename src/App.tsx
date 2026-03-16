import { useState } from 'react'
import { WorkflowNav } from './components/WorkflowNav'
import { Sidebar } from './components/Sidebar'
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
import type { WorkflowStepId } from './types'
import { workflowSteps } from './mockData'
import './App.css'

const viewMap: Record<WorkflowStepId, React.FC> = {
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

export default function App() {
  const [activeStep, setActiveStep] = useState<WorkflowStepId | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!activeStep) {
    return <StepSelector onSelect={setActiveStep} />
  }

  const ActiveView = viewMap[activeStep]
  const currentStep = workflowSteps.find(s => s.id === activeStep)!

  return (
    <div className="app-layout">
      <WorkflowNav
        steps={workflowSteps}
        activeStep={activeStep}
        onStepClick={setActiveStep}
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
              <ActiveView />
            </div>
          </main>
          <ChatPanel activeStep={activeStep} />
        </div>
      </div>
    </div>
  )
}
