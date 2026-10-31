import api from '@/lib/axios'
import { type Cajero } from '@/types/models'

export const cajerosService = {
  getAll: () =>
    api.get<Cajero[]>('/api/v1/usuarios/cajeros').then(r => r.data),
  create: (data: { nombre: string; email: string; password: string }) =>
    api.post<Cajero>('/api/v1/usuarios/cajeros', data).then(r => r.data),
  update: (id: number, data: Partial<{ nombre: string; email: string }>) =>
    api.patch<Cajero>(`/api/v1/usuarios/cajeros/${id}`, data).then(r => r.data),
  delete: (id: number) =>
    api.delete(`/api/v1/usuarios/cajeros/${id}`).then(r => r.data),
  deleteMany: (ids: number[]) =>
    Promise.all(ids.map(id => api.delete(`/api/v1/usuarios/cajeros/${id}`).then(r => r.data))),
}
