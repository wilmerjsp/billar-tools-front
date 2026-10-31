import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMovimientosTurno } from '../hooks/use-caja'

interface MovimientosListadoProps {
  turnoId: number
}

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MovimientosListado({ turnoId }: MovimientosListadoProps) {
  const { data: movimientos, isLoading } = useMovimientosTurno(turnoId)

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    )
  }

  if (!movimientos || movimientos.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 rounded-md border border-dashed py-8 text-muted-foreground'>
        <Wallet className='h-8 w-8' />
        <p className='text-sm'>No hay movimientos manuales en este turno.</p>
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead className='text-right'>Monto</TableHead>
            <TableHead className='text-right'>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.map((mov) => (
            <TableRow key={mov.id}>
              <TableCell>
                {mov.tipo === 'ingreso' ? (
                  <Badge variant='outline' className='gap-1 text-green-600'>
                    <ArrowUpCircle className='h-3 w-3' />
                    Ingreso
                  </Badge>
                ) : (
                  <Badge variant='outline' className='gap-1 text-destructive'>
                    <ArrowDownCircle className='h-3 w-3' />
                    Egreso
                  </Badge>
                )}
              </TableCell>
              <TableCell className='font-medium'>{mov.concepto}</TableCell>
              <TableCell
                className={`text-right font-semibold ${
                  mov.tipo === 'ingreso' ? 'text-green-600' : 'text-destructive'
                }`}
              >
                {mov.tipo === 'ingreso' ? '+' : '−'}
                {formatCurrency(mov.monto)}
              </TableCell>
              <TableCell className='text-right text-sm text-muted-foreground'>
                {formatFecha(mov.fecha_hora)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
