import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft, ClipboardList, ShoppingBag } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useVentasPorMesera } from '../hooks/use-comisiones'
import type { VentasMesera } from '../types'

const COP = (v: number) =>
  Number(v).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

function formatFecha(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MeseraCard({ mesera }: { mesera: VentasMesera }) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base font-semibold'>
            <ShoppingBag className='h-4 w-4 text-primary' />
            {mesera.nombre}
          </CardTitle>
          <span className='text-sm font-bold text-primary'>{COP(mesera.subtotal)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className='text-right'>Cant.</TableHead>
              <TableHead className='text-right'>Valor unit.</TableHead>
              <TableHead className='text-right'>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mesera.productos.map((p) => (
              <TableRow key={p.producto_id}>
                <TableCell className='font-medium'>{p.nombre}</TableCell>
                <TableCell className='text-right text-muted-foreground'>{p.cantidad}</TableCell>
                <TableCell className='text-right text-muted-foreground'>
                  {COP(p.valor_unitario)}
                </TableCell>
                <TableCell className='text-right font-semibold'>{COP(p.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function VentasPorMeseraPage() {
  const { turnoId } = useParams({ from: '/_authenticated/comisiones/ventas-mesera/$turnoId' })
  const id = Number(turnoId)

  const { data, isLoading, isError } = useVentasPorMesera(id)

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
        <div className='mb-6'>
          <Button variant='ghost' size='sm' className='mb-4 -ml-2' asChild>
            <Link to='/comisiones'>
              <ArrowLeft className='mr-1.5 h-4 w-4' />
              Volver a comisiones
            </Link>
          </Button>

          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Ventas por mesera — Turno #{id}
              </h2>
              {data && (
                <p className='text-muted-foreground'>
                  {formatFecha(data.fecha_apertura)} —{' '}
                  {data.fecha_cierre ? formatFecha(data.fecha_cierre) : 'en curso'}
                  <Badge
                    variant={data.status === 'abierto' ? 'default' : 'secondary'}
                    className='ml-3'
                  >
                    {data.status}
                  </Badge>
                </p>
              )}
            </div>
            {data && (
              <div className='rounded-lg border bg-muted/50 px-5 py-3 text-right'>
                <p className='text-xs text-muted-foreground'>Total general</p>
                <p className='text-2xl font-bold text-primary'>{COP(data.total_general)}</p>
              </div>
            )}
          </div>
        </div>

        <Separator className='mb-6' />

        {isLoading && (
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-48 w-full rounded-xl' />
            ))}
          </div>
        )}

        {isError && (
          <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
            <ClipboardList className='mb-4 h-12 w-12' />
            <p>No se pudo cargar el reporte. Intenta de nuevo.</p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            {data.meseras.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
                <ClipboardList className='mb-4 h-12 w-12' />
                <p>No hay ventas registradas en este turno.</p>
              </div>
            ) : (
              <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                {data.meseras.map((mesera) => (
                  <MeseraCard key={mesera.mesera_id} mesera={mesera} />
                ))}
              </div>
            )}
          </>
        )}
      </Main>
    </>
  )
}
