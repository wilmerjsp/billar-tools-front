import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CajeroFormModal } from '../components/cajero-form-modal'
import { useCajeros } from '../hooks/use-usuarios'

export function UsuariosPage() {
  const { data: cajeros, isLoading, isError } = useCajeros()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Usuarios</h1>
            <p className='text-sm text-muted-foreground'>
              Gestión de cajeros del billar
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <PlusIcon className='mr-2 h-4 w-4' />
            Nuevo Cajero
          </Button>
        </div>

        {isLoading && (
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        )}

        {isError && (
          <p className='text-sm text-destructive'>
            Error al cargar los usuarios.
          </p>
        )}

        {!isLoading && !isError && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Billar asignado</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(cajeros ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-center text-muted-foreground'
                  >
                    No hay cajeros registrados
                  </TableCell>
                </TableRow>
              ) : (
                (cajeros ?? []).map((cajero) => (
                  <TableRow key={cajero.id}>
                    <TableCell className='font-medium'>
                      {cajero.nombre}
                    </TableCell>
                    <TableCell>{cajero.email}</TableCell>
                    <TableCell className='capitalize'>{cajero.rol}</TableCell>
                    <TableCell>
                      {cajero.billares.length > 0
                        ? cajero.billares.map((b) => b.billar_id).join(', ')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={cajero.activo ? 'default' : 'secondary'}
                      >
                        {cajero.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <CajeroFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </Main>
    </>
  )
}
