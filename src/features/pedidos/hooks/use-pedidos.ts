import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  findMiTurno,
  turnosActivosQueryOptions,
} from "@/features/caja/hooks/use-caja";
import { useAuthStore } from "@/stores/auth-store";
import { PedidoStatus, type MetodoPago } from "@/types/enums";
import type { Pedido } from "@/types/models";
import { pedidosService } from "../services/pedidos-service";
import { showApiError } from "@/lib/handle-server-error";

export function usePedidosPendientes(billarId: number) {
  return useQuery({
    queryKey: ["pedidos", "pendientes", billarId],
    queryFn: () => pedidosService.getPendientes(),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    enabled: billarId > 0,
  });
}

export function usePedidosMutaciones() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.auth.user);

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ["pedidos"] });

  function despacharPorOrigen(
    pedidos: Pedido[],
    status: PedidoStatus,
    extra?: { motivo_rechazo?: string; turno_caja_id?: number; metodo_pago?: string },
  ) {
    const juego = pedidos.filter((p) => p.origen === "juego");
    const barra = pedidos.filter((p) => p.origen === "barra");
    const calls: Promise<unknown>[] = [];

    if (juego.length > 0) {
      calls.push(
        pedidosService.actualizarEstadoBatch({
          consumo_ids: juego.map((p) => p.id),
          status,
          ...extra,
        }),
      );
    }

    for (const p of barra) {
      calls.push(
        pedidosService.actualizarEstadoBarra(p.juego_id, p.id, {
          status,
          motivo_rechazo: extra?.motivo_rechazo,
          turno_caja_id: extra?.turno_caja_id,
          metodo_pago: extra?.metodo_pago,
        }),
      );
    }

    return Promise.all(calls);
  }

  const aceptar = useMutation({
    mutationFn: (pedidos: Pedido[]) =>
      despacharPorOrigen(pedidos, PedidoStatus.ACEPTADO),
    onSuccess: () => {
      invalidar();
      toast.success("Pedido(s) aceptado(s)");
    },
    onError: (error) => showApiError(error, "Error al aceptar el pedido"),
  });

  const rechazar = useMutation({
    mutationFn: ({ pedidos, motivo_rechazo }: { pedidos: Pedido[]; motivo_rechazo?: string }) =>
      despacharPorOrigen(pedidos, PedidoStatus.RECHAZADO, { motivo_rechazo }),
    onSuccess: () => {
      invalidar();
      toast.success("Pedido(s) rechazado(s)");
    },
    onError: (error) => showApiError(error, "Error al rechazar el pedido"),
  });

  const marcarEntregado = useMutation({
    mutationFn: async ({
      pedidos,
      metodo_pago,
    }: {
      pedidos: Pedido[];
      metodo_pago: MetodoPago;
    }) => {
      // El pedido se registra en el turno de quien lo entrega,
      // nunca en el primer turno activo que exista en la sucursal
      const turnos = await queryClient.fetchQuery(turnosActivosQueryOptions);
      const miTurno = findMiTurno(turnos, user?.id);
      if (!miTurno) {
        throw new Error(
          "No tienes un turno de caja abierto. Abre tu turno para registrar la entrega en tu caja.",
        );
      }
      return despacharPorOrigen(pedidos, PedidoStatus.ENTREGADO, {
        turno_caja_id: miTurno.id,
        metodo_pago,
      });
    },
    onSuccess: () => {
      invalidar();
      queryClient.invalidateQueries({ queryKey: ["facturas"] });
      toast.success("Pedido(s) entregado(s)");
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Error al marcar como entregado",
      ),
  });

  const cancelar = useMutation({
    mutationFn: (pedidos: Pedido[]) =>
      Promise.all(
        pedidos.map((p) =>
          p.origen === "juego"
            ? pedidosService.cancelarJuego(p.id)
            : pedidosService.actualizarEstadoBarra(p.juego_id, p.id, {
                status: PedidoStatus.CANCELADO,
              }),
        ),
      ),
    onSuccess: () => {
      invalidar();
      toast.success("Pedido(s) cancelado(s)");
    },
    onError: (error) => showApiError(error, "Error al cancelar el pedido"),
  });

  return { aceptar, rechazar, marcarEntregado, cancelar };
}
