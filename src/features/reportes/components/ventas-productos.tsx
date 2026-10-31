import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useVentasProductos } from '../hooks/use-reportes'
import {
  SERIE_1,
  axisLine,
  axisTick,
  formatCOP,
  gridStroke,
  tooltipContentStyle,
  tooltipCursor,
  tooltipLabelStyle,
} from './chart-theme'

interface VentasProductosProps {
  fechaInicio: string
  fechaFin: string
}

export function VentasProductos({ fechaInicio, fechaFin }: VentasProductosProps) {
  const { data, isLoading, isError } = useVentasProductos({
    fechaInicio,
    fechaFin,
  })

  if (isLoading) {
    return <Skeleton className='h-[420px] w-full' />
  }

  if (isError) {
    return (
      <p className='text-sm text-destructive'>
        Error al cargar el reporte de ventas.
      </p>
    )
  }

  const chartData = (data ?? []).map((item) => ({
    nombre: item.nombre,
    unidades: item.unidades,
    ingresos: item.ingresos,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos más vendidos</CardTitle>
        <CardDescription>
          Ranking de productos por unidades vendidas en el período, de mayor a
          menor. El largo de cada barra es la cantidad de unidades; al pasar el
          cursor sobre una barra se ve también el ingreso total que generó ese
          producto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!chartData.length ? (
          <p className='py-12 text-center text-sm text-muted-foreground'>
            Sin ventas de productos registradas en el período seleccionado.
          </p>
        ) : (
          <ResponsiveContainer width='100%' height={350}>
            <BarChart
              layout='vertical'
              data={chartData}
              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke={gridStroke} />
              <XAxis type='number' tick={axisTick} axisLine={axisLine} tickLine={axisLine} />
              <YAxis
                type='category'
                dataKey='nombre'
                tick={axisTick}
                axisLine={axisLine}
                tickLine={axisLine}
                width={80}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                cursor={tooltipCursor}
                formatter={(value, _name, item) => {
                  const ingresos = (
                    item?.payload as { ingresos?: number } | undefined
                  )?.ingresos
                  const detalle =
                    typeof ingresos === 'number'
                      ? ` · ${formatCOP(ingresos)} en ingresos`
                      : ''
                  return [`${value} unidades${detalle}`, 'Ventas']
                }}
              />
              <Bar
                dataKey='unidades'
                name='Unidades vendidas'
                fill={SERIE_1}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
