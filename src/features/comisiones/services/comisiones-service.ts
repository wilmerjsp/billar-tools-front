import api from '@/lib/axios'
import type {
  ConfigComision,
  ComisionVentasPaginado,
  ComisionResumenMesera,
  ComisionVentasParams,
  ComisionResumenParams,
  VentasPorMeseraReporte,
} from '../types'

export const comisionesService = {
  // Configuraciones
  getConfigs: (params?: { solo_activas?: boolean }) =>
    api.get<ConfigComision[]>('/api/v1/comisiones/config', { params }).then((r) => r.data),

  createConfig: (data: { producto_id: number; precio_barra: number }) =>
    api.post<ConfigComision>('/api/v1/comisiones/config', data).then((r) => r.data),

  updateConfig: (id: number, data: { precio_barra?: number; activa?: boolean }) =>
    api.patch<ConfigComision>(`/api/v1/comisiones/config/${id}`, data).then((r) => r.data),

  deleteConfig: (id: number) =>
    api.delete(`/api/v1/comisiones/config/${id}`).then((r) => r.data),

  // Ventas
  getVentas: (params?: ComisionVentasParams) =>
    api.get<ComisionVentasPaginado>('/api/v1/comisiones/ventas', { params }).then((r) => r.data),

  getResumen: (params?: ComisionResumenParams) =>
    api.get<ComisionResumenMesera[]>('/api/v1/comisiones/ventas/resumen', { params }).then((r) => r.data),

  pagarComision: (id: number) =>
    api.patch(`/api/v1/comisiones/ventas/${id}/pagar`).then((r) => r.data),

  getVentasPorMesera: (turnoId: number) =>
    api
      .get<{ data: VentasPorMeseraReporte }>('/api/v1/reportes/ventas-por-mesera', {
        params: { turno_id: turnoId },
      })
      .then((r) => r.data.data ?? r.data),
}
