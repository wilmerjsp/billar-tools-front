import api from '@/lib/axios'
import { type EstadoJuego, type MetodoPago } from '@/types/enums'
import { type JuegoActivo, type JuegoResumen, type JuegoHistorialItem, type Factura, type ConsumoResumen, type FacturaTiempoResumen } from '@/types/models'

export interface HistorialJuegosParams {
  fecha_desde?: string
  fecha_hasta?: string
  status?: EstadoJuego
  mesa_id?: number
  page?: number
  page_size?: number
}

export interface HistorialJuegosResult {
  items: JuegoHistorialItem[]
  total: number
}

// Normaliza la respuesta cruda del API al modelo JuegoActivo
// - GET /juegos/activos devuelve el juego plano (JuegoResponse, sin jugadores ni consumos)
// - GET /juegos/{id} devuelve { juego, jugadores, partidas, cuentas, movimientos }
//   donde los jugadores usan `alias` y el saldo viene en cuentas[].total
const parseNum = (v: unknown): number =>
  typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : 0

function normalizarJuego(raw: Record<string, unknown>): JuegoActivo {
  const base = (raw.juego ?? raw) as Record<string, unknown>
  const estadoRaw = (base.estado ?? base.status ?? '') as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cuentas = (raw.cuentas ?? []) as any[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jugadores: JuegoActivo['jugadores'] = ((raw.jugadores ?? []) as any[]).map((j) => {
    const cuenta = cuentas.find((c) => c.jugador_alias === j.alias)
    return {
      ...j,
      nombre: j.nombre ?? j.alias ?? '',
      saldo: parseNum(j.saldo ?? cuenta?.total),
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const consumos: JuegoActivo['consumos'] = ((raw.consumos ?? []) as any[]).map((c) => ({
    ...c,
    precio_unitario: parseNum(c.precio_unitario),
  }))

  return {
    ...(base as unknown as JuegoActivo),
    estado: estadoRaw.toLowerCase() as EstadoJuego,
    inicio: (base.inicio ?? base.hora_inicio ?? '') as string,
    mesa_numero: (base.mesa_numero ?? base.mesa_id ?? 0) as number,
    jugadores,
    consumos,
    costo_tiempo:
      base.costo_tiempo !== undefined && base.costo_tiempo !== null
        ? parseFloat(base.costo_tiempo as string)
        : undefined,
    tarifa_snapshot:
      base.tarifa_snapshot !== undefined && base.tarifa_snapshot !== null
        ? parseFloat(base.tarifa_snapshot as string)
        : undefined,
  }
}

export interface CrearConsumoInput {
  juego_id: number
  producto_id: number
  cantidad: number
  jugador_alias?: string
  notas?: string
}

export interface FacturarJuegoInput {
  turno_caja_id: number
  metodo_pago: MetodoPago
  descuento?: number
}

export const juegosService = {
  getActivos: (billarId: number) =>
    api
      .get<Record<string, unknown>[]>('/api/v1/juegos/activos', {
        params: { billar_id: billarId },
      })
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : []
        return raw.map(normalizarJuego)
      }),

  getById: (id: number) =>
    api
      .get<Record<string, unknown>>(`/api/v1/juegos/${id}`)
      .then((r) => normalizarJuego(r.data)),

  getResumen: (id: number) =>
    api
      .get<Record<string, unknown>>(`/api/v1/juegos/${id}/resumen`)
      .then((r) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any = r.data.data ?? r.data
        const parseF = (v: unknown): number =>
          typeof v === 'string' ? parseFloat(v) : ((v as number) ?? 0)

        const consumos: ConsumoResumen[] = ((raw.consumos as unknown[]) ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => ({
            consumo_id: c.consumo_id,
            producto_nombre: c.producto_nombre,
            cantidad: c.cantidad,
            precio_unitario: parseF(c.precio_unitario),
            subtotal: parseF(c.subtotal),
            jugador_alias: c.jugador_alias ?? null,
            status: (c.status ?? '').toLowerCase(),
            factura_id: c.factura_id ?? null,
            factura_numero: c.factura_numero ?? null,
          })
        )

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ft: any = raw.factura_tiempo
        const factura_tiempo: FacturaTiempoResumen | null = ft
          ? {
              id: ft.id,
              numero_factura: ft.numero_factura,
              total: parseF(ft.total),
              metodo_pago: ft.metodo_pago,
              fecha_hora: ft.fecha_hora,
            }
          : null

        return {
          juego_id: raw.juego_id,
          mesa_id: raw.mesa_id,
          status: (raw.status as string) ?? '',
          hora_inicio: raw.hora_inicio as string,
          hora_fin: (raw.hora_fin as string | null) ?? null,
          tiempo_minutos: (raw.tiempo_minutos as number | null) ?? null,
          costo_tiempo: parseF(raw.costo_tiempo),
          consumos,
          total_consumos: parseF(raw.total_consumos),
          total_tiempo: parseF(raw.total_tiempo),
          total_juego: parseF(raw.total_juego),
          factura_tiempo,
        } satisfies JuegoResumen
      }),

  facturar: (id: number, data: FacturarJuegoInput) =>
    api.post<Factura>(`/api/v1/juegos/${id}/facturar`, data).then((r) => r.data),

  crearConsumo: (data: CrearConsumoInput) =>
    api.post('/api/v1/consumos/juego', data).then((r) => r.data),

  getHistorial: async (params: HistorialJuegosParams): Promise<HistorialJuegosResult> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await api.get<any>('/api/v1/juegos', {
      params: {
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
        ...(params.fecha_desde ? { fecha_desde: params.fecha_desde } : {}),
        ...(params.fecha_hasta ? { fecha_hasta: params.fecha_hasta } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.mesa_id ? { mesa_id: params.mesa_id } : {}),
      },
    })
    const parseN = (v: unknown): number | null =>
      v === null || v === undefined
        ? null
        : typeof v === 'string'
          ? parseFloat(v)
          : (v as number)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: JuegoHistorialItem[] = (r.data?.items ?? []).map((j: any) => ({
      id: j.id,
      mesa_id: j.mesa_id,
      mesa_numero: j.mesa_numero,
      status: (j.status ?? '').toLowerCase() as EstadoJuego,
      hora_inicio: j.hora_inicio,
      hora_fin: j.hora_fin ?? null,
      tiempo_minutos: j.tiempo_minutos ?? null,
      costo_tiempo: parseN(j.costo_tiempo),
      total_consumos: parseN(j.total_consumos),
      total_juego: parseN(j.total_juego),
      factura_id: j.factura_id ?? null,
      numero_factura: j.numero_factura ?? null,
    }))
    const total: number = r.data?.total ?? items.length
    return { items, total }
  },
}
