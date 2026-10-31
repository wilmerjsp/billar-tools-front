import { ShieldCheck } from 'lucide-react'

export function AdministradoresSuperAdminPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center gap-3'>
        <ShieldCheck className='h-6 w-6' />
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Administradores</h1>
          <p className='text-muted-foreground'>
            Gestiona las cuentas de administrador de la plataforma
          </p>
        </div>
      </div>

      <div className='rounded-lg border border-dashed p-12 text-center'>
        <ShieldCheck className='mx-auto h-12 w-12 text-muted-foreground/40' />
        <h3 className='mt-4 text-lg font-semibold'>Módulo en construcción</h3>
        <p className='mt-2 text-sm text-muted-foreground'>
          Aquí podrás crear y gestionar las cuentas de los administradores de cada billar.
        </p>
      </div>
    </div>
  )
}
