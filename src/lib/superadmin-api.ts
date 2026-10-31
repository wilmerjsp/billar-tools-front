import axios from 'axios'
import { ENV } from './constants'

let getSuperAdminStore: () => {
  auth: {
    accessToken: string
    setAccessToken: (token: string) => void
    setUser: (user: import('@/types/models').AuthUser | null) => void
    reset: () => void
  }
}

async function loadSuperAdminStore() {
  if (!getSuperAdminStore) {
    const mod = await import('@/stores/superadmin-auth-store')
    getSuperAdminStore = mod.useSuperAdminAuthStore.getState
  }
}

const superAdminApi = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
  headers: { 'X-Client': 'web' },
})

const SUPERADMIN_REFRESH_URL = '/api/v1/auth/admin/refresh'
const SUPERADMIN_LOGIN_URL = '/api/v1/auth/admin/login'

superAdminApi.interceptors.request.use(async (config) => {
  await loadSuperAdminStore()
  const token = getSuperAdminStore().auth.accessToken
  const isRefresh = config.url === SUPERADMIN_REFRESH_URL
  if (token && !isRefresh && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

superAdminApi.interceptors.response.use((response) => {
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

let refreshPromise: Promise<string> | null = null

async function doRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = superAdminApi
      .post<{ access_token: string }>(SUPERADMIN_REFRESH_URL)
      .then(async ({ data }) => {
        if (!data?.access_token) throw new Error('Invalid token refresh response')
        const { authUserFromToken } = await import('@/lib/jwt')
        const store = getSuperAdminStore().auth
        store.setAccessToken(data.access_token)
        const user = authUserFromToken(data.access_token)
        store.setUser(user)
        return data.access_token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

superAdminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isRefreshEndpoint = original?.url === SUPERADMIN_REFRESH_URL
    const isLoginEndpoint = original?.url === SUPERADMIN_LOGIN_URL

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isRefreshEndpoint &&
      !isLoginEndpoint
    ) {
      original._retry = true
      try {
        await loadSuperAdminStore()
        const newToken = await doRefresh()
        original.headers.Authorization = `Bearer ${newToken}`
        return superAdminApi(original)
      } catch (refreshError) {
        await loadSuperAdminStore()
        getSuperAdminStore().auth.reset()
        window.location.href = '/superadmin-sign-in'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default superAdminApi
