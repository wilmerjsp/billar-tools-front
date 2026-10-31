import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sucursalesService } from '../services/sucursales-service'

export function useSucursales() {
  return useQuery({
    queryKey: ['sucursales'],
    queryFn: () => sucursalesService.getAll(),
    staleTime: 1000 * 60,
  })
}

export function useSucursalMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['sucursales'] })

  const create = useMutation({
    mutationFn: sucursalesService.create,
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<{ nombre: string; direccion: string; telefono: string }>
    }) => sucursalesService.update(id, data),
    onSuccess: invalidate,
  })

  const updateEstado = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      sucursalesService.updateEstado(id, activo),
    onSuccess: invalidate,
  })

  return { create, update, updateEstado }
}
