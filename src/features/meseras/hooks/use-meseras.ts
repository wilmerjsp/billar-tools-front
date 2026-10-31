import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { meserasService } from '../services/meseras-service'

export function useMeseras() {
  return useQuery({
    queryKey: ['meseras'],
    queryFn: () => meserasService.getAll(),
    staleTime: 1000 * 30,
  })
}

export function useMeseraMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['meseras'] })

  const create = useMutation({
    mutationFn: (data: {
      billar_id: number
      nombre_completo: string
      usuario: string
      password: string
      foto_url?: string
    }) => meserasService.create(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<{ nombre_completo: string; usuario: string; foto_url: string }>
    }) => meserasService.update(id, data),
    onSuccess: invalidate,
  })

  const updateEstado = useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) =>
      meserasService.updateEstado(id, activa),
    onSuccess: invalidate,
  })

  const updatePin = useMutation({
    mutationFn: ({ id, pin }: { id: number; pin: string }) =>
      meserasService.updatePin(id, pin),
    onSuccess: invalidate,
  })

  const deleteMuchos = useMutation({
    mutationFn: (ids: number[]) => meserasService.deleteMany(ids),
    onSuccess: invalidate,
  })

  return { create, update, updateEstado, updatePin, deleteMuchos }
}
