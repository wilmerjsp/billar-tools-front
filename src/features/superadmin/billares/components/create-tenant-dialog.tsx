import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Building2, CheckCircle2, Loader2, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import { PasswordInput } from '@/components/password-input'
import { Separator } from '@/components/ui/separator'
import { useCreateTenant, type CreateTenantStep } from '../hooks/use-billares-sa'
import { showApiError } from '@/lib/handle-server-error'

const schema = z.object({
  nombre: z.string().min(1, 'Requerido').max(100, 'Máximo 100 caracteres'),
  direccion: z.string(),
  telefono: z.string(),
  es_prueba: z.boolean(),
  admin_nombre: z.string().min(1, 'Requerido'),
  admin_email: z.email({ error: 'Correo inválido' }),
  admin_password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormValues = z.infer<typeof schema>

const STEP_LABELS: Record<CreateTenantStep, string> = {
  idle: '',
  billar: 'Creando billar...',
  admin: 'Creando administrador...',
  assign: 'Asignando billar al admin...',
  done: '¡Tenant creado con éxito!',
}

interface CreateTenantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTenantDialog({ open, onOpenChange }: CreateTenantDialogProps) {
  const { mutateAsync, isPending, isSuccess, step, reset } = useCreateTenant()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      direccion: '',
      telefono: '',
      es_prueba: false,
      admin_nombre: '',
      admin_email: '',
      admin_password: '',
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      reset()
    }
  }, [open, form, reset])

  async function onSubmit(values: FormValues) {
    try {
      const result = await mutateAsync(values)
      toast.success(
        `Tenant creado: ${result.billar.nombre} · Admin: ${result.admin.email}`
      )
      onOpenChange(false)
    } catch (error) {
      showApiError(error, 'Error al crear el tenant')
    }
  }

  const isRunning = isPending || (isSuccess && step !== 'idle')

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isRunning) onOpenChange(v) }}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Crear nuevo tenant</DialogTitle>
          <DialogDescription>
            Se creará el billar, la cuenta de administrador y se vincularán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
            {/* Sección billar */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-sm font-medium'>
                <Building2 className='h-4 w-4' />
                Datos del billar
              </div>
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
            </div>

            <Separator />

            {/* Sección admin */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-sm font-medium'>
                <UserPlus className='h-4 w-4' />
                Cuenta del administrador
              </div>
              <FormField
                control={form.control}
                name='admin_nombre'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo <span className='text-destructive'>*</span></FormLabel>
                    <FormControl>
                      <Input placeholder='Juan Pérez' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='admin_email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico <span className='text-destructive'>*</span></FormLabel>
                    <FormControl>
                      <Input placeholder='juan@ejemplo.com' type='email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='admin_password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña <span className='text-destructive'>*</span></FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='Mínimo 8 caracteres' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Indicador de progreso */}
            {isPending && (
              <div
                className={cn(
                  'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                  step === 'done'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-blue-200 bg-blue-50 text-blue-700'
                )}
              >
                {step === 'done' ? (
                  <CheckCircle2 className='h-4 w-4 shrink-0' />
                ) : (
                  <Loader2 className='h-4 w-4 shrink-0 animate-spin' />
                )}
                {STEP_LABELS[step]}
              </div>
            )}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                disabled={isRunning}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isRunning}>
                {isRunning && <Loader2 className='animate-spin' />}
                Crear tenant
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
