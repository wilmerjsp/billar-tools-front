import { useAuthStore } from '@/stores/auth-store'
import { UserRole } from '@/types/enums'

export function usePermissions() {
  const { auth } = useAuthStore()
  // rol_sucursal refleja el scope actual del token (billar-scoped)
  const rol = auth.user?.rol_sucursal ?? auth.user?.rol

  return {
    canManageUsers: rol === UserRole.SUPERADMIN,
    canManageSucursales: rol === UserRole.SUPERADMIN,
    canManageAdmins: rol === UserRole.SUPERADMIN,
    canAccessCaja: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CAJERO].includes(
      rol as UserRole
    ),
    canEditProducts: [UserRole.SUPERADMIN, UserRole.ADMIN].includes(
      rol as UserRole
    ),
    canManageMesas: [UserRole.SUPERADMIN, UserRole.ADMIN].includes(
      rol as UserRole
    ),
    canAnularFactura: rol !== UserRole.CAJERO,
    isAdmin: [UserRole.SUPERADMIN, UserRole.ADMIN].includes(rol as UserRole),
    isSuperAdmin: rol === UserRole.SUPERADMIN,
  }
}
