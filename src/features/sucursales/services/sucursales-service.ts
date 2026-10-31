import api from '@/lib/axios'
import { type Billar } from '@/types/models'

export const sucursalesService = {
  getAll: () => api.get<Billar[]>('/api/v1/billares').then((r) => r.data),

  getById: (id: number) =>
    api.get<Billar>(`/api/v1/billares/${id}`).then((r) => r.data),

  create: (data: {
    nombre: string
    direccion?: string
    telefono?: string
  }) => api.post<Billar>('/api/v1/billares', data).then((r) => r.data),

  update: (
    id: number,
    data: Partial<{ nombre: string; direccion: string; telefono: string }>
  ) => api.patch<Billar>(`/api/v1/billares/${id}`, data).then((r) => r.data),

  updateEstado: (id: number, activo: boolean) =>
    api
      .patch(`/api/v1/billares/${id}/estado`, { activo })
      .then((r) => r.data),
}
