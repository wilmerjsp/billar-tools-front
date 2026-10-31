import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { type Billar } from '@/types/models'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { useUpdateBillar } from '../hooks/use-billares-sa'
import { showApiError } from '@/lib/handle-server-error'

const schema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  direccion: z.string(),
  telefono: z.string(),
  es_prueba: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface EditBillarDialogProps {
  billar: Billar | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBillarDialog({ billar, open, onOpenChange }: EditBillarDialogProps) {
  const updateBillar = useUpdateBillar()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      direccion: '',
      telefono: '',
      es_prueba: false,
    },
  })

  useEffect(() => {
    if (open && billar) {
      form.reset({
        nombre: billar.nombre,
        direccion: billar.direccion ?? '',
        telefono: billar.telefono ?? '',
        es_prueba: billar.es_prueba,
      })
    }
  }, [open, billar, form])

  function onSubmit(values: FormValues) {
    if (!billar) return
    updateBillar.mutate(
      {
        billarId: billar.id,
        data: {
          nombre: values.nombre,
          direccion: values.direccion || undefined,
          telefono: values.telefono || undefined,
          es_prueba: values.es_prueba,
        },
      },
      {
        onSuccess: () => {
          toast.success('Billar actualizado correctamente')
          onOpenChange(false)
        },
        onError: (error) => showApiError(error, 'Error al actualizar el billar'),
      }
    )
  }

  const isPending = updateBillar.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v) }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Editar billar</DialogTitle>
          <DialogDescription>
            Actualiza los datos del tenant seleccionado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre <span className='text-destructive'>*</span></FormLabel>
                  <FormControl>
                    <Input placeholder='Billar Central' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='direccion'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder='Calle 10 #5-20' {...field} />
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
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder='3001234567' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='es_prueba'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                  <div>
                    <FormLabel className='cursor-pointer'>Billar de prueba</FormLabel>
                    <p className='text-xs text-muted-foreground'>
                      Marca este tenant como entorno de prueba
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='animate-spin' />}
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
