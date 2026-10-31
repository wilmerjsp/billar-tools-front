const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) throw new Error('VITE_API_URL no está definida')

// Deriva la URL base de WebSocket desde VITE_API_URL (http→ws, https→wss)
const wsBaseUrl = (import.meta.env.VITE_WS_URL as string | undefined) ?? apiUrl.replace(/^http/, 'ws')

export const ENV = {
  API_URL: apiUrl,
  WS_BASE_URL: wsBaseUrl,
} as const
