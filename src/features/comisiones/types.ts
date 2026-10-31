export interface ConfigComision {
  id: number
  billar_id: number
  producto_id: number
  precio_barra: number
  activa: boolean
}

export interface ComisionVenta {
  id: number
  factura_id: number
  mesera_id: number
  mesera_nombre: string
  producto_id: number
  producto_nombre_snapshot: string
  origen_tipo: string
  origen_id: number
  cantidad: number
  precio_venta: number
  precio_barra: number
  comision_unitaria: number
  comision_total: number
  status: 'pendiente' | 'pagada'
  fecha_hora: string
}

export interface ComisionVentasPaginado {
  items: ComisionVenta[]
  total: number
  page: number
  page_size: number
}

export interface ComisionResumenMesera {
  mesera_id: number
  mesera_nombre: string
  total_ventas: number
  total_comision: number
  comision_pendiente: number
}

export interface ComisionVentasParams {
  mesera_id?: number
  turno_caja_id?: number
  status?: 'pendiente' | 'pagada'
  page?: number
  page_size?: number
}

export interface ComisionResumenParams {
  turno_caja_id?: number
}

// Ventas por mesera (reporte de turno)
export interface VentaPorMeseraProducto {
  producto_id: number
  nombre: string
  cantidad: number
  valor_unitario: number
  total: number
}

export interface VentasMesera {
  mesera_id: number
  nombre: string
  productos: VentaPorMeseraProducto[]
  subtotal: number
}

export interface VentasPorMeseraReporte {
  turno_id: number
  fecha_apertura: string
  // null cuando el turno sigue abierto
  fecha_cierre: string | null
  status: string
  meseras: VentasMesera[]
  total_general: number
}
