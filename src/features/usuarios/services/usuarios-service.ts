import api from '@/lib/axios'
import { type UserAdmin } from '@/types/models'

export const usuariosService = {
  getCajeros: () =>
    api
      .get<UserAdmin[]>('/api/v1/usuarios/cajeros')
      .then((r) => r.data),

  createCajero: (data: {
    nombre: string
    email: string
    password: string
  }) =>
    api.post<UserAdmin>('/api/v1/usuarios/cajeros', data).then((r) => r.data),
}
