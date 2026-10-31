import { create } from 'zustand'
import { type AuthUser } from '@/types/models'

interface SuperAdminAuthState {
  auth: {
    user: AuthUser | null
    accessToken: string
    isAuthenticated: boolean
    isLoading: boolean
    setUser: (user: AuthUser | null) => void
    setAccessToken: (accessToken: string) => void
    setIsLoading: (loading: boolean) => void
    reset: () => void
  }
}

export const useSuperAdminAuthStore = create<SuperAdminAuthState>()((set) => ({
  auth: {
    user: null,
    accessToken: '',
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) =>
      set((state) => ({
        auth: { ...state.auth, user, isAuthenticated: !!user },
      })),
    setAccessToken: (accessToken) =>
      set((state) => ({
        auth: { ...state.auth, accessToken, isAuthenticated: !!accessToken },
      })),
    setIsLoading: (isLoading) =>
      set((state) => ({ auth: { ...state.auth, isLoading } })),
    reset: () =>
      set((state) => ({
        auth: {
          ...state.auth,
          user: null,
          accessToken: '',
          isAuthenticated: false,
          isLoading: false,
        },
      })),
  },
}))
