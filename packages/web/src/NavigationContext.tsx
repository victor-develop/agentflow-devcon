import { createContext, useContext } from 'react'
import type { WorkflowStepId } from './types'

interface NavigationContextType {
  navigateTo: (step: WorkflowStepId, itemId?: string) => void
}

export const NavigationContext = createContext<NavigationContextType>({
  navigateTo: () => {},
})

export function useNavigation() {
  return useContext(NavigationContext)
}
