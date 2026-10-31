import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type CategoriaProducto } from '@/types/models'

export const categoriasColumns: ColumnDef<CategoriaProducto>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todo'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[50px]' },
  },
  {
    accessorKey: 'orden',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Orden' />
    ),
    cell: ({ row }) => (
      <div className='w-12 text-center'>{row.getValue('orden')}</div>
    ),
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('nombre')}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'icono',
    header: 'Icono',
    cell: ({ row }) => {
      const icono = row.getValue<string | undefined>('icono')
      return <div className='text-lg'>{icono ?? '—'}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'activa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const activa = row.getValue<boolean>('activa')
      return (
        <Badge
          variant='outline'
          className={
            activa
              ? 'border-green-500 text-green-600'
              : 'border-gray-400 text-gray-500'
          }
        >
          {activa ? 'Activa' : 'Inactiva'}
        </Badge>
      )
    },
    filterFn: (row, id, value: string[]) => {
      const activa = row.getValue<boolean>(id)
      return value.includes(String(activa))
    },
    enableSorting: false,
  },
]
