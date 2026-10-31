# Flujo de Pedidos (Consumos)

Documento técnico que describe el flujo completo de pedidos entre la **App Mesera** (móvil) y el **Panel Admin** (web), incluyendo los cambios implementados para soportarlo.

---

## Flujo del Negocio

```
Mesera (App)                     Admin (Web)                       Caja
─────────────────────────────────────────────────────────────────────────
1. Registra pedido               ←── WS: pedido_nuevo
   (2 cervezas = $18.000)            Admin ve pedido en lista

2.                               Admin ACEPTA pedido
   WS: pedido_actualizado ──►        status: aceptado
   (App muestra confirmación)

   — o —

   WS: pedido_actualizado ──►    Admin RECHAZA pedido
   (App muestra rechazo)             status: rechazado + motivo

3. Mesera va a barra
   y paga al admin               Admin marca ENTREGADO
                                     turno_caja_id = turno activo
                                     status: entregado            ──► Pago queda
                                 WS: pedido_actualizado               en turno_caja
```

---

## Estados del Pedido

```
PENDIENTE ──► ACEPTADO ──► ENTREGADO
     │              │
     └──► RECHAZADO └──► CANCELADO
```

| Status      | Quién puede setearlo | Descripción                              |
|-------------|---------------------|------------------------------------------|
| `pendiente` | Sistema (al crear)  | Pedido recién creado, esperando revisión |
| `aceptado`  | Admin               | Admin confirmó, mesera puede prepararlo  |
| `rechazado` | Admin               | Admin rechazó, se notifica a la app      |
| `entregado` | Admin               | Mesera pagó y retiró el pedido           |
| `cancelado` | Admin / Mesera      | Cancelado en cualquier punto             |

---

## Eventos WebSocket

Canal: `billar:{billar_id}:pedidos`

### `pedido_nuevo`
Publicado cuando la mesera crea un pedido. El panel admin lo escucha para mostrarlo en tiempo real.

```json
{
  "event": "pedido_nuevo",
  "billar_id": 1,
  "payload": {
    "consumo_id": 42,
    "juego_id": 5,
    "producto_id": 10,
    "producto_nombre": "Cerveza Águila",
    "cantidad": 2,
    "precio_unitario": 9000.00,
    "precio_total": 18000.00,
    "jugador_alias": "Juan",
    "mesera_id": 3
  }
}
```

### `pedido_actualizado`
Publicado cuando admin cambia el estado. La **app mesera** lo escucha para notificar aceptación, rechazo o cancelación.

```json
{
  "event": "pedido_actualizado",
  "billar_id": 1,
  "payload": {
    "consumo_id": 42,
    "juego_id": 5,
    "status": "aceptado",
    "motivo_rechazo": null
  }
}
```

```json
{
  "event": "pedido_actualizado",
  "billar_id": 1,
  "payload": {
    "consumo_id": 42,
    "juego_id": 5,
    "status": "rechazado",
    "motivo_rechazo": "Sin stock de cerveza"
  }
}
```

---

## Endpoints Involucrados

### App Mesera

#### Crear pedido
```
POST /consumos/juego
Authorization: Bearer <token_mesera>

{
  "juego_id": 5,
  "producto_id": 10,
  "cantidad": 2,
  "jugador_alias": "Juan",
  "notas": null
}
```
Respuesta `201`:
```json
{
  "success": true,
  "data": { "id": 42, "status": "pendiente", ... },
  "message": "Consumo registrado"
}
```

#### Ver consumos de un juego
```
GET /consumos/juego/{juego_id}?status=pendiente
Authorization: Bearer <token_mesera>
```

---

### Panel Admin

#### Ver todos los pedidos activos del billar
```
GET /consumos/pendientes
Authorization: Bearer <token_admin>
```
Retorna pedidos en estado `pendiente` y `aceptado`.

```json
{
  "success": true,
  "data": {
    "juego": [ { "id": 42, "status": "pendiente", ... } ],
    "barra": []
  }
}
```

#### Aceptar pedido
```
PATCH /consumos/juego/42/estado
Authorization: Bearer <token_admin>

{ "status": "aceptado" }
```

#### Rechazar pedido
```
PATCH /consumos/juego/42/estado
Authorization: Bearer <token_admin>

{
  "status": "rechazado",
  "motivo_rechazo": "Sin stock de cerveza"
}
```

#### Marcar como entregado/pagado
```
PATCH /consumos/juego/42/estado
Authorization: Bearer <token_admin>

{
  "status": "entregado",
  "turno_caja_id": 7
}
```
`turno_caja_id` es el ID del turno de caja activo. Obtenerlo desde `GET /caja/{caja_id}/turno/activo`.

---

## Cambios Implementados en el API

### Nuevos campos en `consumo_x_juego`

| Campo            | Tipo         | Descripción                                      |
|------------------|--------------|--------------------------------------------------|
| `motivo_rechazo` | `VARCHAR(200)` | Razón del rechazo (opcional, solo en rechazado) |
| `turno_caja_id`  | `INTEGER FK` | Turno de caja al que se registró el pago         |

### Nuevos valores del enum `PedidoStatus`

- `aceptado` — pedido aceptado por admin
- `rechazado` — pedido rechazado por admin

### Eventos WebSocket publicados

- `crear_consumo_juego` → publica `pedido_nuevo`
- `actualizar_estado_consumo_juego` → publica `pedido_actualizado`


---

## Cambios Requeridos en el Front Admin (Web)

### 1. Conectar WebSocket al canal `pedidos`

### 2. Página de pedidos
- Al cargar: `GET /consumos/pendientes` para lista inicial
- En tiempo real: escuchar `pedido_nuevo` y `pedido_actualizado` por WS
- Botones por pedido: **Aceptar** | **Rechazar** (con campo motivo) | **Marcar entregado**

### 3. Para "Marcar entregado"
- Obtener el turno activo: `GET /caja/{caja_id}/turno/activo`
- Usar ese `turno_caja_id` en el body del PATCH

---

## Cambios Requeridos en la App Mesera (Móvil)

### 1. Conectar WebSocket al canal `pedidos`
La app debe conectarse al mismo canal para recibir notificaciones de sus pedidos.

### 2. UI de pedidos
- Badge/indicador visual por estado: pendiente / aceptado / rechazado / entregado
- Push notification o in-app alert cuando llega `pedido_actualizado` con status `rechazado` o `cancelado`
