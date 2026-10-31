import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/shared/currency-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { TipoMesa } from '@/types/enums'
import { type Mesa } from '@/types/models'
import { mesaFormSchema, type MesaFormValues } from '../types'
import { useMesaMutations } from '../hooks/use-mesas'

interface MesaFormModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  mesa?: Mesa
}

export function MesaFormModal({
  open,
  onOpenChange,
  mesa,
}: MesaFormModalProps) {
  const { create, update } = useMesaMutations()
  const isEditing = !!mesa

  const form = useForm<MesaFormValues>({
    resolver: zodResolver(mesaFormSchema),
    defaultValues: {
      numero: mesa?.numero ?? 1,
      nombre: mesa?.nombre ?? '',
      tipo: mesa?.tipo ?? undefined,
      registra_tiempo: mesa?.registra_tiempo ?? true,
      tarifa_por_hora: mesa?.tarifa_por_hora ?? undefined,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        numero: mesa?.numero ?? 1,
        nombre: mesa?.nombre ?? '',
        tipo: mesa?.tipo ?? undefined,
        registra_tiempo: mesa?.registra_tiempo ?? true,
        tarifa_por_hora: mesa?.tarifa_por_hora ?? undefined,
      })
    }
  }, [open, mesa, form])

  function handleSubmit(data: MesaFormValues) {
    const payload = {
      ...data,
      tarifa_por_hora: data.registra_tiempo ? (data.tarifa_por_hora ?? 0) : 0,
    }
    if (isEditing && mesa) {
      update.mutate(
        { id: mesa.id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = create.isPending || update.isPending
  const registraTiempo = form.watch('registra_tiempo')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Mesa' : 'Nueva Mesa'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='numero'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de mesa</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej. Mesa VIP' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='tipo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo (opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccionar tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TipoMesa).map((tipo) => (
                        <SelectItem key={tipo} value={tipo} className='capitalize'>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='registra_tiempo'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                  <div className='space-y-0.5'>
                    <FormLabel>Cobrar tiempo</FormLabel>
                    <FormDescription>
                      La mesa registrará y cobrará el tiempo de juego
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='tarifa_por_hora'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarifa por hora (opcional)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      disabled={!registraTiempo}
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
                {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
