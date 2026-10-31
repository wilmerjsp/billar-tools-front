import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { type Billar } from '@/types/models'
import { useSucursalMutations } from '../hooks/use-sucursales'
import { showApiError } from '@/lib/handle-server-error'

const sucursalSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
})

type SucursalFormValues = z.infer<typeof sucursalSchema>

interface SucursalFormModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  sucursal?: Billar
}

export function SucursalFormModal({
  open,
  onOpenChange,
  sucursal,
}: SucursalFormModalProps) {
  const { create, update } = useSucursalMutations()
  const isEditing = !!sucursal

  const form = useForm<SucursalFormValues>({
    resolver: zodResolver(sucursalSchema),
    defaultValues: {
      nombre: sucursal?.nombre ?? '',
      direccion: sucursal?.direccion ?? '',
      telefono: sucursal?.telefono ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: sucursal?.nombre ?? '',
        direccion: sucursal?.direccion ?? '',
        telefono: sucursal?.telefono ?? '',
      })
    }
  }, [open, sucursal, form])

  function handleSubmit(data: SucursalFormValues) {
    if (isEditing && sucursal) {
      update.mutate(
        { id: sucursal.id, data },
        {
          onSuccess: () => {
            toast.success('Sucursal actualizada correctamente')
            onOpenChange(false)
          },
          onError: (error) => showApiError(error, 'Error al actualizar la sucursal'),
        }
      )
    } else {
      create.mutate(data, {
        onSuccess: () => {
          toast.success('Sucursal creada correctamente')
          onOpenChange(false)
        },
        onError: (error) => showApiError(error, 'Error al crear la sucursal'),
      })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej. Billar Centro' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='direccion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ej. Calle 123 # 45-67'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='telefono'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ej. 3001234567'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending
                  ? 'Guardando...'
                  : isEditing
                    ? 'Actualizar'
                    : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
