import { AlertCircle, Coins } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { useValorizado } from '../hooks/use-inventario'

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

export function ValorizadoTab() {
  const { data: valorizado, isLoading, isError } = useValorizado()

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    )
  }

  if (isError || !valorizado) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
        <Coins className='mb-4 h-12 w-12' />
        <p>Error al cargar el inventario valorizado. Intenta de nuevo.</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Valor total a costo</p>
            <p className='text-2xl font-bold'>
              {formatCurrency(valorizado.total_valor_costo)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>
              Valor total a precio de venta
            </p>
            <p className='text-2xl font-bold'>
              {formatCurrency(valorizado.total_valor_venta)}
            </p>
          </CardContent>
        </Card>
      </div>

      {valorizado.productos_sin_costo > 0 && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {valorizado.productos_sin_costo} producto(s) sin costo definido; su
            valor a costo no se incluye en el total. Edita el producto o
            registra una compra para fijar el costo.
          </AlertDescription>
        </Alert>
      )}

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className='text-right'>Stock</TableHead>
              <TableHead className='text-right'>Costo unit.</TableHead>
              <TableHead className='text-right'>Venta unit.</TableHead>
              <TableHead className='text-right'>Valor a costo</TableHead>
              <TableHead className='text-right'>Valor a venta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {valorizado.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center'>
                  <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                    <Coins className='h-10 w-10' />
                    <p>No hay productos con inventario para valorizar.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              valorizado.items.map((item) => (
                <TableRow key={item.producto_id}>
                  <TableCell className='font-medium'>
                    {item.producto_nombre}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {item.categoria}
                  </TableCell>
                  <TableCell className='text-right'>
                    {parseFloat(item.stock_actual)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(item.precio_costo)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(item.precio_venta)}
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCurrency(item.valor_costo)}
                  </TableCell>
                  <TableCell className='text-right font-medium'>
                    {formatCurrency(item.valor_venta)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
