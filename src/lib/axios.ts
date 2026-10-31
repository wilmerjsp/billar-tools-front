import axios from 'axios'
import { ENV } from './constants'

// Importación diferida para evitar dependencia circular
let getAuthStore: () => {
  auth: {
    accessToken: string
    refreshToken: string
    setAccessToken: (token: string) => void
    setUser: (user: import('@/types/models').AuthUser | null) => void
    reset: () => void
  }
}

async function loadAuthStore() {
  if (!getAuthStore) {
    const mod = await import('@/stores/auth-store')
    getAuthStore = mod.useAuthStore.getState
  }
}

const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
  headers: { 'X-Client': 'web' },
})

// Inyectar access_token en cada request.
// Excepciones:
//   - REFRESH_URL: se autentica solo con la httpOnly cookie — enviar un Bearer expirado
//     hace que el backend rechace la petición con 401 antes de revisar la cookie.
//   - Si el llamador ya puso Authorization explícito (e.g. token provisional en login
//     multi-billar), no sobrescribir.
api.interceptors.request.use(async (config) => {
  await loadAuthStore()
  const token = getAuthStore().auth.accessToken
  const isRefresh = config.url === REFRESH_URL
  if (token && !isRefresh && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Desenvolver el envelope { success, data, message } automáticamente
api.interceptors.response.use((response) => {
  if (
    response.data &&
    typeof response.data === 'object' &&
    'success' in response.data &&
    'data' in response.data
  ) {
    response.data = response.data.data
  }
  return response
})

const REFRESH_URL = '/api/v1/auth/admin/refresh'
const LOGIN_URL = '/api/v1/auth/admin/login'

// Lock para evitar múltiples refresh simultáneos (thundering herd).
// Todos los requests que fallan con 401 al mismo tiempo comparten este Promise.
let refreshPromise: Promise<string> | null = null

async function doRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<{ access_token: string }>(REFRESH_URL)
      .then(async ({ data }) => {
        if (!data?.access_token) throw new Error('Invalid token refresh response')
        const { authUserFromToken } = await import('@/lib/jwt')
        const { loadUserDisplay } = await import('@/lib/user-display-storage')
        const store = getAuthStore().auth
        store.setAccessToken(data.access_token)
        const fromJwt = authUserFromToken(data.access_token)
        const display = loadUserDisplay()
        store.setUser({
          ...fromJwt,
          nombre: fromJwt.nombre || display?.nombre || display?.email || '',
          email: fromJwt.email || display?.email || '',
        })
        return data.access_token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// Manejar expiración y refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isRefreshEndpoint = original?.url === REFRESH_URL
    const isLoginEndpoint = original?.url === LOGIN_URL

    if (error.response?.status === 401 && !original._retry && !isRefreshEndpoint && !isLoginEndpoint) {
      original._retry = true
      try {
        await loadAuthStore()
        // El refresh_token viaja como httpOnly cookie (withCredentials: true lo envía automáticamente)
        const newToken = await doRefresh()
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        await loadAuthStore()
        getAuthStore().auth.reset()
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api
