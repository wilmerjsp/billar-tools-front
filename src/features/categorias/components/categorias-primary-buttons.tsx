import { Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCategorias } from './categorias-provider'

export function CategoriasPrimaryButtons() {
  const { setOpen, setCurrentRow, selectedRows } = useCategorias()

  const selectedCount = selectedRows.length

  function handleEdit() {
    if (selectedRows.length === 1) {
      setCurrentRow(selectedRows[0])
      setOpen('edit')
    }
  }

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        disabled={selectedCount !== 1}
        onClick={handleEdit}
      >
        <Pencil className='mr-2 h-4 w-4' />
        Editar
      </Button>
      {/* Botón de eliminar deshabilitado temporalmente.
          Para restaurarlo, descomentar y re-agregar Trash2 al import de lucide-react.
      <Button
        variant='destructive'
        disabled={selectedCount === 0}
        onClick={() => setOpen('delete')}
      >
        <Trash2 className='mr-2 h-4 w-4' />
        Eliminar{selectedCount > 0 ? ` (${selectedCount})` : ''}
      </Button>
      */}
      <Button onClick={() => setOpen('add')}>
        <Plus className='mr-2 h-4 w-4' />
        Nueva Categoría
      </Button>
    </div>
  )
}
