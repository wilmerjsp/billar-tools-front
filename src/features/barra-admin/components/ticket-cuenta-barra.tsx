import { type Ref } from 'react'
import { receiptStyles } from '@/components/shared/ticket-styles'

export interface TicketCuentaBarraItem {
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface TicketCuentaBarraProps {
  cuentaId: number
  atendidoPor?: string | null
  descripcion?: string | null
  fechaHora: string
  facturada: boolean
  items: TicketCuentaBarraItem[]
  total: number
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

function fmtFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function TicketCuentaBarra({
  cuentaId,
  atendidoPor,
  descripcion,
  fechaHora,
  facturada,
  items,
  total,
  negocioNombre = 'BILLAR ADMIN',
  ref,
}: TicketCuentaBarraProps) {
  return (
    <div ref={ref}>
      <style>{receiptStyles}</style>
      <div className='receipt'>
        <div className='receipt-header'>
          <h2>{negocioNombre}</h2>
          <div>Cuenta de barra</div>
        </div>

        <div className='receipt-details'>
          <div>
            <strong>Cuenta N° {cuentaId}</strong>
            {!facturada && ' — PRECUENTA'}
          </div>
          {descripcion && <div>Descripción: {descripcion}</div>}
          {atendidoPor && <div>Atendido por: {atendidoPor}</div>}
          <div>Apertura: {fmtFecha(fechaHora)}</div>
          <div>Impresión: {fmtFecha(new Date().toISOString())}</div>
        </div>

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
            {items.map((item) => (
              <tr key={item.nombre}>
                <td>{item.nombre}</td>
                <td>{item.cantidad}</td>
                <td>{fmt(item.precio_unitario)}</td>
                <td>{fmt(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='receipt-totals'>
          <div className='total-line'>
            <span>TOTAL:</span>
            <span>{fmt(total)}</span>
          </div>
        </div>

        {!facturada && (
          <div className='receipt-payment'>
            <div>
              <span>Estado:</span>
              <span>Pendiente de cobro</span>
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
