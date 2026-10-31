export interface CreateBillarRequest {
  nombre: string
  direccion?: string
  telefono?: string
  es_prueba: boolean
}

export interface UpdateBillarRequest {
  nombre?: string
  direccion?: string
  telefono?: string
  es_prueba?: boolean
}

export interface CreateAdminRequest {
  nombre: string
  email: string
  password: string
  rol: 'admin'
}

export interface AssignBillarRequest {
  billar_id: number
  rol_sucursal: 'admin'
}

export interface BillarAdminPersonal {
  id: number
  nombre: string
  email: string
  activo: boolean
  rol_sucursal: string
  es_propietario: boolean
  ultimo_login: string | null
  created_at: string
}

export interface BillarCajeroPersonal {
  id: number
  nombre: string
  email: string
  activo: boolean
  rol_sucursal: string
  es_propietario: boolean
  ultimo_login: string | null
  created_at: string
}

export interface BillarMeseraPersonal {
  id: number
  nombre_completo: string
  usuario: string
  activa: boolean
  foto_url: string | null
  created_at: string
}

export interface BillarPersonal {
  admins: BillarAdminPersonal[]
  cajeros: BillarCajeroPersonal[]
  meseras: BillarMeseraPersonal[]
}

export interface CreateTenantFormValues {
  nombre: string
  direccion: string
  telefono: string
  es_prueba: boolean
  admin_nombre: string
  admin_email: string
  admin_password: string
}
