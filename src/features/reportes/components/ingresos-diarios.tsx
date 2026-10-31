import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { showApiError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useIngresosDiarios } from '../hooks/use-reportes'
import { reportesService } from '../services/reportes-service'
import {
  SERIE_1,
  SERIE_2,
  axisLine,
  axisTick,
  formatCOP,
  gridStroke,
  legendText,
  tooltipContentStyle,
  tooltipCursor,
  tooltipLabelStyle,
} from './chart-theme'

interface IngresosDiariosProps {
  fechaInicio: string
  fechaFin: string
}

export function IngresosDiarios({ fechaInicio, fechaFin }: IngresosDiariosProps) {
  const { data, isLoading, isError } = useIngresosDiarios({
    fechaInicio,
    fechaFin,
  })
  const [isExporting, setIsExporting] = useState(false)

  async function handleExportar() {
    setIsExporting(true)
    try {
      const blob = await reportesService.exportar({
        tipo: 'ingresos-diarios',
        fecha_desde: fechaInicio,
        fecha_hasta: fechaFin,
      })
      const url = URL.createObjectURL(blob as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ingresos-diarios-${fechaInicio}-${fechaFin}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Reporte exportado correctamente')
    } catch (error) {
      showApiError(error, 'Error al exportar el reporte')
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return <Skeleton className='h-[420px] w-full' />
  }

  if (isError) {
    return (
      <p className='text-sm text-destructive'>
        Error al cargar el reporte de ingresos.
      </p>
    )
  }

  const totalPeriodo = (data ?? []).reduce((acc, d) => acc + d.total, 0)

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between gap-4 space-y-0'>
        <div className='space-y-1.5'>
          <CardTitle>Ingresos diarios</CardTitle>
          <CardDescription>
            Cuánto dinero entró cada día del período y de dónde vino:
            «Tiempo de juego» es lo cobrado por el uso de las mesas y
            «Consumo» lo cobrado por bar y productos. Total del período:{' '}
            <span className='font-medium text-foreground'>
              {formatCOP(totalPeriodo)}
            </span>
            .
          </CardDescription>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={handleExportar}
          disabled={isExporting || !data?.length}
        >
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </CardHeader>
      <CardContent>
        {!data?.length ? (
          <p className='py-12 text-center text-sm text-muted-foreground'>
            Sin ingresos registrados en el período seleccionado.
          </p>
        ) : (
          <ResponsiveContainer width='100%' height={350}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke={gridStroke} />
              <XAxis dataKey='dia' tick={axisTick} axisLine={axisLine} tickLine={axisLine} />
              <YAxis tick={axisTick} axisLine={axisLine} tickLine={axisLine} />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                cursor={tooltipCursor}
                formatter={(value) =>
                  typeof value === 'number' ? formatCOP(value) : String(value)
                }
              />
              <Legend formatter={legendText} />
              <Bar
                dataKey='ingresos_tiempo'
                name='Tiempo de juego'
                fill={SERIE_1}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='ingresos_consumo'
                name='Consumo'
                fill={SERIE_2}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
