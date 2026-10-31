import api from '@/lib/axios'
import type {
  CuentaBarraAdmin,
  AbrirCuentaBody,
  AgregarItemBody,
  CobrarCuentaBody,
  ItemBarraAdmin,
  HistorialBarraParams,
  HistorialBarraResult,
  CuentaBarraDetalle,
  BarraItemDetalle,
} from '../types'

// El interceptor de axios en lib/axios.ts ya desenvuelve { success, data } → r.data es el payload directo.

export const barraAdminService = {
  getCuentasActivas: () =>
    api
      .get<CuentaBarraAdmin[]>('/api/v1/consumos/barra/admin/activas')
      .then((r) => r.data),

  getCuenta: (cuentaId: number) =>
    api
      .get<CuentaBarraAdmin>(`/api/v1/consumos/barra/admin/${cuentaId}`)
      .then((r) => r.data),

  abrirCuenta: (body: AbrirCuentaBody) =>
    api
      .post<CuentaBarraAdmin>('/api/v1/consumos/barra/admin', body)
      .then((r) => r.data),

  agregarItem: (cuentaId: number, body: AgregarItemBody) =>
    api
      .post<ItemBarraAdmin>(`/api/v1/consumos/barra/admin/${cuentaId}/items`, body)
      .then((r) => r.data),

  agregarItems: (cuentaId: number, items: AgregarItemBody[]) =>
    Promise.all(items.map((body) => barraAdminService.agregarItem(cuentaId, body))),

  quitarItem: (cuentaId: number, itemId: number) =>
    api
      .delete(`/api/v1/consumos/barra/admin/${cuentaId}/items/${itemId}`)
      .then((r) => r.data),

  cobrarCuenta: (cuentaId: number, body: CobrarCuentaBody) =>
    api
      .post(`/api/v1/consumos/barra/admin/${cuentaId}/cobrar`, body)
      .then((r) => r.data),

  // Cierra una cuenta admin abierta sin ítems activos.
  // 422: CUENTA_CON_ITEMS, CUENTA_NO_ABIERTA, CUENTA_NO_ADMIN
  cerrarCuentaVaciaAdmin: (cuentaId: number) =>
    api.delete(`/api/v1/consumos/barra/admin/${cuentaId}`).then((r) => r.data),

  // Variante genérica: cubre también cuentas de meseras vacías.
  // 422: CUENTA_CON_ITEMS, CUENTA_NO_ABIERTA
  cerrarCuentaVacia: (cuentaId: number) =>
    api.delete(`/api/v1/consumos/barra/${cuentaId}`).then((r) => r.data),

  getHistorial: async (params: HistorialBarraParams): Promise<HistorialBarraResult> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await api.get<any>('/api/v1/consumos/barra', {
      params: {
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
        ...(params.fecha_desde ? { fecha_desde: params.fecha_desde } : {}),
        ...(params.fecha_hasta ? { fecha_hasta: params.fecha_hasta } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    })
    const parseN = (v: unknown): number =>
      v === null || v === undefined ? 0 : typeof v === 'string' ? parseFloat(v) : (v as number)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (r.data?.items ?? []).map((c: any) => ({
      id: c.id,
      billar_id: c.billar_id,
      mesera_id: c.mesera_id ?? null,
      admin_id: c.admin_id ?? null,
      mesera_nombre: c.mesera_nombre ?? null,
      admin_nombre: c.admin_nombre ?? null,
      descripcion: c.descripcion ?? null,
      fecha_hora: c.fecha_hora,
      status: c.status,
      total: parseN(c.total),
    }))
    return { items, total: r.data?.total ?? items.length }
  },

  getCuentaDetalle: async (cuentaId: number): Promise<CuentaBarraDetalle> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await api.get<any>(`/api/v1/consumos/barra/${cuentaId}`)
    const raw = r.data
    const parseN = (v: unknown): number =>
      v === null || v === undefined ? 0 : typeof v === 'string' ? parseFloat(v) : (v as number)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: BarraItemDetalle[] = (raw.items ?? []).map((item: any) => ({
      id: item.id,
      personal_id: item.personal_id,
      mesera_nombre: item.mesera_nombre ?? null,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: parseN(item.precio_unitario),
      precio_venta_snapshot: parseN(item.precio_venta_snapshot),
      precio_barra_snapshot: parseN(item.precio_barra_snapshot),
      costo_snapshot: item.costo_snapshot != null ? parseN(item.costo_snapshot) : null,
      producto_nombre_snapshot: item.producto_nombre_snapshot ?? '',
      notas: item.notas ?? null,
      status: item.status,
      fecha_hora: item.fecha_hora,
      updated_at: item.updated_at,
    }))
    return {
      id: raw.id,
      billar_id: raw.billar_id,
      mesera_id: raw.mesera_id ?? null,
      admin_id: raw.admin_id ?? null,
      mesera_nombre: raw.mesera_nombre ?? null,
      admin_nombre: raw.admin_nombre ?? null,
      turno_caja_id: raw.turno_caja_id ?? null,
      descripcion: raw.descripcion ?? null,
      fecha_hora: raw.fecha_hora,
      status: raw.status,
      total: parseN(raw.total),
      items,
    }
  },
}
