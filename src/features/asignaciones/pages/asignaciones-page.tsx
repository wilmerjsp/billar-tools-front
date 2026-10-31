import { useMemo, useState } from 'react'
import { Link2, Check } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

import { type Asignacion, type Mesa, type Mesera } from '@/types/models'
import { useMeseras } from '@/features/meseras/hooks/use-meseras'
import { useMesas } from '@/features/mesas/hooks/use-mesas'
import { useAsignaciones, useAsignacionMutations } from '../hooks/use-asignaciones'
import { showApiError } from '@/lib/handle-server-error'

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// ── Mesa card — assigned panel ─────────────────────────────────────────────
interface AssignedCardProps {
  asignacion: Asignacion
  mesa?: Mesa
  selected: boolean
  onToggle: () => void
}

function AssignedMesaCard({ asignacion, mesa, selected, onToggle }: AssignedCardProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative flex flex-col gap-1 rounded-lg border p-3 text-left transition-all',
        'hover:border-primary/60 hover:bg-accent',
        selected && 'border-primary bg-primary/10 ring-2 ring-primary/30'
      )}
    >
      {selected && (
        <span className='absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground'>
          <Check className='h-2.5 w-2.5' />
        </span>
      )}
      <span className='font-semibold'>Mesa #{asignacion.mesa_numero}</span>
      {mesa?.nombre && (
        <span className='text-xs text-muted-foreground'>{mesa.nombre}</span>
      )}
      <Badge
        variant={asignacion.activa ? 'default' : 'secondary'}
        className='w-fit text-xs'
      >
        {asignacion.activa ? 'Activa' : 'Inactiva'}
      </Badge>
    </button>
  )
}

// ── Mesa card — available panel ────────────────────────────────────────────
interface AvailableCardProps {
  mesa: Mesa
  selected: boolean
  onToggle: () => void
}

function AvailableMesaCard({ mesa, selected, onToggle }: AvailableCardProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative flex flex-col gap-1 rounded-lg border p-3 text-left transition-all',
        'hover:border-primary/60 hover:bg-accent',
        selected && 'border-primary bg-primary/10 ring-2 ring-primary/30'
      )}
    >
      {selected && (
        <span className='absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground'>
          <Check className='h-2.5 w-2.5' />
        </span>
      )}
      <span className='font-semibold'>Mesa #{mesa.numero}</span>
      {mesa.nombre && (
        <span className='text-xs text-muted-foreground'>{mesa.nombre}</span>
      )}
      {mesa.tipo && (
        <span className='text-xs capitalize text-muted-foreground'>
          {mesa.tipo}
        </span>
      )}
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export function AsignacionesPage() {
  const [selectedMesera, setSelectedMesera] = useState<Mesera | null>(null)
  const [selectedAssignedIds, setSelectedAssignedIds] = useState<Set<number>>(
    new Set()
  )
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<Set<number>>(
    new Set()
  )

  const { data: meseras, isLoading: loadingMeseras } = useMeseras()
  const { data: mesas, isLoading: loadingMesas } = useMesas()
  const { data: asignaciones, isLoading: loadingAsignaciones } = useAsignaciones()
  const { createBatch, toggleBatch, removeBatch } = useAsignacionMutations()

  const isLoading = loadingMeseras || loadingMesas || loadingAsignaciones

  // Assignments for the selected mesera
  const assignedToSelected = useMemo(() => {
    if (!selectedMesera || !asignaciones) return []
    return asignaciones.filter((a) => a.mesera_id === selectedMesera.id)
  }, [selectedMesera, asignaciones])

  // All mesa IDs that have ANY assignment (across all meseras)
  const allAssignedMesaIds = useMemo(
    () => new Set((asignaciones ?? []).map((a) => a.mesa_id)),
    [asignaciones]
  )

  // Lookup para mostrar nombre/tipo de la mesa en el panel de asignadas
  const mesasById = useMemo(
    () => new Map((mesas ?? []).map((m) => [m.id, m])),
    [mesas]
  )

  // Mesas with NO assignment at all → shown in the available panel
  const availableMesas = useMemo(() => {
    if (!mesas) return []
    return mesas.filter((m) => !allAssignedMesaIds.has(m.id))
  }, [mesas, allAssignedMesaIds])

  const assignedCountByMesera = useMemo(() => {
    const counts: Record<number, number> = {}
    asignaciones?.forEach((a) => {
      counts[a.mesera_id] = (counts[a.mesera_id] ?? 0) + 1
    })
    return counts
  }, [asignaciones])

  function handleSelectMesera(mesera: Mesera) {
    setSelectedMesera(mesera)
    setSelectedAssignedIds(new Set())
    setSelectedAvailableIds(new Set())
  }

  // ── Left panel selection ───────────────────────────────────────────────
  function toggleAssigned(id: number) {
    setSelectedAssignedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleAllAssigned() {
    if (selectedAssignedIds.size === assignedToSelected.length) {
      setSelectedAssignedIds(new Set())
    } else {
      setSelectedAssignedIds(new Set(assignedToSelected.map((a) => a.id)))
    }
  }

  // ── Right panel selection ──────────────────────────────────────────────
  function toggleAvailable(id: number) {
    setSelectedAvailableIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleAllAvailable() {
    if (selectedAvailableIds.size === availableMesas.length) {
      setSelectedAvailableIds(new Set())
    } else {
      setSelectedAvailableIds(new Set(availableMesas.map((m) => m.id)))
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────
  function handleAssign() {
    if (!selectedMesera || selectedAvailableIds.size === 0) return
    createBatch.mutate(
      {
        mesera_id: selectedMesera.id,
        mesa_ids: Array.from(selectedAvailableIds),
      },
      {
        onSuccess: () => {
          toast.success(
            `${selectedAvailableIds.size} mesa(s) asignada(s) correctamente`
          )
          setSelectedAvailableIds(new Set())
        },
        onError: (error) => showApiError(error, 'Error al asignar las mesas'),
      }
    )
  }

  function handleToggleBatch() {
    toggleBatch.mutate(Array.from(selectedAssignedIds), {
      onSuccess: () => {
        toast.success('Estado de asignaciones actualizado')
        setSelectedAssignedIds(new Set())
      },
      onError: (error) => showApiError(error, 'Error al cambiar el estado'),
    })
  }

  function handleRemoveBatch() {
    const count = selectedAssignedIds.size
    removeBatch.mutate(Array.from(selectedAssignedIds), {
      onSuccess: () => {
        toast.success(`${count} asignación(es) eliminada(s)`)
        setSelectedAssignedIds(new Set())
      },
      onError: (error) => showApiError(error, 'Error al eliminar las asignaciones'),
    })
  }

  const allAssignedSelected =
    assignedToSelected.length > 0 &&
    selectedAssignedIds.size === assignedToSelected.length
  const someAssignedSelected =
    selectedAssignedIds.size > 0 && !allAssignedSelected

  const allAvailableSelected =
    availableMesas.length > 0 &&
    selectedAvailableIds.size === availableMesas.length
  const someAvailableSelected =
    selectedAvailableIds.size > 0 && !allAvailableSelected

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
          <h2 className='text-2xl font-bold tracking-tight'>
            Asignación de Mesas
          </h2>
          <p className='text-muted-foreground'>
            Selecciona una mesera para gestionar sus mesas asignadas.
          </p>
        </div>

        {/* ── Mesera selector ── */}
        {isLoading ? (
          <div className='flex gap-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className='h-28 w-28 flex-shrink-0 rounded-xl'
              />
            ))}
          </div>
        ) : (
          <div className='flex gap-3 overflow-x-auto pb-3'>
            {(meseras ?? []).map((mesera) => {
              const count = assignedCountByMesera[mesera.id] ?? 0
              const isSelected = selectedMesera?.id === mesera.id
              return (
                <button
                  key={mesera.id}
                  onClick={() => handleSelectMesera(mesera)}
                  className={cn(
                    'flex w-28 flex-shrink-0 cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 transition-all',
                    'hover:border-primary/60 hover:bg-accent',
                    isSelected &&
                      'border-primary bg-primary/10 ring-2 ring-primary/30'
                  )}
                >
                  <Avatar className='h-10 w-10'>
                    <AvatarImage
                      src={mesera.foto_url}
                      alt={mesera.nombre_completo}
                    />
                    <AvatarFallback className='text-xs'>
                      {getInitials(mesera.nombre_completo)}
                    </AvatarFallback>
                  </Avatar>
                  <span className='line-clamp-2 text-center text-xs font-medium leading-tight'>
                    {mesera.nombre_completo}
                  </span>
                  <Badge
                    variant={count > 0 ? 'default' : 'secondary'}
                    className='text-xs'
                  >
                    {count} {count === 1 ? 'mesa' : 'mesas'}
                  </Badge>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && !selectedMesera && (
          <div className='mt-16 flex flex-col items-center gap-3 text-muted-foreground'>
            <Link2 className='h-12 w-12 opacity-40' />
            <p>
              Selecciona una mesera para ver y gestionar sus asignaciones.
            </p>
          </div>
        )}

        {/* ── Two panels ── */}
        {!isLoading && selectedMesera && (
          <div className='mt-6 grid grid-cols-2 gap-6'>

            {/* ── Left: assigned mesas ── */}
            <div className='flex flex-col gap-3'>
              <div className='flex min-h-9 items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  {assignedToSelected.length > 0 && (
                    <Checkbox
                      checked={
                        allAssignedSelected ||
                        (someAssignedSelected ? 'indeterminate' : false)
                      }
                      onCheckedChange={toggleAllAssigned}
                      aria-label='Seleccionar todas las asignadas'
                    />
                  )}
                  <h3 className='font-semibold'>
                    Mesas asignadas{' '}
                    <span className='font-normal text-muted-foreground'>
                      ({assignedToSelected.length})
                    </span>
                  </h3>
                </div>

                {selectedAssignedIds.size > 0 && (
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleToggleBatch}
                      disabled={toggleBatch.isPending}
                    >
                      Activar/Desact. ({selectedAssignedIds.size})
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={handleRemoveBatch}
                      disabled={removeBatch.isPending}
                    >
                      Quitar ({selectedAssignedIds.size})
                    </Button>
                  </div>
                )}
              </div>

              {assignedToSelected.length === 0 ? (
                <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-sm text-muted-foreground'>
                  <p>Sin mesas asignadas.</p>
                  <p className='text-xs'>
                    Selecciona mesas del panel derecho para asignar.
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-3 gap-2'>
                  {assignedToSelected.map((asignacion) => (
                    <AssignedMesaCard
                      key={asignacion.id}
                      asignacion={asignacion}
                      mesa={mesasById.get(asignacion.mesa_id)}
                      selected={selectedAssignedIds.has(asignacion.id)}
                      onToggle={() => toggleAssigned(asignacion.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: available mesas ── */}
            <div className='flex flex-col gap-3'>
              <div className='flex min-h-9 items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  {availableMesas.length > 0 && (
                    <Checkbox
                      checked={
                        allAvailableSelected ||
                        (someAvailableSelected ? 'indeterminate' : false)
                      }
                      onCheckedChange={toggleAllAvailable}
                      aria-label='Seleccionar todas las disponibles'
                    />
                  )}
                  <h3 className='font-semibold'>
                    Disponibles para asignar{' '}
                    <span className='font-normal text-muted-foreground'>
                      ({availableMesas.length})
                    </span>
                  </h3>
                </div>

                <Button
                  size='sm'
                  onClick={handleAssign}
                  disabled={
                    selectedAvailableIds.size === 0 || createBatch.isPending
                  }
                >
                  {createBatch.isPending
                    ? 'Asignando...'
                    : selectedAvailableIds.size > 0
                      ? `Asignar (${selectedAvailableIds.size})`
                      : 'Asignar'}
                </Button>
              </div>

              {availableMesas.length === 0 ? (
                <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-sm text-muted-foreground'>
                  <p>No hay mesas sin asignar.</p>
                </div>
              ) : (
                <div className='grid grid-cols-3 gap-2'>
                  {availableMesas.map((mesa) => (
                    <AvailableMesaCard
                      key={mesa.id}
                      mesa={mesa}
                      selected={selectedAvailableIds.has(mesa.id)}
                      onToggle={() => toggleAvailable(mesa.id)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </Main>
    </>
  )
}
