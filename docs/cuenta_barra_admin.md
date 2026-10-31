# Cuenta de Barra Admin

Endpoints para gestionar cuentas de barra creadas directamente por admin o cajero. A diferencia de las cuentas de barra de mesera, los items se marcan como **entregados inmediatamente** al agregarlos (sin flujo de aprobación), y el pago se procesa al final en una sola operación.

**Autenticación:** Bearer token de `user_admin` con `rol_sucursal` en `admin | cajero | superadmin`.

**Base URL:** `/consumos/barra/admin`

---

## Flujo completo

```
1. POST /consumos/barra/admin           → Abrir cuenta
2. POST /consumos/barra/admin/{id}/items → Agregar productos (repetir N veces)
3. DELETE /consumos/barra/admin/{id}/items/{item_id} → Quitar item (opcional)
4. GET /consumos/barra/admin/{id}        → Ver resumen antes de cobrar
5. POST /consumos/barra/admin/{id}/cobrar → Cobrar y generar factura
```

---

## Endpoints

### 1. Abrir cuenta de barra

**POST** `/consumos/barra/admin`

Crea una nueva cuenta de barra asociada al admin autenticado.

#### Headers
```
Authorization: Bearer <token_admin>
Content-Type: application/json
```

#### Body
```json
{
  "descripcion": "Mesa 5 - Juan"   // opcional, para identificar al cliente
}
```

#### Response `201`
```json
{
  "success": true,
  "message": "Cuenta de barra abierta",
  "data": {
    "id": 42,
    "billar_id": 1,
    "admin_id": 3,
    "admin_nombre": null,
    "descripcion": "Mesa 5 - Juan",
    "fecha_hora": "2026-05-13T10:00:00Z",
    "status": "abierto",
    "items": [],
    "total": 0
  }
}
```

> Guardar el `id` devuelto para los siguientes pasos.

---

### 2. Agregar producto a la cuenta

**POST** `/consumos/barra/admin/{personal_id}/items`

Agrega un producto a la cuenta. El item queda en estado `entregado` inmediatamente y el inventario se descuenta en ese momento.

#### Path params
| Param | Tipo | Descripción |
|-------|------|-------------|
| `personal_id` | int | ID de la cuenta (del paso 1) |

#### Body
```json
{
  "producto_id": 15,
  "cantidad": 2,
  "notas": "Sin hielo"   // opcional
}
```

#### Response `201`
```json
{
  "success": true,
  "message": "Item agregado",
  "data": {
    "id": 201,
    "personal_id": 42,
    "producto_id": 15,
    "producto_nombre_snapshot": "Cerveza Club Colombia",
    "cantidad": 2,
    "precio_unitario": "7000.00",
    "subtotal": "14000.00",
    "notas": "Sin hielo",
    "status": "entregado",
    "fecha_hora": "2026-05-13T10:05:00Z"
  }
}
```

#### Errores posibles
| Código | Mensaje |
|--------|---------|
| `404` | Producto o cuenta no encontrada |
| `409 CUENTA_CERRADA` | La cuenta ya fue cobrada |
| `409 STOCK_INSUFICIENTE` | No hay stock suficiente |
| `409 SIN_INVENTARIO` | Producto sin inventario configurado |
| `409 PRODUCTO_OTRO_BILLAR` | Producto de otro billar |

---

### 3. Quitar item de la cuenta

**DELETE** `/consumos/barra/admin/{personal_id}/items/{item_id}`

Cancela un item de la cuenta y restaura el inventario si aplica. Solo funciona con cuentas en estado `abierto`.

#### Path params
| Param | Tipo | Descripción |
|-------|------|-------------|
| `personal_id` | int | ID de la cuenta |
| `item_id` | int | ID del item a quitar |

#### Response `200`
```json
{
  "success": true,
  "message": "Item eliminado",
  "data": null
}
```

#### Errores posibles
| Código | Mensaje |
|--------|---------|
| `409 YA_CANCELADO` | El item ya está cancelado |
| `409 CUENTA_CERRADA` | La cuenta ya fue cobrada |

---

### 4. Ver detalle de la cuenta

**GET** `/consumos/barra/admin/{personal_id}`

Retorna el estado actual de la cuenta con todos sus items y el total a cobrar.

#### Response `200`
```json
{
  "success": true,
  "data": {
    "id": 42,
    "billar_id": 1,
    "admin_id": 3,
    "admin_nombre": "Carlos Administrador",
    "descripcion": "Mesa 5 - Juan",
    "fecha_hora": "2026-05-13T10:00:00Z",
    "status": "abierto",
    "items": [
      {
        "id": 201,
        "personal_id": 42,
        "producto_id": 15,
        "producto_nombre_snapshot": "Cerveza Club Colombia",
        "cantidad": 2,
        "precio_unitario": "7000.00",
        "subtotal": "14000.00",
        "notas": "Sin hielo",
        "status": "entregado",
        "fecha_hora": "2026-05-13T10:05:00Z"
      },
      {
        "id": 202,
        "personal_id": 42,
        "producto_id": 8,
        "producto_nombre_snapshot": "Agua Cristal 600ml",
        "cantidad": 1,
        "precio_unitario": "3000.00",
        "subtotal": "3000.00",
        "notas": null,
        "status": "cancelado",
        "fecha_hora": "2026-05-13T10:07:00Z"
      }
    ],
    "total": "14000.00"   // suma solo items no cancelados
  }
}
```

> El campo `total` excluye items con `status = "cancelado"`.

---

### 5. Cobrar la cuenta (generar factura)

**POST** `/consumos/barra/admin/{personal_id}/cobrar`

Cierra la cuenta, genera la factura y registra el movimiento en caja. Después de este paso la cuenta queda en estado `facturado` y no admite más cambios.

#### Body
```json
{
  "turno_caja_id": 7,
  "metodo_pago": "efectivo"   // efectivo | tarjeta | transferencia | mixto
}
```

#### Response `200`
```json
{
  "success": true,
  "message": "Cuenta cobrada y facturada",
  "data": null
}
```

#### Errores posibles
| Código | Mensaje |
|--------|---------|
| `409 CUENTA_NO_ABIERTA` | La cuenta ya fue cobrada o cerrada antes |
| `409 SIN_ITEMS` | La cuenta no tiene items activos para cobrar |

---

### 6. Listar cuentas admin abiertas

**GET** `/consumos/barra/admin/activas`

Retorna todas las cuentas de barra admin en estado `abierto` para el billar del admin autenticado. Útil para mostrar las cuentas en curso en el panel web.

#### Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "billar_id": 1,
      "admin_id": 3,
      "admin_nombre": "Carlos Administrador",
      "descripcion": "Mesa 5 - Juan",
      "fecha_hora": "2026-05-13T10:00:00Z",
      "status": "abierto",
      "items": [],
      "total": "14000.00"
    }
  ]
}
```

---

## Notas de implementación para el frontend

### Estados de cuenta
| Status | Descripción |
|--------|-------------|
| `abierto` | En curso, se pueden agregar/quitar items |
| `cerrado` | Cerrada, pendiente de cobro (no aplica para flujo admin) |
| `facturado` | Cobrada y facturada, solo consulta |

### Estados de item
| Status | Descripción |
|--------|-------------|
| `entregado` | Consumido, suma al total |
| `cancelado` | Quitado, NO suma al total |

### Flujo de pantalla sugerido

```
┌─────────────────────────────────────────────────┐
│  NUEVA CUENTA DE BARRA                          │
│  Descripción: [_________________]               │
│  [Abrir Cuenta]                                 │
└─────────────────────────────────────────────────┘
               ↓ POST /barra/admin
┌─────────────────────────────────────────────────┐
│  CUENTA #42 — Mesa 5 - Juan            ABIERTA  │
│                                                  │
│  Buscar producto: [__________] [Agregar]         │
│                                                  │
│  Items:                                          │
│  ✓ Cerveza Club Colombia x2     $14,000  [×]    │
│  ✓ Agua Cristal 600ml x1         $3,000  [×]    │
│                                                  │
│  ─────────────────────────────────────           │
│  TOTAL                          $17,000          │
│                                                  │
│  [COBRAR]                                        │
└─────────────────────────────────────────────────┘
               ↓ POST /barra/admin/{id}/cobrar
┌─────────────────────────────────────────────────┐
│  Método de pago: [efectivo ▾]                   │
│  Turno de caja: [Turno #7 ▾]                    │
│  [Confirmar pago $17,000]                        │
└─────────────────────────────────────────────────┘
```

### Campos que necesitas de otros endpoints
- **Productos disponibles**: `GET /productos?billar_id={id}` — para el buscador de productos
- **Turno de caja activo**: `GET /caja/turno/activo` — para el selector del formulario de cobro
