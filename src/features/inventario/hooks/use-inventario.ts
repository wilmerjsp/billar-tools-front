import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  inventarioService,
  type CompraPayload,
  type ConteoFisicoPayload,
  type KardexParams,
} from '../services/inventario-service'
import { type TipoAjusteInventario } from '@/types/enums'

export function useInventario() {
  return useQuery({
    queryKey: ['inventario'],
    queryFn: () => inventarioService.getInventario(),
    staleTime: 1000 * 30,
  })
}

export function useAlertasStock() {
  return useQuery({
    queryKey: ['inventario-alertas'],
    queryFn: () => inventarioService.getAlertas(),
    staleTime: 1000 * 60,
  })
}

interface MovimientosFilters {
  producto_id?: number
  tipo?: TipoAjusteInventario
}

export function useMovimientos(filters?: MovimientosFilters) {
  return useQuery({
    queryKey: ['inventario-movimientos', filters],
    queryFn: () =>
      inventarioService.getMovimientos({
        ...filters,
      }),
    staleTime: 1000 * 30,
  })
}

interface AjusteStockPayload {
  producto_id: number
  tipo: TipoAjusteInventario
  cantidad: number
  motivo: string
}

function useInvalidateInventario() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['inventario'] })
    queryClient.invalidateQueries({ queryKey: ['inventario-alertas'] })
    queryClient.invalidateQueries({ queryKey: ['inventario-movimientos'] })
    queryClient.invalidateQueries({ queryKey: ['inventario-valorizado'] })
    queryClient.invalidateQueries({ queryKey: ['kardex'] })
  }
}

export function useAjusteStockMutation() {
  const invalidate = useInvalidateInventario()

  return useMutation({
    mutationFn: (data: AjusteStockPayload) => inventarioService.ajusteStock(data),
    onSuccess: invalidate,
  })
}

export function useRegistrarCompra() {
  const invalidate = useInvalidateInventario()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CompraPayload) => inventarioService.registrarCompra(data),
    onSuccess: () => {
      invalidate()
      // La compra puede actualizar el precio_costo del producto
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useConteoFisico() {
  const invalidate = useInvalidateInventario()

  return useMutation({
    mutationFn: (data: ConteoFisicoPayload) => inventarioService.conteoFisico(data),
    onSuccess: invalidate,
  })
}

export function useKardex(productoId: number, params?: KardexParams) {
  return useQuery({
    queryKey: ['kardex', productoId, params],
    queryFn: () => inventarioService.getKardex(productoId, params),
    enabled: productoId > 0,
    staleTime: 1000 * 30,
  })
}

export function useValorizado() {
  return useQuery({
    queryKey: ['inventario-valorizado'],
    queryFn: () => inventarioService.getValorizado(),
    staleTime: 1000 * 60,
  })
}
