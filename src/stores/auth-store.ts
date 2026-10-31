import { create } from 'zustand'
import { type AuthUser } from '@/types/models'
import { clearUserDisplay } from '@/lib/user-display-storage'

// Los tokens NUNCA se guardan en localStorage ni sessionStorage (XSS).
// Se almacenan únicamente en memoria (RAM). Al recargar la página se pierden,
// pero el refresh_token en memoria permite restaurar la sesión automáticamente.

interface AuthState {
  auth: {
    user: AuthUser | null
    accessToken: string
    refreshToken: string
    isAuthenticated: boolean
    isLoading: boolean
    setUser: (user: AuthUser | null) => void
    setAccessToken: (accessToken: string) => void
    setRefreshToken: (refreshToken: string) => void
    setTokens: (accessToken: string, refreshToken: string) => void
    setIsLoading: (loading: boolean) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: null,
    accessToken: '',
    refreshToken: '',
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) =>
      set((state) => ({
        auth: { ...state.auth, user, isAuthenticated: !!user },
      })),
    setAccessToken: (accessToken) =>
      set((state) => ({
        auth: {
          ...state.auth,
          accessToken,
          isAuthenticated: !!accessToken,
        },
      })),
    setRefreshToken: (refreshToken) =>
      set((state) => ({ auth: { ...state.auth, refreshToken } })),
    setTokens: (accessToken, refreshToken) =>
      set((state) => ({
        auth: {
          ...state.auth,
          accessToken,
          refreshToken,
          isAuthenticated: !!accessToken,
        },
      })),
    setIsLoading: (isLoading) =>
      set((state) => ({ auth: { ...state.auth, isLoading } })),
    reset: () => {
      clearUserDisplay()
      return set((state) => ({
        auth: {
          ...state.auth,
          user: null,
          accessToken: '',
          refreshToken: '',
          isAuthenticated: false,
          isLoading: false,
        },
      }))
    },
  },
}))
