export type PeriodoFacturacion = 'mes' | 'semestre' | 'anual'

export interface PlanPrecio {
  periodo: PeriodoFacturacion
  precio: string
}

export interface PlanSuscripcion {
  id: number
  nombre: string
  max_admins: number
  max_cajas: number
  max_cajeros: number
  max_meseras: number
  activo: boolean
  precios: PlanPrecio[]
}

export interface SuscripcionDetalle {
  id: number
  billar_id: number
  plan_id: number
  periodo: PeriodoFacturacion
  fecha_inicio: string
  fecha_fin: string
  activa: boolean
  monto_cobrado: string
  plan: PlanSuscripcion
}

export interface CreatePlanRequest {
  nombre: string
  max_admins: number
  max_cajas: number
  max_cajeros: number
  max_meseras: number
}

export interface UpdatePlanRequest {
  max_admins?: number | null
  max_cajas?: number | null
  max_cajeros?: number | null
  max_meseras?: number | null
  activo?: boolean | null
}

export interface SetPrecioRequest {
  periodo: PeriodoFacturacion
  precio: string
}

export interface CreateSuscripcionRequest {
  billar_id: number
  plan_id: number
  periodo: PeriodoFacturacion
}

export interface RenovarSuscripcionRequest {
  plan_id: number
  periodo: PeriodoFacturacion
}
