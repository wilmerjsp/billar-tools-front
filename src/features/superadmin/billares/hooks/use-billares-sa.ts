import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { billaresSaService } from '../services/billares-sa-service'
import {
  type CreateTenantFormValues,
  type UpdateBillarRequest,
} from '../types'

export function useBillaresSa() {
  return useQuery({
    queryKey: ['sa-billares'],
    queryFn: billaresSaService.getAll,
    staleTime: 1000 * 60,
  })
}

export function useBillarSa(billarId: number) {
  return useQuery({
    queryKey: ['sa-billares', billarId],
    queryFn: () => billaresSaService.getById(billarId),
    staleTime: 1000 * 60,
  })
}

export function useBillarPersonal(billarId: number) {
  return useQuery({
    queryKey: ['sa-billares', billarId, 'personal'],
    queryFn: () => billaresSaService.getPersonal(billarId),
    staleTime: 1000 * 30,
  })
}

export function useToggleEstadoBillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ billarId, activo }: { billarId: number; activo: boolean }) =>
      billaresSaService.toggleEstado(billarId, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-billares'] })
    },
  })
}

export function useUpdateBillar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ billarId, data }: { billarId: number; data: UpdateBillarRequest }) =>
      billaresSaService.updateBillar(billarId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-billares'] })
    },
  })
}

export type CreateTenantStep = 'idle' | 'billar' | 'admin' | 'assign' | 'done'

export function useCreateTenant() {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<CreateTenantStep>('idle')

  const mutation = useMutation({
    mutationFn: async (values: CreateTenantFormValues) => {
      setStep('billar')
      const billar = await billaresSaService.createBillar({
        nombre: values.nombre,
        direccion: values.direccion || undefined,
        telefono: values.telefono || undefined,
        es_prueba: values.es_prueba,
      })

      setStep('admin')
      const admin = await billaresSaService.createAdmin({
        nombre: values.admin_nombre,
        email: values.admin_email,
        password: values.admin_password,
        rol: 'admin',
      })

      setStep('assign')
      await billaresSaService.assignBillar(admin.id, {
        billar_id: billar.id,
        rol_sucursal: 'admin',
      })

      setStep('done')
      return { billar, admin }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-billares'] })
    },
    onSettled: () => {
      // Resetear step al finalizar (éxito o error) con pequeño delay para que
      // el caller pueda leer el estado 'done' antes del reset
      setTimeout(() => setStep('idle'), 500)
    },
  })

  return { ...mutation, step }
}
