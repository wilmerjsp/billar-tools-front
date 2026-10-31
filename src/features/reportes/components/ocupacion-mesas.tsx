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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useOcupacionMesas } from '../hooks/use-reportes'
import {
  SERIE_1,
  SERIE_2,
  axisLine,
  axisTick,
  gridStroke,
  legendText,
  tooltipContentStyle,
  tooltipCursor,
  tooltipLabelStyle,
} from './chart-theme'

interface OcupacionMesasProps {
  fechaInicio: string
  fechaFin: string
}

export function OcupacionMesas({ fechaInicio, fechaFin }: OcupacionMesasProps) {
  const { data, isLoading, isError } = useOcupacionMesas({
    fechaInicio,
    fechaFin,
  })

  if (isLoading) {
    return <Skeleton className='h-[420px] w-full' />
  }

  if (isError) {
    return (
      <p className='text-sm text-destructive'>
        Error al cargar el reporte de ocupación.
      </p>
    )
  }

  const chartData = (data ?? []).map((item) => ({
    mesa: item.nombre || `Mesa ${item.numero}`,
    horas: item.horas_uso,
    juegos: item.total_juegos,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocupación de mesas</CardTitle>
        <CardDescription>
          Qué tanto se usó cada mesa en el período: «Horas de uso» son las
          horas acumuladas con la mesa ocupada y «Total juegos» la cantidad de
          partidas jugadas en ella. Las mesas con barras más altas son las más
          demandadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!chartData.length ? (
          <p className='py-12 text-center text-sm text-muted-foreground'>
            Sin uso de mesas registrado en el período seleccionado.
          </p>
        ) : (
          <ResponsiveContainer width='100%' height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke={gridStroke} />
              <XAxis dataKey='mesa' tick={axisTick} axisLine={axisLine} tickLine={axisLine} />
              <YAxis tick={axisTick} axisLine={axisLine} tickLine={axisLine} />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                cursor={tooltipCursor}
              />
              <Legend formatter={legendText} />
              <Bar
                dataKey='horas'
                name='Horas de uso'
                fill={SERIE_1}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey='juegos'
                name='Total juegos'
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
