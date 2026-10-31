import { useState } from 'react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { type RowSelectionState } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

import { type Mesera } from '@/types/models'
import { useAuthStore } from '@/stores/auth-store'
import { useMeseras, useMeseraMutations } from '../hooks/use-meseras'
import { MeseraFormModal } from '../components/mesera-form-modal'
import { showApiError } from '@/lib/handle-server-error'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function MeserasPage() {
  const { auth } = useAuthStore()
  const billarId = auth.user?.billares_asignados[0] ?? 0

  const [modalOpen, setModalOpen] = useState(false)
  const [meseraSeleccionada, setMeseraSeleccionada] = useState<Mesera | undefined>(undefined)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: meseras, isLoading, isError } = useMeseras()
  const { updateEstado, deleteMuchos } = useMeseraMutations()

  // Derive selected rows from rowSelection state + meseras data
  const selectedRows =
    meseras?.filter((_, idx) => rowSelection[idx]) ?? []
  const selectedCount = selectedRows.length

  function handleEditar(mesera: Mesera) {
    setMeseraSeleccionada(mesera)
    setModalOpen(true)
  }

  function handleNueva() {
    setMeseraSeleccionada(undefined)
    setModalOpen(true)
  }

  function handleEditarSeleccionada() {
    if (selectedRows.length === 1) {
      handleEditar(selectedRows[0])
    }
  }

  function handleToggleEstado(mesera: Mesera) {
    updateEstado.mutate(
      { id: mesera.id, activa: !mesera.activa },
      {
        onError: (error) => showApiError(error, 'Error al cambiar el estado de la mesera'),
      }
    )
  }

  function handleDeleteConfirm() {
    const ids = selectedRows.map((m) => m.id)
    deleteMuchos.mutate(ids, {
      onSuccess: () => {
        toast.success(`${ids.length} mesera(s) eliminada(s) correctamente`)
        setRowSelection({})
        setDeleteDialogOpen(false)
      },
      onError: (error) => showApiError(error, 'Error al eliminar las meseras'),
    })
  }

  // All rows for manual selection tracking (using index-based selection)
  const allRows = meseras ?? []

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

  const allSelected =
    allRows.length > 0 && allRows.every((_, idx) => rowSelection[idx])
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
            <h2 className='text-2xl font-bold tracking-tight'>Meseras</h2>
            <p className='text-muted-foreground'>
              Gestiona las meseras del billar.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              disabled={selectedCount !== 1}
              onClick={handleEditarSeleccionada}
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
            <Button onClick={handleNueva}>
              <Plus className='mr-2 h-4 w-4' />
              Nueva Mesera
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
            <Users className='mb-4 h-12 w-12' />
            <p>Error al cargar las meseras. Intenta de nuevo.</p>
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
                  <TableHead>Mesera</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última actividad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-12 text-center'>
                      <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                        <Users className='h-10 w-10' />
                        <p>No hay meseras registradas.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  allRows.map((mesera, idx) => (
                    <TableRow
                      key={mesera.id}
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
                            <AvatarImage
                              src={mesera.foto_url}
                              alt={mesera.nombre_completo}
                            />
                            <AvatarFallback className='text-xs'>
                              {getInitials(mesera.nombre_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <span className='font-medium'>
                            {mesera.nombre_completo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {mesera.usuario}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Switch
                            checked={mesera.activa}
                            onCheckedChange={() => handleToggleEstado(mesera)}
                          />
                          <Badge
                            variant={mesera.activa ? 'default' : 'secondary'}
                          >
                            {mesera.activa ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {mesera.ultima_actividad
                          ? new Date(mesera.ultima_actividad).toLocaleString('es-MX')
                          : 'Sin actividad'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>

      <MeseraFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mesera={meseraSeleccionada}
        billarId={billarId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar meseras?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán {selectedCount} mesera(s). Esta acción no se puede
              deshacer.
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
