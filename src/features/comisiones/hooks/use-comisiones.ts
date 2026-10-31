import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { comisionesService } from '../services/comisiones-service'
import type { ComisionVentasParams, ComisionResumenParams } from '../types'

export function useVentasPorMesera(turnoId: number) {
  return useQuery({
    queryKey: ['ventas-por-mesera', turnoId],
    queryFn: () => comisionesService.getVentasPorMesera(turnoId),
    enabled: turnoId > 0,
    // Turno abierto: refrescar en vivo; cerrado: los datos ya no cambian
    staleTime: 1000 * 30,
    refetchInterval: (query) =>
      query.state.data?.status === 'abierto' ? 1000 * 30 : false,
  })
}

export function useComisionConfigs(soloActivas = false) {
  return useQuery({
    queryKey: ['comisiones-config', soloActivas],
    queryFn: () => comisionesService.getConfigs({ solo_activas: soloActivas || undefined }),
    staleTime: 1000 * 30,
  })
}

export function useComisionVentas(params: ComisionVentasParams) {
  return useQuery({
    queryKey: ['comisiones-ventas', params],
    queryFn: () => comisionesService.getVentas(params),
    staleTime: 1000 * 30,
  })
}

export function useComisionResumen(params?: ComisionResumenParams) {
  return useQuery({
    queryKey: ['comisiones-resumen', params],
    queryFn: () => comisionesService.getResumen(params),
    staleTime: 1000 * 30,
  })
}

export function useComisionConfigMutations() {
  const queryClient = useQueryClient()
  const invalidateConfigs = () =>
    queryClient.invalidateQueries({ queryKey: ['comisiones-config'] })

  const create = useMutation({
    mutationFn: (data: { producto_id: number; precio_barra: number }) =>
      comisionesService.createConfig(data),
    onSuccess: invalidateConfigs,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { precio_barra?: number; activa?: boolean } }) =>
      comisionesService.updateConfig(id, data),
    onSuccess: invalidateConfigs,
  })

  const remove = useMutation({
    mutationFn: (id: number) => comisionesService.deleteConfig(id),
    onSuccess: invalidateConfigs,
  })

  return { create, update, remove }
}

export function useComisionVentaMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['comisiones-ventas'] })
    queryClient.invalidateQueries({ queryKey: ['comisiones-resumen'] })
  }

  const pagar = useMutation({
    mutationFn: (id: number) => comisionesService.pagarComision(id),
    onSuccess: invalidate,
  })

  return { pagar }
}
