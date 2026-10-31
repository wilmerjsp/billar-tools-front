import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { suscripcionService } from './suscripcion-service'

export function useMiSuscripcion() {
  return useQuery({
    queryKey: ['mi-suscripcion'],
    queryFn: () => suscripcionService.getMiBillar(),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // 403 = usuario no propietario: reintentar no cambia nada
      if (isAxiosError(error) && error.response?.status === 403) return false
      return failureCount < 2
    },
  })
}
