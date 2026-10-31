import { type ConsumoResumen } from '@/types/models'

export interface ConsumoAgrupado {
  producto_nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  jugadores: string[]
}

/**
 * Agrupa los consumos por producto sumando cantidades y subtotales.
 * Recopila los alias de jugadores únicos por producto.
 */
export function agruparConsumos(consumos: ConsumoResumen[]): ConsumoAgrupado[] {
  const map = new Map<string, ConsumoAgrupado>()

  for (const c of consumos.filter((c) => c.status !== 'rechazado' && c.status !== 'cancelado')) {
    const key = c.producto_nombre
    const existing = map.get(key)

    if (existing) {
      existing.cantidad += c.cantidad
      existing.subtotal += c.subtotal
      if (c.jugador_alias && !existing.jugadores.includes(c.jugador_alias)) {
        existing.jugadores.push(c.jugador_alias)
      }
    } else {
      map.set(key, {
        producto_nombre: c.producto_nombre,
        cantidad: c.cantidad,
        precio_unitario: c.precio_unitario,
        subtotal: c.subtotal,
        jugadores: c.jugador_alias ? [c.jugador_alias] : [],
      })
    }
  }

  return Array.from(map.values())
}
