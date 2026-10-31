export type EstadoCuentaBarra = 'abierto' | 'cerrado' | 'facturado'
export type EstadoItemBarra = 'pendiente' | 'aceptado' | 'rechazado' | 'entregado' | 'cancelado'

export interface ItemBarraAdmin {
  id: number
  personal_id: number
  producto_id: number
  producto_nombre_snapshot: string
  cantidad: number
  precio_unitario: string
  subtotal: string
  notas: string | null
  status: EstadoItemBarra
  fecha_hora: string
}

export interface CuentaBarraAdmin {
  id: number
  billar_id: number
  admin_id: number
  admin_nombre: string | null
  descripcion: string | null
  fecha_hora: string
  status: EstadoCuentaBarra
  items: ItemBarraAdmin[]
  total: string | number
}

export interface AbrirCuentaBody {
  descripcion?: string
}

export interface AgregarItemBody {
  producto_id: number
  cantidad: number
  notas?: string
}

export interface CobrarCuentaBody {
  turno_caja_id: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto'
}

// Historial de cuentas de barra

export interface BarraHistorialItem {
  id: number
  billar_id: number
  mesera_id: number | null
  admin_id: number | null
  mesera_nombre: string | null
  admin_nombre: string | null
  descripcion: string | null
  fecha_hora: string
  status: EstadoCuentaBarra
  total: number
}

export interface BarraItemDetalle {
  id: number
  personal_id: number
  mesera_nombre: string | null
  producto_id: number
  cantidad: number
  precio_unitario: number
  precio_venta_snapshot: number
  precio_barra_snapshot: number
  costo_snapshot: number | null
  producto_nombre_snapshot: string
  notas: string | null
  status: EstadoItemBarra
  fecha_hora: string
  updated_at: string
}

export interface CuentaBarraDetalle {
  id: number
  billar_id: number
  mesera_id: number | null
  admin_id: number | null
  mesera_nombre: string | null
  admin_nombre: string | null
  turno_caja_id: number | null
  descripcion: string | null
  fecha_hora: string
  status: EstadoCuentaBarra
  total: number
  items: BarraItemDetalle[]
}

export interface HistorialBarraParams {
  fecha_desde?: string
  fecha_hasta?: string
  status?: EstadoCuentaBarra
  page?: number
  page_size?: number
}

export interface HistorialBarraResult {
  items: BarraHistorialItem[]
  total: number
}
