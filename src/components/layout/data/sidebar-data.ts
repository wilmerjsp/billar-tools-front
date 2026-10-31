import {
  LayoutDashboard,
  Table2,
  Gamepad2,
  History,
  Link2,
  ShoppingCart,
  CreditCard,
  ClipboardList,
  Package,
  Warehouse,
  Users2,
  BarChart3,
  Settings,
  // UserCog,      // ícono de Usuarios (opción oculta del menú)
  // Building2,    // ícono de Sucursales (opción oculta del menú)
  MonitorCog,
  Tag,
  Coins,
  ConciergeBell,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Usuario',
    email: '',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Billar Tools Admin',
      logo: MonitorCog,
      plan: 'Panel de Control',
    },
  ],
  navGroups: [
    {
      title: 'Principal',
      items: [
        { title: 'Dashboard', url: '/', icon: LayoutDashboard },
        { title: 'Mesas', url: '/mesas', icon: Table2 },
        { title: 'Juegos Activos', url: '/juegos', icon: Gamepad2 },
        { title: 'Historial de Juegos', url: '/juegos/historial', icon: History },
        { title: 'Asignación de Mesas', url: '/asignaciones', icon: Link2 },
      ],
    },{
      title: 'Ventas',
      items: [
        { title: 'Pedidos', url: '/pedidos', icon: ShoppingCart },
        { title: 'Barra Admin', url: '/barra-admin', icon: ConciergeBell },
        { title: 'Historial de Barra', url: '/barra-admin/historial', icon: History },
        { title: 'Caja', url: '/caja', icon: CreditCard },
        { title: 'Turnos de Caja', url: '/turnos', icon: ClipboardList },
        { title: 'Comisiones', url: '/comisiones', icon: Coins },
      ],
    },
    {
      title: 'Catálogo',
      items: [
        { title: 'Productos', url: '/productos', icon: Package },
        { title: 'Categorías', url: '/categorias', icon: Tag },
        { title: 'Inventario', url: '/inventario', icon: Warehouse }
        
      ],
    },
    {
      title: 'Administración',
      items: [
        { title: 'Reportes', url: '/reportes', icon: BarChart3 },
        {
          title: 'Configuración',
          icon: Settings,
          items: [
            // Ocultas del menú temporalmente — las rutas /sucursales y /usuarios siguen activas
            // { title: 'Sucursales', url: '/sucursales', icon: Building2 },
            // { title: 'Usuarios', url: '/usuarios', icon: UserCog },
            { title: 'Meseras', url: '/meseras', icon: Users2 },
            { title: 'Cajeros', url: '/cajeros', icon: CreditCard }
          ],
        },
      ],
    },
  ],
}
