import { useState } from 'react'
import { Pencil, Plus, Trash2, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { type RowSelectionState } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

import { type Cajero } from '@/types/models'
import { useCajeros, useCajeroMutations } from '../hooks/use-cajeros'
import { CajeroFormModal } from '../components/cajero-form-modal'
import { showApiError } from '@/lib/handle-server-error'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function CajerosPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [cajeroSeleccionado, setCajeroSeleccionado] = useState<Cajero | undefined>(undefined)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: cajeros, isLoading, isError } = useCajeros()
  const { deleteMuchos } = useCajeroMutations()

  const allRows = cajeros ?? []
  const selectedRows = allRows.filter((_, idx) => rowSelection[idx])
  const selectedCount = selectedRows.length

  function handleEditar(cajero: Cajero) {
    setCajeroSeleccionado(cajero)
    setModalOpen(true)
  }

  function handleNuevo() {
    setCajeroSeleccionado(undefined)
    setModalOpen(true)
  }

  function handleEditarSeleccionado() {
    if (selectedRows.length === 1) {
      handleEditar(selectedRows[0])
    }
  }

  function handleDeleteConfirm() {
    const ids = selectedRows.map((c) => c.id)
    deleteMuchos.mutate(ids, {
      onSuccess: () => {
        toast.success(`${ids.length} cajero(s) eliminado(s) correctamente`)
        setRowSelection({})
        setDeleteDialogOpen(false)
      },
      onError: (error) => showApiError(error, 'Error al eliminar los cajeros'),
    })
  }

  function isRowSelected(idx: number) {
    return !!rowSelection[idx]
  }

  function toggleRow(idx: number) {
    setRowSelection((prev) => {
      const next = { ...prev }
      if (next[idx]) {
        delete next[idx]
      } else {
        next[idx] = true
      }
      return next
    })
  }

  const allSelected = allRows.length > 0 && allRows.every((_, idx) => rowSelection[idx])
  const someSelected = allRows.some((_, idx) => rowSelection[idx])

  function toggleAll() {
    if (allSelected) {
      setRowSelection({})
    } else {
      const next: RowSelectionState = {}
      allRows.forEach((_, idx) => { next[idx] = true })
      setRowSelection(next)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Cajeros</h2>
            <p className='text-muted-foreground'>Gestiona los cajeros del sistema.</p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              disabled={selectedCount !== 1}
              onClick={handleEditarSeleccionado}
            >
              <Pencil className='mr-2 h-4 w-4' />
              Editar
            </Button>
            <Button
              variant='destructive'
              disabled={selectedCount === 0}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Eliminar{selectedCount > 0 ? ` (${selectedCount})` : ''}
            </Button>
            <Button onClick={handleNuevo}>
              <Plus className='mr-2 h-4 w-4' />
              Nuevo Cajero
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className='space-y-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='h-14 w-full' />
            ))}
          </div>
        )}

        {isError && (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <UserCog className='mb-4 h-12 w-12' />
            <p>Error al cargar los cajeros. Intenta de nuevo.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[50px]'>
                    <Checkbox
                      checked={allSelected || (someSelected && 'indeterminate')}
                      onCheckedChange={toggleAll}
                      aria-label='Seleccionar todo'
                    />
                  </TableHead>
                  <TableHead>Cajero</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último acceso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-12 text-center'>
                      <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                        <UserCog className='h-10 w-10' />
                        <p>No hay cajeros registrados.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  allRows.map((cajero, idx) => (
                    <TableRow
                      key={cajero.id}
                      data-state={isRowSelected(idx) ? 'selected' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isRowSelected(idx)}
                          onCheckedChange={() => toggleRow(idx)}
                          aria-label='Seleccionar fila'
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback className='text-xs'>
                              {getInitials(cajero.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <span className='font-medium'>{cajero.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>{cajero.email}</TableCell>
                      <TableCell>
                        <Badge variant={cajero.activo ? 'default' : 'secondary'}>
                          {cajero.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {cajero.ultimo_login
                          ? new Date(cajero.ultimo_login).toLocaleString('es-MX')
                          : 'Sin acceso'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>

      <CajeroFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cajero={cajeroSeleccionado}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cajeros?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán {selectedCount} cajero(s). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
