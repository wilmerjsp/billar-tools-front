import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
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
import { useCrearCaja } from '../hooks/use-caja'

const crearCajaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
})

type CrearCajaFormValues = z.infer<typeof crearCajaSchema>

interface CrearCajaModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function CrearCajaModal({ open, onOpenChange }: CrearCajaModalProps) {
  const crearCaja = useCrearCaja()
  const [limitError, setLimitError] = useState<string | null>(null)

  const form = useForm<CrearCajaFormValues>({
    resolver: zodResolver(crearCajaSchema),
    defaultValues: { nombre: '' },
  })

  function handleClose() {
    setLimitError(null)
    form.reset()
    onOpenChange(false)
  }

  function onSubmit(values: CrearCajaFormValues) {
    setLimitError(null)
    crearCaja.mutate(values.nombre, {
      onSuccess: () => {
        toast.success('Caja creada correctamente')
        handleClose()
      },
      onError: (error) => {
        const err = error as { response?: { status?: number; data?: { error?: { code?: string; message?: string } } } }
        if (err?.response?.status === 403 && err?.response?.data?.error?.code === 'FORBIDDEN') {
          setLimitError(err.response.data.error.message ?? 'Límite del plan alcanzado.')
        } else {
          showApiError(error, 'Error al crear la caja')
        }
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear caja</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Caja principal' {...field} />
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
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={crearCaja.isPending}>
                {crearCaja.isPending ? 'Creando...' : 'Crear caja'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
