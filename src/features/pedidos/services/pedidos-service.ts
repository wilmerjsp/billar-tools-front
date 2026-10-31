import api from "@/lib/axios";
import type { PedidoStatus } from "@/types/enums";
import type { Pedido } from "@/types/models";

interface RawJuegoPedido extends Omit<Pedido, "status" | "precio_unitario" | "origen"> {
  status: string;
  precio_unitario: string | number;
}

interface RawBarraPedido {
  id: number;
  personal_id: number;
  mesera_nombre?: string;
  producto_id: number;
  cantidad: number;
  precio_unitario: string | number;
  producto_nombre_snapshot?: string | null;
  notas?: string | null;
  status: string;
  fecha_hora: string;
  updated_at?: string;
  precio_venta_snapshot?: string | null;
  costo_snapshot?: string | null;
  motivo_rechazo?: string | null;
}

interface PedidosPendientesResponse {
  juego: RawJuegoPedido[];
  barra: RawBarraPedido[];
}

function normalizarJuego(raw: RawJuegoPedido): Pedido {
  return {
    ...raw,
    origen: 'juego',
    status: raw.status.toLowerCase() as PedidoStatus,
    precio_unitario:
      typeof raw.precio_unitario === "string"
        ? parseFloat(raw.precio_unitario)
        : raw.precio_unitario,
  };
}

function normalizarBarra(raw: RawBarraPedido): Pedido {
  return {
    id: raw.id,
    origen: 'barra',
    juego_id: raw.personal_id,
    partida_id: null,
    producto_id: raw.producto_id,
    producto_nombre: raw.producto_nombre_snapshot ?? undefined,
    mesera_nombre: raw.mesera_nombre,
    cantidad: raw.cantidad,
    precio_unitario:
      typeof raw.precio_unitario === "string"
        ? parseFloat(raw.precio_unitario)
        : raw.precio_unitario,
    fecha_hora: raw.fecha_hora,
    notas: raw.notas ?? null,
    motivo_rechazo: raw.motivo_rechazo ?? null,
    turno_caja_id: null,
    status: raw.status.toLowerCase() as PedidoStatus,
    tipo: 'individual',
  };
}

export interface ActualizarEstadoBody {
  status: PedidoStatus;
  motivo_rechazo?: string;
  turno_caja_id?: number;
  metodo_pago?: string;
}

export const pedidosService = {
  getPendientes: () =>
    api
      .get<PedidosPendientesResponse>("/api/v1/consumos/pendientes")
      .then((r) => [
        ...(r.data.juego ?? []).map(normalizarJuego),
        ...(r.data.barra ?? []).map(normalizarBarra),
      ]),

  actualizarEstadoBatch: (body: {
    consumo_ids: number[];
    status: PedidoStatus;
    turno_caja_id?: number;
    metodo_pago?: string;
  }) =>
    api.patch("/api/v1/consumos/juego/batch-update", body).then((r) => r.data),

  actualizarEstadoBarra: (
    personal_id: number,
    item_id: number,
    body: { status: PedidoStatus; motivo_rechazo?: string; turno_caja_id?: number; metodo_pago?: string },
  ) =>
    api
      .patch(`/api/v1/consumos/barra/${personal_id}/items/${item_id}/estado`, body)
      .then((r) => r.data),

  cancelarJuego: (consumoId: number) =>
    api.post(`/api/v1/consumos/juego/${consumoId}/cancelar`).then((r) => r.data),
};
