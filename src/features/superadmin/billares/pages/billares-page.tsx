import { useState } from 'react'
import { Building2, MapPin, Pencil, Phone, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { type Billar } from '@/types/models'
import { useBillaresSa, useToggleEstadoBillar } from '../hooks/use-billares-sa'
import { CreateTenantDialog } from '../components/create-tenant-dialog'
import { EditBillarDialog } from '../components/edit-billar-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { showApiError } from '@/lib/handle-server-error'

export function BillaresSuperAdminPage() {
  const [openCreate, setOpenCreate] = useState(false)
  const [billarToEdit, setBillarToEdit] = useState<Billar | null>(null)
  const { data: billares, isLoading, isError } = useBillaresSa()
  const toggleEstado = useToggleEstadoBillar()

  function handleToggle(billarId: number, activo: boolean) {
    toggleEstado.mutate(
      { billarId, activo },
      {
        onError: (error) => showApiError(error, 'Error al cambiar el estado del billar'),
      }
    )
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Building2 className='h-6 w-6' />
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Billares</h1>
            <p className='text-muted-foreground'>
              Gestiona los tenants registrados en la plataforma
            </p>
          </div>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className='h-4 w-4' />
          Nuevo tenant
        </Button>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Billar</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className='h-4 w-40' /></TableCell>
                  <TableCell><Skeleton className='h-4 w-32' /></TableCell>
                  <TableCell><Skeleton className='h-4 w-24' /></TableCell>
                  <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                  <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                  <TableCell><Skeleton className='h-4 w-10' /></TableCell>
                  <TableCell><Skeleton className='h-4 w-8' /></TableCell>
                </TableRow>
              ))
            )}

            {isError && (
              <TableRow>
                <TableCell colSpan={7} className='py-10 text-center text-muted-foreground'>
                  Error al cargar los billares
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && billares?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center'>
                  <Building2 className='mx-auto mb-3 h-10 w-10 text-muted-foreground/40' />
                  <p className='text-sm text-muted-foreground'>
                    No hay tenants registrados. Crea el primero.
                  </p>
                </TableCell>
              </TableRow>
            )}

            {billares?.map((b) => (
              <TableRow key={b.id}>
                <TableCell className='font-medium'>
                  <Link
                    to='/superadmin/billares/$billarId'
                    params={{ billarId: String(b.id) }}
                    className='hover:underline'
                  >
                    {b.nombre}
                  </Link>
                </TableCell>
                <TableCell>
                  {b.direccion ? (
                    <span className='flex items-center gap-1 text-muted-foreground'>
                      <MapPin className='h-3 w-3 shrink-0' />
                      {b.direccion}
                    </span>
                  ) : (
                    <span className='text-muted-foreground/50'>—</span>
                  )}
                </TableCell>
                <TableCell>
                  {b.telefono ? (
                    <span className='flex items-center gap-1 text-muted-foreground'>
                      <Phone className='h-3 w-3 shrink-0' />
                      {b.telefono}
                    </span>
                  ) : (
                    <span className='text-muted-foreground/50'>—</span>
                  )}
                </TableCell>
                <TableCell>
                  {b.es_prueba ? (
                    <Badge variant='outline'>Prueba</Badge>
                  ) : (
                    <span className='text-muted-foreground/50'>—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={b.activo ? 'default' : 'secondary'}>
                    {b.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={b.activo}
                    onCheckedChange={(checked) => handleToggle(b.id, checked)}
                    disabled={toggleEstado.isPending}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant='ghost'
                    size='icon'
                    aria-label={`Editar ${b.nombre}`}
                    onClick={() => setBillarToEdit(b)}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateTenantDialog open={openCreate} onOpenChange={setOpenCreate} />
      <EditBillarDialog
        billar={billarToEdit}
        open={billarToEdit !== null}
        onOpenChange={(v) => { if (!v) setBillarToEdit(null) }}
      />
    </div>
  )
}
