import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const dataMode = process.env.VITE_DATA_MODE || 'api'

export default defineConfig({
  base: dataMode === 'mock' ? '/agentflow-devcon/' : '/',
  plugins: [react()],
  server: {
    proxy: dataMode === 'api' ? {
      '/api': 'http://localhost:4170',
      '/ws': {
        target: 'ws://localhost:4170',
        ws: true,
      },
    } : undefined,
  },
})
