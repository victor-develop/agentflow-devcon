import { WebSocketServer, type WebSocket } from 'ws'
import type { Server } from 'node:http'
import type { WSMessage } from '@agentflow-devcon/shared'

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' })
  const clients = new Set<WebSocket>()

  wss.on('connection', (ws) => {
    clients.add(ws)
    ws.on('close', () => clients.delete(ws))
    ws.on('error', () => clients.delete(ws))
  })

  function broadcast(msg: WSMessage) {
    const data = JSON.stringify(msg)
    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(data)
      }
    }
  }

  return { wss, broadcast }
}
