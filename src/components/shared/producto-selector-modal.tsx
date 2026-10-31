import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export interface ProductoSelectorOption {
  id: number
  nombre: string
  detalle?: string
}

interface ProductoSelectorModalProps {
  options: ProductoSelectorOption[]
  open: boolean
  onOpenChange: (v: boolean) => void
  onSelect: (option: ProductoSelectorOption) => void
  title?: string
  description?: string
}

export function ProductoSelectorModal({
  options,
  open,
  onOpenChange,
  onSelect,
  title = 'Seleccionar producto',
  description = 'Busca por nombre y selecciona un producto.',
}: ProductoSelectorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='gap-0 p-0 sm:max-w-md'>
        <DialogHeader className='p-4 pb-2'>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder='Buscar producto...' />
          <CommandList className='max-h-72'>
            <CommandEmpty>No se encontraron productos.</CommandEmpty>
            {options.map((option) => (
              <CommandItem
                key={option.id}
                value={option.nombre}
                onSelect={() => {
                  onSelect(option)
                  onOpenChange(false)
                }}
              >
                <span>{option.nombre}</span>
                {option.detalle && (
                  <span className='ml-auto text-xs text-muted-foreground'>
                    {option.detalle}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
