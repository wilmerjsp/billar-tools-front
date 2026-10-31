import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useSuperAdminAuthStore } from '@/stores/superadmin-auth-store'
import { SuperAdminSignIn } from '@/features/superadmin/auth/sign-in'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/superadmin-sign-in')({
  beforeLoad: () => {
    const { auth } = useSuperAdminAuthStore.getState()
    if (auth.isAuthenticated) {
      throw redirect({ to: '/superadmin' })
    }
  },
  component: SuperAdminSignIn,
  validateSearch: searchSchema,
})
