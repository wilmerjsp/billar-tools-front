import type {
  EstadoConsumoItem,
  EstadoFactura,
  EstadoJuego,
  MesaStatus,
  MetodoPago,
  OrigenTipo,
  PedidoStatus,
  TipoAjusteInventario,
  TipoMesa,
  UserRole,
} from './enums'

export interface Billar {
  id: number
  nombre: string
  direccion?: string
  telefono?: string
  activo: boolean
  es_prueba: boolean
}

export interface BillarAsignado {
  billar_id: number
  rol_sucursal: UserRole
  assigned_at: string
}

export interface AuthUser {
  id: number
  nombre: string
  email?: string
  usuario?: string
  rol: UserRole
  rol_sucursal: UserRole
  billares_asignados: number[]
  billares: BillarAsignado[]
  ultimo_login: string | null
}

export interface Mesa {
  id: number
  billar_id: number
  numero: number
  nombre?: string
  tipo?: TipoMesa
  registra_tiempo: boolean
  tarifa_por_hora?: number
  status: MesaStatus
  juego_activo?: { id: number; hora_inicio: string } | null
}

export interface Mesera {
  id: number
  billar_id: number
  nombre_completo: string
  usuario: string
  foto_url?: string
  activa: boolean
  ultima_actividad?: string
}

export interface Jugador {
  id: number
  nombre: string
  saldo: number
}

export interface ConsumoItem {
  id: number
  producto_id: number
  producto_nombre: string
  cantidad: number
  precio_unitario: number
  precio_venta_snapshot?: string
  costo_snapshot?: string | null
  producto_nombre_snapshot?: string | null
  estado: EstadoConsumoItem
  updated_at?: string
  notas?: string
}

export interface ConsumoResumen {
  consumo_id: number
  producto_nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  jugador_alias: string | null
  status: string
  factura_id: number | null
  factura_numero: string | null
}

export interface FacturaTiempoResumen {
  id: number
  numero_factura: string
  total: number
  metodo_pago: string
  fecha_hora: string
}

export interface JuegoResumen {
  juego_id: number
  mesa_id: number
  status: string
  hora_inicio: string
  hora_fin: string | null
  tiempo_minutos: number | null
  costo_tiempo: number
  consumos: ConsumoResumen[]
  total_consumos: number
  total_tiempo: number
  total_juego: number
  factura_tiempo: FacturaTiempoResumen | null
}

export interface JuegoActivo {
  id: number
  billar_id?: number
  mesa_id: number
  mesa_numero: number
  mesera_id?: number
  mesera_nombre?: string
  tipo_juego?: string
  tipo_cobro?: string
  inicio: string
  hora_fin?: string
  estado: EstadoJuego
  turno_caja_id?: number | null
  jugadores: Jugador[]
  consumos: ConsumoItem[]
  tiempo_minutos?: number
  costo_tiempo?: number
  tarifa_snapshot?: number
  updated_at?: string
}

export interface Pedido {
  id: number
  juego_id: number
  partida_id: number | null
  producto_id: number
  producto_nombre?: string
  mesera_id?: number
  mesera_nombre?: string
  cantidad: number
  precio_unitario: number
  precio_barra_snapshot?: number | null
  fecha_hora: string
  jugador_alias?: string
  mesa_numero?: number
  motivo_rechazo?: string | null
  notas?: string | null
  turno_caja_id?: number | null
  status: PedidoStatus
  tipo: 'individual' | 'partida'
  origen: 'juego' | 'barra'
}

export interface CajaMovimiento {
  id: number
  turno_caja_id: number
  tipo: 'ingreso' | 'egreso'
  concepto: string
  monto: string
  user_admin_id: number | null
  user_caja_id: number | null
  fecha_hora: string
}

export interface ResumenTurno {
  total_bruto: string
  total_comisiones: string
  total_ingresos: string
  total_anulado: string
  count_movimientos: number
  count_anulados: number
  por_metodo_pago: Record<string, string>
  ingresos_manuales: string
  egresos_manuales: string
  efectivo_esperado: string
}

export interface ResumenTurnoActivo extends ResumenTurno {
  turno_id: number
  fecha_apertura: string
  monto_apertura: string
}

export interface PreCierreJuego {
  juego_id: number
  mesa: string
  status: string
}

export interface PreCierreBarra {
  personal_id: number
  tipo: string
  nombre: string | null
  descripcion: string | null
  status: string
}

export interface PreCierre {
  puede_cerrar: boolean
  juegos_en_curso: PreCierreJuego[]
  juegos_sin_cobrar: PreCierreJuego[]
  barras_abiertas: PreCierreBarra[]
}

export interface TurnoCaja {
  id: number
  caja_id: number
  caja_nombre?: string
  user_caja_id?: number
  // Id del usuario que abrió el turno, normalizado desde user_caja_id /
  // user_caja.id / user_admin_id según qué campo envíe el API
  abierto_por_user_id?: number
  cajero_nombre?: string
  fecha_apertura: string
  fecha_cierre?: string
  monto_apertura: number | string
  monto_cierre?: number | string
  monto_sistema?: number | string
  diferencia?: number | string
  status: string
  observaciones?: string
  total_acumulado?: number
  movimientos_caja?: CajaMovimiento[]
  resumen?: ResumenTurno
  // Campos alternativos para compatibilidad
  apertura?: string
  cierre?: string
}

export interface Factura {
  id: number
  billar_id: number
  turno_caja_id: number
  numero_factura?: string
  origen_tipo: OrigenTipo
  origen_id: number
  subtotal_tiempo: number | null
  subtotal_consumo: number
  descuento: number
  total: number
  metodo_pago: MetodoPago
  status: EstadoFactura
  fecha_hora: string
}

export interface ComboItemProducto {
  id: number
  nombre: string
  precio: number | string
  disponible: boolean
  imagen_url: string | null
}

export interface ComboItem {
  producto_id: number
  cantidad: number | string
  producto?: ComboItemProducto
}

export interface Producto {
  id: number
  categoria_id: number
  categoria: CategoriaProducto
  nombre: string
  descripcion?: string
  precio: number
  precio_costo?: number | string | null
  imagen_url?: string
  disponible: boolean
  lleva_inventario: boolean
  es_combo?: boolean
  combo_items?: ComboItem[]
  // Solo combos: unidades vendibles según stock de componentes (null en productos normales)
  stock_disponible?: string | null
  billar_id?: number
  created_at?: string
}

export interface CategoriaProducto {
  id: number
  nombre: string
  icono?: string
  orden: number
  activa: boolean
  billar_id?: number
}

export interface InventarioItem {
  producto_id: number
  producto: Producto
  stock_actual: number
  stock_minimo: number
  unidad: string
}

export interface KardexItem {
  id: number
  fecha_hora: string
  tipo: TipoAjusteInventario
  cantidad: string
  costo_unitario: string | null
  motivo: string
  referencia_id: number | null
  referencia_tipo: string | null
  usuario_id: number
  usuario_tipo: string
  // null en movimientos históricos cuyo stock previo no es reconstruible
  saldo: string | null
}

export interface Kardex {
  producto: ComboItemProducto
  stock_actual: string
  total: number
  page: number
  page_size: number
  items: KardexItem[]
}

export interface ValorizadoItem {
  producto_id: number
  producto_nombre: string
  categoria: string
  stock_actual: string
  stock_minimo: string
  precio_costo: string | null
  precio_venta: string
  valor_costo: string | null
  valor_venta: string
}

export interface Valorizado {
  items: ValorizadoItem[]
  total_valor_costo: string
  total_valor_venta: string
  productos_sin_costo: number
}

export interface ConteoFisicoResultado {
  producto_id: number
  producto_nombre: string
  stock_anterior: string
  stock_contado: string
  diferencia: string
}

export interface ConteoFisico {
  productos_contados: number
  productos_ajustados: number
  resultados: ConteoFisicoResultado[]
}

export interface MovimientoInventario {
  id: number
  inventario_id: number
  inventario: {
    id: number
    producto: {
      id: number
      nombre: string
    }
  }
  tipo: TipoAjusteInventario
  cantidad: string
  motivo: string
  referencia_id: number | null
  referencia_tipo: string
  usuario_id: number
  usuario_tipo: string
  fecha_hora: string
}

export interface Caja {
  id: number
  billar_id: number
  nombre: string
  activa: boolean
}

export interface UserAdmin {
  id: number
  nombre: string
  email: string
  rol: UserRole
  billares: BillarAsignado[]
  activo: boolean
  ultimo_login: string | null
}

export interface Cajero {
  id: number
  nombre: string
  email: string
  activo: boolean
  ultimo_login: string | null
}

export interface AlertaStock {
  id: number
  billar_id: number
  producto_id: number
  stock_actual: number
  stock_minimo: number
  producto: Producto | null
}

export interface JuegoHistorialItem {
  id: number
  mesa_id: number
  mesa_numero: number
  status: EstadoJuego
  hora_inicio: string
  hora_fin: string | null
  tiempo_minutos: number | null
  costo_tiempo: number | null
  total_consumos: number | null
  total_juego: number | null
  factura_id: number | null
  numero_factura: string | null
}

export interface Asignacion {
  id: number
  billar_id: number
  mesera_id: number
  mesa_id: number
  activa: boolean
  created_at: string
  created_by_admin_id: number
  mesera_nombre: string
  mesa_numero: number
}

export interface KPIDashboard {
  ingresos_hoy: number
  mesas_activas: number
  pedidos_pendientes: number
  turnos_abiertos: number
}

export interface EventoActividad {
  id: number
  tipo: string
  descripcion: string
  creado_en: string
}
