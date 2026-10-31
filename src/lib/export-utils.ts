import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  type TurnoCaja,
  type Factura,
  type CajaMovimiento,
  type InventarioItem,
} from '@/types/models'
import { EstadoFactura, MetodoPago, OrigenTipo } from '@/types/enums'

const metodoPagoLabels: Record<MetodoPago, string> = {
  [MetodoPago.EFECTIVO]: 'Efectivo',
  [MetodoPago.TARJETA]: 'Tarjeta',
  [MetodoPago.TRANSFERENCIA]: 'Transferencia',
  [MetodoPago.MIXTO]: 'Mixto',
}

const origenLabels: Record<OrigenTipo, string> = {
  [OrigenTipo.JUEGO]: 'Mesa',
  [OrigenTipo.BARRA]: 'Barra',
  [OrigenTipo.CONSUMO_JUEGO]: 'Consumo',
  [OrigenTipo.CONSUMO_BARRA]: 'Consumo Barra',
}

function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null) return ''
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatFecha(iso: string | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildFacturasRows(facturas: Factura[]) {
  return facturas.map((f) => ({
    factura: f.numero_factura ?? `#${f.id}`,
    origen: origenLabels[f.origen_tipo] ?? f.origen_tipo,
    total: formatCurrency(f.total),
    metodo: metodoPagoLabels[f.metodo_pago] ?? f.metodo_pago,
    estado: f.status === EstadoFactura.ANULADA ? 'Anulada' : 'Pagada',
    fecha: formatFecha(f.fecha_hora),
  }))
}

function buildMovimientosRows(movimientos: CajaMovimiento[]) {
  return movimientos.map((m) => ({
    tipo: m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso',
    concepto: m.concepto,
    monto: `${m.tipo === 'ingreso' ? '+' : '-'}${formatCurrency(m.monto)}`,
    fecha: formatFecha(m.fecha_hora),
  }))
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function estadoStock(item: InventarioItem): string {
  const actual = Number(item.stock_actual)
  const minimo = Number(item.stock_minimo)
  if (actual < minimo) return 'Crítico'
  if (actual < minimo * 1.5) return 'Bajo'
  return 'OK'
}

function buildInventarioRows(items: InventarioItem[]) {
  return items.map((i) => ({
    producto: i.producto?.nombre ?? `Producto #${i.producto_id}`,
    // El stock es Numeric(10,2) en el backend: se exporta sin truncar para no
    // falsear cantidades fraccionarias en un archivo que sirve de soporte.
    stockActual: Number(i.stock_actual),
    stockMinimo: Number(i.stock_minimo),
    estado: estadoStock(i),
  }))
}

function fechaArchivo(): string {
  return new Date().toISOString().slice(0, 10)
}

export function exportInventarioCSV(items: InventarioItem[]) {
  const lines: string[] = []
  lines.push('Producto,Stock actual,Stock mínimo,Estado')

  buildInventarioRows(items).forEach((r) => {
    // El nombre del producto es texto libre y puede contener comas
    lines.push(
      `"${r.producto.replace(/"/g, '""')}",${r.stockActual},${r.stockMinimo},${r.estado}`
    )
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `inventario-${fechaArchivo()}.csv`)
}

export async function exportInventarioExcel(items: InventarioItem[]) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Inventario')
  ws.columns = [{ width: 32 }, { width: 14 }, { width: 14 }, { width: 12 }]
  ws.addRow(['Producto', 'Stock actual', 'Stock mínimo', 'Estado'])

  buildInventarioRows(items).forEach((r) => {
    ws.addRow([r.producto, r.stockActual, r.stockMinimo, r.estado])
  })

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  downloadBlob(blob, `inventario-${fechaArchivo()}.xlsx`)
}

export function exportInventarioPDF(items: InventarioItem[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new jsPDF() as any

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Inventario — Stock actual', 14, 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${formatFecha(new Date().toISOString())}`, 14, 24)

  autoTable(doc, {
    startY: 30,
    head: [['Producto', 'Stock actual', 'Stock mínimo', 'Estado']],
    body: buildInventarioRows(items).map((r) => [
      r.producto,
      String(r.stockActual),
      String(r.stockMinimo),
      r.estado,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  })

  doc.save(`inventario-${fechaArchivo()}.pdf`)
}

export function exportTurnoCSV(
  turno: TurnoCaja,
  facturas: Factura[],
  movimientos: CajaMovimiento[] = []
) {
  const lines: string[] = []

  lines.push(`Detalle Turno #${turno.id}`)
  lines.push(`Caja,${turno.caja_nombre ?? ''}`)
  lines.push(`Cajero,${turno.cajero_nombre ?? ''}`)
  lines.push(`Apertura,${formatFecha(turno.fecha_apertura)}`)
  if (turno.fecha_cierre) lines.push(`Cierre,${formatFecha(turno.fecha_cierre)}`)
  lines.push(`Monto apertura,${formatCurrency(turno.monto_apertura)}`)
  if (turno.total_acumulado !== undefined)
    lines.push(`Total ventas,${formatCurrency(turno.total_acumulado)}`)
  if (turno.resumen) {
    Object.entries(turno.resumen.por_metodo_pago ?? {}).forEach(([metodo, monto]) => {
      lines.push(`Ventas ${metodo},${formatCurrency(monto)}`)
    })
    lines.push(`Ingresos manuales,+${formatCurrency(turno.resumen.ingresos_manuales)}`)
    lines.push(`Egresos manuales,-${formatCurrency(turno.resumen.egresos_manuales)}`)
    lines.push(`Efectivo esperado (sistema),${formatCurrency(turno.resumen.efectivo_esperado)}`)
  }
  if (turno.monto_cierre !== undefined)
    lines.push(`Monto físico,${formatCurrency(turno.monto_cierre)}`)
  if (turno.diferencia !== undefined)
    lines.push(`Diferencia,${formatCurrency(turno.diferencia)}`)
  lines.push('')
  lines.push('Factura,Origen,Total,Método,Estado,Fecha')

  buildFacturasRows(facturas).forEach((r) => {
    lines.push(`${r.factura},${r.origen},${r.total},${r.metodo},${r.estado},${r.fecha}`)
  })

  if (movimientos.length > 0) {
    lines.push('')
    lines.push('Movimientos de efectivo')
    lines.push('Tipo,Concepto,Monto,Fecha')
    buildMovimientosRows(movimientos).forEach((r) => {
      // El concepto es texto libre y puede contener comas
      lines.push(`${r.tipo},"${r.concepto.replace(/"/g, '""')}",${r.monto},${r.fecha}`)
    })
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `turno-${turno.id}.csv`)
}

export async function exportTurnoExcel(
  turno: TurnoCaja,
  facturas: Factura[],
  movimientos: CajaMovimiento[] = []
) {
  const wb = new ExcelJS.Workbook()

  // Hoja de resumen
  const wsResumen = wb.addWorksheet('Resumen')
  wsResumen.columns = [{ width: 20 }, { width: 25 }]
  wsResumen.addRows([
    ['Campo', 'Valor'],
    ['Turno', `#${turno.id}`],
    ['Caja', turno.caja_nombre ?? ''],
    ['Cajero', turno.cajero_nombre ?? ''],
    ['Apertura', formatFecha(turno.fecha_apertura)],
    ['Cierre', formatFecha(turno.fecha_cierre)],
    ['Monto apertura', formatCurrency(turno.monto_apertura)],
    ['Total ventas', turno.total_acumulado !== undefined ? formatCurrency(turno.total_acumulado) : ''],
  ])
  if (turno.resumen) {
    Object.entries(turno.resumen.por_metodo_pago ?? {}).forEach(([metodo, monto]) => {
      wsResumen.addRow([`Ventas ${metodo}`, formatCurrency(monto)])
    })
    wsResumen.addRows([
      ['Ingresos manuales', `+${formatCurrency(turno.resumen.ingresos_manuales)}`],
      ['Egresos manuales', `-${formatCurrency(turno.resumen.egresos_manuales)}`],
      ['Efectivo esperado (sistema)', formatCurrency(turno.resumen.efectivo_esperado)],
    ])
  }
  wsResumen.addRows([
    ['Monto físico', turno.monto_cierre !== undefined ? formatCurrency(turno.monto_cierre) : ''],
    ['Diferencia', turno.diferencia !== undefined ? formatCurrency(turno.diferencia) : ''],
  ])

  // Hoja de facturas
  const wsFacturas = wb.addWorksheet('Facturas')
  wsFacturas.columns = [
    { width: 22 },
    { width: 12 },
    { width: 16 },
    { width: 16 },
    { width: 10 },
    { width: 18 },
  ]
  wsFacturas.addRow(['Factura', 'Origen', 'Total', 'Método de pago', 'Estado', 'Fecha'])
  buildFacturasRows(facturas).forEach((r) => {
    wsFacturas.addRow([r.factura, r.origen, r.total, r.metodo, r.estado, r.fecha])
  })

  // Hoja de movimientos de efectivo
  if (movimientos.length > 0) {
    const wsMovimientos = wb.addWorksheet('Movimientos')
    wsMovimientos.columns = [
      { width: 12 },
      { width: 30 },
      { width: 16 },
      { width: 18 },
    ]
    wsMovimientos.addRow(['Tipo', 'Concepto', 'Monto', 'Fecha'])
    buildMovimientosRows(movimientos).forEach((r) => {
      wsMovimientos.addRow([r.tipo, r.concepto, r.monto, r.fecha])
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  downloadBlob(blob, `turno-${turno.id}.xlsx`)
}

export function exportTurnoPDF(
  turno: TurnoCaja,
  facturas: Factura[],
  movimientos: CajaMovimiento[] = []
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new jsPDF() as any

  const titulo = `Detalle Turno #${turno.id}${turno.caja_nombre ? ` — ${turno.caja_nombre}` : ''}`
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(titulo, 14, 18)

  // Tabla de resumen
  const resumenRows: [string, string][] = [
    ['Cajero', turno.cajero_nombre ?? '—'],
    ['Apertura', formatFecha(turno.fecha_apertura)],
  ]
  if (turno.fecha_cierre) resumenRows.push(['Cierre', formatFecha(turno.fecha_cierre)])
  resumenRows.push(['Monto apertura', formatCurrency(turno.monto_apertura)])
  if (turno.total_acumulado !== undefined)
    resumenRows.push(['Total ventas', formatCurrency(turno.total_acumulado)])
  if (turno.resumen) {
    Object.entries(turno.resumen.por_metodo_pago ?? {}).forEach(([metodo, monto]) => {
      resumenRows.push([`Ventas ${metodo}`, formatCurrency(monto)])
    })
    resumenRows.push(['Ingresos manuales', `+${formatCurrency(turno.resumen.ingresos_manuales)}`])
    resumenRows.push(['Egresos manuales', `-${formatCurrency(turno.resumen.egresos_manuales)}`])
    resumenRows.push(['Efectivo esperado (sistema)', formatCurrency(turno.resumen.efectivo_esperado)])
  }
  if (turno.monto_cierre !== undefined)
    resumenRows.push(['Monto físico contado', formatCurrency(turno.monto_cierre)])
  if (turno.diferencia !== undefined)
    resumenRows.push(['Diferencia', formatCurrency(turno.diferencia)])

  autoTable(doc, {
    startY: 24,
    head: [['Campo', 'Valor']],
    body: resumenRows,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    margin: { left: 14, right: 14 },
  })

  // Tabla de facturas
  const facturasY = (doc.lastAutoTable?.finalY ?? 80) + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Facturas del turno', 14, facturasY)

  const facturaRows = buildFacturasRows(facturas).map((r) => [
    r.factura,
    r.origen,
    r.total,
    r.metodo,
    r.estado,
    r.fecha,
  ])

  autoTable(doc, {
    startY: facturasY + 4,
    head: [['Factura', 'Origen', 'Total', 'Método', 'Estado', 'Fecha']],
    body: facturaRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  })

  // Tabla de movimientos de efectivo
  if (movimientos.length > 0) {
    let movimientosY = (doc.lastAutoTable?.finalY ?? 80) + 10
    if (movimientosY > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage()
      movimientosY = 18
    }
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Movimientos de efectivo', 14, movimientosY)

    const movimientoRows = buildMovimientosRows(movimientos).map((r) => [
      r.tipo,
      r.concepto,
      r.monto,
      r.fecha,
    ])

    autoTable(doc, {
      startY: movimientosY + 4,
      head: [['Tipo', 'Concepto', 'Monto', 'Fecha']],
      body: movimientoRows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
  }

  doc.save(`turno-${turno.id}.pdf`)
}
