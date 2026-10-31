import api from '@/lib/axios'
import { type Mesera } from '@/types/models'

export const meserasService = {
  getAll: () =>
    // billar_id se resuelve del token internamente
    api.get<Mesera[]>('/api/v1/meseras').then(r => r.data),
  getById: (id: number) =>
    api.get<Mesera>(`/api/v1/meseras/${id}`).then(r => r.data),
  create: (data: { billar_id: number; nombre_completo: string; usuario: string; password: string; foto_url?: string }) =>
    api.post<Mesera>('/api/v1/meseras', data).then(r => r.data),
  update: (id: number, data: Partial<{ nombre_completo: string; usuario: string; foto_url: string }>) =>
    api.patch<Mesera>(`/api/v1/meseras/${id}`, data).then(r => r.data),
  updateEstado: (id: number, activa: boolean) =>
    api.patch(`/api/v1/meseras/${id}/estado`, { activa }).then(r => r.data),
  updatePin: (id: number, pin: string) =>
    api.patch(`/api/v1/meseras/${id}/pin`, { pin }).then(r => r.data),
  delete: (id: number) =>
    api.delete(`/api/v1/meseras/${id}`).then(r => r.data),
  deleteMany: (ids: number[]) =>
    Promise.all(ids.map(id => api.delete(`/api/v1/meseras/${id}`).then(r => r.data))),
}
