import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebSocket } from '@/hooks/use-web-socket'
import { getErrorMessage } from '@/types/api'
import { MesaStatus } from '@/types/enums'
import { type Mesa } from '@/types/models'
import { useMesas } from '../hooks/use-mesas'
import { MesaCard } from '../components/mesa-card'
import { MesaFormModal } from '../components/mesa-form-modal'
import { MesaActionsModal } from '../components/mesa-actions-modal'
import { Plus } from 'lucide-react'

type FilterStatus = MesaStatus | 'all'

const filterLabels: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: MesaStatus.DISPONIBLE, label: 'Disponible' },
  { value: MesaStatus.OCUPADA, label: 'Ocupada' },
  { value: MesaStatus.RESERVADA, label: 'Reservada' },
  { value: MesaStatus.MANTENIMIENTO, label: 'Mantenimiento' },
]

function MesasSkeleton() {
  return (
    <div className='grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className='h-32 w-full rounded-lg' />
      ))}
    </div>
  )
}

function SectionError({
  error,
  onRetry,
}: {
  error: Error
  onRetry: () => void
}) {
  return (
    <div className='flex flex-col items-center justify-center gap-4 py-12 text-center'>
      <p className='text-destructive'>
        Error al cargar las mesas: {getErrorMessage(error)}
      </p>
      <Button variant='outline' onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

export function MesasPage() {
  useWebSocket('mesas')

  const { data: mesas, isLoading, isError, error, refetch } = useMesas()

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingMesa, setEditingMesa] = useState<Mesa | undefined>(undefined)
  const [actionsModalOpen, setActionsModalOpen] = useState(false)
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)

  const filteredMesas =
    mesas?.filter((m) =>
      activeFilter === 'all' ? true : m.status === activeFilter
    ) ?? []

  function handleSelectMesa(id: number) {
    const mesa = mesas?.find((m) => m.id === id) ?? null
    setSelectedMesa(mesa)
    setActionsModalOpen(true)
  }

  function handleNewMesa() {
    setEditingMesa(undefined)
    setFormModalOpen(true)
  }

  function handleEditMesa(mesa: Mesa) {
    setEditingMesa(mesa)
    setFormModalOpen(true)
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Mesas</h1>
          <Button onClick={handleNewMesa}>
            <Plus className='mr-2 h-4 w-4' />
            Nueva Mesa
          </Button>
        </div>

        {/* Filter buttons */}
        <div className='mb-4 flex flex-wrap gap-2'>
          {filterLabels.map(({ value, label }) => (
            <Button
              key={value}
              size='sm'
              variant={activeFilter === value ? 'default' : 'outline'}
              onClick={() => setActiveFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {isLoading && <MesasSkeleton />}
        {isError && error instanceof Error && (
          <SectionError error={error} onRetry={refetch} />
        )}
        {!isLoading && !isError && (
          <div className='grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'>
            {filteredMesas.length === 0 ? (
              <p className='col-span-full text-center text-muted-foreground py-12'>
                No hay mesas con el filtro seleccionado.
              </p>
            ) : (
              filteredMesas.map((mesa) => (
                <MesaCard
                  key={mesa.id}
                  mesa={mesa}
                  onSelect={handleSelectMesa}
                  isSelected={selectedMesa?.id === mesa.id}
                />
              ))
            )}
          </div>
        )}
      </Main>

      <MesaFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        mesa={editingMesa}
      />

      <MesaActionsModal
        mesa={selectedMesa}
        open={actionsModalOpen}
        onOpenChange={setActionsModalOpen}
        onEdit={handleEditMesa}
      />
    </>
  )
}
