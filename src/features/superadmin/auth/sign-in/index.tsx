import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '@/features/auth/auth-layout'
import { SuperAdminAuthForm } from './components/superadmin-auth-form'

export function SuperAdminSignIn() {
  const { redirect } = useSearch({ from: '/(auth)/superadmin-sign-in' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Panel Super Admin</CardTitle>
          <CardDescription>
            Acceso exclusivo para administración de la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuperAdminAuthForm redirectTo={redirect} />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
