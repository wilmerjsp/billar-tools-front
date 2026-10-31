import api from '@/lib/axios'

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  confirm_new_password: string
}

export const authService = {
  changePassword: (data: ChangePasswordPayload) =>
    api
      .put('/api/v1/auth/admin/change-password', data)
      .then((r) => r.data),
}
