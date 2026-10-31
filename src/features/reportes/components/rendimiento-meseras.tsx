import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRendimientoMeseras } from '../hooks/use-reportes'
import { formatCOP } from './chart-theme'

interface RendimientoMeserasProps {
  fechaInicio: string
  fechaFin: string
}

export function RendimientoMeseras({
  fechaInicio,
  fechaFin,
}: RendimientoMeserasProps) {
  const { data, isLoading, isError } = useRendimientoMeseras({
    fechaInicio,
    fechaFin,
  })

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className='text-sm text-destructive'>
        Error al cargar el rendimiento de meseras.
      </p>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento de meseras</CardTitle>
        <CardDescription>
          Desempeño de cada mesera en el período: cuántos pedidos atendió y el
          valor total del consumo que generaron esos pedidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mesera</TableHead>
              <TableHead className='text-right'>Pedidos atendidos</TableHead>
              <TableHead className='text-right'>Consumo generado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className='text-center text-muted-foreground'
                >
                  Sin datos para el período seleccionado
                </TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((mesera) => (
                <TableRow key={mesera.mesera_id}>
                  <TableCell className='font-medium'>{mesera.nombre}</TableCell>
                  <TableCell className='text-right'>
                    {mesera.pedidos_atendidos}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCOP(mesera.consumo_generado)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
