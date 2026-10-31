import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { asignacionesService } from '../services/asignaciones-service'
import { type AsignacionBatchValues } from '../types'

export function useAsignaciones() {
  return useQuery({
    queryKey: ['asignaciones'],
    queryFn: () => asignacionesService.getAll(),
    staleTime: 1000 * 30,
  })
}

export function useAsignacionMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['asignaciones'] })

  const createBatch = useMutation({
    mutationFn: (data: AsignacionBatchValues) =>
      asignacionesService.createBatch(data),
    onSuccess: invalidate,
  })

  const toggleBatch = useMutation({
    mutationFn: (ids: number[]) => asignacionesService.toggleBatch(ids),
    onSuccess: invalidate,
  })

  const removeBatch = useMutation({
    mutationFn: (ids: number[]) => asignacionesService.deleteBatch(ids),
    onSuccess: invalidate,
  })

  return { createBatch, toggleBatch, removeBatch }
}
