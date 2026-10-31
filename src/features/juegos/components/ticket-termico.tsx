import { type Ref } from 'react'
import { type JuegoResumen } from '@/types/models'
import { receiptStyles } from '@/components/shared/ticket-styles'
import { agruparConsumos } from '../utils/agrupar-consumos'

interface TicketTermicoProps {
  resumen: JuegoResumen
  mesaNumero?: number | null
  negocioNombre?: string
  ref?: Ref<HTMLDivElement>
}

function fmt(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function fmtDuracion(minutos: number | null): string {
  if (minutos === null) return '—'
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function TicketTermico({
  resumen,
  mesaNumero,
  negocioNombre = 'BILLAR ADMIN',
  ref,
}: TicketTermicoProps) {
  const factura = resumen.factura_tiempo
  const consumos = agruparConsumos(resumen.consumos)

  return (
    <div ref={ref}>
      <style>{receiptStyles}</style>
      <div className='receipt'>
        <div className='receipt-header'>
          <h2>{negocioNombre}</h2>
          <div>Sistema de Gestión de Billares</div>
        </div>

        <div className='receipt-details'>
          {factura && (
            <div>
              <strong>Factura N° {factura.numero_factura}</strong>
            </div>
          )}
          <div>Fecha: {fmtFecha(factura?.fecha_hora ?? new Date().toISOString())}</div>
          <div>Juego: #{resumen.juego_id}</div>
          {mesaNumero != null && <div>Mesa: {mesaNumero}</div>}
          <div>Inicio: {fmtFecha(resumen.hora_inicio)}</div>
          {resumen.hora_fin && <div>Fin: {fmtFecha(resumen.hora_fin)}</div>}
          {resumen.tiempo_minutos !== null && (
            <div>Duración: {fmtDuracion(resumen.tiempo_minutos)}</div>
          )}
        </div>

        {consumos.length > 0 && (
          <table className='receipt-items'>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cant</th>
                <th>V. Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {consumos.map((c) => (
                <tr key={c.producto_nombre}>
                  <td>
                    {c.producto_nombre}
                    {c.jugadores.length > 0 && (
                      <div className='jugadores'>({c.jugadores.join(', ')})</div>
                    )}
                  </td>
                  <td>{c.cantidad}</td>
                  <td>{fmt(c.precio_unitario)}</td>
                  <td>{fmt(c.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className='receipt-totals'>
          <div>
            <span>Tiempo de juego:</span>
            <span>{fmt(resumen.costo_tiempo)}</span>
          </div>
          <div>
            <span>Total consumos:</span>
            <span>{fmt(resumen.total_consumos)}</span>
          </div>
          <div className='total-line'>
            <span>TOTAL:</span>
            <span>{fmt(resumen.total_juego)}</span>
          </div>
        </div>

        {factura && (
          <div className='receipt-payment'>
            <div>
              <span>Método de pago:</span>
              <span>{capitalize(factura.metodo_pago)}</span>
            </div>
          </div>
        )}

        <div className='receipt-footer'>
          <div>¡Gracias por su visita!</div>
          <div>Vuelva pronto</div>
        </div>
      </div>
    </div>
  )
}
