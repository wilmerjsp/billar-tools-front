import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { sucursalesService } from '@/features/sucursales/services/sucursales-service'
import {
  loadBillarDisplay,
  saveBillarDisplay,
} from '@/lib/billar-display-storage'
// import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const user = useAuthStore((s) => s.auth.user)
  const billarId = user?.billares_asignados[0]

  const { data: billar } = useQuery({
    queryKey: ['billares', billarId],
    queryFn: () => sucursalesService.getById(billarId!),
    enabled: !!billarId,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (billar?.nombre) {
      saveBillarDisplay({ nombre: billar.nombre })
    }
  }, [billar?.nombre])

  const cached = loadBillarDisplay()
  const billarNombre = billar?.nombre ?? cached?.nombre ?? 'Panel de Control'

  const teams = [
    { ...sidebarData.teams[0], plan: billarNombre },
  ]

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />

        {/* Replace <TeamSwitch /> with the following <AppTitle />
         /* if you want to use the normal app title instead of TeamSwitch dropdown */}
        {/* <AppTitle /> */}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
