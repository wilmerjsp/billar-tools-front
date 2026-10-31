import api from '@/lib/axios'

export interface IngresoDiario {
  dia: string | null
  ingresos_tiempo: number
  ingresos_consumo: number
  total: number
}

export interface OcupacionMesa {
  mesa_id: number
  numero: number
  nombre: string
  horas_uso: number
  total_juegos: number
}

export interface VentaProducto {
  producto_id: number
  nombre: string
  unidades: number
  ingresos: number
}

export interface RendimientoMesera {
  mesera_id: number
  nombre: string
  pedidos_atendidos: number
  consumo_generado: number
}

export interface CierreTurno {
  turno_id: number
  monto_apertura: number
  monto_cierre: number | null
  monto_sistema: number | null
  diferencia: number | null
  total_facturas: number
  facturas_anuladas: number
  por_metodo_pago: Record<string, number>
}

interface RangoFechas {
  fecha_desde: string
  fecha_hasta: string
}

export type TipoReporteExportable =
  | 'ingresos-diarios'
  | 'ocupacion-mesas'
  | 'ventas-productos'
  | 'rendimiento-meseras'

export const reportesService = {
  getIngresosDiarios: (params: RangoFechas) =>
    api
      .get<IngresoDiario[]>('/api/v1/reportes/ingresos-diarios', { params })
      .then((r) => r.data),

  getOcupacionMesas: (params: RangoFechas) =>
    api
      .get<OcupacionMesa[]>('/api/v1/reportes/ocupacion-mesas', { params })
      .then((r) => r.data),

  getVentasProductos: (params: RangoFechas) =>
    api
      .get<VentaProducto[]>('/api/v1/reportes/ventas-productos', { params })
      .then((r) => r.data),

  getRendimientoMeseras: (params: RangoFechas) =>
    api
      .get<RendimientoMesera[]>('/api/v1/reportes/rendimiento-meseras', {
        params,
      })
      .then((r) => r.data),

  getCierreTurno: (turnoId: number) =>
    api
      .get<CierreTurno>(`/api/v1/reportes/cierre-turno/${turnoId}`)
      .then((r) => r.data),

  exportar: (params: RangoFechas & { tipo: TipoReporteExportable }) =>
    api
      .get('/api/v1/reportes/exportar', {
        params: { ...params, formato: 'xlsx' },
        responseType: 'blob',
      })
      .then((r) => r.data),
}
