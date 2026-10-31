# Documentación de API Endpoints

## `/api/v1/auth/admin/login`

### **POST**
- **Descripción:** Login de admin/cajero

**Payload (JSON):**
```json
{
  "email": "string", // Email
  "password": "string", // Password
  "billar_id": "any" // Billar Id
}
```

## `/api/v1/auth/admin/refresh`

### **POST**
- **Descripción:** Renovar access_token de admin

**Payload:** No se requiere payload o el schema está definido directamente.

## `/api/v1/auth/admin/logout`

### **POST**
- **Descripción:** Cerrar sesión de admin

**Payload:** No se requiere payload o el schema está definido directamente.

## `/api/v1/billares`

### **GET**
- **Descripción:** Get Billares

### **POST**
- **Descripción:** Create Billar

**Payload (JSON):**
```json
{
  "nombre": "string", // Nombre
  "direccion": "any", // Direccion
  "telefono": "any" // Telefono
}
```

## `/api/v1/billares/{billar_id}`

### **GET**
- **Descripción:** Get Billar

### **PATCH**
- **Descripción:** Update Billar

## `/api/v1/billares/{billar_id}/estado`

### **PATCH**
- **Descripción:** Update Estado Billar

## `/api/v1/usuarios/cajeros`

### **GET**
- **Descripción:** List Cajeros

### **POST**
- **Descripción:** Create Cajero

**Payload (JSON):**
```json
{
  "billar_id": "integer", // Billar Id
  "nombre": "string", // Nombre
  "usuario": "string", // Usuario
  "password": "string" // Password
}
```

## `/api/v1/meseras`

### **GET**
- **Descripción:** List Meseras

### **POST**
- **Descripción:** Create Mesera

**Payload (JSON):**
```json
{
  "billar_id": "integer", // Billar Id
  "nombre_completo": "string", // Nombre Completo
  "usuario": "string", // Usuario
  "password": "string", // Password
  "foto_url": "any" // Foto Url
}
```

## `/api/v1/meseras/{mesera_id}`

### **GET**
- **Descripción:** Get Mesera

### **PATCH**
- **Descripción:** Update Mesera

## `/api/v1/meseras/{mesera_id}/pin`

### **PATCH**
- **Descripción:** Update Pin

## `/api/v1/meseras/{mesera_id}/estado`

### **PATCH**
- **Descripción:** Update Estado

## `/api/v1/mesas`

### **GET**
- **Descripción:** List Mesas

### **POST**
- **Descripción:** Create Mesa

**Payload (JSON):**
```json
{
  "billar_id": "integer", // Billar Id
  "numero": "integer", // Numero
  "nombre": "any", // Nombre
  "tipo": "any", // tipo
  "tarifa_por_hora": "any" // Tarifa Por Hora
}
```

## `/api/v1/mesas/{mesa_id}`

### **GET**
- **Descripción:** Get Mesa

### **PATCH**
- **Descripción:** Update Mesa

## `/api/v1/mesas/{mesa_id}/estado`

### **PATCH**
- **Descripción:** Change Mesa Status

## `/api/v1/mesas/{mesa_id}/historial`

### **GET**
- **Descripción:** Get Mesa Historial

## `/api/v1/juegos/activos`

### **GET**
- **Descripción:** Listar juegos activos de la sucursal

## `/api/v1/juegos/{juego_id}`

### **GET**
- **Descripción:** Detalle completo de un juego

## `/api/v1/consumos/barra`

### **POST**
- **Descripción:** Abrir cuenta de barra

**Payload (JSON):**
```json
{
  "billar_id": "integer", // Billar Id
  "turno_caja_id": "integer", // Turno Caja Id
  "descripcion": "any" // Descripcion
}
```

## `/api/v1/consumos/barra/{personal_id}/items`

### **POST**
- **Descripción:** Agregar producto a cuenta de barra

**Payload (JSON):**
```json
{
  "producto_id": "integer", // Producto Id
  "cantidad": "integer", // Cantidad
  "notas": "any" // Notas
}
```

## `/api/v1/consumos/barra/{personal_id}/items/{item_id}/estado`

### **PATCH**
- **Descripción:** Actualizar estado de item de barra

## `/api/v1/consumos/barra/activas`

### **GET**
- **Descripción:** Listar cuentas de barra abiertas

## `/api/v1/consumos/barra/{personal_id}/cerrar`

### **POST**
- **Descripción:** Cerrar cuenta de barra

**Payload:** No se requiere payload o el schema está definido directamente.

## `/api/v1/consumos/pendientes`

### **GET**
- **Descripción:** Pedidos pendientes (juegos + barra)

## `/api/v1/caja`

### **GET**
- **Descripción:** Listar cajas de la sucursal

### **POST**
- **Descripción:** Crear caja nueva

**Payload (JSON):**
```json
{
  "billar_id": "integer", // Billar Id
  "nombre": "string" // Nombre
}
```

## `/api/v1/caja/{caja_id}/turno/abrir`

### **POST**
- **Descripción:** Abrir turno de caja

**Payload (JSON):**
```json
{
  "user_caja_id": "integer", // User Caja Id
  "monto_apertura": "any" // Monto Apertura
}
```

## `/api/v1/caja/{caja_id}/turno/activo`

### **GET**
- **Descripción:** Obtener turno activo

## `/api/v1/caja/{caja_id}/turno/cerrar`

### **POST**
- **Descripción:** Cerrar turno de caja

**Payload (JSON):**
```json
{
  "monto_cierre": "any", // Monto Cierre
  "observaciones": "any" // Observaciones
}
```

## `/api/v1/caja/{caja_id}/turnos`

### **GET**
- **Descripción:** Historial de turnos

## `/api/v1/facturas`

### **POST**
- **Descripción:** Emitir factura

**Payload (JSON):**
```json
{
  "billar_id": "integer", // Billar Id
  "turno_caja_id": "integer", // Turno Caja Id
  "origen_tipo": "string", // Origen Tipo
  "origen_id": "integer", // Origen Id
  "subtotal_tiempo": "any", // Subtotal Tiempo
  "subtotal_consumo": "any", // Subtotal Consumo
  "descuento": "any", // Descuento
  "metodo_pago": "string" // Metodo Pago
}
```

### **GET**
- **Descripción:** Listar facturas con filtros

## `/api/v1/facturas/{factura_id}`

### **GET**
- **Descripción:** Detalle de una factura

## `/api/v1/facturas/{factura_id}/anular`

### **PATCH**
- **Descripción:** Anular factura

## `/api/v1/productos/categorias`

### **GET**
- **Descripción:** Listar Categorias

### **POST**
- **Descripción:** Crear Categoria

**Payload (JSON):**
```json
{
  "nombre": "string", // Nombre
  "icono": "any", // Icono
  "orden": "integer", // Orden
  "activa": "boolean" // Activa
}
```

## `/api/v1/productos/categorias/{categoria_id}`

### **PATCH**
- **Descripción:** Editar Categoria

## `/api/v1/productos`

### **GET**
- **Descripción:** Listar Productos

### **POST**
- **Descripción:** Crear Producto

**Payload (JSON):**
```json
{
  "categoria_id": "integer", // Categoria Id
  "nombre": "string", // Nombre
  "descripcion": "any", // Descripcion
  "precio": "any", // Precio
  "imagen_url": "any", // Imagen Url
  "disponible": "boolean", // Disponible
  "lleva_inventario": "boolean" // Lleva Inventario
}
```

## `/api/v1/productos/{producto_id}`

### **PATCH**
- **Descripción:** Editar Producto

## `/api/v1/productos/{producto_id}/disponibilidad`

### **PATCH**
- **Descripción:** Toggle Disponibilidad

## `/api/v1/productos/{producto_id}/inventario`

### **GET**
- **Descripción:** Inventario Producto

## `/api/v1/inventario`

### **GET**
- **Descripción:** Inventario Billar

## `/api/v1/inventario/ajuste`

### **POST**
- **Descripción:** Ajuste Inventario

**Payload (JSON):**
```json
{
  "billar_id": "integer", // Billar Id
  "producto_id": "integer", // Producto Id
  "tipo": "any", // tipo
  "cantidad": "any", // Cantidad
  "motivo": "string", // Motivo
  "usuario_id": "integer", // Usuario Id
  "usuario_tipo": "any" // usuario_tipo
}
```

## `/api/v1/inventario/movimientos`

### **GET**
- **Descripción:** Listar Movimientos

## `/api/v1/inventario/alertas`

### **GET**
- **Descripción:** Alertas Stock

## `/api/v1/reportes/ingresos-diarios`

### **GET**
- **Descripción:** Ingresos por día en un rango de fechas

## `/api/v1/reportes/ocupacion-mesas`

### **GET**
- **Descripción:** Horas de uso por mesa y tasa de ocupación

## `/api/v1/reportes/ventas-productos`

### **GET**
- **Descripción:** Ranking de productos más vendidos

## `/api/v1/reportes/rendimiento-meseras`

### **GET**
- **Descripción:** Rendimiento de meseras

## `/api/v1/reportes/cierre-turno/{turno_id}`

### **GET**
- **Descripción:** Reporte de cierre de turno

## `/api/v1/reportes/exportar`

### **GET**
- **Descripción:** Exportar reporte a Excel o PDF

