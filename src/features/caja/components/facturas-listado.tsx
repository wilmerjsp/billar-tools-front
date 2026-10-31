import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { showApiError } from '@/lib/handle-server-error'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { DataTablePagination } from '@/components/data-table'
import { type Factura } from '@/types/models'
import { EstadoFactura, MetodoPago, OrigenTipo } from '@/types/enums'
import { cn } from '@/lib/utils'
// import { usePermissions } from '@/hooks/use-permissions'
import { cajaService } from '../services/caja-service'
import { useFacturasTurno } from '../hooks/use-caja'
import { useQueryClient } from '@tanstack/react-query'

const metodoPagoLabels: Record<MetodoPago, string> = {
  [MetodoPago.EFECTIVO]: 'Efectivo',
  [MetodoPago.TARJETA]: 'Tarjeta',
  [MetodoPago.TRANSFERENCIA]: 'Transferencia',
  [MetodoPago.MIXTO]: 'Mixto',
}

const origenLabels: Record<OrigenTipo, string> = {
  [OrigenTipo.JUEGO]: 'Mesa',
  [OrigenTipo.BARRA]: 'Barra',
  [OrigenTipo.CONSUMO_JUEGO]: 'Consumo',
  [OrigenTipo.CONSUMO_BARRA]: 'Consumo barra',
}

const anularSchema = z.object({
  motivo: z
    .string()
    .min(5, 'El motivo debe tener al menos 5 caracteres')
    .max(255),
})

type AnularFormValues = z.infer<typeof anularSchema>

const facturaColumns: ColumnDef<Factura>[] = [
  { accessorKey: 'id' },
  { accessorKey: 'origen_tipo' },
  { accessorKey: 'total' },
  { accessorKey: 'metodo_pago' },
  { accessorKey: 'status' },
  { accessorKey: 'fecha_hora' },
]

interface FacturasListadoProps {
  turnoId: number
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function FacturasListado({ turnoId }: FacturasListadoProps) {
  const queryClient = useQueryClient()
  // const { canAnularFactura } = usePermissions()
  const { data: facturas, isLoading, isError, refetch } = useFacturasTurno(turnoId)

  const [busqueda, setBusqueda] = useState('')
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState<string>('todos')
  const [origenFiltro, setOrigenFiltro] = useState<string>('todos')
  const [facturaAnular, setFacturaAnular] = useState<Factura | null>(null)
  const [anulandoId, setAnulandoId] = useState<number | null>(null)

  const form = useForm<AnularFormValues>({
    resolver: zodResolver(anularSchema),
    defaultValues: { motivo: '' },
  })

  const facturasFiltradas = useMemo(
    () =>
      (Array.isArray(facturas) ? facturas : []).filter((f) => {
        const coincideBusqueda = busqueda
          ? String(f.id).includes(busqueda.trim())
          : true
        const coincideMetodo =
          metodoPagoFiltro === 'todos' || f.metodo_pago === metodoPagoFiltro
        const coincideOrigen =
          origenFiltro === 'todos' || f.origen_tipo === origenFiltro
        return coincideBusqueda && coincideMetodo && coincideOrigen
      }),
    [facturas, busqueda, metodoPagoFiltro, origenFiltro]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: facturasFiltradas,
    columns: facturaColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  async function handleAnular(values: AnularFormValues) {
    if (!facturaAnular) return
    setAnulandoId(facturaAnular.id)
    try {
      await cajaService.anularFactura(facturaAnular.id, values.motivo)
      toast.success(`Factura #${facturaAnular.id} anulada`)
      queryClient.invalidateQueries({ queryKey: ['facturas', turnoId] })
      setFacturaAnular(null)
      form.reset()
    } catch (error) {
      showApiError(error, 'Error al anular la factura')
    } finally {
      setAnulandoId(null)
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-9 w-full' />
        <Skeleton className='h-9 w-full' />
        <Skeleton className='h-9 w-full' />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='py-6 text-center text-muted-foreground'>
        <p>No se pudieron cargar las facturas.</p>
        <button
          onClick={() => refetch()}
          className='mt-2 text-sm underline underline-offset-4'
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <Input
          placeholder='Buscar por ID...'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className='max-w-xs'
        />
        <Select value={metodoPagoFiltro} onValueChange={setMetodoPagoFiltro}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Método de pago' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todos'>Todos los métodos</SelectItem>
            {Object.values(MetodoPago).map((m) => (
              <SelectItem key={m} value={m}>
                {metodoPagoLabels[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={origenFiltro} onValueChange={setOrigenFiltro}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Origen' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todos'>Todos los orígenes</SelectItem>
            {Object.values(OrigenTipo).map((o) => (
              <SelectItem key={o} value={o}>
                {origenLabels[o]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center text-muted-foreground'
                >
                  Sin facturas
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const factura = row.original
                return (
                  <TableRow key={factura.id}>
                    <TableCell className='font-medium'>
                      {factura.numero_factura ?? `#${factura.id}`}
                    </TableCell>
                    <TableCell>{origenLabels[factura.origen_tipo]}</TableCell>
                    <TableCell>{formatCurrency(factura.total)}</TableCell>
                    <TableCell>{metodoPagoLabels[factura.metodo_pago]}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'font-medium',
                          factura.status === EstadoFactura.ANULADA
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        )}
                      >
                        {factura.status === EstadoFactura.ANULADA ? 'Anulada' : 'Pagada'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFecha(factura.fecha_hora)}</TableCell>
                    {/* <TableCell>
                      {canAnularFactura && factura.status !== EstadoFactura.ANULADA && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive hover:text-destructive'
                          onClick={() => {
                            setFacturaAnular(factura)
                            form.reset()
                          }}
                        >
                          Anular
                        </Button>
                      )}
                    </TableCell> */}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-2' />

      <AlertDialog
        open={!!facturaAnular}
        onOpenChange={(open) => {
          if (!open) {
            setFacturaAnular(null)
            form.reset()
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Anular factura #{facturaAnular?.id}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAnular)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='motivo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo de anulación</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Describe el motivo...'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={anulandoId !== null}
                >
                  {anulandoId !== null ? 'Anulando...' : 'Confirmar anulación'}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
