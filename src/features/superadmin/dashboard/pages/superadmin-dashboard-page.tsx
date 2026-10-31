import { ShieldCheck, Building2, CreditCard, Users } from 'lucide-react'
import { useSuperAdminAuthStore } from '@/stores/superadmin-auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SuperAdminDashboardPage() {
  const user = useSuperAdminAuthStore((s) => s.auth.user)

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          Bienvenido, {user?.nombre ?? 'Super Admin'}
        </h1>
        <p className='text-muted-foreground'>
          Panel de administración de la plataforma Billar Tools
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Billares</CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>—</p>
            <p className='text-xs text-muted-foreground'>Total registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Suscripciones activas</CardTitle>
            <CreditCard className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>—</p>
            <p className='text-xs text-muted-foreground'>Planes vigentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Administradores</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>—</p>
            <p className='text-xs text-muted-foreground'>Cuentas admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Estado</CardTitle>
            <ShieldCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-green-600'>OK</p>
            <p className='text-xs text-muted-foreground'>Plataforma operativa</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
