import { useQueries, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { suscripcionesService } from '../services/suscripciones-service'
import type {
  CreatePlanRequest,
  UpdatePlanRequest,
  SetPrecioRequest,
  CreateSuscripcionRequest,
  RenovarSuscripcionRequest,
} from '../types'

export function usePlanes() {
  return useQuery({
    queryKey: ['sa-planes'],
    queryFn: suscripcionesService.getPlanes,
    staleTime: 1000 * 60,
  })
}

export function useSuscripcionBillar(billarId: number) {
  return useQuery({
    queryKey: ['sa-suscripcion', billarId],
    queryFn: () => suscripcionesService.getSuscripcionBillar(billarId),
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if ((error as { response?: { status?: number } }).response?.status === 404)
        return false
      return failureCount < 2
    },
  })
}

export function useSuscripcionesBillares(billarIds: number[]) {
  return useQueries({
    queries: billarIds.map((id) => ({
      queryKey: ['sa-suscripcion', id],
      queryFn: () => suscripcionesService.getSuscripcionBillar(id),
      staleTime: 1000 * 60,
      retry: (failureCount: number, error: unknown) => {
        if ((error as { response?: { status?: number } }).response?.status === 404)
          return false
        return failureCount < 2
      },
    })),
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => suscripcionesService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-planes'] })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, data }: { planId: number; data: UpdatePlanRequest }) =>
      suscripcionesService.updatePlan(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-planes'] })
    },
  })
}

export function useSetPrecio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, data }: { planId: number; data: SetPrecioRequest }) =>
      suscripcionesService.setPrecio(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-planes'] })
    },
  })
}

export function useCreateSuscripcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSuscripcionRequest) =>
      suscripcionesService.createSuscripcion(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sa-suscripcion', variables.billar_id] })
    },
  })
}

export function useRenovarSuscripcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      billarId,
      data,
    }: {
      billarId: number
      data: RenovarSuscripcionRequest
    }) => suscripcionesService.renovarSuscripcion(billarId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sa-suscripcion', variables.billarId] })
    },
  })
}

export function useRevocarSuscripcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (billarId: number) =>
      suscripcionesService.revocarSuscripcion(billarId),
    onSuccess: (_data, billarId) => {
      queryClient.invalidateQueries({ queryKey: ['sa-suscripcion', billarId] })
    },
  })
}
