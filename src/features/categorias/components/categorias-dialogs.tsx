import { toast } from 'sonner'
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
import { useCategoriasMutations } from '../hooks/use-categorias'
import { CategoriasActionDialog } from './categorias-action-dialog'
import { useCategorias } from './categorias-provider'
import { showApiError } from '@/lib/handle-server-error'

export function CategoriasDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, selectedRows, setRowSelection } =
    useCategorias()
  const { deleteMuchos } = useCategoriasMutations()

  function handleDeleteConfirm() {
    const ids = selectedRows.map((r) => r.id)
    deleteMuchos.mutate(ids, {
      onSuccess: () => {
        toast.success(`${ids.length} categoría(s) eliminada(s) correctamente`)
        setRowSelection({})
        setOpen('delete') // toggle to close
      },
      onError: (error) => showApiError(error, 'Error al eliminar las categorías'),
    })
  }

  return (
    <>
      <CategoriasActionDialog
        key='categoria-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <CategoriasActionDialog
          key={`categoria-edit-${currentRow.id}`}
          open={open === 'edit'}
          onOpenChange={() => {
            setOpen('edit')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )}

      <AlertDialog
        open={open === 'delete'}
        onOpenChange={() => setOpen('delete')}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categorías?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán {selectedRows.length} categoría(s). Esta acción no
              se puede deshacer.
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
