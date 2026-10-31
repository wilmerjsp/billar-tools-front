import { type AuthUser, type BillarAsignado } from '@/types/models'
import { UserRole } from '@/types/enums'

export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return {}
  }
}

export function authUserFromToken(token: string, fallbackEmail = ''): AuthUser {
  const claims = decodeJwtPayload(token)

  const billares: BillarAsignado[] = Array.isArray(claims.billares)
    ? (claims.billares as BillarAsignado[])
    : typeof claims.billar_id === 'number'
      ? [{ billar_id: claims.billar_id, rol_sucursal: (claims.rol_sucursal ?? claims.rol ?? UserRole.ADMIN) as UserRole, assigned_at: '' }]
      : []

  const rol = (claims.rol ?? claims.role ?? UserRole.ADMIN) as UserRole
  const rol_sucursal = (claims.rol_sucursal ?? rol) as UserRole

  return {
    id: typeof claims.sub === 'number' ? claims.sub : Number(claims.sub ?? 0),
    nombre: (claims.nombre ?? claims.name ?? claims.email ?? claims.usuario ?? fallbackEmail) as string,
    email: (claims.email ?? fallbackEmail) as string,
    rol,
    rol_sucursal,
    billares,
    billares_asignados: billares.map((b) => b.billar_id),
    ultimo_login: null,
  }
}
