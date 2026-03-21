export type DataMode = 'api' | 'mock'

export const DATA_MODE: DataMode =
  (import.meta.env.VITE_DATA_MODE as DataMode) || 'api'
