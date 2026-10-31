import api from '@/lib/axios'
import {
  type InventarioItem,
  type MovimientoInventario,
  type AlertaStock,
  type Kardex,
  type Valorizado,
  type ConteoFisico,
} from '@/types/models'
import { type TipoAjusteInventario } from '@/types/enums'

export interface CompraPayload {
  producto_id: number
  cantidad: string
  costo_unitario: string
  nota?: string
  actualizar_precio_costo: boolean
}

export interface ConteoFisicoPayload {
  nota?: string
  items: { producto_id: number; cantidad_contada: string }[]
}

export interface KardexParams {
  tipo?: TipoAjusteInventario
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  page_size?: number
}

export const inventarioService = {
  getInventario: () =>
    // billar_id se resuelve del token internamente
    api.get<InventarioItem[]>('/api/v1/inventario').then(r => r.data),
  getAlertas: () =>
    // billar_id se resuelve del token internamente
    api.get<AlertaStock[]>('/api/v1/inventario/alertas').then(r => r.data),
  getMovimientos: (params: { producto_id?: number; tipo?: TipoAjusteInventario }) =>
    api
      .get<{ items: MovimientoInventario[]; total: number; page: number; page_size: number }>(
        '/api/v1/inventario/movimientos',
        { params }
      )
      .then(r => r.data.items),
  ajusteStock: (data: {
    producto_id: number
    tipo: TipoAjusteInventario
    cantidad: number
    motivo: string
  }) =>
    api.post('/api/v1/inventario/ajuste', data).then(r => r.data),
  registrarCompra: (data: CompraPayload) =>
    api.post('/api/v1/inventario/compras', data).then(r => r.data),
  conteoFisico: (data: ConteoFisicoPayload) =>
    api.post<ConteoFisico>('/api/v1/inventario/conteo-fisico', data).then(r => r.data),
  getKardex: (productoId: number, params?: KardexParams) =>
    api
      .get<Kardex>(`/api/v1/productos/${productoId}/inventario/kardex`, { params })
      .then(r => r.data),
  getValorizado: () =>
    api.get<Valorizado>('/api/v1/inventario/valorizado').then(r => r.data),
}
