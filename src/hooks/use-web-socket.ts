import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { ENV } from '@/lib/constants'

export function useWebSocket(channel: string, onMessage?: (payload: unknown) => void) {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const billarId = auth.user?.billares_asignados[0]
    if (!billarId || !auth.accessToken) return

    let ws: WebSocket | null = null
    let cancelled = false

    function connect() {
      if (cancelled) return

      const currentToken = useAuthStore.getState().auth.accessToken
      if (!currentToken) return

      // Paso 1 — Conectar sin token en la URL
      const url = `${ENV.WS_BASE_URL}/ws/${billarId}/${channel}`
      ws = new WebSocket(url)

      ws.onopen = () => {
        // Paso 2 — Enviar token como primer mensaje (dentro de los 5s que exige el servidor)
        ws?.send(JSON.stringify({ token: currentToken }))
      }

      ws.onmessage = (event) => {
        let payload: unknown
        try {
          payload = JSON.parse(event.data as string)
        } catch {
          payload = event.data
        }

        // Paso 3 — Esperar confirmación antes de procesar eventos normales
        if (
          payload &&
          typeof payload === 'object' &&
          (payload as Record<string, unknown>).event === 'authenticated'
        ) {
          if (import.meta.env.DEV) {
            console.debug(`[WS:${channel}] authenticated`)
          }
          // Refrescar al (re)conectar: los eventos emitidos mientras el socket
          // estuvo cerrado se perdieron, así que la caché puede estar obsoleta
          queryClient.invalidateQueries({ queryKey: [channel] })
          return
        }

        if (import.meta.env.DEV) {
          console.debug(`[WS:${channel}] message:`, payload)
        }
        queryClient.invalidateQueries({ queryKey: [channel] })
        onMessage?.(payload)
      }

      ws.onerror = (event) => {
        if (import.meta.env.DEV) {
          console.warn(`[WS:${channel}] error:`, event)
        }
      }

      ws.onclose = ({ code }) => {
        if (cancelled) return
        if (!useAuthStore.getState().auth.accessToken) return
        // Código 1008 = token inválido/expirado — no tiene sentido reconectar
        // con el mismo token; el useEffect se encargará cuando el token cambie
        if (code === 1008) return
        if (import.meta.env.DEV) {
          console.debug(`[WS:${channel}] closed (${code}) — reconnecting in 3s`)
        }
        reconnectTimer.current = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      if (ws) {
        // Nullify handlers first so the forced close (e.g. React Strict Mode double-invoke)
        // doesn't fire onerror / onclose and trigger a spurious reconnect or console warning
        ws.onopen = null
        ws.onmessage = null
        ws.onerror = null
        ws.onclose = null
        ws.close()
      }
    }
  }, [channel, auth.accessToken, auth.user, queryClient, onMessage])
}
