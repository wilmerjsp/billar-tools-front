# TODO — Cambios requeridos en el Frontend Web (Admin)

> Generado: 2026-03-27
> Contexto: Refactor del API (Fases 1–5). Se listan solo los cambios que afectan los endpoints y WS que la web consume según `web-endpoints-and-ws-rooms.md`.

---

## Cambios CRÍTICOS (rompen funcionalidad actual)

### WEB-01 — Reemplazar body de `POST /api/v1/usuarios/cajeros`

| Campo | Valor |
|---|---|
| Endpoint | `POST /api/v1/usuarios/cajeros` |
| Servicio afectado | `src/features/usuarios/services/usuarios-service.ts` |
| Fase origen | RBAC-25 |

**Problema:** El body cambió. El endpoint ya no crea un `user_caja` sino un `user_admin` con `rol_sucursal=cajero`.

**Antes:**
```typescript
// UserCajaCreate
{
  billar_id: number;
  nombre: string;
  usuario: string;   // username para login
  password: string;
}
```

**Después:**
```typescript
// CajeroCreate
{
  nombre: string;
  email: string;    // email para login (no hay campo usuario)
  password: string;
  // billar_id ya NO va en el body — se resuelve del token del admin
}
```

**Cambios requeridos:**
- Actualizar el formulario de creación de cajero: reemplazar campo `usuario` por `email` (tipo email), eliminar campo `billar_id`.
- Actualizar la llamada al servicio con el nuevo body.

---

### WEB-02 — Actualizar tipo y display de `GET /api/v1/usuarios/cajeros`

| Campo | Valor |
|---|---|
| Endpoint | `GET /api/v1/usuarios/cajeros` |
| Servicio afectado | `src/features/usuarios/services/usuarios-service.ts` |
| Fase origen | RBAC-24 |

**Problema:** La respuesta cambió de `UserCajaResponse[]` a `UserAdminResponse[]`. El tipo y los campos son distintos.

**Antes — `UserCajaResponse`:**
```typescript
{
  id: number;
  billar_id: number;    // top-level
  nombre: string;
  usuario: string;      // username
  activo: boolean;
  created_at: string;
}
```

**Después — `UserAdminResponse`:**
```typescript
{
  id: number;
  nombre: string;
  email: string;        // reemplaza a usuario
  rol: "superadmin" | "admin";
  activo: boolean;
  ultimo_login: string | null;
  created_at: string;
  billares: {           // nuevo — detalle de asignación por sucursal
    billar_id: number;
    rol_sucursal: "superadmin" | "admin" | "cajero";
    assigned_at: string;
  }[];
}
```

**Cambios requeridos:**
- Actualizar el tipo TypeScript del cajero.
- En la tabla/lista de cajeros: reemplazar columna `usuario` por `email`, acceder a `billar_id` desde `billares[0].billar_id`.
- Eliminar el query param `billar_id` de la llamada (ya no lo acepta — el billar se resuelve del token).

---

### WEB-03 — Actualizar body de `POST /api/v1/caja/{id}/turno/abrir`

| Campo | Valor |
|---|---|
| Endpoint | `POST /api/v1/caja/{caja_id}/turno/abrir` |
| Servicio afectado | `src/features/caja/services/caja-service.ts` |
| Fase origen | RBAC-25 / RBAC-10 |

**Problema:** El body ahora acepta `user_caja_id` O `user_admin_id` (exactamente uno). En el nuevo modelo de cajeros, el cajero es un `user_admin` con `rol_sucursal=cajero`, así que se debe usar `user_admin_id`.

**Antes:**
```typescript
{ user_caja_id: number; monto_apertura: number }
```

**Después:**
```typescript
// Exactamente uno de los dos
{
  user_caja_id?: number;    // legacy — cajeros migrados durante periodo de transición
  user_admin_id?: number;   // nuevo — cajeros creados con WEB-01
  monto_apertura: number;
}
```

**Cambio requerido:** Actualizar el formulario de apertura de turno para que seleccione cajeros de la nueva lista (`GET /api/v1/usuarios/cajeros` → `UserAdminResponse[]`) y envíe `user_admin_id` en el body. Durante el periodo de transición, `user_caja_id` sigue funcionando para cajeros migrados.

---

## Cambios de flujo de autenticación

### WEB-04 — Incluir `billar_id` en el login y leer `rol_sucursal` del token

| Campo | Valor |
|---|---|
| Endpoints | `POST /api/v1/auth/admin/login`, `POST /api/v1/auth/admin/refresh` |
| Fase origen | RBAC-01, RBAC-02, RBAC-03 |

**Cambios en el login request:** El body de login ahora acepta `billar_id`:
```typescript
{
  email: string;
  password: string;
  billar_id?: number;   // NUEVO — requerido para admins con múltiples sucursales
}
```

Sin `billar_id`, el token generado tendrá `rol_sucursal=superadmin` (sin scope de sucursal). Un token superadmin sin `billar_id` no puede acceder a endpoints que filtran por `billar_id` del token.

**Cambios en el token JWT:** El access token ahora incluye `rol_sucursal`:
```
{ ..., rol_sucursal: "superadmin" | "admin" | "cajero" }
```

**Cambios requeridos en la web:**
1. **Login UX multi-billar:** Si el admin tiene acceso a múltiples billares (`billares.length > 1`), mostrar un selector de sucursal tras la autenticación inicial y reloguear con el `billar_id` elegido. Si solo tiene uno, enviarlo directamente.
2. **Auth store:** Almacenar y exponer `rol_sucursal` decodificado del JWT (o guardado tras el login).
3. **Guards de UI:** Usar `rol_sucursal` para condicionar visibilidad de funciones:
   - `cajero`: puede ver cajas, turnos, pedidos, facturar. NO puede crear mesas, productos, usuarios ni gestionar billares.
   - `admin`: todo lo anterior más gestión de mesas, productos, meseras, reportes.
   - `superadmin`: acceso completo, incluyendo creación/estado de billares y gestión de admins.

---

## Cambios de permisos por endpoint (afectan según `rol_sucursal`)

### WEB-05 — Endpoints ahora restringidos a `RequireSuperadmin`

| Endpoint | Antes | Después |
|---|---|---|
| `POST /api/v1/billares` | `get_current_admin` | `RequireSuperadmin` |
| `PATCH /api/v1/billares/{id}/estado` | `get_current_admin` | `RequireSuperadmin` |
| `GET /api/v1/usuarios/admins` | `get_current_admin` | `RequireSuperadmin` |
| `POST /api/v1/usuarios/admins` | `get_current_admin` | `RequireSuperadmin` |
| `PATCH /api/v1/usuarios/admins/{id}` | `get_current_admin` | `RequireSuperadmin` |
| `PATCH /api/v1/usuarios/admins/{id}/estado` | `get_current_admin` | `RequireSuperadmin` |

**Cambio requerido:** Ocultar o deshabilitar estos controles en la UI para usuarios con `rol_sucursal=admin` o `cajero`. Sin esto, el botón existe pero la API devuelve **403**.

---

### WEB-06 — `PATCH /api/v1/facturas/{id}/anular` ahora es `RequireAdmin`

Un cajero (`rol_sucursal=cajero`) ya no puede anular facturas. Solo admin o superadmin.

**Cambio requerido:** Ocultar el botón "Anular factura" para usuarios con `rol_sucursal=cajero`.

---

## Limpieza de body (no rompen, pero conviene actualizar)

### WEB-07 — Eliminar `billar_id` del body de `POST /api/v1/productos` y `POST /api/v1/productos/categorias`

El `billar_id` se toma ahora del token del admin (MT-24, MT-25). Si la web lo enviaba en el body, es ignorado silenciosamente. Limpiar el body para evitar confusión.

**Body actualizado para `ProductoCreate`:**
```typescript
{
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string;
  disponible?: boolean;
  lleva_inventario?: boolean;
  // billar_id: ELIMINADO — viene del token
}
```

**Body actualizado para `CategoriaCreate`:**
```typescript
{
  nombre: string;
  icono?: string;
  orden: number;
  activa?: boolean;
  // billar_id: ELIMINADO — viene del token
}
```

---

### WEB-08 — Simplificar body de `POST /api/v1/inventario/ajuste`

El `billar_id`, `usuario_id` y `usuario_tipo` ahora se toman del contexto del token en el servidor.

**Antes (web docs):**
```typescript
{ billar_id, producto_id, tipo, cantidad, motivo, usuario_id, usuario_tipo }
```

**Después (solo estos campos son procesados):**
```typescript
{
  producto_id: number;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: number;
  motivo: string;
  // billar_id, usuario_id, usuario_tipo: ELIMINADOS — vienen del token
}
```

Los campos extra son ignorados silenciosamente por Pydantic, por lo que no se rompe si la web sigue enviándolos — pero conviene limpiarlos.

---

## Cambios de tipado en respuestas (aditivos, no rompen)

### WEB-09 — Nuevos campos en respuestas

Actualizar los tipos TypeScript para aprovechar los nuevos campos:

| Tipo | Campos nuevos | Fase |
|---|---|---|
| `ProductoOut` | `billar_id: number`, `created_at: string` | MT-14/19, AUD-02 |
| `CategoriaOut` | `billar_id: number` | MT-15/20 |
| `JuegoResponse` | `updated_at: string` | AUD-04 |
| `ConsumoJuegoResponse` | `updated_at: string`, `costo_snapshot: string \| null`, `producto_nombre_snapshot: string \| null`, `precio_venta_snapshot: string` | AUD-04, PRECIO-04/05/06 |
| `BarraItemResponse` | `updated_at: string`, `costo_snapshot: string \| null`, `producto_nombre_snapshot: string \| null`, `precio_venta_snapshot: string` | Ídem |
| `UserAdminResponse` | `billares: BillarAsignado[]`, `ultimo_login: string \| null` | RBAC-04 |

> `precio_venta_snapshot` es un alias computado de `precio_unitario` — mismo valor, nombre semántico para reportes históricos.

---

## Discrepancias pre-existentes (no introducidas por este refactor)

### WEB-10 — `GET /api/v1/facturas` — parámetro `origen_tipo` no existe en la API

La documentación web lista `origen_tipo` como query param, pero el endpoint real acepta: `turno_caja_id`, `status`, `metodo_pago`, `fecha_desde`, `fecha_hasta`, `page`, `page_size`. Revisar si la web lo está enviando y eliminarlo.

### WEB-11 — `GET /api/v1/juegos/activos` — `billar_id` como query param no tiene efecto

La documentación lista `billar_id` como query param, pero el endpoint resuelve el billar desde el token. El query param es ignorado. Para superadmin (sin `billar_id` en token), este endpoint puede devolver resultados vacíos o incorrectos. Si la web necesita listar juegos de un billar específico como superadmin, se requiere un cambio en la API (fuera del alcance de este refactor).

---

## No requieren cambios en la web

| Endpoint | Motivo |
|---|---|
| `POST /api/v1/auth/admin/login` | Sin cambio de contrato — solo se añade `billar_id` opcional al body (WEB-04). |
| `POST /api/v1/auth/admin/refresh` | Sin cambio — usa cookie httpOnly. |
| `POST /api/v1/auth/admin/logout` | Sin cambio. |
| `GET /api/v1/billares` | Sigue accesible con `RequireCajero` (todos los roles admin tienen acceso). |
| `GET /api/v1/billares/{id}` | Ídem. |
| `PATCH /api/v1/billares/{id}` | `RequireAdmin` — sin cambio para admins. |
| `GET /api/v1/meseras` y CRUD | Sigue siendo `get_current_admin`. Sin cambio. |
| `GET /api/v1/mesas` y CRUD | Listado con `get_current_user`; edición con `RequireAdmin`. Sin cambio para admin. |
| `GET /api/v1/juegos` | Ahora `RequireAdmin` — sin cambio para usuarios admin. |
| `GET /api/v1/juegos/{id}` | `get_current_user` — sin cambio. |
| `GET /api/v1/juegos/{id}/resumen` | `get_current_user` — sin cambio. |
| `POST /api/v1/juegos/{id}/facturar` | `RequireAdmin` — sin cambio para admin. |
| `GET /api/v1/consumos/pendientes` | `get_current_user` — sin cambio. |
| `PATCH /api/v1/consumos/juego/{id}/estado` | `get_current_user` — sin cambio. |
| `GET /api/v1/productos` y CRUD | Acceso admin sin cambios; nuevos campos en respuesta son aditivos. |
| `GET /api/v1/productos/categorias` y CRUD | Ídem. |
| `GET /api/v1/caja` | `RequireCajero` — accesible a todos los roles admin. |
| `GET /api/v1/caja/{id}/turno/activo` | `RequireCajero` — accesible a todos los roles admin. |
| `GET /api/v1/caja/{id}/turnos` | `RequireCajero` — ídem. |
| `POST /api/v1/caja/{id}/turno/cerrar` | `RequireCajero` — ídem. |
| `POST /api/v1/facturas` | `RequireCajero` — accesible a todos los roles admin. |
| `GET /api/v1/facturas` | `RequireCajero` — ídem. |
| `GET /api/v1/inventario` y operaciones | `RequireAdmin` — sin cambio para admin. |
| `GET /api/v1/reportes/*` | `RequireAdmin` — sin cambio para admin. |
| WebSocket `pedidos` y `mesas` | Sin cambios en contrato ni autenticación. |
