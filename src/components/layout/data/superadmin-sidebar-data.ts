import {
  LayoutDashboard,
  Building2,
  CreditCard,
  ShieldCheck,
  Settings,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const superAdminSidebarData: SidebarData = {
  user: {
    name: 'Super Admin',
    email: '',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Billar Tools',
      logo: ShieldCheck,
      plan: 'Super Admin',
    },
  ],
  navGroups: [
    {
      title: 'Principal',
      items: [
        { title: 'Dashboard', url: '/superadmin', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Gestión',
      items: [
        { title: 'Billares', url: '/superadmin/billares', icon: Building2 },
        { title: 'Suscripciones', url: '/superadmin/suscripciones', icon: CreditCard },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          title: 'Configuración',
          icon: Settings,
          items: [
            { title: 'Administradores', url: '/superadmin/administradores', icon: ShieldCheck },
          ],
        },
      ],
    },
  ],
}
