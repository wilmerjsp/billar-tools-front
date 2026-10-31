import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useMiTurnoActivo } from '@/features/caja/hooks/use-caja'
import type { CobrarCuentaBody } from '../types'

const METODOS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'mixto', label: 'Mixto' },
] as const

const schema = z.object({
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'mixto']),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  total: number
  isPending: boolean
  onConfirm: (body: CobrarCuentaBody) => void
  onClose: () => void
}

export function CobrarDialog({ open, total, isPending, onConfirm, onClose }: Props) {
  // El cobro se registra automáticamente en el turno del usuario autenticado
  const { miTurno, isLoading: turnoLoading } = useMiTurnoActivo()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { metodo_pago: 'efectivo' },
  })

  function handleSubmit(values: FormValues) {
    if (!miTurno) return
    onConfirm({ turno_caja_id: miTurno.id, metodo_pago: values.metodo_pago })
  }

  function handleClose() {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Cobrar — ${total.toLocaleString('es-CO')}
          </DialogTitle>
        </DialogHeader>

        {turnoLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !miTurno ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tienes un turno de caja abierto. Abre tu turno antes de cobrar.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <p className="text-center text-xs text-muted-foreground">
                Se registrará en{' '}
                <span className="font-medium text-foreground">
                  {miTurno.caja_nombre ?? `Caja #${miTurno.caja_id}`}
                </span>{' '}
                — Turno #{miTurno.id}
              </p>

              <FormField
                control={form.control}
                name="metodo_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de pago</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {METODOS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? 'Procesando…'
                    : `Confirmar — $${total.toLocaleString('es-CO')}`}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
