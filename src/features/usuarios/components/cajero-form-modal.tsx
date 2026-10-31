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
import { useCajeroMutations } from '../hooks/use-usuarios'
import { showApiError } from '@/lib/handle-server-error'

const cajeroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Ingresa un email válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type CajeroFormValues = z.infer<typeof cajeroSchema>

interface CajeroFormModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function CajeroFormModal({
  open,
  onOpenChange,
}: CajeroFormModalProps) {
  const { createCajero } = useCajeroMutations()

  const form = useForm<CajeroFormValues>({
    resolver: zodResolver(cajeroSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
    },
  })

  function handleSubmit(data: CajeroFormValues) {
    createCajero.mutate(data, {
      onSuccess: () => {
        toast.success('Cajero creado correctamente')
        form.reset()
        onOpenChange(false)
      },
      onError: (error) => showApiError(error, 'Error al crear el cajero'),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Nuevo Cajero</DialogTitle>
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
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej. Juan Pérez' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='Ej. jperez@billar.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••' {...field} />
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
              <Button type='submit' disabled={createCajero.isPending}>
                {createCajero.isPending ? 'Creando...' : 'Crear cajero'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
