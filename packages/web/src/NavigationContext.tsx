import { createContext, useContext } from 'react'
import type { WorkflowStepId } from './types'

interface NavigationContextType {
  navigateTo: (step: WorkflowStepId, itemId?: string) => void
  targetItemId: string | null
  targetGeneration: number
}

export const NavigationContext = createContext<NavigationContextType>({
  navigateTo: () => {},
  targetItemId: null,
  targetGeneration: 0,
})

export function useNavigation() {
  return useContext(NavigationContext)
}
