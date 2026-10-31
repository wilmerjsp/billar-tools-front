import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import type { MetodoPago } from "@/types/enums";
import { PedidoStatus } from "@/types/enums";
import { type Pedido } from "@/types/models";
import { useKanbanRealTime } from "../hooks/use-kanban-real-time";
import {
  usePedidosMutaciones,
  usePedidosPendientes,
} from "../hooks/use-pedidos";
import { PedidoCard } from "../components/pedido-card";
import { RechazarPedidoDialog } from "../components/rechazar-pedido-dialog";
import { EntregarPedidoDialog } from "../components/entregar-pedido-dialog";
import { CancelarPedidoDialog } from "../components/cancelar-pedido-dialog";

const COLUMNAS: { titulo: string; estado: PedidoStatus }[] = [
  { titulo: "Pendientes", estado: PedidoStatus.PENDIENTE },
  { titulo: "Aceptados", estado: PedidoStatus.ACEPTADO },
];

function agruparPedidos(pedidos: Pedido[]): Pedido[][] {
  const map = new Map<string, Pedido[]>();
  for (const p of pedidos) {
    const key = `${p.origen}_${p.juego_id}`;
    const grupo = map.get(key) ?? [];
    grupo.push(p);
    map.set(key, grupo);
  }
  return [...map.values()];
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {COLUMNAS.map((col) => (
        <div key={col.estado} className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PedidosPage() {
  const { auth } = useAuthStore();
  const billarId = auth.user?.billares_asignados[0] ?? 0;

  useKanbanRealTime();

  const {
    data: pedidos,
    isLoading,
    isError,
    refetch,
  } = usePedidosPendientes(billarId);
  const mutaciones = usePedidosMutaciones();

  const [grupoARechazar, setGrupoARechazar] = useState<Pedido[] | null>(null);
  const [grupoAEntregar, setGrupoAEntregar] = useState<Pedido[] | null>(null);
  const [grupoACancelar, setGrupoACancelar] = useState<Pedido[] | null>(null);

  function handleRechazarConfirmar(motivo: string) {
    if (!grupoARechazar || mutaciones.rechazar.isPending) return;
    mutaciones.rechazar.mutate({ pedidos: grupoARechazar, motivo_rechazo: motivo });
    setGrupoARechazar(null);
  }

  function handleEntregarConfirmar(metodo: MetodoPago) {
    if (!grupoAEntregar || mutaciones.marcarEntregado.isPending) return;
    mutaciones.marcarEntregado.mutate({ pedidos: grupoAEntregar, metodo_pago: metodo });
    setGrupoAEntregar(null);
  }

  function handleCancelarConfirmar() {
    if (!grupoACancelar || mutaciones.cancelar.isPending) return;
    mutaciones.cancelar.mutate(grupoACancelar);
    setGrupoACancelar(null);
  }

  function isGrupoLoading(grupo: Pedido[]) {
    const ids = new Set(grupo.map((p) => p.id));
    return (
      (mutaciones.aceptar.isPending &&
        mutaciones.aceptar.variables?.some((p) => ids.has(p.id))) ||
      (mutaciones.rechazar.isPending &&
        mutaciones.rechazar.variables?.pedidos?.some((p) => ids.has(p.id))) ||
      (mutaciones.marcarEntregado.isPending &&
        mutaciones.marcarEntregado.variables?.pedidos?.some((p) => ids.has(p.id))) ||
      (mutaciones.cancelar.isPending &&
        mutaciones.cancelar.variables?.some((p) => ids.has(p.id)))
    );
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        </div>

        {isLoading && <KanbanSkeleton />}

        {isError && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-muted-foreground">
              No se pudieron cargar los pedidos.
            </p>
            <button
              onClick={() => refetch()}
              className="text-sm underline underline-offset-4"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {COLUMNAS.map((col) => {
              const pedidosColumna = (pedidos ?? []).filter(
                (p) => p.status === col.estado,
              );
              const grupos = agruparPedidos(pedidosColumna);
              return (
                <div key={col.estado} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold">{col.titulo}</h2>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {grupos.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {grupos.length === 0 ? (
                      <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                        Sin pedidos
                      </p>
                    ) : (
                      grupos.map((grupo) => (
                        <PedidoCard
                          key={`${grupo[0].origen}_${grupo[0].juego_id}`}
                          pedidos={grupo}
                          isLoading={isGrupoLoading(grupo)}
                          onAceptar={
                            col.estado === PedidoStatus.PENDIENTE
                              ? () => mutaciones.aceptar.mutate(grupo)
                              : undefined
                          }
                          onRechazar={
                            col.estado === PedidoStatus.PENDIENTE
                              ? () => setGrupoARechazar(grupo)
                              : undefined
                          }
                          onMarcarEntregado={
                            col.estado === PedidoStatus.ACEPTADO
                              ? () => setGrupoAEntregar(grupo)
                              : undefined
                          }
                          onCancelar={
                            col.estado === PedidoStatus.ACEPTADO
                              ? () => setGrupoACancelar(grupo)
                              : undefined
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Main>

      <RechazarPedidoDialog
        open={grupoARechazar !== null}
        isPending={mutaciones.rechazar.isPending}
        onConfirm={handleRechazarConfirmar}
        onClose={() => setGrupoARechazar(null)}
      />

      <EntregarPedidoDialog
        open={grupoAEntregar !== null}
        isPending={mutaciones.marcarEntregado.isPending}
        total={
          grupoAEntregar?.reduce(
            (sum, p) => sum + (p.precio_barra_snapshot ?? p.precio_unitario) * p.cantidad,
            0,
          ) ?? 0
        }
        onConfirm={handleEntregarConfirmar}
        onClose={() => setGrupoAEntregar(null)}
      />

      <CancelarPedidoDialog
        open={grupoACancelar !== null}
        isPending={mutaciones.cancelar.isPending}
        onConfirm={handleCancelarConfirmar}
        onClose={() => setGrupoACancelar(null)}
      />
    </>
  );
}
