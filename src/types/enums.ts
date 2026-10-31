export enum MesaStatus {
  DISPONIBLE = 'disponible',
  OCUPADA = 'ocupada',
  RESERVADA = 'reservada',
  MANTENIMIENTO = 'mantenimiento',
}

export enum TipoMesa {
  POOL = 'pool',
  SNOOKER = 'snooker',
  CARAMBOLA = 'carambola',
  DOMINO = 'domino',
}

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  CAJERO = 'cajero',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  TRANSFERENCIA = 'transferencia',
  MIXTO = 'mixto',
}

export enum OrigenTipo {
  JUEGO = 'juego',
  BARRA = 'barra',
  CONSUMO_JUEGO = 'consumo_juego',
  CONSUMO_BARRA = 'consumo_barra',
}

export enum EstadoFactura {
  EMITIDA = 'emitida',
  PAGADA = 'pagada',
  ANULADA = 'anulada',
}

export enum TipoAjusteInventario {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  AJUSTE = 'ajuste',
}

export enum EstadoConsumoItem {
  PENDIENTE = 'pendiente',
  EN_PREPARACION = 'en_preparacion',
  ENTREGADO = 'entregado',
}

export enum PedidoStatus {
  PENDIENTE = 'pendiente',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
}

export enum EstadoJuego {
  EN_JUEGO = 'en_juego',
  PAUSADO = 'pausado',
  CERRADO = 'cerrado',
  FINALIZADO = 'finalizado',
  FACTURADO = 'facturado',
}
