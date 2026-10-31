import { useRef, useState } from 'react'
import { Plus, Printer, Trash2, X } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { loadBillarDisplay } from '@/lib/billar-display-storage'
import { printTicket } from '@/lib/print-ticket'
import { useCuentaBarra, useBarraAdminMutations } from '../hooks/use-barra-admin'
import type { CobrarCuentaBody, AgregarItemBody, ItemBarraAdmin } from '../types'
import { AgregarItemDialog } from './agregar-item-dialog'
import { CobrarDialog } from './cobrar-dialog'
import { TicketCuentaBarra } from './ticket-cuenta-barra'

function formatCOP(value: string | number): string {
  return `$${Number(value).toLocaleString('es-CO')}`
}

interface GrupoProducto {
  producto_id: number
  nombre: string
  precio_unitario: string
  cantidad: number
  subtotal: number
  notas: string[]
  // ID del último ítem entregado del grupo (para quitar de a uno)
  ultimoItemId: number
}

function agruparItems(items: ItemBarraAdmin[]): GrupoProducto[] {
  const mapa = new Map<number, GrupoProducto>()

  const entregados = [...items]
    .filter((i) => i.status === 'entregado')
    .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())

  for (const item of entregados) {
    const existing = mapa.get(item.producto_id)
    const notas = item.notas ? [item.notas] : []
    if (existing) {
      existing.cantidad += item.cantidad
      existing.subtotal += Number(item.subtotal)
      if (item.notas && !existing.notas.includes(item.notas)) {
        existing.notas.push(item.notas)
      }
      existing.ultimoItemId = item.id
    } else {
      mapa.set(item.producto_id, {
        producto_id: item.producto_id,
        nombre: item.producto_nombre_snapshot,
        precio_unitario: item.precio_unitario,
        cantidad: item.cantidad,
        subtotal: Number(item.subtotal),
        notas,
        ultimoItemId: item.id,
      })
    }
  }

  return [...mapa.values()]
}

interface Props {
  cuentaId: number
  onCuentaCobrada: () => void
}

export function CuentaDetalle({ cuentaId, onCuentaCobrada }: Props) {
  const { data: cuenta, isLoading, isError } = useCuentaBarra(cuentaId)
  const mutations = useBarraAdminMutations(cuentaId)
  const [agregarOpen, setAgregarOpen] = useState(false)
  const [cobrarOpen, setCobrarOpen] = useState(false)
  const [cerrarVaciaOpen, setCerrarVaciaOpen] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  function handleCerrarVacia() {
    mutations.cerrarCuentaVacia.mutate(
      { id: cuentaId, esAdmin: true },
      {
        onSuccess: () => {
          setCerrarVaciaOpen(false)
          // Deselecciona la cuenta, igual que al cobrarla
          onCuentaCobrada()
        },
        onError: () => setCerrarVaciaOpen(false),
      },
    )
  }

  function handleAgregarItems(items: AgregarItemBody[]) {
    mutations.agregarItems.mutate(
      { id: cuentaId, items },
      { onSuccess: () => setAgregarOpen(false) },
    )
  }

  function handleCobrar(body: CobrarCuentaBody) {
    mutations.cobrarCuenta.mutate(
      { id: cuentaId, body },
      {
        onSuccess: () => {
          setCobrarOpen(false)
          onCuentaCobrada()
        },
      },
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !cuenta) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No se pudo cargar la cuenta.
        </CardContent>
      </Card>
    )
  }

  const grupos = agruparItems(cuenta.items)
  const total = Number(cuenta.total)
  const estaAbierta = cuenta.status === 'abierto'

  // Último ítem entregado (para "repetir último" en el modal)
  const ultimoItemEntregado = [...cuenta.items]
    .filter((i) => i.status === 'entregado')
    .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())[0]

  const ultimoProducto = ultimoItemEntregado
    ? {
        producto_id: ultimoItemEntregado.producto_id,
        nombre: ultimoItemEntregado.producto_nombre_snapshot,
        cantidad: ultimoItemEntregado.cantidad,
      }
    : undefined

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">
              Cuenta #{cuenta.id}
              {cuenta.descripcion && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  — {cuenta.descripcion}
                </span>
              )}
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {cuenta.admin_nombre ?? 'Admin'} ·{' '}
              {new Date(cuenta.fecha_hora).toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {grupos.length > 0 && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                title="Imprimir recibo"
                onClick={() =>
                  printTicket(ticketRef.current, `Cuenta-${cuenta.id}`)
                }
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
            <Badge variant={estaAbierta ? 'default' : 'secondary'}>
              {cuenta.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {estaAbierta && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setAgregarOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar producto
            </Button>
          )}

          <div className="space-y-2">
            {grupos.length === 0 && (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Sin productos aún
              </p>
            )}

            {grupos.map((grupo) => (
              <div
                key={grupo.producto_id}
                className="flex items-center gap-3 rounded-md border px-3 py-2.5"
              >
                {/* Badge de cantidad prominente */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-lg font-bold text-primary">
                  {grupo.cantidad}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{grupo.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCOP(grupo.precio_unitario)} c/u
                    {grupo.notas.length > 0 && ` · ${grupo.notas.join(', ')}`}
                  </p>
                </div>

                <div className="ml-2 flex items-center gap-2">
                  <span className="text-sm font-bold">{formatCOP(grupo.subtotal)}</span>
                  {estaAbierta && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                      disabled={mutations.quitarItem.isPending}
                      title="Quitar una unidad"
                      onClick={() =>
                        mutations.quitarItem.mutate({
                          itemId: grupo.ultimoItemId,
                          cuentaId,
                        })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {grupos.length > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatCOP(total)}</span>
              </div>
            </>
          )}

          {estaAbierta && (
            <Button
              className="mt-2 w-full"
              disabled={grupos.length === 0 || mutations.cobrarCuenta.isPending}
              onClick={() => setCobrarOpen(true)}
            >
              Cobrar {grupos.length > 0 && `— ${formatCOP(total)}`}
            </Button>
          )}

          {estaAbierta && grupos.length === 0 && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              disabled={mutations.cerrarCuentaVacia.isPending}
              onClick={() => setCerrarVaciaOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Cerrar cuenta vacía
            </Button>
          )}

          {!estaAbierta && (
            <div className="rounded-md bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
              Esta cuenta ya fue{' '}
              {cuenta.status === 'facturado' ? 'facturada' : 'cerrada'}
            </div>
          )}
        </CardContent>
      </Card>

      <AgregarItemDialog
        open={agregarOpen}
        isPending={mutations.agregarItems.isPending}
        ultimoProducto={ultimoProducto}
        onConfirm={handleAgregarItems}
        onClose={() => setAgregarOpen(false)}
      />

      <CobrarDialog
        open={cobrarOpen}
        total={total}
        isPending={mutations.cobrarCuenta.isPending}
        onConfirm={handleCobrar}
        onClose={() => setCobrarOpen(false)}
      />

      <AlertDialog open={cerrarVaciaOpen} onOpenChange={setCerrarVaciaOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Cerrar la cuenta #{cuenta.id}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              La cuenta no tiene productos, así que se cerrará sin generar
              factura. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCerrarVacia}
              disabled={mutations.cerrarCuentaVacia.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {mutations.cerrarCuentaVacia.isPending
                ? 'Cerrando...'
                : 'Cerrar cuenta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ticket montado oculto: printTicket copia su HTML a una ventana dedicada */}
      <div style={{ display: 'none' }}>
        <TicketCuentaBarra
          ref={ticketRef}
          cuentaId={cuenta.id}
          atendidoPor={cuenta.admin_nombre}
          descripcion={cuenta.descripcion}
          fechaHora={cuenta.fecha_hora}
          facturada={cuenta.status === 'facturado'}
          items={grupos.map((g) => ({
            nombre: g.nombre,
            cantidad: g.cantidad,
            precio_unitario: Number(g.precio_unitario),
            subtotal: g.subtotal,
          }))}
          total={total}
          negocioNombre={loadBillarDisplay()?.nombre}
        />
      </div>
    </>
  )
}
