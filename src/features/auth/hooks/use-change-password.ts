import { useMutation } from '@tanstack/react-query'
import { authService, type ChangePasswordPayload } from '../services/auth-service'

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => authService.changePassword(data),
  })
}
