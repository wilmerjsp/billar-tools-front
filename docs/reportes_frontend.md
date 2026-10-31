# API de Reportes — Guía para Frontend

Documentación de los endpoints del módulo `reportes` para su implementación en el panel Admin Web.

- **Prefijo:** `/reportes`
- **Autenticación:** todos los endpoints requieren rol **admin**. Enviar header `Authorization: Bearer {token}`.
- **Formato de fechas:** `YYYY-MM-DD` (ISO 8601). El backend expande el rango a día completo: `fecha_desde` desde las `00:00:00` y `fecha_hasta` hasta las `23:59:59`.

## Formato general de respuesta

Todas las respuestas JSON exitosas usan la envoltura estándar:

```json
{
  "success": true,
  "data": { },
  "message": "OK"
}
```

Los errores usan:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Turno 15 no encontrado",
    "details": null
  }
}
```

Errores comunes en este módulo:

| HTTP | Código | Cuándo |
|---|---|---|
| 401 | `UNAUTHORIZED` | Token ausente o inválido |
| 403 | `FORBIDDEN` | El usuario no es admin |
| 404 | `NOT_FOUND` | `turno_id` no existe (ventas-por-mesera, cierre-turno) |
| 422 | — | Query params faltantes o con formato inválido (error de validación de FastAPI) |
| 400 | `TIPO_INVALIDO` / `FORMATO_INVALIDO` | Solo en `/exportar` |

---

## 1. Ingresos diarios

Ingresos por día en un rango de fechas, separados por origen (tiempo de mesa vs. consumo).

```
GET /reportes/ingresos-diarios?fecha_desde=2026-06-01&fecha_hasta=2026-06-30
```

**Query params**

| Param | Tipo | Requerido | Descripción |
|---|---|---|---|
| `fecha_desde` | date | Sí | Inicio del rango |
| `fecha_hasta` | date | Sí | Fin del rango |

**Respuesta** — `data` es una lista, un elemento por día con actividad:

```json
{
  "success": true,
  "data": [
    {
      "dia": "2026-06-01",
      "ingresos_tiempo": 150000.0,
      "ingresos_consumo": 85000.0,
      "total": 235000.0
    }
  ],
  "message": "OK"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `dia` | string \| null | Fecha del día (`YYYY-MM-DD`) |
| `ingresos_tiempo` | number | Ingresos por tiempo de juego en mesas |
| `ingresos_consumo` | number | Ingresos por consumo (bar/productos) |
| `total` | number | Suma de ambos |

---

## 2. Ocupación de mesas

Horas de uso y cantidad de juegos por mesa en el rango.

```
GET /reportes/ocupacion-mesas?fecha_desde=2026-06-01&fecha_hasta=2026-06-30
```

**Query params:** `fecha_desde` y `fecha_hasta` (igual que arriba).

**Respuesta** — `data` es una lista, un elemento por mesa:

```json
{
  "success": true,
  "data": [
    {
      "mesa_id": 3,
      "numero": 1,
      "nombre": "Mesa Pool 1",
      "horas_uso": 42.5,
      "total_juegos": 28
    }
  ],
  "message": "OK"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `mesa_id` | number | ID de la mesa |
| `numero` | number | Número visible de la mesa |
| `nombre` | string | Nombre de la mesa |
| `horas_uso` | number | Horas de uso acumuladas (2 decimales) |
| `total_juegos` | number | Cantidad de juegos jugados |

---

## 3. Ventas de productos

Ranking de productos más vendidos en el rango.

```
GET /reportes/ventas-productos?fecha_desde=2026-06-01&fecha_hasta=2026-06-30
```

**Query params:** `fecha_desde` y `fecha_hasta`.

**Respuesta** — `data` es una lista, un elemento por producto:

```json
{
  "success": true,
  "data": [
    {
      "producto_id": 7,
      "nombre": "Cerveza Águila",
      "unidades": 120,
      "ingresos": 480000.0
    }
  ],
  "message": "OK"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `producto_id` | number | ID del producto |
| `nombre` | string | Nombre del producto |
| `unidades` | number (int) | Unidades vendidas |
| `ingresos` | number | Total facturado por el producto |

---

## 4. Rendimiento de meseras

Pedidos atendidos y consumo generado por mesera en el rango.

```
GET /reportes/rendimiento-meseras?fecha_desde=2026-06-01&fecha_hasta=2026-06-30
```

**Query params:** `fecha_desde` y `fecha_hasta`.

**Respuesta** — `data` es una lista, un elemento por mesera:

```json
{
  "success": true,
  "data": [
    {
      "mesera_id": 2,
      "nombre": "María Gómez",
      "pedidos_atendidos": 45,
      "consumo_generado": 320000.0
    }
  ],
  "message": "OK"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `mesera_id` | number | ID de la mesera |
| `nombre` | string | Nombre completo |
| `pedidos_atendidos` | number | Cantidad de pedidos atendidos |
| `consumo_generado` | number | Valor total del consumo generado |

---

## 5. Ventas por mesera (turno de caja)

Detalle de productos vendidos por cada mesera dentro de un turno de caja específico. Combina ventas de juego y de barra.

```
GET /reportes/ventas-por-mesera?turno_id=15
```

**Query params**

| Param | Tipo | Requerido | Descripción |
|---|---|---|---|
| `turno_id` | number | Sí | ID del turno de caja |

**Respuesta** — `data` es un objeto:

```json
{
  "success": true,
  "data": {
    "turno_id": 15,
    "fecha_apertura": "2026-06-30T14:00:00",
    "fecha_cierre": "2026-06-30T23:45:00",
    "status": "cerrado",
    "meseras": [
      {
        "mesera_id": 2,
        "nombre": "María Gómez",
        "productos": [
          {
            "producto_id": 7,
            "nombre": "Cerveza Águila",
            "cantidad": 12,
            "valor_unitario": 4000.0,
            "total": 48000.0
          }
        ],
        "subtotal": 48000.0
      }
    ],
    "total_general": 48000.0
  },
  "message": "OK"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `turno_id` | number | ID del turno |
| `fecha_apertura` | string | Datetime ISO 8601 |
| `fecha_cierre` | string \| null | `null` si el turno sigue abierto |
| `status` | string | `"abierto"` \| `"cerrado"` |
| `meseras[].productos[]` | array | Productos vendidos por la mesera |
| `meseras[].subtotal` | number | Total vendido por la mesera |
| `total_general` | number | Suma de todos los subtotales |

**Errores:** `404 NOT_FOUND` si el turno no existe.

---

## 6. Cierre de turno

Resumen del cierre de un turno de caja: montos, diferencia y desglose por método de pago.

```
GET /reportes/cierre-turno/{turno_id}
```

**Path params**

| Param | Tipo | Descripción |
|---|---|---|
| `turno_id` | number | ID del turno de caja |

**Respuesta** — `data` es un objeto:

```json
{
  "success": true,
  "data": {
    "turno_id": 15,
    "monto_apertura": 100000.0,
    "monto_cierre": 850000.0,
    "monto_sistema": 855000.0,
    "diferencia": -5000.0,
    "total_facturas": 42,
    "facturas_anuladas": 2,
    "por_metodo_pago": {
      "efectivo": 500000.0,
      "tarjeta": 200000.0,
      "transferencia": 155000.0
    }
  },
  "message": "OK"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `monto_apertura` | number | Base con la que abrió el turno |
| `monto_cierre` | number \| null | Monto contado al cerrar (`null` si el turno sigue abierto) |
| `monto_sistema` | number \| null | Monto calculado por el sistema (`null` si sigue abierto) |
| `diferencia` | number \| null | `monto_cierre - monto_sistema` (`null` si sigue abierto) |
| `total_facturas` | number | Total de facturas del turno (incluye anuladas) |
| `facturas_anuladas` | number | Cantidad de facturas anuladas |
| `por_metodo_pago` | object | Mapa `{ metodo: total }`. Claves posibles: `"efectivo"`, `"tarjeta"`, `"transferencia"`, `"mixto"`. Solo aparecen los métodos con facturas |

**Errores:** `404 NOT_FOUND` si el turno no existe.

---

## 7. Exportar reporte

Descarga uno de los reportes de rango de fechas como archivo. Actualmente solo soporta **Excel (`xlsx`)**; el PDF aún no está implementado.

```
GET /reportes/exportar?tipo=ingresos-diarios&formato=xlsx&fecha_desde=2026-06-01&fecha_hasta=2026-06-30
```

**Query params**

| Param | Tipo | Requerido | Descripción |
|---|---|---|---|
| `tipo` | string | Sí | Uno de: `ingresos-diarios`, `ocupacion-mesas`, `ventas-productos`, `rendimiento-meseras` |
| `formato` | string | No (default `xlsx`) | Solo `xlsx` está soportado |
| `fecha_desde` | date | Sí | Inicio del rango |
| `fecha_hasta` | date | Sí | Fin del rango |

**Respuesta** — no es JSON. Es un archivo binario (streaming):

- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename={tipo}.xlsx`

En el front, tratar la respuesta como `blob`:

```ts
const res = await fetch(`${API}/reportes/exportar?tipo=ingresos-diarios&formato=xlsx&fecha_desde=2026-06-01&fecha_hasta=2026-06-30`, {
  headers: { Authorization: `Bearer ${token}` },
});
const blob = await res.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "ingresos-diarios.xlsx";
a.click();
URL.revokeObjectURL(url);
```

**Errores** (estos sí llegan como JSON `ErrorResponse`):

- `400 TIPO_INVALIDO` — `tipo` no está en la lista soportada.
- `400 FORMATO_INVALIDO` — `formato` distinto de `xlsx` (p. ej. `pdf`).
