import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { showApiError } from '@/lib/handle-server-error'
import { type CategoriaProducto } from '@/types/models'
import { useCategoriasMutations } from '../hooks/use-categorias'

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  icono: z.string().optional(),
  orden: z.number().int().min(0).optional(),
  activa: z.boolean(),
})

type CategoriaFormValues = z.infer<typeof formSchema>

type CategoriasActionDialogProps = {
  currentRow?: CategoriaProducto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriasActionDialog({
  currentRow,
  open,
  onOpenChange,
}: CategoriasActionDialogProps) {
  const isEdit = !!currentRow
  const { create, update } = useCategoriasMutations()

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          nombre: currentRow.nombre,
          icono: currentRow.icono ?? '',
          orden: currentRow.orden,
          activa: currentRow.activa,
        }
      : {
          nombre: '',
          icono: '',
          orden: 0,
          activa: true,
        },
  })

  const onSubmit = (values: CategoriaFormValues) => {
    const dto = {
      nombre: values.nombre,
      icono: values.icono || undefined,
      orden: values.orden,
      activa: values.activa,
    }

    if (isEdit) {
      update.mutate(
        { id: currentRow.id, dto },
        {
          onSuccess: () => {
            form.reset()
            onOpenChange(false)
            toast.success('Categoría actualizada correctamente')
          },
          onError: (error) => {
            showApiError(error, 'Error al actualizar la categoría')
          },
        }
      )
    } else {
      create.mutate(dto, {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
          toast.success('Categoría creada correctamente')
        },
        onError: (error) => {
          showApiError(error, 'Error al crear la categoría')
        },
      })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza los datos de la categoría aquí.'
              : 'Completa los datos para crear la categoría.'}{' '}
            Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='categoria-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Bebidas'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='icono'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Icono</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='🍺'
                      className='col-span-4'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='orden'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Orden</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      className='col-span-4'
                      value={field.value !== undefined ? String(field.value) : ''}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(
                          val === '' ? undefined : parseInt(val, 10)
                        )
                      }}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='activa'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Activa</FormLabel>
                  <FormControl>
                    <Checkbox
                      className='col-span-4'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='categoria-form' disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
