import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { showApiError } from '@/lib/handle-server-error'
import { type Mesera } from '@/types/models'
import { useMeseraMutations } from '../hooks/use-meseras'

const createSchema = z.object({
  nombre_completo: z.string().min(1, 'El nombre es requerido'),
  usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  foto_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

const editSchema = z.object({
  nombre_completo: z.string().min(1, 'El nombre es requerido'),
  usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  foto_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>

interface MeseraFormModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  mesera?: Mesera
  billarId: number
}

export function MeseraFormModal({
  open,
  onOpenChange,
  mesera,
  billarId,
}: MeseraFormModalProps) {
  const isEditing = !!mesera
  const { create, update } = useMeseraMutations()
  const [showPassword, setShowPassword] = useState(false)
  const [generatedPin, setGeneratedPin] = useState<string | null>(null)
  const [limitError, setLimitError] = useState<string | null>(null)

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      nombre_completo: '',
      usuario: '',
      password: '',
      foto_url: '',
    },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      nombre_completo: '',
      usuario: '',
      foto_url: '',
    },
  })

  useEffect(() => {
    if (mesera) {
      editForm.reset({
        nombre_completo: mesera.nombre_completo,
        usuario: mesera.usuario,
        foto_url: mesera.foto_url ?? '',
      })
    } else {
      createForm.reset({
        nombre_completo: '',
        usuario: '',
        password: '',
        foto_url: '',
      })
      setGeneratedPin(null)
    }
  }, [mesera, createForm, editForm])

  function handleClose() {
    setGeneratedPin(null)
    setLimitError(null)
    onOpenChange(false)
  }

  function onSubmitCreate(values: CreateFormValues) {
    setLimitError(null)
    create.mutate(
      {
        billar_id: billarId,
        nombre_completo: values.nombre_completo,
        usuario: values.usuario,
        password: values.password,
        foto_url: values.foto_url || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success('Mesera creada correctamente')
          const pin = (data as unknown as Record<string, unknown>)?.pin
          if (pin && typeof pin === 'string') {
            setGeneratedPin(pin)
          } else {
            handleClose()
          }
        },
        onError: (error) => {
          const err = error as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } }
          if (err?.response?.status === 403 && err?.response?.data?.error?.code === 'FORBIDDEN') {
            setLimitError(err.response.data.error.message ?? 'Límite del plan alcanzado.')
          } else {
            showApiError(error, 'Error al crear la mesera')
          }
        },
      }
    )
  }

  function onSubmitEdit(values: EditFormValues) {
    if (!mesera) return
    update.mutate(
      {
        id: mesera.id,
        data: {
          nombre_completo: values.nombre_completo,
          usuario: values.usuario,
          foto_url: values.foto_url || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Mesera actualizada correctamente')
          handleClose()
        },
        onError: (error) => {
          showApiError(error, 'Error al actualizar la mesera')
        },
      }
    )
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[450px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Mesera' : 'Nueva Mesera'}
          </DialogTitle>
        </DialogHeader>

        {generatedPin ? (
          <div className='space-y-4'>
            <Alert>
              <AlertTitle>Mesera creada exitosamente</AlertTitle>
              <AlertDescription>
                <p className='mb-2'>
                  El PIN temporal de la mesera es:
                </p>
                <p className='text-2xl font-bold tracking-widest'>{generatedPin}</p>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Guarda este PIN ahora. No se mostrará de nuevo.
                </p>
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : isEditing ? (
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className='space-y-4'>
              <FormField
                control={editForm.control}
                name='nombre_completo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder='Ej. María García López' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name='usuario'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder='Ej. maria.garcia' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name='foto_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de foto (opcional)</FormLabel>
                    <FormControl>
                      <Input type='url' placeholder='https://...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending ? 'Guardando...' : 'Actualizar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className='space-y-4'>
              <FormField
                control={createForm.control}
                name='nombre_completo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder='Ej. María García López' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='usuario'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder='Ej. maria.garcia' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Mínimo 6 caracteres'
                          {...field}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-1 top-1/2 -translate-y-1/2'
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='foto_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de foto (opcional)</FormLabel>
                    <FormControl>
                      <Input type='url' placeholder='https://...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {limitError && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{limitError}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending ? 'Creando...' : 'Crear mesera'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
