import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, BookOpenText, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TipoAjusteInventario } from '@/types/enums'
import { useKardex } from '../hooks/use-inventario'

type TipoFiltro = TipoAjusteInventario | 'todos'

const PAGE_SIZE = 50

const TIPO_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  ajuste: 'Ajuste',
}

function formatCurrency(value: string | null): string {
  if (value === null || value === undefined) return '—'
  const num = parseFloat(value)
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function KardexPage() {
  const navigate = useNavigate()
  const { productoId } = useParams({
    from: '/_authenticated/inventario/kardex/$productoId',
  })
  const id = parseInt(productoId, 10)

  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>('todos')
  const [page, setPage] = useState(1)

  const { data: kardex, isLoading, isError } = useKardex(id, {
    tipo: tipoFiltro === 'todos' ? undefined : tipoFiltro,
    page,
    page_size: PAGE_SIZE,
  })

  const totalPages = kardex ? Math.max(1, Math.ceil(kardex.total / PAGE_SIZE)) : 1

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/inventario' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver
          </Button>
          <h2 className='text-2xl font-bold tracking-tight'>
            Kardex{kardex ? ` — ${kardex.producto.nombre}` : ''}
          </h2>
        </div>

        {isLoading && (
          <div className='space-y-4'>
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-64 w-full' />
          </div>
        )}

        {isError && (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <BookOpenText className='mb-4 h-12 w-12' />
            <p>
              No se pudo cargar el kardex. Verifica que el producto lleve
              control de inventario (los combos no tienen kardex propio).
            </p>
          </div>
        )}

        {kardex && (
          <>
            <Card className='mb-6'>
              <CardContent className='flex flex-wrap items-center gap-x-8 gap-y-2 p-4 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Producto</p>
                  <p className='font-semibold'>{kardex.producto.nombre}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Stock actual</p>
                  <p className='font-semibold'>{parseFloat(kardex.stock_actual)}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Precio de venta</p>
                  <p className='font-semibold'>
                    {formatCurrency(String(kardex.producto.precio))}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Movimientos</p>
                  <p className='font-semibold'>{kardex.total}</p>
                </div>
              </CardContent>
            </Card>

            <div className='mb-4 flex gap-2'>
              {(
                [
                  'todos',
                  TipoAjusteInventario.ENTRADA,
                  TipoAjusteInventario.SALIDA,
                  TipoAjusteInventario.AJUSTE,
                ] as TipoFiltro[]
              ).map((f) => (
                <Button
                  key={f}
                  size='sm'
                  variant={tipoFiltro === f ? 'default' : 'outline'}
                  onClick={() => {
                    setTipoFiltro(f)
                    setPage(1)
                  }}
                >
                  {f === 'todos' ? 'Todos' : TIPO_LABELS[f]}
                </Button>
              ))}
            </div>

            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className='text-right'>Cantidad</TableHead>
                    <TableHead className='text-right'>Costo unitario</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className='text-right'>Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kardex.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='py-12 text-center'>
                        <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                          <BookOpenText className='h-10 w-10' />
                          <p>No hay movimientos para este filtro.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    kardex.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className='text-sm text-muted-foreground'>
                          {formatFecha(item.fecha_hora)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.tipo === TipoAjusteInventario.ENTRADA
                                ? 'default'
                                : item.tipo === TipoAjusteInventario.SALIDA
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {TIPO_LABELS[item.tipo] ?? item.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          {parseFloat(item.cantidad)}
                        </TableCell>
                        <TableCell className='text-right'>
                          {formatCurrency(item.costo_unitario)}
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {item.motivo}
                        </TableCell>
                        <TableCell className='text-right font-semibold'>
                          {item.saldo !== null ? parseFloat(item.saldo) : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='mt-4 flex items-center justify-end gap-2'>
              <span className='text-sm text-muted-foreground'>
                Página {kardex.page} de {totalPages}
              </span>
              <Button
                variant='outline'
                size='icon'
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label='Página anterior'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label='Página siguiente'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
