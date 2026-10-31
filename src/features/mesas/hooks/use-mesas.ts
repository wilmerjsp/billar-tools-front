import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mesasService } from '../services/mesas-service'
import { type MesaFormValues } from '../types'

export function useMesas() {
  return useQuery({
    queryKey: ['mesas'],
    queryFn: () => mesasService.getAll(),
    staleTime: 1000 * 30,
  })
}

export function useMesaMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['mesas'] })

  const create = useMutation({
    mutationFn: mesasService.create,
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<MesaFormValues>
    }) => mesasService.update(id, data),
    onSuccess: invalidate,
  })

  const updateEstado = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      mesasService.updateEstado(id, status),
    onSuccess: invalidate,
  })

  const deleteMesa = useMutation({
    mutationFn: (id: number) => mesasService.delete(id),
    onSuccess: invalidate,
  })

  return { create, update, updateEstado, deleteMesa }
}
