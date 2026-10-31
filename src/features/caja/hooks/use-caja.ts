import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import type { TurnoCaja } from '@/types/models'
import { cajaService } from '../services/caja-service'

export function useCajas() {
  return useQuery({
    queryKey: ['cajas'],
    queryFn: () => cajaService.getCajas(),
  })
}

// Compartido entre el hook y las mutaciones que necesitan resolver el turno
// de forma imperativa (queryClient.fetchQuery) sin duplicar key/staleTime
export const turnosActivosQueryOptions = {
  queryKey: ['turnos-activos'] as const,
  queryFn: () => cajaService.getTurnosActivos(),
  staleTime: 1000 * 30,
}

export function findMiTurno(turnos: TurnoCaja[], userId?: number): TurnoCaja | undefined {
  if (!userId) return undefined
  return turnos.find((t) => t.abierto_por_user_id === userId)
}

export function useTurnosActivos() {
  return useQuery(turnosActivosQueryOptions)
}

/**
 * Turno abierto del usuario autenticado. Toda operación de dinero
 * (entregar pedido, facturar, cobrar barra) debe registrarse en este turno,
 * nunca en "el primer turno activo" de la sucursal.
 */
export function useMiTurnoActivo() {
  const user = useAuthStore((s) => s.auth.user)
  const query = useTurnosActivos()
  const turnos = query.data ?? []
  return { ...query, turnos, miTurno: findMiTurno(turnos, user?.id) }
}

export function useTurnoActivo(cajaId: number) {
  return useQuery({
    queryKey: ['turno-activo', cajaId],
    queryFn: () => cajaService.getTurnoActivo(cajaId),
    enabled: cajaId > 0,
    retry: false, // No reintentar 404 (sin turno activo)
  })
}

export function useFacturasTurno(turnoId: number) {
  return useQuery({
    queryKey: ['facturas', turnoId],
    queryFn: () => cajaService.getFacturas(turnoId),
    enabled: turnoId > 0,
  })
}

export function useHistorialTurnos(cajaId: number) {
  return useQuery({
    queryKey: ['turnos', cajaId],
    queryFn: () => cajaService.getHistorialTurnos(cajaId),
    enabled: cajaId > 0,
  })
}

export function useTurno(turnoId: number) {
  return useQuery({
    queryKey: ['turno', turnoId],
    queryFn: () => cajaService.getTurno(turnoId),
    enabled: turnoId > 0,
  })
}

export function useCrearCaja() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nombre: string) => cajaService.crearCaja(nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] })
    },
  })
}

export function useRenombrarCaja() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cajaId, nombre }: { cajaId: number; nombre: string }) =>
      cajaService.renombrarCaja(cajaId, nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] })
      queryClient.invalidateQueries({ queryKey: ['turno-activo'] })
    },
  })
}

export function useEliminarCaja() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cajaId: number) => cajaService.eliminarCaja(cajaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] })
    },
  })
}

export function usePreCierre(cajaId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['pre-cierre', cajaId],
    queryFn: () => cajaService.getPreCierre(cajaId),
    enabled: enabled && cajaId > 0,
    staleTime: 0,
    retry: false,
  })
}

export function useResumenTurnoActivo(cajaId: number, enabled = true) {
  return useQuery({
    queryKey: ['turno-resumen', cajaId],
    queryFn: () => cajaService.getResumenTurnoActivo(cajaId),
    enabled: enabled && cajaId > 0,
    retry: false,
  })
}

export function useMovimientosTurno(turnoId: number) {
  return useQuery({
    queryKey: ['movimientos-caja', turnoId],
    queryFn: () => cajaService.getMovimientosTurno(turnoId),
    enabled: turnoId > 0,
  })
}

export function useCrearMovimiento(cajaId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { tipo: 'ingreso' | 'egreso'; concepto: string; monto: string }) =>
      cajaService.crearMovimiento(cajaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turno-resumen', cajaId] })
      queryClient.invalidateQueries({ queryKey: ['movimientos-caja'] })
    },
  })
}

export function useCajaMutations(cajaId: number) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['turno-activo'] })
    queryClient.invalidateQueries({ queryKey: ['turnos-activos'] })
    queryClient.invalidateQueries({ queryKey: ['cajas'] })
    queryClient.invalidateQueries({ queryKey: ['turno-resumen'] })
  }

  const abrirTurno = useMutation({
    mutationFn: (data: { monto_apertura: number }) =>
      cajaService.abrirTurno(cajaId, data),
    onSuccess: invalidate,
  })

  const cerrarTurno = useMutation({
    mutationFn: (data: { monto_cierre: number; observaciones?: string }) =>
      cajaService.cerrarTurno(cajaId, data),
    onSuccess: () => {
      // Eliminar de caché inmediatamente para que turnoActivo quede undefined
      // y la pantalla se limpie sin esperar el refetch
      queryClient.removeQueries({ queryKey: ['turno-activo', cajaId] })
      queryClient.removeQueries({ queryKey: ['turnos-activos'] })
      queryClient.removeQueries({ queryKey: ['facturas'] })
      queryClient.removeQueries({ queryKey: ['turno-resumen', cajaId] })
      queryClient.removeQueries({ queryKey: ['pre-cierre', cajaId] })
      queryClient.removeQueries({ queryKey: ['movimientos-caja'] })
      queryClient.invalidateQueries({ queryKey: ['cajas'] })
      queryClient.invalidateQueries({ queryKey: ['turnos', cajaId] })
    },
  })

  return { abrirTurno, cerrarTurno }
}
