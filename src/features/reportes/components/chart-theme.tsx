import type { CSSProperties } from 'react'

// Colores de serie: tokens del tema con valores propios para light y dark.
// Los tokens están en oklch, por lo que se usan con var() directo (nunca hsl(var())).
export const SERIE_1 = 'var(--chart-1)'
export const SERIE_2 = 'var(--chart-2)'

export const gridStroke = 'var(--border)'

export const axisTick = {
  fontSize: 12,
  fill: 'var(--muted-foreground)',
}

export const axisLine = { stroke: 'var(--border)' }

// Tooltip legible en ambos modos (el default de Recharts es fondo blanco fijo)
export const tooltipContentStyle: CSSProperties = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: 'var(--popover-foreground)',
}

export const tooltipLabelStyle: CSSProperties = {
  color: 'var(--popover-foreground)',
}

// Resaltado de la barra bajo el cursor, sutil en ambos modos
export const tooltipCursor = { fill: 'var(--muted)', opacity: 0.4 }

// La leyenda de Recharts pinta el texto del color de la serie;
// el texto debe usar tokens de texto para mantener contraste en ambos modos.
export function legendText(value: string) {
  return <span style={{ color: 'var(--foreground)' }}>{value}</span>
}

export const formatCOP = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
