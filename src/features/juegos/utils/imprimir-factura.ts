import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { type JuegoResumen } from '@/types/models'
import { agruparConsumos } from './agrupar-consumos'

function fmt(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
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

// ─── PDF A4 ────────────────────────────────────────────────────────────────────

export function imprimirFacturaPDF(
  resumen: JuegoResumen,
  mesaNumero?: number | null,
  negocioNombre = 'BILLAR ADMIN'
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const factura = resumen.factura_tiempo
  const pageW = doc.internal.pageSize.getWidth()
  let y = 18

  // ── Encabezado ──
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(negocioNombre, pageW / 2, y, { align: 'center' })
  y += 7

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text('Sistema de Gestión de Billares', pageW / 2, y, { align: 'center' })
  doc.setTextColor(0)
  y += 10

  doc.setLineWidth(0.5)
  doc.line(14, y, pageW - 14, y)
  y += 7

  // ── Título ──
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(factura ? 'FACTURA DE VENTA' : 'CUENTA DE JUEGO', pageW / 2, y, {
    align: 'center',
  })
  y += 9

  // ── Datos de la factura ──
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  if (factura) {
    doc.setFont('helvetica', 'bold')
    doc.text(`N° ${factura.numero_factura}`, 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(fmtFecha(factura.fecha_hora), pageW - 14, y, { align: 'right' })
    y += 6
  }

  doc.text(`Juego: #${resumen.juego_id}`, 14, y)
  if (mesaNumero) {
    doc.text(`Mesa: ${mesaNumero}`, pageW / 2, y, { align: 'center' })
  }
  y += 5

  doc.setTextColor(80)
  doc.text(`Inicio: ${fmtFecha(resumen.hora_inicio)}`, 14, y)
  if (resumen.hora_fin) {
    doc.text(`Fin: ${fmtFecha(resumen.hora_fin)}`, pageW - 14, y, {
      align: 'right',
    })
  }
  y += 5

  if (resumen.tiempo_minutos !== null) {
    doc.text(`Duración: ${fmtDuracion(resumen.tiempo_minutos)}`, 14, y)
  }
  doc.setTextColor(0)
  y += 8

  doc.setLineWidth(0.3)
  doc.line(14, y, pageW - 14, y)
  y += 7

  // ── Consumos ──
  const consumosAgrupados = agruparConsumos(resumen.consumos)
  if (consumosAgrupados.length > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('DETALLE DE CONSUMOS', 14, y)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [['Producto', 'Cant.', 'P. Unitario', 'Subtotal']],
      body: consumosAgrupados.map((c) => [
        c.jugadores.length > 0
          ? `${c.producto_nombre}\n(${c.jugadores.join(', ')})`
          : c.producto_nombre,
        String(c.cantidad),
        fmt(c.precio_unitario),
        fmt(c.subtotal),
      ]),
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 16 },
        2: { halign: 'right', cellWidth: 38 },
        3: { halign: 'right', cellWidth: 38 },
      },
      margin: { left: 14, right: 14 },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8
  }

  // ── Totales ──
  const labelX = 120
  const valueX = pageW - 14

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80)
  doc.text('Tiempo de juego:', labelX, y)
  doc.text(fmt(resumen.costo_tiempo), valueX, y, { align: 'right' })
  y += 5

  doc.text('Total consumos:', labelX, y)
  doc.text(fmt(resumen.total_consumos), valueX, y, { align: 'right' })
  y += 4

  doc.setTextColor(0)
  doc.setLineWidth(0.4)
  doc.line(labelX, y, valueX, y)
  y += 5

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', labelX, y)
  doc.text(fmt(resumen.total_juego), valueX, y, { align: 'right' })
  y += 6

  if (factura) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80)
    doc.text(`Método de pago: ${capitalize(factura.metodo_pago)}`, labelX, y)
    doc.setTextColor(0)
    y += 10
  }

  // ── Pie ──
  y += 4
  doc.setLineWidth(0.5)
  doc.line(14, y, pageW - 14, y)
  y += 6

  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(120)
  doc.text('¡Gracias por su visita!', pageW / 2, y, { align: 'center' })

  const filename = factura
    ? `factura-${factura.numero_factura}.pdf`
    : `cuenta-juego-${resumen.juego_id}.pdf`

  doc.save(filename)
}
