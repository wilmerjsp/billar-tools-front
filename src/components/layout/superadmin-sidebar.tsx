import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { superAdminSidebarData } from './data/superadmin-sidebar-data'
import { NavGroup } from './nav-group'
import { TeamSwitcher } from './team-switcher'
import { SuperAdminNavUser } from './superadmin-nav-user'

export function SuperAdminSidebar() {
  const { collapsible, variant } = useLayout()

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={superAdminSidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {superAdminSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SuperAdminNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
