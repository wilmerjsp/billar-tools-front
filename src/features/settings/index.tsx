import { Outlet } from '@tanstack/react-router'
import {
  CreditCard,
  Palette,
  SlidersHorizontal,
  Wrench,
  UserCog,
} from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems: {
  title: string
  href: string
  icon: React.JSX.Element
  adminOnly?: boolean
}[] = [
  {
    title: 'Perfil del billar',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Cuenta',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  },
  {
    title: 'Suscripción',
    href: '/settings/suscripcion',
    icon: <CreditCard size={18} />,
    adminOnly: true,
  },
  {
    title: 'Apariencia',
    href: '/settings/appearance',
    icon: <Palette size={18} />,
  },
  {
    title: 'Preferencias',
    href: '/settings/preferencias',
    icon: <SlidersHorizontal size={18} />,
  },
]

export function Settings() {
  const { isAdmin } = usePermissions()
  const navItems = sidebarNavItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Configuración
          </h1>
          <p className='text-muted-foreground'>
            Administra la configuración general del sistema.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={navItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
