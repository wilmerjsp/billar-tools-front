import { createFileRoute, redirect } from '@tanstack/react-router'
import { useSuperAdminAuthStore } from '@/stores/superadmin-auth-store'
import { authUserFromToken } from '@/lib/jwt'
import superAdminApi from '@/lib/superadmin-api'
import { SuperAdminLayout } from '@/components/layout/superadmin-layout'
import { UserRole } from '@/types/enums'

export const Route = createFileRoute('/superadmin')({
  beforeLoad: async ({ location }) => {
    const { auth } = useSuperAdminAuthStore.getState()

    if (auth.accessToken) {
      const user = auth.user ?? authUserFromToken(auth.accessToken)
      if (user.rol !== UserRole.SUPERADMIN) {
        auth.reset()
        throw redirect({ to: '/superadmin-sign-in', search: { redirect: location.pathname } })
      }
      if (!auth.user) auth.setUser(user)
      auth.setIsLoading(false)
      return
    }

    try {
      const { data } = await superAdminApi.post('/api/v1/auth/admin/refresh')
      const token: string =
        (data as { data?: { access_token: string } }).data?.access_token ??
        (data as { access_token: string }).access_token
      if (!token) throw new Error('No access_token in refresh response')
      const user = authUserFromToken(token)
      if (user.rol !== UserRole.SUPERADMIN) throw new Error('Insufficient role')
      auth.setAccessToken(token)
      auth.setUser(user)
    } catch {
      auth.reset()
      throw redirect({
        to: '/superadmin-sign-in',
        search: { redirect: location.pathname },
      })
    }

    auth.setIsLoading(false)
  },
  component: SuperAdminLayout,
})
