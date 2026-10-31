import superAdminApi from '@/lib/superadmin-api'
import type {
  PlanSuscripcion,
  SuscripcionDetalle,
  CreatePlanRequest,
  UpdatePlanRequest,
  SetPrecioRequest,
  CreateSuscripcionRequest,
  RenovarSuscripcionRequest,
  PlanPrecio,
} from '../types'

export const suscripcionesService = {
  getPlanes: () =>
    superAdminApi
      .get<PlanSuscripcion[]>('/api/v1/suscripciones/planes')
      .then((r) => r.data),

  createPlan: (data: CreatePlanRequest) =>
    superAdminApi
      .post<PlanSuscripcion>('/api/v1/suscripciones/planes', data)
      .then((r) => r.data),

  updatePlan: (planId: number, data: UpdatePlanRequest) =>
    superAdminApi
      .patch<PlanSuscripcion>(`/api/v1/suscripciones/planes/${planId}`, data)
      .then((r) => r.data),

  setPrecio: (planId: number, data: SetPrecioRequest) =>
    superAdminApi
      .put<PlanPrecio>(`/api/v1/suscripciones/planes/${planId}/precios`, data)
      .then((r) => r.data),

  getSuscripcionBillar: (billarId: number) =>
    superAdminApi
      .get<SuscripcionDetalle>(`/api/v1/suscripciones/billar/${billarId}`)
      .then((r) => r.data),

  createSuscripcion: (data: CreateSuscripcionRequest) =>
    superAdminApi
      .post<SuscripcionDetalle>('/api/v1/suscripciones', data)
      .then((r) => r.data),

  renovarSuscripcion: (billarId: number, data: RenovarSuscripcionRequest) =>
    superAdminApi
      .post<SuscripcionDetalle>(
        `/api/v1/suscripciones/billar/${billarId}/renovar`,
        data
      )
      .then((r) => r.data),

  revocarSuscripcion: (billarId: number) =>
    superAdminApi
      .patch<SuscripcionDetalle>(
        `/api/v1/suscripciones/billar/${billarId}/revocar`
      )
      .then((r) => r.data),
}
