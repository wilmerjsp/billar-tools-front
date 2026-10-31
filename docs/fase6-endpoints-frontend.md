# Fase 6 — Endpoints para el Frontend

Guía de integración de los endpoints **nuevos** y **modificados** de la fase 6
(caja, cuentas de barra, combos e inventario). Todos los paths llevan el
prefijo `/api/v1`. Formato de respuesta estándar:

```json
{ "success": true, "message": "...", "data": { } }
```

Errores:

```json
{ "success": false, "error": { "code": "CODIGO", "message": "...", "details": { } } }
```

> `error.details` es **nuevo** en esta fase (antes no existía el campo): llega
> `null` salvo en los errores que se indican abajo.

---

## 1. Caja

### 1.1 `PATCH /caja/{caja_id}` — **NUEVO** (rol: admin)

Renombrar una caja.

```json
// Request
{ "nombre": "Caja Barra" }
// Response 200 → data: CajaResponse
{ "id": 3, "billar_id": 1, "nombre": "Caja Barra", "activa": true }
```

Errores: `404 CAJA_NOT_FOUND`, `422 CAJA_DUPLICADA` (nombre ya usado por otra
caja del billar).

### 1.2 `DELETE /caja/{caja_id}` — **NUEVO** (rol: admin)

Borrado lógico (`activa = false`). El historial de turnos/facturas se conserva.

- `200` → `{ "message": "Caja eliminada" }`
- `422 CAJA_CON_TURNO_ABIERTO` — hay un turno abierto; cerrar primero.
- `404 CAJA_NOT_FOUND` — no existe o ya está inactiva.
- `403` si el rol es cajero.

### 1.3 `GET /caja` — **MODIFICADO** (rol: cajero+)

- Ahora devuelve **solo cajas activas** por defecto.
- Nuevo query param `?incluir_inactivas=true` para verlas todas (cada item
  trae el campo `activa`).

### 1.4 `POST /caja` — **MODIFICADO** (rol: admin)

- Si existe una caja **inactiva** con el mismo nombre, se **reactiva** (mismo
  `id`, conserva historial) y responde `201` normal.
- Si existe una caja **activa** con el mismo nombre → `422 CAJA_DUPLICADA`.

### 1.5 `POST /caja/{caja_id}/turno/cerrar` — **MODIFICADO** (rol: cajero+)

Dos cambios importantes:

**a) Puede fallar con `409 CIERRE_CAJA_BLOQUEADO`** si en el billar hay juegos
en curso, juegos sin cobrar o cuentas de barra sin facturar (aplica siempre,
aunque haya otra caja abierta):

```json
{
  "success": false,
  "error": {
    "code": "CIERRE_CAJA_BLOQUEADO",
    "message": "No se puede cerrar la caja: hay 1 juego(s) en curso, 2 cuenta(s) de barra sin facturar",
    "details": {
      "juegos_en_curso":   [{ "juego_id": 12, "mesa": "Mesa 3", "status": "en_juego" }],
      "juegos_sin_cobrar": [{ "juego_id": 15, "mesa": "Mesa 1", "status": "finalizado" }],
      "barras_abiertas":   [{ "personal_id": 8, "tipo": "mesera", "nombre": "Laura",
                              "descripcion": null, "status": "abierto" }]
    }
  }
}
```

El front debe mostrar estos recursos como lista accionable (ir al juego / a la
cuenta) antes de reintentar el cierre.

**b) Cambió la semántica de `monto_sistema`**: ahora es el **efectivo
esperado en caja** = apertura + ventas en efectivo − comisiones de meseras
+ ingresos manuales − egresos manuales. Las ventas con tarjeta/transferencia
ya **no** suman a `monto_sistema` (se reportan aparte en `por_metodo_pago`).
`diferencia = monto_cierre − monto_sistema` sigue igual. Ajustar cualquier
pantalla de arqueo que asumiera que `monto_sistema` incluía todos los métodos.

### 1.6 `GET /caja/{caja_id}/turno/pre-cierre` — **NUEVO** (rol: cajero+)

Chequeo previo al cierre, sin cerrar nada. Ideal para deshabilitar el botón
"Cerrar turno" y listar los bloqueos.

```json
// Response 200 → data: PreCierreResponse
{
  "puede_cerrar": false,
  "juegos_en_curso":   [{ "juego_id": 12, "mesa": "Mesa 3", "status": "en_juego" }],
  "juegos_sin_cobrar": [],
  "barras_abiertas":   []
}
```

`422 NO_TURNO_ABIERTO` si la caja no tiene turno activo.

### 1.7 `GET /caja/{caja_id}/turno/activo/resumen` — **NUEVO** (rol: cajero+)

Resumen en vivo del turno abierto (para el dashboard de caja).

```json
// Response 200 → data: ResumenTurnoActivoResponse
{
  "turno_id": 45,
  "fecha_apertura": "2026-07-14T08:00:00Z",
  "monto_apertura": "100.00",
  "total_bruto": "300.00",
  "total_comisiones": "30.00",
  "total_ingresos": "270.00",
  "total_anulado": "0.00",
  "count_movimientos": 2,
  "count_anulados": 0,
  "por_metodo_pago": { "efectivo": "200.00", "transferencia": "100.00" },
  "ingresos_manuales": "50.00",
  "egresos_manuales": "20.00",
  "efectivo_esperado": "300.00"
}
```

`422 NO_TURNO_ABIERTO` si no hay turno.

### 1.8 `POST /caja/{caja_id}/movimientos` — **NUEVO** (rol: cajero+)

Registrar ingreso/egreso manual de efectivo en el turno abierto (gastos,
retiros, base adicional).

```json
// Request
{ "tipo": "egreso", "concepto": "Compra de hielo", "monto": "20.00" }
// tipo: "ingreso" | "egreso"; monto > 0; concepto máx 150 chars

// Response 201 → data: CajaMovimientoResponse
{
  "id": 7, "turno_caja_id": 45, "tipo": "egreso",
  "concepto": "Compra de hielo", "monto": "20.00",
  "user_admin_id": 2, "user_caja_id": null,
  "fecha_hora": "2026-07-14T14:30:00Z"
}
```

`422 NO_TURNO_ABIERTO` si la caja no tiene turno abierto.

### 1.9 `GET /caja/turnos/{turno_id}/movimientos` — **NUEVO** (rol: cajero+)

Lista de movimientos manuales de un turno (abierto o cerrado). Response:
`data: CajaMovimientoResponse[]`.

### 1.10 `GET /caja/turnos/{turno_id}` — **MODIFICADO** (rol: cajero+)

El detalle de turno ahora incluye:

- `movimientos_caja`: `CajaMovimientoResponse[]` (movimientos manuales).
- `resumen` con campos nuevos: `por_metodo_pago`, `ingresos_manuales`,
  `egresos_manuales`, `efectivo_esperado` (además de los existentes
  `total_bruto`, `total_comisiones`, `total_ingresos`, `total_anulado`,
  `count_movimientos`, `count_anulados`).

---

## 2. Cuentas de barra y pedidos

### 2.1 `GET /consumos/barra` — **MODIFICADO**

Ahora accesible para el rol **cajero** (antes solo admin/superadmin). Sin
cambios de shape.

### 2.2 `POST /consumos/juego/{consumo_id}/cancelar` — **MODIFICADO**

Ahora accesible para el rol **cajero**. Sin cambios de shape. El front puede
habilitar el botón de cancelar pedido para cajeros.

### 2.3 Cobros en general — **NUEVO ERROR POSIBLE**

Cualquier endpoint que facture (cobrar barra, cobrar juego, entregar pedido)
puede devolver `422 TURNO_DE_OTRO_BILLAR` si el `turno_caja_id` enviado no
pertenece al billar de la sesión. Con un solo billar por sesión no debería
ocurrir; tratarlo como error genérico "turno inválido, recarga las cajas".

---

## 3. Productos y combos

### 3.1 `POST /productos` — **MODIFICADO** (rol: admin)

Acepta crear combos:

```json
// Request (combo)
{
  "categoria_id": 2,
  "nombre": "Botella de Ron + Soda",
  "precio": "85.00",
  "es_combo": true,
  "combo_items": [
    { "producto_id": 10, "cantidad": "1" },
    { "producto_id": 11, "cantidad": "1" }
  ]
}
```

Reglas:
- Con `es_combo: true`, `combo_items` es obligatorio (≥1) y el backend fuerza
  `lleva_inventario: false` (el stock del combo es virtual). Ignorar
  `stock_inicial`/`stock_minimo` en el form de combos.
- Los componentes deben ser productos del mismo billar y **no** pueden ser
  combos.

Errores nuevos (todos `422`): `COMBO_SIN_ITEMS`, `COMBO_ITEM_DUPLICADO`,
`COMBO_ANIDADO`, y `404` si un componente no existe.

### 3.2 `PATCH /productos/{producto_id}` — **MODIFICADO** (rol: admin)

Acepta `combo_items` para **reemplazar** la composición completa de un combo
(enviar la lista final, no un delta). Editar la composición no altera ventas
pasadas. `422 NO_ES_COMBO` si el producto no es combo. No se puede convertir
un producto existente en combo ni viceversa.

### 3.3 `GET /productos` y responses de producto — **MODIFICADO**

Todo `ProductoOut` (listados, crear, editar, toggle disponibilidad) incluye
ahora:

```json
{
  "es_combo": true,
  "combo_items": [
    { "producto_id": 10, "cantidad": "1.00",
      "producto": { "id": 10, "nombre": "Ron", "precio": "80.00",
                    "disponible": true, "imagen_url": null } }
  ],
  "stock_disponible": "5"
}
```

- `stock_disponible` (solo combos, `null` en productos normales): unidades
  vendibles = mínimo entre `stock_componente / cantidad_requerida`. Nota: el
  listado se cachea ~5 min, así que este valor puede estar levemente
  desactualizado; la validación real ocurre al vender.
- En productos normales `es_combo: false` y `combo_items: []`.

### 3.4 Venta de combos — sin cambios de integración

Un combo se vende como cualquier producto (mismo `producto_id` en pedidos de
juego, barra y barra admin; una sola línea en factura y reportes). El
inventario descuenta cada componente automáticamente. Si un componente no
alcanza, el error `422 STOCK_INSUFICIENTE` indica **cuál** componente en el
`message` y no se descuenta nada.

---

## 4. Inventario avanzado (ítem D)

### 4.1 Costo de producto — **MODIFICADO**

`POST /productos` y `PATCH /productos/{id}` aceptan `precio_costo`
(opcional, ≥ 0), y todo `ProductoOut` lo incluye (`null` si no está definido).
Sirve para valorización y margen; el precio de venta sigue siendo `precio`.

### 4.2 `POST /inventario/compras` — **NUEVO** (rol: admin)

Entrada de inventario por compra, con costo unitario. A diferencia del ajuste
(`POST /inventario/ajuste`), queda registrada con `referencia_tipo: "compra"`.

```json
// Request
{
  "producto_id": 10,
  "cantidad": "24",
  "costo_unitario": "2.50",
  "nota": "Compra distribuidor",          // opcional, máx 100
  "actualizar_precio_costo": true          // default true: fija precio_costo al último costo
}
// Response 201 → data: InventarioConProductoOut (stock ya sumado)
```

Errores: `404 PRODUCTO_NOT_FOUND`, `403` (producto de otro billar),
`422 SIN_CONTROL_INVENTARIO` (producto con `lleva_inventario: false`).

### 4.3 `POST /inventario/conteo-fisico` — **NUEVO** (rol: admin)

Ajuste masivo por conteo físico: fija el stock de cada producto al valor
contado (solo genera movimiento para los que difieren).

```json
// Request
{
  "nota": "Cierre de mes",                 // opcional, máx 80
  "items": [
    { "producto_id": 10, "cantidad_contada": "7" },
    { "producto_id": 11, "cantidad_contada": "8" }
  ]
}
// Response 201 → data: ConteoFisicoOut
{
  "productos_contados": 2,
  "productos_ajustados": 1,
  "resultados": [
    { "producto_id": 10, "producto_nombre": "Ron",
      "stock_anterior": "10.00", "stock_contado": "7", "diferencia": "-3.00" },
    { "producto_id": 11, "producto_nombre": "Soda",
      "stock_anterior": "8.00", "stock_contado": "8", "diferencia": "0.00" }
  ]
}
```

Errores (`422`): `CONTEO_DUPLICADO` (producto repetido en items),
`SIN_CONTROL_INVENTARIO`. Valida todo antes de ajustar nada.

### 4.4 `GET /productos/{producto_id}/inventario/kardex` — **NUEVO** (rol: admin)

Movimientos del producto con el **stock resultante (saldo)** por fila, más
reciente primero.

Query params: `tipo` (`entrada|salida|ajuste`), `fecha_desde`, `fecha_hasta`,
`page` (default 1), `page_size` (default 50, máx 200).

```json
// Response 200 → data: KardexOut
{
  "producto": { "id": 10, "nombre": "Ron", "precio": "80.00", "disponible": true, "imagen_url": null },
  "stock_actual": "36.00",
  "total": 3, "page": 1, "page_size": 50,
  "items": [
    { "id": 88, "fecha_hora": "...", "tipo": "entrada", "cantidad": "6.00",
      "costo_unitario": "2.00", "motivo": "Compra de inventario",
      "referencia_id": null, "referencia_tipo": "compra",
      "usuario_id": 2, "usuario_tipo": "user_admin", "saldo": "36.00" }
  ]
}
```

Notas:
- `saldo` puede ser `null` en movimientos históricos anteriores a un ajuste
  cuyo stock previo no es reconstruible (datos previos a esta fase). Mostrar
  "—" en ese caso. Los productos creados desde ahora registran su stock
  inicial como movimiento ("Stock inicial"), así que su kardex es completo.
- `422 SIN_CONTROL_INVENTARIO` si el producto no lleva inventario (incluye
  combos: su stock es virtual, consultar el kardex de los componentes).

### 4.5 `GET /inventario/valorizado` — **NUEVO** (rol: admin)

Inventario valorizado a costo y a precio de venta, ordenado por nombre.

```json
// Response 200 → data: ValorizadoOut
{
  "items": [
    { "producto_id": 10, "producto_nombre": "Ron", "categoria": "Licores",
      "stock_actual": "10.00", "stock_minimo": "1.00",
      "precio_costo": "50.00", "precio_venta": "80.00",
      "valor_costo": "500.00", "valor_venta": "800.00" }
  ],
  "total_valor_costo": "500.00",
  "total_valor_venta": "860.00",
  "productos_sin_costo": 1
}
```

`valor_costo` es `null` para productos sin `precio_costo`;
`productos_sin_costo` cuenta cuántos hay (útil para avisar al admin que
complete costos).
