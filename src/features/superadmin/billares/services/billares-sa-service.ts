import superAdminApi from '@/lib/superadmin-api'
import { type Billar, type UserAdmin, type BillarAsignado } from '@/types/models'
import {
  type BillarPersonal,
  type CreateBillarRequest,
  type UpdateBillarRequest,
  type CreateAdminRequest,
  type AssignBillarRequest,
} from '../types'

export const billaresSaService = {
  getAll: () =>
    superAdminApi.get<Billar[]>('/api/v1/billares').then((r) => r.data),

  getById: (billarId: number) =>
    superAdminApi.get<Billar>(`/api/v1/billares/${billarId}`).then((r) => r.data),

  toggleEstado: (billarId: number, activo: boolean) =>
    superAdminApi
      .patch<Billar>(`/api/v1/billares/${billarId}/estado`, { activo })
      .then((r) => r.data),

  getPersonal: (billarId: number) =>
    superAdminApi
      .get<BillarPersonal>(`/api/v1/billares/${billarId}/personal`)
      .then((r) => r.data),

  createBillar: (data: CreateBillarRequest) =>
    superAdminApi.post<Billar>('/api/v1/billares', data).then((r) => r.data),

  updateBillar: (billarId: number, data: UpdateBillarRequest) =>
    superAdminApi
      .patch<Billar>(`/api/v1/billares/${billarId}`, data)
      .then((r) => r.data),

  createAdmin: (data: CreateAdminRequest) =>
    superAdminApi
      .post<UserAdmin>('/api/v1/usuarios/admins', data)
      .then((r) => r.data),

  assignBillar: (userId: number, data: AssignBillarRequest) =>
    superAdminApi
      .post<BillarAsignado>(`/api/v1/usuarios/admins/${userId}/billares`, data)
      .then((r) => r.data),
}
