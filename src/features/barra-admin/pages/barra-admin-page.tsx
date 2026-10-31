import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  useCuentasBarraActivas,
  useBarraAdminMutations,
} from '../hooks/use-barra-admin'
import type { CuentaBarraAdmin } from '../types'
import { NuevaCuentaDialog } from '../components/nueva-cuenta-dialog'
import { CuentaDetalle } from '../components/cuenta-detalle'

function ListaSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((n) => (
        <Skeleton key={n} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}

function CuentaListItem({
  cuenta,
  selected,
  onClick,
}: {
  cuenta: CuentaBarraAdmin
  selected: boolean
  onClick: () => void
}) {
  const total = Number(cuenta.total)
  const itemsActivos = cuenta.items.filter((i) => i.status === 'entregado').length

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent',
        selected && 'border-primary bg-primary/5',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">
            #{cuenta.id}
            {cuenta.descripcion && (
              <span className="ml-1 text-muted-foreground">
                — {cuenta.descripcion}
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {itemsActivos} {itemsActivos === 1 ? 'ítem' : 'ítems'}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold">
          ${total.toLocaleString('es-CO')}
        </span>
      </div>
    </button>
  )
}

export function BarraAdminPage() {
  const { data: cuentas = [], isLoading, isError, refetch } = useCuentasBarraActivas()
  const mutations = useBarraAdminMutations()
  const [nuevaCuentaOpen, setNuevaCuentaOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  function handleAbrirCuenta(descripcion?: string) {
    mutations.abrirCuenta.mutate(
      { descripcion },
      {
        onSuccess: (nueva) => {
          setNuevaCuentaOpen(false)
          setSelectedId(nueva.id)
        },
      },
    )
  }

  function handleCuentaCobrada() {
    setSelectedId(null)
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Barra — Admin</h1>
          <Button onClick={() => setNuevaCuentaOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva cuenta
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
          {/* Panel izquierdo: lista de cuentas */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cuentas abiertas ({cuentas.length})
            </p>

            {isLoading && <ListaSkeleton />}

            {isError && (
              <div className="text-center text-sm text-muted-foreground py-6">
                <p>No se pudieron cargar las cuentas.</p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-xs underline underline-offset-4"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!isLoading && !isError && cuentas.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No hay cuentas abiertas.
                  <br />
                  Crea una nueva con el botón de arriba.
                </CardContent>
              </Card>
            )}

            {!isLoading &&
              cuentas.map((cuenta) => (
                <CuentaListItem
                  key={cuenta.id}
                  cuenta={cuenta}
                  selected={selectedId === cuenta.id}
                  onClick={() => setSelectedId(cuenta.id)}
                />
              ))}
          </div>

          {/* Panel derecho: detalle */}
          <div>
            {selectedId ? (
              <CuentaDetalle
                cuentaId={selectedId}
                onCuentaCobrada={handleCuentaCobrada}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                  Selecciona una cuenta para ver el detalle
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Main>

      <NuevaCuentaDialog
        open={nuevaCuentaOpen}
        isPending={mutations.abrirCuenta.isPending}
        onConfirm={handleAbrirCuenta}
        onClose={() => setNuevaCuentaOpen(false)}
      />
    </>
  )
}
