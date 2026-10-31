import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosService } from '../services/usuarios-service'

export function useCajeros() {
  return useQuery({
    queryKey: ['cajeros'],
    queryFn: () => usuariosService.getCajeros(),
    staleTime: 1000 * 60,
  })
}

export function useCajeroMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['cajeros'] })

  const createCajero = useMutation({
    mutationFn: usuariosService.createCajero,
    onSuccess: invalidate,
  })

  return { createCajero }
}
