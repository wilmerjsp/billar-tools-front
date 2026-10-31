import { Ban, Check, Loader2, PackageCheck, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PedidoStatus } from '@/types/enums'
import { type Pedido } from '@/types/models'

interface PedidoCardProps {
  pedidos: Pedido[]
  onAceptar?: () => void
  onRechazar?: () => void
  onMarcarEntregado?: () => void
  onCancelar?: () => void
  isLoading?: boolean
}

const statusConfig: Record<
  PedidoStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  [PedidoStatus.PENDIENTE]: { label: 'Pendiente', variant: 'secondary' },
  [PedidoStatus.ACEPTADO]: { label: 'Aceptado', variant: 'default' },
  [PedidoStatus.RECHAZADO]: { label: 'Rechazado', variant: 'destructive' },
  [PedidoStatus.ENTREGADO]: { label: 'Entregado', variant: 'outline' },
  [PedidoStatus.CANCELADO]: { label: 'Cancelado', variant: 'outline' },
}

interface ProductoAgrupado {
  producto_id: number
  producto_nombre?: string
  cantidad: number
  precioLinea: number
  precioBarraLinea: number | null
  tieneComision: boolean
  notas: string[]
}

function precioEfectivo(p: Pedido): number {
  return p.precio_barra_snapshot != null ? p.precio_barra_snapshot : p.precio_unitario
}

function agruparProductos(pedidos: Pedido[]): ProductoAgrupado[] {
  const map = new Map<number, ProductoAgrupado>()
  for (const p of pedidos) {
    const existing = map.get(p.producto_id)
    const tieneComision = p.precio_barra_snapshot != null
    if (existing) {
      existing.cantidad += p.cantidad
      existing.precioLinea += p.precio_unitario * p.cantidad
      existing.precioBarraLinea =
        tieneComision && existing.precioBarraLinea != null
          ? existing.precioBarraLinea + p.precio_barra_snapshot! * p.cantidad
          : null
      if (p.notas) existing.notas.push(p.notas)
    } else {
      map.set(p.producto_id, {
        producto_id: p.producto_id,
        producto_nombre: p.producto_nombre,
        cantidad: p.cantidad,
        precioLinea: p.precio_unitario * p.cantidad,
        precioBarraLinea: tieneComision ? p.precio_barra_snapshot! * p.cantidad : null,
        tieneComision,
        notas: p.notas ? [p.notas] : [],
      })
    }
  }
  return [...map.values()]
}

function formatHora(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrecio(valor: number): string {
  return valor.toLocaleString('es-CO')
}

export function PedidoCard({
  pedidos,
  onAceptar,
  onRechazar,
  onMarcarEntregado,
  onCancelar,
  isLoading = false,
}: PedidoCardProps) {
  const first = pedidos[0]
  const config = statusConfig[first.status]
  const titulo =
    first.origen === 'barra'
      ? 'Barra'
      : first.mesa_numero
        ? `Mesa ${first.mesa_numero}`
        : 'Mesa —'
  const hayAcciones = onAceptar || onRechazar || onMarcarEntregado || onCancelar

  const total = pedidos.reduce((sum, p) => sum + precioEfectivo(p) * p.cantidad, 0)
  const productosAgrupados = agruparProductos(pedidos)

  return (
    <Card className='w-full'>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-2'>
          <div className='space-y-0.5'>
            <CardTitle className='text-sm font-semibold'>{titulo}</CardTitle>
            {first.mesera_nombre ? (
              <p className='text-xs text-muted-foreground'>
                Mesera: {first.mesera_nombre}
              </p>
            ) : (
              <p className='text-xs text-muted-foreground italic'>
                Mesera no disponible
              </p>
            )}
          </div>
          <div className='flex shrink-0 flex-col items-end gap-1'>
            <Badge variant={config.variant}>{config.label}</Badge>
            <span className='text-xs text-muted-foreground'>
              {formatHora(first.fecha_hora)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-1.5'>
        {productosAgrupados.map((pg) => {
          const lineaTotal = pg.precioBarraLinea ?? pg.precioLinea
          return (
            <div key={pg.producto_id} className='flex items-center justify-between gap-2'>
              <span className='text-sm'>
                <span className='font-medium'>{pg.cantidad}×</span>{' '}
                {pg.producto_nombre ?? `Producto #${pg.producto_id}`}
              </span>
              <span className='shrink-0 text-xs text-muted-foreground'>
                ${formatPrecio(lineaTotal)}
              </span>
            </div>
          )
        })}

        {productosAgrupados.length > 1 && (
          <div className='flex items-center justify-between border-t pt-1.5'>
            <span className='text-xs font-medium text-muted-foreground'>Total</span>
            <span className='text-sm font-semibold'>${formatPrecio(total)}</span>
          </div>
        )}

        {productosAgrupados
          .filter((pg) => pg.notas.length > 0)
          .map((pg) => (
            <p key={pg.producto_id} className='text-xs text-muted-foreground'>
              {productosAgrupados.length > 1
                ? `${pg.producto_nombre ?? `Producto #${pg.producto_id}`}: ${pg.notas.join(', ')}`
                : `Nota: ${pg.notas.join(', ')}`}
            </p>
          ))}

        {first.motivo_rechazo && (
          <p className='mt-1 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive'>
            Motivo: {first.motivo_rechazo}
          </p>
        )}
      </CardContent>

      {hayAcciones && (
        <CardFooter className='gap-2 pt-0'>
          {onAceptar && (
            <Button
              size='sm'
              className='flex-1'
              disabled={isLoading}
              onClick={onAceptar}
            >
              {isLoading ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                <Check className='h-3 w-3' />
              )}
              Aceptar
            </Button>
          )}
          {onRechazar && (
            <Button
              size='sm'
              variant='destructive'
              className='flex-1'
              disabled={isLoading}
              onClick={onRechazar}
            >
              <X className='h-3 w-3' />
              Rechazar
            </Button>
          )}
          {onMarcarEntregado && (
            <Button
              size='sm'
              variant='outline'
              className='flex-1'
              disabled={isLoading}
              onClick={onMarcarEntregado}
            >
              {isLoading ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                <PackageCheck className='h-3 w-3' />
              )}
              Entregado
            </Button>
          )}
          {onCancelar && (
            <Button
              size='sm'
              variant='ghost'
              className='flex-1 text-destructive hover:text-destructive'
              disabled={isLoading}
              onClick={onCancelar}
            >
              {isLoading ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                <Ban className='h-3 w-3' />
              )}
              Cancelar
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
