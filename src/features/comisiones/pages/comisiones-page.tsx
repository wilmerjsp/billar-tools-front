import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole } from '@/types/enums'
import { ConfigTable } from '../components/config-table'
import { VentasTable } from '../components/ventas-table'

export function ComisionesPage() {
  const user = useAuthStore((s) => s.auth.user)
  const isAdmin =
    user?.rol === UserRole.ADMIN || user?.rol === UserRole.SUPERADMIN

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h2 className='text-2xl font-bold tracking-tight'>Comisiones</h2>
          <p className='text-muted-foreground'>
            Configura las comisiones por producto y consulta las ventas de meseras.
          </p>
        </div>

        <Tabs defaultValue={isAdmin ? 'config' : 'ventas'}>
          <TabsList className='mb-6'>
            {isAdmin && <TabsTrigger value='config'>Configuración</TabsTrigger>}
            <TabsTrigger value='ventas'>Ventas</TabsTrigger>
          </TabsList>

          {isAdmin && (
            <TabsContent value='config'>
              <ConfigTable />
            </TabsContent>
          )}

          <TabsContent value='ventas'>
            <VentasTable />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
