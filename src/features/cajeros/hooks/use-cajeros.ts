import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cajerosService } from '../services/cajeros-service'

export function useCajeros() {
  return useQuery({
    queryKey: ['cajeros'],
    queryFn: () => cajerosService.getAll(),
    staleTime: 1000 * 30,
  })
}

export function useCajeroMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['cajeros'] })

  const create = useMutation({
    mutationFn: (data: { nombre: string; email: string; password: string }) =>
      cajerosService.create(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<{ nombre: string; email: string }>
    }) => cajerosService.update(id, data),
    onSuccess: invalidate,
  })

  const deleteMuchos = useMutation({
    mutationFn: (ids: number[]) => cajerosService.deleteMany(ids),
    onSuccess: invalidate,
  })

  return { create, update, deleteMuchos }
}
