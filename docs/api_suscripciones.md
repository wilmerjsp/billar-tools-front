# Módulo de Suscripciones

> **Autorización:** Todos los endpoints de este módulo requieren rol `superadmin`.
> El header `Authorization: Bearer <token>` es obligatorio en todas las peticiones.

---

## Tipos compartidos

### `PeriodoFacturacion`
```
"mes" | "semestre" | "anual"
```

### `PlanSuscripcionResponse`
```json
{
  "id": 1,
  "nombre": "pro",
  "max_admins": 2,
  "max_cajas": 2,
  "max_cajeros": 3,
  "max_meseras": 6,
  "activo": true,
  "precios": [
    { "periodo": "mes",      "precio": "50.00" },
    { "periodo": "semestre", "precio": "270.00" },
    { "periodo": "anual",    "precio": "480.00" }
  ]
}
```

### `SuscripcionResponse`
```json
{
  "id": 1,
  "billar_id": 3,
  "plan_id": 2,
  "periodo": "mes",
  "fecha_inicio": "2026-05-07T14:00:00Z",
  "fecha_fin": "2026-06-07T06:00:00Z",
  "activa": true,
  "monto_cobrado": "50.00",
  "plan": { /* PlanSuscripcionResponse */ }
}
```

> `fecha_fin` siempre está fijada a las **06:00 AM** del día de vencimiento.

### Envelope de respuesta exitosa
```json
{ "success": true, "data": { /* objeto o array */ }, "message": "OK" }
```

### Envelope de error
```json
{ "success": false, "error": { "code": "CODIGO_ERROR", "message": "Descripción del error" } }
```

---

## Planes

### `GET /api/v1/suscripciones/planes`
Lista todos los planes activos con sus precios por periodo.

**Respuesta 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "demo",
      "max_admins": 1,
      "max_cajas": 1,
      "max_cajeros": 0,
      "max_meseras": 1,
      "activo": true,
      "precios": []
    },
    {
      "id": 2,
      "nombre": "basico",
      "max_admins": 1,
      "max_cajas": 1,
      "max_cajeros": 1,
      "max_meseras": 3,
      "activo": true,
      "precios": [
        { "periodo": "mes",      "precio": "50.00" },
        { "periodo": "semestre", "precio": "270.00" },
        { "periodo": "anual",    "precio": "480.00" }
      ]
    }
  ],
  "message": "OK"
}
```

---

### `POST /api/v1/suscripciones/planes`
Crea un nuevo plan de suscripción.

**Body**
```json
{
  "nombre": "enterprise",
  "max_admins": 5,
  "max_cajas": 5,
  "max_cajeros": 10,
  "max_meseras": 20
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `nombre` | string (max 50) | ✓ | Nombre único del plan |
| `max_admins` | integer (≥ 0) | ✓ | Límite de administradores |
| `max_cajas` | integer (≥ 0) | ✓ | Límite de cajas |
| `max_cajeros` | integer (≥ 0) | ✓ | Límite de cajeros |
| `max_meseras` | integer (≥ 0) | ✓ | Límite de meseras |

**Respuesta 201** — `PlanSuscripcionResponse` (precios vacíos hasta configurarlos)

**Errores**
| Código HTTP | `error.code` | Causa |
|---|---|---|
| 409 | `PLANSUSCRIPCION_CONFLICT` | Ya existe un plan con ese nombre |

---

### `PATCH /api/v1/suscripciones/planes/{plan_id}`
Actualiza límites o estado activo de un plan. Todos los campos son opcionales.

**Body** (enviar solo los campos a cambiar)
```json
{
  "max_meseras": 8,
  "activo": false
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `max_admins` | integer (≥ 0) \| null | Nuevo límite de admins |
| `max_cajas` | integer (≥ 0) \| null | Nuevo límite de cajas |
| `max_cajeros` | integer (≥ 0) \| null | Nuevo límite de cajeros |
| `max_meseras` | integer (≥ 0) \| null | Nuevo límite de meseras |
| `activo` | boolean \| null | Activar / desactivar el plan |

**Respuesta 200** — `PlanSuscripcionResponse`

**Errores**
| Código HTTP | `error.code` | Causa |
|---|---|---|
| 404 | `PLANSUSCRIPCION_NOT_FOUND` | Plan no encontrado |

---

### `PUT /api/v1/suscripciones/planes/{plan_id}/precios`
Establece o reemplaza el precio de un periodo específico para el plan.
Si ya existía un precio para ese periodo, lo actualiza; si no, lo crea.

**Body**
```json
{
  "periodo": "semestre",
  "precio": "270.00"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `periodo` | `PeriodoFacturacion` | ✓ | Periodo al que aplica el precio |
| `precio` | decimal (≥ 0) | ✓ | Precio para ese periodo |

**Respuesta 201**
```json
{
  "success": true,
  "data": { "periodo": "semestre", "precio": "270.00" },
  "message": "OK"
}
```

**Errores**
| Código HTTP | `error.code` | Causa |
|---|---|---|
| 404 | `PLANSUSCRIPCION_NOT_FOUND` | Plan no encontrado |

---

### `PATCH /api/v1/suscripciones/planes/{plan_id}/precios/{periodo}`
Actualiza únicamente el precio de un periodo ya existente.

**Path params**
- `plan_id` — ID del plan
- `periodo` — `mes` | `semestre` | `anual`

**Body**
```json
{
  "precio": "55.00"
}
```

**Respuesta 200** — `PlanPrecioResponse`

**Errores**
| Código HTTP | `error.code` | Causa |
|---|---|---|
| 404 | `PLANPRECIO_NOT_FOUND` | No existe precio para ese plan/periodo |

---

## Suscripciones

### `POST /api/v1/suscripciones`
Crea una suscripción para un billar.
> El plan `demo` se asigna automáticamente al crear un billar, por lo que este endpoint se usa para asignar planes pagos cuando el billar aún no tiene suscripción registrada de esa forma.

**Body**
```json
{
  "billar_id": 3,
  "plan_id": 2,
  "periodo": "mes"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `billar_id` | integer | ✓ | ID del billar |
| `plan_id` | integer | ✓ | ID del plan a asignar |
| `periodo` | `PeriodoFacturacion` | ✓ | Periodo de facturación |

**Respuesta 201** — `SuscripcionResponse`

**Errores**
| Código HTTP | `error.code` | Causa |
|---|---|---|
| 409 | `SUSCRIPCION_CONFLICT` | El billar ya tiene una suscripción registrada (usar `/renovar`) |
| 404 | `PLANSUSCRIPCION_NOT_FOUND` | Plan no encontrado o inactivo |
| 422 | `PRECIO_NO_CONFIGURADO` | El plan no tiene precio configurado para el periodo solicitado |

---

### `GET /api/v1/suscripciones/billar/{billar_id}`
Consulta la suscripción actual de un billar.

**Respuesta 200** — `SuscripcionResponse`

**Errores**
| Código HTTP | `error.code` | Causa |
|---|---|---|
| 404 | `SUSCRIPCION_NOT_FOUND` | El billar no tiene suscripción |

---

### `POST /api/v1/suscripciones/billar/{billar_id}/renovar`
Renueva o cambia el plan de un billar existente.
Reinicia `fecha_inicio` a `now()` y recalcula `fecha_fin` según el nuevo periodo.
También reactiva la suscripción si estaba vencida.

**Body**
```json
{
  "plan_id": 3,
  "periodo": "anual"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|:---:|---|
| `plan_id` | integer | ✓ | ID del plan (puede ser diferente al actual) |
| `periodo` | `PeriodoFacturacion` | ✓ | Nuevo periodo de facturación |

**Respuesta 200** — `SuscripcionResponse`

**Errores**
| Código HTTP | `error.code` | Causa |
|---|---|---|
| 404 | `SUSCRIPCION_NOT_FOUND` | El billar no tiene suscripción registrada |
| 404 | `PLANSUSCRIPCION_NOT_FOUND` | Plan no encontrado o inactivo |
| 422 | `PRECIO_NO_CONFIGURADO` | El plan no tiene precio configurado para el periodo solicitado |

---

## Comportamiento automático del sistema

### Creación de billar
Al crear un billar via `POST /api/v1/billares`, el sistema crea automáticamente una suscripción demo:
- **Plan:** `demo`
- **Periodo:** `mes`
- **Monto:** `0.00`
- **Fecha fin:** `fecha_creacion + 1 mes` a las **06:00 AM**

### Suscripción vencida
Cuando `fecha_fin` es alcanzada, en el **primer request** de cualquier usuario del billar:
1. La suscripción se marca `activa = false`
2. Todas las conexiones WebSocket del billar se cierran (código `1008`)
3. El request retorna `403 FORBIDDEN`

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "La suscripción del billar está vencida o inactiva"
  }
}
```

> El **superadmin** nunca recibe este error — puede acceder al sistema para gestionar/renovar suscripciones sin importar el estado de la suscripción.

### Límites de plan
Al intentar crear un usuario, cajero, mesera o caja que supera el límite del plan activo:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Límite de meseras alcanzado para el plan 'basico' (3 máximo)"
  }
}
```

---

## Flujo recomendado de configuración inicial

```
1. POST /api/v1/suscripciones/planes           → crear plan "basico"
2. PUT  /api/v1/suscripciones/planes/2/precios → asignar precio mes
3. PUT  /api/v1/suscripciones/planes/2/precios → asignar precio semestre
4. PUT  /api/v1/suscripciones/planes/2/precios → asignar precio anual
5. POST /api/v1/billares                        → crear billar (auto-crea demo)
6. POST /api/v1/suscripciones/billar/3/renovar → asignar plan pago al billar
```
