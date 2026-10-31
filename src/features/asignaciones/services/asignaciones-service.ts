import api from '@/lib/axios'
import { type Asignacion } from '@/types/models'
import { type AsignacionBatchValues } from '../types'

export const asignacionesService = {
  getAll: () =>
    api.get<Asignacion[]>('/api/v1/asignaciones').then((r) => r.data),

  createBatch: (data: AsignacionBatchValues) =>
    api
      .post<Asignacion[]>('/api/v1/asignaciones', data)
      .then((r) => r.data),

  toggleBatch: (ids: number[]) =>
    api
      .patch<Asignacion[]>('/api/v1/asignaciones/toggle', { ids })
      .then((r) => r.data),

  deleteBatch: (ids: number[]) =>
    api
      .delete('/api/v1/asignaciones', { data: { ids } })
      .then((r) => r.data),
}
