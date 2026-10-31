import { useState } from 'react'
import { Layers, Pencil, Plus, Settings2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

import { useProductos } from '@/features/productos/hooks/use-productos'
import { useComisionConfigs, useComisionConfigMutations } from '../hooks/use-comisiones'
import { ConfigFormModal } from './config-form-modal'
import { ConfigBatchModal } from './config-batch-modal'
import type { ConfigComision } from '../types'
import type { Producto } from '@/types/models'
import { showApiError } from '@/lib/handle-server-error'

const COP = (v: number) =>
  Number(v).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

export function ConfigTable() {
  const [modalOpen, setModalOpen] = useState(false)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selected, setSelected] = useState<(ConfigComision & { producto?: Producto }) | undefined>()

  const { data: configs, isLoading, isError } = useComisionConfigs()
  const { data: productos } = useProductos()
  const { update, remove } = useComisionConfigMutations()

  function handleNuevo() {
    setSelected(undefined)
    setModalOpen(true)
  }

  function handleEditar(config: ConfigComision) {
    const producto = productos?.find((p) => p.id === config.producto_id)
    setSelected({ ...config, producto })
    setModalOpen(true)
  }

  function handleDeleteClick(config: ConfigComision) {
    const producto = productos?.find((p) => p.id === config.producto_id)
    setSelected({ ...config, producto })
    setDeleteDialogOpen(true)
  }

  function handleDeleteConfirm() {
    if (!selected) return
    remove.mutate(selected.id, {
      onSuccess: () => {
        toast.success('Configuración desactivada')
        setDeleteDialogOpen(false)
      },
      onError: (error) => showApiError(error, 'Error al desactivar la configuración'),
    })
  }

  function handleToggleActiva(config: ConfigComision) {
    update.mutate(
      { id: config.id, data: { activa: !config.activa } },
      { onError: (error) => showApiError(error, 'Error al cambiar el estado') }
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
        <Settings2 className='mb-4 h-12 w-12' />
        <p>Error al cargar las configuraciones. Intenta de nuevo.</p>
      </div>
    )
  }

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-sm text-muted-foreground'>
          {configs?.length ?? 0} configuración(es) registrada(s)
        </p>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setBatchModalOpen(true)}>
            <Layers className='mr-2 h-4 w-4' />
            Por lote
          </Button>
          <Button onClick={handleNuevo}>
            <Plus className='mr-2 h-4 w-4' />
            Nueva configuración
          </Button>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className='text-right'>Precio venta</TableHead>
              <TableHead className='text-right'>Precio barra</TableHead>
              <TableHead className='text-right'>Comisión unit.</TableHead>
              <TableHead className='text-center'>Activa</TableHead>
              <TableHead className='w-[80px]' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!configs || configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='py-12 text-center'>
                  <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                    <Settings2 className='h-10 w-10' />
                    <p>No hay configuraciones de comisión aún.</p>
                    <Button variant='outline' size='sm' onClick={handleNuevo}>
                      Crear la primera
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => {
                const producto = productos?.find((p) => p.id === config.producto_id)
                const precioVenta = Number(producto?.precio ?? 0)
                const precioBarra = Number(config.precio_barra)
                const comision = precioVenta - precioBarra

                return (
                  <TableRow key={config.id} className={!config.activa ? 'opacity-50' : ''}>
                    <TableCell className='font-medium'>
                      {producto?.nombre ?? `Producto #${config.producto_id}`}
                    </TableCell>
                    <TableCell className='text-right text-muted-foreground'>
                      {precioVenta > 0 ? COP(precioVenta) : '—'}
                    </TableCell>
                    <TableCell className='text-right'>{COP(precioBarra)}</TableCell>
                    <TableCell className='text-right font-semibold text-green-600'>
                      {precioVenta > 0 ? COP(comision) : '—'}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Switch
                        checked={config.activa}
                        onCheckedChange={() => handleToggleActiva(config)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleEditar(config)}
                          aria-label='Editar'
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDeleteClick(config)}
                          aria-label='Desactivar'
                          className='text-destructive hover:text-destructive'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ConfigFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        config={selected}
      />

      <ConfigBatchModal open={batchModalOpen} onOpenChange={setBatchModalOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar configuración?</AlertDialogTitle>
            <AlertDialogDescription>
              Se desactivará la comisión para{' '}
              <span className='font-medium'>
                {selected?.producto?.nombre ?? `Producto #${selected?.producto_id}`}
              </span>
              . El producto ya no generará comisiones (soft delete).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
