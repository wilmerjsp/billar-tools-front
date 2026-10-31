import { useCallback, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { useWebSocket } from '@/hooks/use-web-socket'
import { useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/types/api'
import { EstadoJuego } from '@/types/enums'
import { useMesas } from '@/features/mesas/hooks/use-mesas'
import { useJuegosActivos } from '../hooks/use-juegos'
import { JuegoCard } from '../components/juego-card'
import { JuegoDetallePanel } from '../components/juego-detalle-panel'
import { FacturarJuegoModal } from '../components/facturar-juego-modal'

function JuegosSkeleton() {
  return (
    <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className='h-36 w-full rounded-lg' />
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
        Error al cargar los juegos: {getErrorMessage(error)}
      </p>
      <Button variant='outline' onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}

export function JuegosActivosPage() {
  const { auth } = useAuthStore()
  const billarId = auth.user?.billares_asignados[0] ?? 0
  const queryClient = useQueryClient()

  // Todos los eventos del canal mesas (juego_iniciado, juego_finalizado, juego_facturado,
  // mesa_actualizada, etc.) pueden afectar la lista de juegos activos → invalidar siempre
  const handleMesasEvent = useCallback(
    (_payload: unknown) => {
      queryClient.invalidateQueries({ queryKey: ['juegos', 'activos', billarId] })
    },
    [queryClient, billarId]
  )
  useWebSocket('mesas', handleMesasEvent)

  const {
    data: juegos,
    isLoading,
    isError,
    error,
    refetch,
  } = useJuegosActivos(billarId)
  const { data: mesas } = useMesas()

  const [selectedJuegoId, setSelectedJuegoId] = useState<number | null>(null)
  const [cobrandoJuegoId, setCobrandoJuegoId] = useState<number | null>(null)

  const resolverMesaNumero = (mesaId: number, fallback: number) =>
    mesas?.find((m) => m.id === mesaId)?.numero ?? fallback

  const juegosActivos = (juegos ?? [])
    .filter((j) => j.estado === EstadoJuego.EN_JUEGO || j.estado === EstadoJuego.PAUSADO)
    .map((j) => ({ ...j, mesa_numero: resolverMesaNumero(j.mesa_id, j.mesa_numero) }))

  const pendientesCobro = (juegos ?? [])
    .filter((j) => j.estado === EstadoJuego.FINALIZADO)
    .map((j) => ({ ...j, mesa_numero: resolverMesaNumero(j.mesa_id, j.mesa_numero) }))

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
        {isLoading && (
          <>
            <div className='mb-4 h-8 w-48 rounded bg-muted animate-pulse' />
            <JuegosSkeleton />
          </>
        )}
        {isError && error instanceof Error && (
          <SectionError error={error} onRetry={refetch} />
        )}

        {!isLoading && !isError && (
          <div className='space-y-8'>
            {/* ── Sección: En juego ── */}
            <section>
              <div className='mb-4 flex items-center gap-3'>
                <h1 className='text-2xl font-bold tracking-tight'>Juegos Activos</h1>
                {juegosActivos.length > 0 && (
                  <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                    <span className='mr-1.5 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse' />
                    {juegosActivos.length} activo{juegosActivos.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
                {juegosActivos.length > 0 ? (
                  juegosActivos.map((juego) => (
                    <JuegoCard
                      key={juego.id}
                      juego={juego}
                      onClick={setSelectedJuegoId}
                    />
                  ))
                ) : (
                  <p className='col-span-full py-8 text-center text-muted-foreground'>
                    No hay juegos activos en este momento.
                  </p>
                )}
              </div>
            </section>

            {/* ── Sección: Pendientes de cobro ── */}
            {pendientesCobro.length > 0 && (
              <>
                <Separator />
                <section>
                  <div className='mb-4 flex items-center gap-3'>
                    <h2 className='text-xl font-bold tracking-tight'>Pendientes de cobro</h2>
                    <Badge className='bg-orange-100 text-orange-700 hover:bg-orange-100'>
                      {pendientesCobro.length}
                    </Badge>
                  </div>
                  <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
                    {pendientesCobro.map((juego) => (
                      <JuegoCard
                        key={juego.id}
                        juego={juego}
                        onClick={setSelectedJuegoId}
                        onRegistrarCobro={setCobrandoJuegoId}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </Main>

      <JuegoDetallePanel
        juegoId={selectedJuegoId}
        onClose={() => setSelectedJuegoId(null)}
      />

      {cobrandoJuegoId !== null && (
        <FacturarJuegoModal
          juegoId={cobrandoJuegoId}
          open={cobrandoJuegoId !== null}
          onClose={() => setCobrandoJuegoId(null)}
        />
      )}
    </>
  )
}
