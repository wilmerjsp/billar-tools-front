import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

import { showApiError } from '@/lib/handle-server-error'
import { type Cajero } from '@/types/models'
import { useCajeroMutations } from '../hooks/use-cajeros'

const createSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

const editSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>

interface CajeroFormModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  cajero?: Cajero
}

export function CajeroFormModal({ open, onOpenChange, cajero }: CajeroFormModalProps) {
  const isEditing = !!cajero
  const { create, update } = useCajeroMutations()
  const [showPassword, setShowPassword] = useState(false)
  const [limitError, setLimitError] = useState<string | null>(null)

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { nombre: '', email: '', password: '' },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { nombre: '', email: '' },
  })

  useEffect(() => {
    if (cajero) {
      editForm.reset({ nombre: cajero.nombre, email: cajero.email })
    } else {
      createForm.reset({ nombre: '', email: '', password: '' })
    }
  }, [cajero, createForm, editForm])

  function handleClose() {
    setLimitError(null)
    onOpenChange(false)
  }

  function onSubmitCreate(values: CreateFormValues) {
    setLimitError(null)
    create.mutate(values, {
      onSuccess: () => {
        toast.success('Cajero creado correctamente')
        handleClose()
      },
      onError: (error) => {
        const err = error as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } }
        if (err?.response?.status === 403 && err?.response?.data?.error?.code === 'FORBIDDEN') {
          setLimitError(err.response.data.error.message ?? 'Límite del plan alcanzado.')
        } else {
          showApiError(error, 'Error al crear el cajero')
        }
      },
    })
  }

  function onSubmitEdit(values: EditFormValues) {
    if (!cajero) return
    update.mutate(
      { id: cajero.id, data: values },
      {
        onSuccess: () => {
          toast.success('Cajero actualizado correctamente')
          handleClose()
        },
        onError: (error) => {
          showApiError(error, 'Error al actualizar el cajero')
        },
      }
    )
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[450px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cajero' : 'Nuevo Cajero'}</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className='space-y-4'>
              <FormField
                control={editForm.control}
                name='nombre'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder='Ej. Juan Pérez' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='cajero@ejemplo.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type='button' variant='outline' onClick={handleClose} disabled={isPending}>
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
                name='nombre'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder='Ej. Juan Pérez' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='cajero@ejemplo.com' {...field} />
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
                          placeholder='Mínimo 8 caracteres'
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

              {limitError && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{limitError}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button type='button' variant='outline' onClick={handleClose} disabled={isPending}>
                  Cancelar
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending ? 'Creando...' : 'Crear cajero'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
