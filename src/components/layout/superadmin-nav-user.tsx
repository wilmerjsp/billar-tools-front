import { ChevronsUpDown, LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { useSuperAdminAuthStore } from '@/stores/superadmin-auth-store'
import superAdminApi from '@/lib/superadmin-api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ConfirmDialog } from '@/components/confirm-dialog'

export function SuperAdminNavUser() {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()
  const navigate = useNavigate()
  const { auth } = useSuperAdminAuthStore()

  const displayName = auth.user?.nombre ?? 'Super Admin'
  const displayEmail = auth.user?.email ?? ''
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  const handleSignOut = async () => {
    try {
      await superAdminApi.post('/api/v1/auth/admin/logout')
    } catch {
      // Ignorar errores del servidor; proceder con limpieza local
    } finally {
      auth.reset()
      navigate({ to: '/superadmin-sign-in', replace: true })
      toast.success('Sesión cerrada')
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg'>
                    {initials || 'SA'}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{displayName}</span>
                  <span className='truncate text-xs'>{displayEmail}</span>
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarFallback className='rounded-lg'>
                      {initials || 'SA'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-start text-sm leading-tight'>
                    <span className='truncate font-semibold'>{displayName}</span>
                    <span className='truncate text-xs'>{displayEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <ShieldCheck />
                  Super Admin
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ConfirmDialog
        open={!!open}
        onOpenChange={setOpen}
        title='Cerrar sesión'
        desc='¿Estás seguro de que deseas cerrar sesión?'
        confirmText='Cerrar sesión'
        destructive
        handleConfirm={handleSignOut}
        className='sm:max-w-sm'
      />
    </>
  )
}
