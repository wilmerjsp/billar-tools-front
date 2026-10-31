import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
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
import { type Billar } from '@/types/models'
import { SucursalFormModal } from '../components/sucursal-form-modal'
import { useSucursalMutations, useSucursales } from '../hooks/use-sucursales'
import { showApiError } from '@/lib/handle-server-error'

export function SucursalesPage() {
  const { data: sucursales, isLoading, isError } = useSucursales()
  const { updateEstado } = useSucursalMutations()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState<
    Billar | undefined
  >(undefined)

  function handleEdit(sucursal: Billar) {
    setSelectedSucursal(sucursal)
    setModalOpen(true)
  }

  function handleNueva() {
    setSelectedSucursal(undefined)
    setModalOpen(true)
  }

  function handleToggleEstado(sucursal: Billar) {
    updateEstado.mutate(
      { id: sucursal.id, activo: !sucursal.activo },
      {
        onSuccess: () =>
          toast.success(
            sucursal.activo
              ? 'Sucursal desactivada'
              : 'Sucursal activada'
          ),
        onError: (error) => showApiError(error, 'Error al cambiar el estado'),
      }
    )
  }

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
            <h1 className='text-2xl font-bold tracking-tight'>Sucursales</h1>
            <p className='text-sm text-muted-foreground'>
              Gestión de billares / sucursales
            </p>
          </div>
          <Button onClick={handleNueva}>
            <PlusIcon className='mr-2 h-4 w-4' />
            Nueva Sucursal
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
            Error al cargar las sucursales.
          </p>
        )}

        {!isLoading && !isError && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className='text-right'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sucursales ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-center text-muted-foreground'
                  >
                    No hay sucursales registradas
                  </TableCell>
                </TableRow>
              ) : (
                (sucursales ?? []).map((sucursal) => (
                  <TableRow key={sucursal.id}>
                    <TableCell className='font-medium'>
                      {sucursal.nombre}
                    </TableCell>
                    <TableCell>
                      {sucursal.direccion ?? (
                        <span className='text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sucursal.telefono ?? (
                        <span className='text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sucursal.activo ? 'default' : 'secondary'}
                      >
                        {sucursal.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEdit(sucursal)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleToggleEstado(sucursal)}
                          disabled={updateEstado.isPending}
                        >
                          {sucursal.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <SucursalFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          sucursal={selectedSucursal}
        />
      </Main>
    </>
  )
}
