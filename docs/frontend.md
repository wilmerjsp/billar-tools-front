Instalar el Dashboard https://github.com/satnaing/shadcn-admin

y realizar las siguientes modificaciones.

## 1. Módulos del Admin Web (React)

### 1.1 Autenticación

| Vista / Componente | Descripción |
|--------------------|-------------|
| `LoginPage` | Formulario de login. Gestiona el access_token en memoria (Zustand) y el refresh_token en cookie httpOnly |
| `ProtectedRoute` | HOC que verifica token activo antes de renderizar cualquier ruta protegida |
| `RoleGuard` | Oculta o deshabilita elementos según el rol: superadmin, admin, cajero |
| `useAuth` | Hook global con login(), logout(), refreshToken() y estado del usuario actual |
| `AuthStore` | Estado en memoria (Zustand): accessToken, user (id, nombre, rol, billares asignados) |

### 1.2 Dashboard

| Vista / Componente | Descripción |
|--------------------|-------------|
| `DashboardPage` | Página principal. Combina KPIs, mapa de mesas y feed de actividad en tiempo real |
| `KPICards` | Tarjetas con ingresos del día, mesas activas, pedidos pendientes y turnos abiertos |
| `MesasMiniMapa` | Grid compacto de todas las mesas con color según estado. Actualizado por WebSocket |
| `ActividadFeed` | Lista de eventos recientes: juegos abiertos, pedidos, facturas. Máximo 20 items |
| `AlertasPanel` | Notificaciones en tiempo real: stock bajo, mesas con tiempo excesivo, turnos sin cajero |

### 1.3 Mesas y Juegos

| Vista / Componente | Descripción |
|--------------------|-------------|
| `MesasPage` | Vista principal: mapa visual de mesas con filtro por estado y sucursal |
| `MesaCard` | Tarjeta de una mesa: color por estado, cronómetro si está ocupada, mesera asignada |
| `MesaFormModal` | Modal de creación y edición: número, nombre, tipo, tarifa |
| `JuegosActivosPage` | Feed en tiempo real de partidas activas con cronómetros en vivo |
| `JuegoDetallePanel` | Panel lateral con detalle completo: jugadores, partidas, cuentas y consumo acumulado |
| `JuegoAccionesAdmin` | Acciones de admin sobre un juego activo: pausar, cerrar, reasignar mesera |
| `CuentasJugadores` | Vista de saldos por jugador con historial de movimientos expandible |

### 1.4 Pedidos

| Vista / Componente | Descripción |
|--------------------|-------------|
| `PedidosPage` | Tablero Kanban: columnas Pendiente, En preparación, Entregado |
| `PedidoCard` | Tarjeta de pedido con mesa/barra de origen, producto, cantidad y mesera |
| `PedidosFiltros` | Filtros por mesa, mesera, origen (juego/barra) y sucursal |
| `useKanbanRealTime` | Hook que suscribe a `consumo:nuevo` y `consumo:estado` para actualizar el board sin polling |

### 1.5 Caja y Facturación

| Vista / Componente | Descripción |
|--------------------|-------------|
| `CajaPage` | Panel del turno activo: cajero, hora de apertura, total acumulado en tiempo real |
| `AbrirTurnoModal` | Formulario de apertura de turno con monto inicial declarado |
| `CerrarTurnoModal` | Ingresa monto físico, muestra monto sistema y diferencia calculada |
| `FacturasListado` | Tabla de facturas del turno activo con búsqueda y filtro por método de pago |
| `FacturaDetalle` | Detalle de una factura: conceptos, subtotales, descuento, total y estado |
| `FacturarJuegoModal` | Modal de facturación de un juego cerrado con desglose de cuentas por jugador |
| `AnularFacturaModal` | Confirmación de anulación con campo de motivo obligatorio |
| `HistorialTurnos` | Lista paginada de turnos anteriores con exportación del reporte de cierre |

### 1.6 Productos e Inventario

| Vista / Componente | Descripción |
|--------------------|-------------|
| `ProductosPage` | Tabla con búsqueda, filtro por categoría y toggle de disponibilidad inline |
| `ProductoFormModal` | Modal de creación y edición: nombre, categoría, precio, imagen, lleva_inventario |
| `CategoriasManager` | Lista de categorías con drag-and-drop para reordenar. CRUD en modal |
| `InventarioPage` | Stock actual por sucursal con indicadores de nivel (verde/ámbar/rojo) |
| `AjusteStockModal` | Formulario de ajuste manual con tipo (entrada/ajuste) y motivo obligatorio |
| `MovimientosInventario` | Historial de movimientos con filtro por producto, tipo y rango de fechas |
| `AlertasStockBanner` | Banner fijo cuando hay productos bajo el mínimo en la sucursal activa |

### 1.7 Meseras

| Vista / Componente | Descripción |
|--------------------|-------------|
| `MeserasPage` | Tabla con foto, nombre, estado activo/inactivo y última actividad |
| `MeseraFormModal` | Creación y edición. Incluye generación de PIN temporal visible solo una vez |
| `MeseraActividad` | Historial: juegos atendidos, pedidos tomados y consumo generado |

### 1.8 Reportes

| Vista / Componente | Descripción |
|--------------------|-------------|
| `ReportesPage` | Contenedor con selector de tipo, rango de fechas y sucursal |
| `IngresosDiarios` | Gráfica de barras (Recharts) con ingresos por día. Desglose tiempo vs consumo |
| `OcupacionMesas` | Gráfica de ocupación por mesa y franja horaria. Identifica la mesa más rentable |
| `VentasProductos` | Ranking de productos con barras horizontales. Filtro por categoría |
| `RendimientoMeseras` | Tabla comparativa: pedidos, tiempo promedio y consumo generado por mesera |
| `CierreTurnoReporte` | Reporte detallado de cierre seleccionable desde el historial de turnos |
| `ExportarBtn` | Presente en cada reporte. Llama a `/reportes/exportar` con tipo y formato (Excel/PDF) |

### 1.9 Configuración _(solo superadmin)_

| Vista / Componente | Descripción |
|--------------------|-------------|
| `SucursalesPage` | Lista de sucursales con indicadores de estado. Creación y edición |
| `UsuariosPage` | CRUD de user_admin y user_caja. Asignación de roles y sucursales |
| `CajasConfig` | Gestión de cajas por sucursal: crear, renombrar, activar/desactivar |

---