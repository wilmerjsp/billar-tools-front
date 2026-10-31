import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuthStore } from '@/stores/auth-store'
import { KPICards } from './components/kpi-cards'
import { MesasMiniMapa } from './components/mesas-mini-mapa'
import { PedidosPendientesWidget } from './components/pedidos-pendientes-widget'

export function Dashboard() {
  const { auth } = useAuthStore()
  const billarId = auth.user?.billares_asignados[0] ?? 0

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>

        <div className='space-y-6'>
          <KPICards billarId={billarId} />

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <MesasMiniMapa />
            <PedidosPendientesWidget billarId={billarId} />
          </div>
        </div>
      </Main>
    </>
  )
}
