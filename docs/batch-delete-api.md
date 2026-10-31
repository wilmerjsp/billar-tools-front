# API Changes Required: Batch Delete Support

## Summary

The admin dashboard supports selecting multiple rows and deleting them in bulk
for the **Productos**, **Categorías** and **Meseras** modules. The current API
does not expose DELETE endpoints for these resources. Until batch endpoints
exist, the frontend executes individual deletes in parallel via `Promise.all`.

---

## Required Endpoints

### Productos

**Single delete**
```
DELETE /api/v1/productos/{id}
Authorization: Bearer <access_token>

Response 204 – No Content
Response 404 – Not Found
Response 409 – Conflict (e.g. producto has pending orders)
```

**Batch delete (recommended)**
```
DELETE /api/v1/productos/batch
Authorization: Bearer <access_token>
Content-Type: application/json

Body
{ "ids": [1, 2, 3] }

Response 200 – { "deleted": 3, "errors": [] }
Response 207 – Multi-Status (partial failures)
  { "deleted": 2, "errors": [{ "id": 3, "message": "tiene pedidos activos" }] }
```

---

### Categorías de Productos

**Single delete**
```
DELETE /api/v1/productos/categorias/{id}
Authorization: Bearer <access_token>

Response 204 – No Content
Response 404 – Not Found
Response 409 – Conflict (categoría has associated products)
```

**Batch delete (recommended)**
```
DELETE /api/v1/productos/categorias/batch
Authorization: Bearer <access_token>
Content-Type: application/json

Body
{ "ids": [1, 2] }

Response 200 – { "deleted": 2, "errors": [] }
Response 207 – Multi-Status (partial failures)
```

---

### Meseras

**Single delete**
```
DELETE /api/v1/meseras/{id}
Authorization: Bearer <access_token>

Response 204 – No Content
Response 404 – Not Found
```

**Batch delete (recommended)**
```
DELETE /api/v1/meseras/batch
Authorization: Bearer <access_token>
Content-Type: application/json

Body
{ "ids": [10, 11, 12] }

Response 200 – { "deleted": 3, "errors": [] }
Response 207 – Multi-Status (partial failures)
```

---

## Frontend Migration (when batch endpoints are ready)

Replace the `deleteMany` fallback in each service with the batch endpoint:

```ts
// productos-service.ts — current fallback
deleteMany: (ids: number[]) =>
  Promise.all(ids.map((id) => api.delete(`/api/v1/productos/${id}`)))

// Replace with:
deleteMany: (ids: number[]) =>
  api.delete('/api/v1/productos/batch', { data: { ids } }).then((r) => r.data)
```

Apply the same pattern to `meseras-service.ts` and `categorias-service.ts`.

---

## Business Rules for the Backend

| Resource      | Blocking condition                                    | Recommended response |
|---------------|-------------------------------------------------------|----------------------|
| Producto      | Has líneas de pedido activas o históricas             | 409 Conflict         |
| Categoría     | Tiene productos asociados                             | 409 Conflict         |
| Mesera        | Tiene juegos o pedidos activos en curso               | 409 Conflict         |

For batch operations, prefer **207 Multi-Status** so the frontend can show which
items failed and why, rather than aborting the entire batch on the first error.
