import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'
import { clearBillarDisplay } from '@/lib/billar-display-storage'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await api.post('/api/v1/auth/admin/logout')
    } catch {
      // Ignorar errores de logout en el servidor; proceder con limpieza local
    } finally {
      auth.reset()
      clearBillarDisplay()
      navigate({
        to: '/sign-in',
        replace: true,
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Cerrar sesión'
      desc='¿Estás seguro de que deseas cerrar sesión? Deberás iniciar sesión nuevamente para acceder al sistema.'
      confirmText='Cerrar sesión'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
