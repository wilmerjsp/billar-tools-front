import { useWebSocket } from '@/hooks/use-web-socket'

export function useKanbanRealTime() {
  useWebSocket('pedidos')
}
