import api from '@/lib/axios'
import type { EstadoFactura } from '@/types/enums'
import type {
  TurnoCaja,
  Factura,
  Caja,
  CajaMovimiento,
  PreCierre,
  ResumenTurnoActivo,
} from '@/types/models'

// Helper para mapear respuesta del API a TurnoCaja
function mapTurnoCaja(turno: any): TurnoCaja {
  return {
    ...turno,
    apertura: turno.fecha_apertura || turno.apertura,
    cierre: turno.fecha_cierre || turno.cierre,
    cajero_nombre: turno.cajero_nombre || turno.user_caja?.nombre || turno.user_admin?.nombre,
    abierto_por_user_id:
      turno.abierto_por_user_id ??
      turno.user_caja_id ??
      turno.user_caja?.id ??
      turno.user_admin_id ??
      turno.user_admin?.id,
    monto_apertura: typeof turno.monto_apertura === 'string' ? parseFloat(turno.monto_apertura) : turno.monto_apertura,
    monto_cierre: turno.monto_cierre ? (typeof turno.monto_cierre === 'string' ? parseFloat(turno.monto_cierre) : turno.monto_cierre) : undefined,
    monto_sistema: turno.monto_sistema ? (typeof turno.monto_sistema === 'string' ? parseFloat(turno.monto_sistema) : turno.monto_sistema) : undefined,
    diferencia: turno.diferencia ? (typeof turno.diferencia === 'string' ? parseFloat(turno.diferencia) : turno.diferencia) : undefined,
    total_acumulado: turno.total_acumulado ?? (turno.resumen?.total_ingresos ? parseFloat(turno.resumen.total_ingresos) : undefined),
  }
}

export const cajaService = {
  crearCaja: (nombre: string) =>
    api
      .post<any>('/api/v1/caja', { nombre })
      .then((r) => r.data.data ?? r.data),
  getCajas: () =>
    // billar_id se resuelve del token internamente
    api
      .get<any>('/api/v1/caja')
      .then((r) => {
        const data = r.data.data ?? r.data
        return Array.isArray(data) ? data : [data]
      }),
  renombrarCaja: (cajaId: number, nombre: string) =>
    api
      .patch<Caja>(`/api/v1/caja/${cajaId}`, { nombre })
      .then((r) => r.data),
  eliminarCaja: (cajaId: number) =>
    api.delete(`/api/v1/caja/${cajaId}`).then((r) => r.data),
  getPreCierre: (cajaId: number) =>
    api
      .get<PreCierre>(`/api/v1/caja/${cajaId}/turno/pre-cierre`)
      .then((r) => r.data),
  getResumenTurnoActivo: (cajaId: number) =>
    api
      .get<ResumenTurnoActivo>(`/api/v1/caja/${cajaId}/turno/activo/resumen`)
      .then((r) => r.data),
  crearMovimiento: (
    cajaId: number,
    data: { tipo: 'ingreso' | 'egreso'; concepto: string; monto: string }
  ) =>
    api
      .post<CajaMovimiento>(`/api/v1/caja/${cajaId}/movimientos`, data)
      .then((r) => r.data),
  getMovimientosTurno: (turnoId: number) =>
    api
      .get<CajaMovimiento[]>(`/api/v1/caja/turnos/${turnoId}/movimientos`)
      .then((r) => (Array.isArray(r.data) ? r.data : [])),
  // No existe un endpoint global de turnos activos: se consultan las cajas
  // y luego el turno activo de cada una en paralelo (404 = caja sin turno).
  getTurnosActivos: async (): Promise<TurnoCaja[]> => {
    const cajas: Caja[] = await cajaService.getCajas()
    const results = await Promise.allSettled(
      cajas.map(
        (caja): Promise<TurnoCaja> =>
          cajaService.getTurnoActivo(caja.id).then((turno) => ({
            ...turno,
            caja_nombre: turno.caja_nombre ?? caja.nombre,
          }))
      )
    )
    return results
      .filter((r): r is PromiseFulfilledResult<TurnoCaja> => r.status === 'fulfilled')
      .map((r) => r.value)
  },
  getTurnoActivo: (cajaId: number) =>
    api
      .get<any>(`/api/v1/caja/${cajaId}/turno/activo`)
      .then((r) => {
        const turno = r.data.data ?? r.data
        return mapTurnoCaja(turno)
      }),
  abrirTurno: (
    cajaId: number,
    data: { monto_apertura: number }
  ) =>
    api
      .post<any>(`/api/v1/caja/${cajaId}/turno/abrir`, data)
      .then((r) => {
        const turno = r.data.data ?? r.data
        return mapTurnoCaja(turno)
      }),
  cerrarTurno: (
    cajaId: number,
    data: { monto_cierre: number; observaciones?: string }
  ) =>
    api
      .post<any>(`/api/v1/caja/${cajaId}/turno/cerrar`, data)
      .then((r) => {
        const turno = r.data.data ?? r.data
        return mapTurnoCaja(turno)
      }),
  getHistorialTurnos: (cajaId: number) =>
    api
      .get<any>(`/api/v1/caja/${cajaId}/turnos`)
      .then((r) => {
        const data = r.data?.data ?? r.data
        const turnos: any[] = Array.isArray(data) ? data : (data?.items ?? [])
        return turnos.map(mapTurnoCaja)
      }),
  getFacturas: async (turnoId: number) => {
    const baseParams = {
      turno_caja_id: turnoId,
    }

    const mapFactura = (f: any): Factura => ({
      ...f,
      subtotal_consumo: parseFloat(f.subtotal_consumo ?? '0'),
      descuento: parseFloat(f.descuento ?? '0'),
      total: parseFloat(f.total ?? '0'),
      status: (f.status ?? '').toLowerCase() as EstadoFactura,
    })

    // Primera página para conocer el total real
    const first = await api.get<any>('/api/v1/facturas', {
      params: { ...baseParams, page: 1, page_size: 100 },
    })

    const firstItems: any[] = first.data?.items ?? (Array.isArray(first.data) ? first.data : [])
    const total: number = first.data?.total ?? firstItems.length

    if (total <= firstItems.length) {
      return firstItems.map(mapFactura)
    }

    // Hay más páginas — cargarlas en paralelo
    const remaining = Math.ceil((total - firstItems.length) / 100)
    const pages = await Promise.all(
      Array.from({ length: remaining }, (_, i) =>
        api.get<any>('/api/v1/facturas', {
          params: { ...baseParams, page: i + 2, page_size: 100 },
        })
      )
    )

    const allItems = [
      ...firstItems,
      ...pages.flatMap((r) => r.data?.items ?? (Array.isArray(r.data) ? r.data : [])),
    ]

    return allItems.map(mapFactura)
  },
  getTurno: (turnoId: number) =>
    api
      .get<any>(`/api/v1/caja/turnos/${turnoId}`)
      .then((r) => {
        const turno = r.data.data ?? r.data
        return mapTurnoCaja(turno)
      }),
  anularFactura: (facturaId: number, motivo: string) =>
    api
      .patch(`/api/v1/facturas/${facturaId}/anular`, { motivo })
      .then((r) => r.data),
}
