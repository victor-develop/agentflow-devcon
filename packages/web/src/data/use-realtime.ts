import { useEffect, useRef, useCallback } from 'react'
import { DATA_MODE } from './config'
import type { WSMessage } from '@agentflow-devcon/shared'

type WSHandler = (msg: WSMessage) => void

export function useRealtime(onMessage: WSHandler) {
  const wsRef = useRef<WebSocket | null>(null)
  const handlerRef = useRef<WSHandler>(onMessage)
  handlerRef.current = onMessage

  useEffect(() => {
    if (DATA_MODE === 'mock') return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/ws`

    function connect() {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSMessage
          handlerRef.current(msg)
        } catch { /* ignore malformed messages */ }
      }

      ws.onclose = () => {
        // Reconnect after 2s
        setTimeout(connect, 2000)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { send }
}
