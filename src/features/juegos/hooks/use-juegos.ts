import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { type CrearConsumoInput, type FacturarJuegoInput, type HistorialJuegosParams, juegosService } from '../services/juegos-service'
import { showApiError } from '@/lib/handle-server-error'

export function useJuegosActivos(billarId: number) {
  return useQuery({
    queryKey: ['juegos', 'activos', billarId],
    queryFn: () => juegosService.getActivos(billarId),
    staleTime: 1000 * 15,
    enabled: billarId > 0,
  })
}

export function useJuego(id: number) {
  return useQuery({
    queryKey: ['juegos', id],
    queryFn: () => juegosService.getById(id),
    enabled: id > 0,
  })
}

export function useCrearConsumo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CrearConsumoInput) => juegosService.crearConsumo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      toast.success('Pedido enviado — pendiente de aprobación')
    },
    onError: (error) => showApiError(error, 'Error al enviar el pedido'),
  })
}

export function useJuegoResumen(id: number) {
  return useQuery({
    queryKey: ['juegos', id, 'resumen'],
    queryFn: () => juegosService.getResumen(id),
    enabled: id > 0,
  })
}

export function useHistorialJuegos(params: HistorialJuegosParams) {
  return useQuery({
    queryKey: ['juegos', 'historial', params],
    queryFn: () => juegosService.getHistorial(params),
    placeholderData: (prev) => prev,
  })
}

export function useFacturarJuego() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FacturarJuegoInput }) =>
      juegosService.facturar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['juegos'] })
      queryClient.invalidateQueries({ queryKey: ['facturas'] })
    },
    onError: (error) => showApiError(error, 'Error al facturar el juego'),
  })
}
