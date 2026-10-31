import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { barraAdminService } from '../services/barra-admin-service'
import type { AbrirCuentaBody, AgregarItemBody, CobrarCuentaBody, HistorialBarraParams } from '../types'
import { showApiError } from '@/lib/handle-server-error'

const KEYS = {
  activas: ['barra-admin', 'activas'] as const,
  cuenta: (id: number) => ['barra-admin', 'cuenta', id] as const,
}

export function useCuentasBarraActivas() {
  return useQuery({
    queryKey: KEYS.activas,
    queryFn: barraAdminService.getCuentasActivas,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  })
}

export function useCuentaBarra(cuentaId: number) {
  return useQuery({
    queryKey: KEYS.cuenta(cuentaId),
    queryFn: () => barraAdminService.getCuenta(cuentaId),
    enabled: cuentaId > 0,
    staleTime: 1000 * 15,
  })
}

export function useHistorialBarra(params: HistorialBarraParams) {
  return useQuery({
    queryKey: ['barra-admin', 'historial', params],
    queryFn: () => barraAdminService.getHistorial(params),
    placeholderData: (prev) => prev,
  })
}

export function useCuentaBarraDetalle(cuentaId: number) {
  return useQuery({
    queryKey: ['barra-admin', 'detalle', cuentaId],
    queryFn: () => barraAdminService.getCuentaDetalle(cuentaId),
    enabled: cuentaId > 0,
    staleTime: 1000 * 30,
  })
}


export function useBarraAdminMutations(cuentaId?: number) {
  const queryClient = useQueryClient()

  const invalidarActivas = () =>
    queryClient.invalidateQueries({ queryKey: KEYS.activas })

  const invalidarCuenta = (id: number) =>
    queryClient.invalidateQueries({ queryKey: KEYS.cuenta(id) })

  const abrirCuenta = useMutation({
    mutationFn: (body: AbrirCuentaBody) => barraAdminService.abrirCuenta(body),
    onSuccess: () => {
      invalidarActivas()
    },
    onError: (error) => showApiError(error, 'No se pudo abrir la cuenta'),
  })

  const agregarItem = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AgregarItemBody }) =>
      barraAdminService.agregarItem(id, body),
    onSuccess: (_, { id }) => {
      invalidarActivas()
      invalidarCuenta(id)
    },
    onError: (err: unknown) => {
      showApiError(err, 'No se pudo agregar el producto')
    },
  })

  const agregarItems = useMutation({
    mutationFn: ({ id, items }: { id: number; items: AgregarItemBody[] }) =>
      barraAdminService.agregarItems(id, items),
    onSuccess: (_, { id }) => {
      invalidarActivas()
      invalidarCuenta(id)
    },
    onError: (error) => showApiError(error, 'No se pudieron agregar los productos'),
  })

  const quitarItem = useMutation({
    mutationFn: ({ itemId }: { itemId: number; cuentaId: number }) =>
      barraAdminService.quitarItem(cuentaId ?? 0, itemId),
    onSuccess: (_, { cuentaId: id }) => {
      invalidarActivas()
      invalidarCuenta(id)
    },
    onError: (error) => showApiError(error, 'No se pudo quitar el ítem'),
  })

  const cobrarCuenta = useMutation({
    mutationFn: ({ id, body }: { id: number; body: CobrarCuentaBody }) =>
      barraAdminService.cobrarCuenta(id, body),
    onSuccess: (_, { id }) => {
      invalidarActivas()
      invalidarCuenta(id)
      toast.success('Cuenta cobrada y facturada')
    },
    onError: (error) => showApiError(error, 'No se pudo cobrar la cuenta'),
  })

  const cerrarCuentaVacia = useMutation({
    mutationFn: ({ id, esAdmin }: { id: number; esAdmin: boolean }) =>
      esAdmin
        ? barraAdminService.cerrarCuentaVaciaAdmin(id)
        : barraAdminService.cerrarCuentaVacia(id),
    onSuccess: () => {
      // Cubre activas, cuenta, historial y detalle
      queryClient.invalidateQueries({ queryKey: ['barra-admin'] })
      // Las cuentas abiertas bloquean el cierre de caja
      queryClient.invalidateQueries({ queryKey: ['pre-cierre'] })
      toast.success('Cuenta cerrada')
    },
    onError: (error) => showApiError(error, 'No se pudo cerrar la cuenta'),
  })

  return {
    abrirCuenta,
    agregarItem,
    agregarItems,
    quitarItem,
    cobrarCuenta,
    cerrarCuentaVacia,
  }
}
