import { DATA_MODE } from './config'
import { apiClient } from './api-client'
import { mockClient } from './mock-client'

export const dataClient = DATA_MODE === 'mock' ? mockClient : apiClient
