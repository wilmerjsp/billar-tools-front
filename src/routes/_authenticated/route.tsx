import { createFileRoute, redirect } from '@tanstack/react-router'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/auth-store'
import { authUserFromToken } from '@/lib/jwt'
import { loadUserDisplay } from '@/lib/user-display-storage'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { UserRole } from '@/types/enums'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()

    // Si ya hay access_token en memoria, restaurar user si falta
    if (auth.accessToken) {
      const user = auth.user ?? authUserFromToken(auth.accessToken)
      // Un superadmin no debe acceder al panel de admin
      if (user.rol === UserRole.SUPERADMIN) {
        auth.reset()
        throw redirect({ to: '/sign-in', search: { redirect: location.pathname } })
      }
      if (!auth.user) auth.setUser(user)
      auth.setIsLoading(false)
      return
    }

    // Intentar restaurar sesión via httpOnly cookie (withCredentials: true lo envía automáticamente)
    try {
      const { data } = await api.post('/api/v1/auth/admin/refresh')
      // El interceptor ya puede haber desenvuelto { success, data: { access_token } }
      // pero manejamos ambos formatos por si acaso
      const token: string =
        (data as { data?: { access_token: string } }).data?.access_token ??
        (data as { access_token: string }).access_token
      if (!token) throw new Error('No access_token in refresh response')
      const fromJwt = authUserFromToken(token)
      // Un superadmin no debe acceder al panel de admin
      if (fromJwt.rol === UserRole.SUPERADMIN) throw new Error('Insufficient role')
      const display = loadUserDisplay()
      const user = {
        ...fromJwt,
        nombre: fromJwt.nombre || display?.nombre || display?.email || '',
        email: fromJwt.email || display?.email || '',
      }
      auth.setAccessToken(token)
      auth.setUser(user)
    } catch {
      auth.reset()
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }

    auth.setIsLoading(false)
  },
  component: AuthenticatedLayout,
})
