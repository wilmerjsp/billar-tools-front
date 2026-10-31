import { useQuery } from '@tanstack/react-query'
import { reportesService } from '../services/reportes-service'

interface ReporteParams {
  fechaInicio: string
  fechaFin: string
}

function isEnabled(fechaInicio: string, fechaFin: string) {
  return fechaInicio.length > 0 && fechaFin.length > 0
}

export function useIngresosDiarios({ fechaInicio, fechaFin }: ReporteParams) {
  return useQuery({
    queryKey: ['reportes', 'ingresos-diarios', fechaInicio, fechaFin],
    queryFn: () =>
      reportesService.getIngresosDiarios({
        fecha_desde: fechaInicio,
        fecha_hasta: fechaFin,
      }),
    enabled: isEnabled(fechaInicio, fechaFin),
    staleTime: 1000 * 60 * 5,
  })
}

export function useOcupacionMesas({ fechaInicio, fechaFin }: ReporteParams) {
  return useQuery({
    queryKey: ['reportes', 'ocupacion-mesas', fechaInicio, fechaFin],
    queryFn: () =>
      reportesService.getOcupacionMesas({
        fecha_desde: fechaInicio,
        fecha_hasta: fechaFin,
      }),
    enabled: isEnabled(fechaInicio, fechaFin),
    staleTime: 1000 * 60 * 5,
  })
}

export function useVentasProductos({ fechaInicio, fechaFin }: ReporteParams) {
  return useQuery({
    queryKey: ['reportes', 'ventas-productos', fechaInicio, fechaFin],
    queryFn: () =>
      reportesService.getVentasProductos({
        fecha_desde: fechaInicio,
        fecha_hasta: fechaFin,
      }),
    enabled: isEnabled(fechaInicio, fechaFin),
    staleTime: 1000 * 60 * 5,
  })
}

export function useRendimientoMeseras({
  fechaInicio,
  fechaFin,
}: ReporteParams) {
  return useQuery({
    queryKey: ['reportes', 'rendimiento-meseras', fechaInicio, fechaFin],
    queryFn: () =>
      reportesService.getRendimientoMeseras({
        fecha_desde: fechaInicio,
        fecha_hasta: fechaFin,
      }),
    enabled: isEnabled(fechaInicio, fechaFin),
    staleTime: 1000 * 60 * 5,
  })
}
