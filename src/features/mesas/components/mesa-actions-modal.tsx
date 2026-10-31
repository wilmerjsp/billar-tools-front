import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CalendarClock, Lock, Pencil, PlayCircle, Trash2, Wrench, CircleCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MesaStatus } from '@/types/enums'
import { type Mesa } from '@/types/models'
import { useMesaMutations } from '../hooks/use-mesas'
import { showApiError } from '@/lib/handle-server-error'

interface MesaActionsModalProps {
  mesa: Mesa | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (mesa: Mesa) => void
}

export function MesaActionsModal({
  mesa,
  open,
  onOpenChange,
  onEdit,
}: MesaActionsModalProps) {
  const navigate = useNavigate()
  const { updateEstado, deleteMesa } = useMesaMutations()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const mesaLabel = mesa ? (mesa.nombre ?? `Mesa ${mesa.numero}`) : ''

  function handleClose() {
    setConfirmDelete(false)
    onOpenChange(false)
  }

  function handleEstado(status: MesaStatus) {
    if (!mesa) return
    updateEstado.mutate(
      { id: mesa.id, status },
      {
        onSuccess: () => {
          toast.success(`Mesa marcada como ${status.toLowerCase()}`)
          handleClose()
        },
        onError: (error) => {
          showApiError(error, 'No se pudo actualizar el estado de la mesa')
        },
      }
    )
  }

  function handleDelete() {
    if (!mesa) return
    deleteMesa.mutate(mesa.id, {
      onSuccess: () => {
        toast.success(`${mesaLabel} eliminada`)
        handleClose()
      },
      onError: (error) => {
        showApiError(error, 'No se pudo eliminar la mesa')
      },
    })
  }

  const isPending = updateEstado.isPending || deleteMesa.isPending
  const isOcupada = mesa?.status === MesaStatus.OCUPADA

  // Mesa ocupada: se bloquean todas las acciones para no interferir con el
  // juego en curso. La gestión se hace desde Juegos Activos.
  if (isOcupada) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>{mesaLabel}</DialogTitle>
            <DialogDescription>
              Esta mesa está ocupada con un juego en curso.
            </DialogDescription>
          </DialogHeader>

          <div className='flex items-start gap-3 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground'>
            <Lock className='mt-0.5 h-5 w-5 shrink-0' />
            <p>
              Las acciones de esta mesa están bloqueadas mientras el juego esté
              activo. Para gestionar consumos o finalizar el juego, hazlo desde
              Juegos Activos.
            </p>
          </div>

          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={handleClose}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                handleClose()
                navigate({ to: '/juegos' })
              }}
            >
              <PlayCircle className='mr-2 h-5 w-5' />
              Ver Juegos Activos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (confirmDelete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Eliminar {mesaLabel}</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar
              esta mesa?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isPending}
            >
              {deleteMesa.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>{mesaLabel}</DialogTitle>
          <DialogDescription>Selecciona una acción para esta mesa</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-3 py-2'>
          <Button
            variant='outline'
            className='justify-start gap-3 h-12'
            onClick={() => {
              if (mesa && onEdit) {
                onEdit(mesa)
                handleClose()
              }
            }}
            disabled={isPending}
          >
            <Pencil className='h-5 w-5' />
            Editar información
          </Button>

          {mesa?.status !== MesaStatus.DISPONIBLE && (
            <Button
              variant='outline'
              className='justify-start gap-3 h-12 text-green-600 hover:text-green-600'
              onClick={() => handleEstado(MesaStatus.DISPONIBLE)}
              disabled={isPending}
            >
              <CircleCheck className='h-5 w-5' />
              Marcar como Disponible
            </Button>
          )}

          {mesa?.status !== MesaStatus.RESERVADA && (
            <Button
              variant='outline'
              className='justify-start gap-3 h-12'
              onClick={() => handleEstado(MesaStatus.RESERVADA)}
              disabled={isPending}
            >
              <CalendarClock className='h-5 w-5 text-yellow-500' />
              Marcar como Reservada
            </Button>
          )}

          {mesa?.status !== MesaStatus.MANTENIMIENTO && (
            <Button
              variant='outline'
              className='justify-start gap-3 h-12'
              onClick={() => handleEstado(MesaStatus.MANTENIMIENTO)}
              disabled={isPending}
            >
              <Wrench className='h-5 w-5 text-gray-500' />
              Poner en Mantenimiento
            </Button>
          )}

          <Button
            variant='outline'
            className='justify-start gap-3 h-12 text-destructive hover:text-destructive'
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
          >
            <Trash2 className='h-5 w-5' />
            Eliminar Mesa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
