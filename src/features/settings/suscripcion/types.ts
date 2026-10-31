export type EstadoSuscripcion = 'activa' | 'vencida' | 'inactiva'

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

export interface UsoRecurso {
  actual: number
  maximo: number
}

export interface MiSuscripcion {
  estado: EstadoSuscripcion
  periodo: PeriodoFacturacion
  fecha_inicio: string
  fecha_fin: string
  dias_restantes: number
  monto_cobrado: string
  plan: PlanSuscripcion
  uso: {
    admins: UsoRecurso
    cajeros: UsoRecurso
    meseras: UsoRecurso
    cajas: UsoRecurso
  }
}
