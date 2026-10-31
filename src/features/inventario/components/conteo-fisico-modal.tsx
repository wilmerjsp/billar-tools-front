import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Search as SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { showApiError } from '@/lib/handle-server-error'
import { type ConteoFisico } from '@/types/models'
import { useConteoFisico, useInventario } from '../hooks/use-inventario'

interface ConteoFisicoModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ConteoFisicoModal({ open, onOpenChange }: ConteoFisicoModalProps) {
  const { data: inventario } = useInventario()
  const conteoFisico = useConteoFisico()

  const [busqueda, setBusqueda] = useState('')
  const [nota, setNota] = useState('')
  // Cantidades contadas por producto_id; vacío = producto no contado
  const [conteos, setConteos] = useState<Record<number, string>>({})
  const [resultado, setResultado] = useState<ConteoFisico | null>(null)

  const itemsFiltrados = useMemo(() => {
    const items = inventario ?? []
    if (!busqueda.trim()) return items
    const q = busqueda.toLowerCase()
    return items.filter((i) => i.producto.nombre.toLowerCase().includes(q))
  }, [inventario, busqueda])

  const itemsContados = Object.entries(conteos).filter(
    ([, v]) => v.trim() !== '' && !isNaN(parseFloat(v)) && parseFloat(v) >= 0
  )

  function handleClose(v: boolean) {
    if (!v) {
      setBusqueda('')
      setNota('')
      setConteos({})
      setResultado(null)
    }
    onOpenChange(v)
  }

  function handleSubmit() {
    conteoFisico.mutate(
      {
        nota: nota.trim() || undefined,
        items: itemsContados.map(([productoId, cantidad]) => ({
          producto_id: Number(productoId),
          cantidad_contada: cantidad.trim(),
        })),
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Conteo aplicado: ${data.productos_ajustados} ajustado(s) de ${data.productos_contados} contado(s)`
          )
          setResultado(data)
        },
        onError: (error) => {
          showApiError(error, 'Error al aplicar el conteo físico')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[640px]'>
        <DialogHeader>
          <DialogTitle>Conteo físico</DialogTitle>
          <DialogDescription>
            Ingresa la cantidad contada de cada producto. El stock se fijará al
            valor contado; los productos sin cantidad no se modifican.
          </DialogDescription>
        </DialogHeader>

        {resultado ? (
          <>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className='text-right'>Stock anterior</TableHead>
                    <TableHead className='text-right'>Contado</TableHead>
                    <TableHead className='text-right'>Diferencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.resultados.map((r) => {
                    const dif = parseFloat(r.diferencia)
                    return (
                      <TableRow key={r.producto_id}>
                        <TableCell className='font-medium'>
                          {r.producto_nombre}
                        </TableCell>
                        <TableCell className='text-right'>
                          {parseFloat(r.stock_anterior)}
                        </TableCell>
                        <TableCell className='text-right'>
                          {parseFloat(r.stock_contado)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            dif === 0
                              ? 'text-muted-foreground'
                              : dif > 0
                                ? 'text-green-600'
                                : 'text-destructive'
                          }`}
                        >
                          {dif > 0 ? '+' : ''}
                          {dif}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Cerrar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className='flex flex-col gap-3'>
              <div className='relative'>
                <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar producto...'
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className='pl-9'
                />
              </div>

              <div className='max-h-80 overflow-y-auto rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className='text-right'>Stock sistema</TableHead>
                      <TableHead className='w-32 text-right'>Contado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className='py-8 text-center text-muted-foreground'
                        >
                          No hay productos con inventario.
                        </TableCell>
                      </TableRow>
                    ) : (
                      itemsFiltrados.map((item) => (
                        <TableRow key={item.producto_id}>
                          <TableCell className='font-medium'>
                            {item.producto.nombre}
                          </TableCell>
                          <TableCell className='text-right text-muted-foreground'>
                            {Math.trunc(item.stock_actual)}
                          </TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              min={0}
                              step={1}
                              placeholder='—'
                              className='text-right'
                              value={conteos[item.producto_id] ?? ''}
                              onChange={(e) =>
                                setConteos((s) => ({
                                  ...s,
                                  [item.producto_id]: e.target.value,
                                }))
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <Input
                placeholder='Nota (opcional, ej: Cierre de mes)'
                maxLength={80}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleClose(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={itemsContados.length === 0 || conteoFisico.isPending}
              >
                {conteoFisico.isPending
                  ? 'Aplicando...'
                  : `Aplicar conteo (${itemsContados.length})`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
