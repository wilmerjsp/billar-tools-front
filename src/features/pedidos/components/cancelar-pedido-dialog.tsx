import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface CancelarPedidoDialogProps {
  open: boolean
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
}

export function CancelarPedidoDialog({
  open,
  isPending,
  onConfirm,
  onClose,
}: CancelarPedidoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Cancelar pedido</DialogTitle>
          <DialogDescription>
            Esta acción cancelará el pedido aceptado. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose} disabled={isPending}>
            Volver
          </Button>
          <Button variant='destructive' onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className='h-3 w-3 animate-spin' />}
            Confirmar cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
