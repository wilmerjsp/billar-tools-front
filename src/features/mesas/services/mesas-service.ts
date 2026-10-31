import api from '@/lib/axios'
import { type Mesa } from '@/types/models'
import { type MesaFormValues } from '../types'

export const mesasService = {
  getAll: () =>
    // billar_id se resuelve del token internamente
    api
      .get<Mesa[]>(`/api/v1/mesas`)
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<Mesa>(`/api/v1/mesas/${id}`).then((r) => r.data),

  create: (data: MesaFormValues) =>
    api.post<Mesa>('/api/v1/mesas', data).then((r) => r.data),

  update: (id: number, data: Partial<MesaFormValues>) =>
    api.patch<Mesa>(`/api/v1/mesas/${id}`, data).then((r) => r.data),

  updateEstado: (id: number, status: string) =>
    api
      .patch(`/api/v1/mesas/${id}/estado`, { status })
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/api/v1/mesas/${id}`).then((r) => r.data),
}
