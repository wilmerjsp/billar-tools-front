# Genos Billar Tools — Información para Landing Page

## ¿Qué es?

**Genos Billar Tools** es un panel de administración web diseñado específicamente para la gestión integral de billares y salones de juego. Centraliza en una sola plataforma el control de mesas, ventas, inventario, personal y reportes — todo en tiempo real.

---

## Función Principal

Sistema de gestión operativa (POS + ERP ligero) para cadenas de billares. Permite al administrador y cajero controlar en tiempo real:

- El estado de cada mesa y partida activa
- Los pedidos de productos desde mesas y barra
- La caja del turno activo con facturación
- El inventario de productos
- El desempeño del personal (meseras y cajeros)

---

## Objetivo

Eliminar el papel y las hojas de cálculo de la operación diaria de un billar, reemplazándolos con un sistema web accesible desde cualquier dispositivo, que actualiza datos en tiempo real y genera reportes listos para descargar.

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| **Superadmin** | Control total: billares, planes, suscripciones, administradores |
| **Admin** | Gestión completa de su sucursal: mesas, personal, productos, reportes |
| **Cajero** | Turno de caja, facturación y consulta de pedidos |

---

## Pantallas del Panel Web

---

### Autenticación

La entrada al sistema está protegida por dos portales independientes según el tipo de usuario.

**Login de Admin / Cajero** — Formulario de acceso estándar donde el usuario ingresa su correo, contraseña y selecciona la sucursal a la que pertenece. El sistema emite un token de acceso que se guarda únicamente en memoria (nunca en el navegador) y un refresh token en cookie httpOnly para renovar la sesión de forma transparente. Si la sesión expira mientras el usuario trabaja, el sistema la renueva automáticamente sin interrumpir la operación ni redirigir al login.

**Login de Superadmin** — Portal separado con ruta propia, diseñado para el equipo que administra la plataforma completa. Desde aquí se gestiona qué billares existen en el sistema, qué planes tienen activos y qué administradores están asignados a cada uno. Este portal no comparte sesión con el panel de operaciones.

**Recuperación de contraseña** — Flujo de dos pasos: el usuario ingresa su correo, recibe un código OTP de un solo uso y lo valida en pantalla antes de poder establecer una nueva contraseña. Protege contra reinicios masivos no autorizados.

---

### Dashboard Principal

La pantalla de inicio que ve el administrador o cajero al ingresar. Es el punto de control central del negocio y se actualiza en tiempo real sin necesidad de recargar la página.

**KPIs en tiempo real** — Cuatro tarjetas en la parte superior muestran de un vistazo las métricas más importantes del día: ingresos acumulados en el turno actual, número de mesas ocupadas en este momento, pedidos pendientes de entregar, y cuántos turnos de caja están abiertos. Cada cifra cambia automáticamente cuando el sistema recibe un evento nuevo.

**Mapa visual de mesas** — Grid compacto que representa todas las mesas del local. Cada celda tiene un color según el estado actual de la mesa: gris para libre, verde para ocupada, amarillo para reservada y rojo para mantenimiento. Con un solo vistazo el administrador sabe la ocupación del local sin moverse de su escritorio.

**Feed de actividad reciente** — Lista cronológica de los últimos 20 eventos del local: juegos que se abrieron, pedidos que llegaron, facturas que se emitieron. Permite al administrador entender qué pasó en los últimos minutos sin tener que revisar cada módulo por separado.

**Alertas automáticas** — Panel de notificaciones que aparece cuando el sistema detecta situaciones que requieren atención: un producto cayó por debajo del stock mínimo, una mesa lleva más tiempo del habitual sin que se haya facturado, o hay un turno de caja que lleva demasiado tiempo abierto. Las alertas desaparecen automáticamente cuando la situación se resuelve.

---

### Mesas y Juegos

El corazón operativo del billar. Todo lo relacionado con las mesas físicas y las partidas que se juegan en ellas se gestiona desde aquí.

**Mapa de mesas** — Vista principal con todas las mesas del local representadas visualmente. Cada mesa muestra su nombre o número, su estado actual con color diferenciado, y si está ocupada, el cronómetro de tiempo activo y la mesera asignada. Desde esta misma vista el administrador puede abrir un juego nuevo en una mesa libre con un solo clic, filtrar por estado (libre/ocupada/mantenimiento) o cambiar de sucursal si gestiona más de un local.

**Juegos activos** — Feed en tiempo real que lista todas las partidas que están corriendo en este momento. Cada tarjeta muestra la mesa, los jugadores registrados, cuánto tiempo llevan jugando con un cronómetro en vivo, y el consumo de productos acumulado hasta el momento. Esta vista es ideal para que el cajero o el administrador supervisen la operación sin tener que ir físicamente a cada mesa.

**Detalle de juego** — Panel lateral que se abre al seleccionar un juego. Muestra la información completa de la partida: jugadores con sus cuentas individuales, el historial de partidas dentro del juego (si hay series), el detalle de cada consumo pedido y el total acumulado por jugador. Es la referencia exacta que necesita el cajero al momento de facturar.

**Acciones de admin sobre un juego** — Desde el panel de detalle, el administrador puede ejecutar acciones críticas: pausar temporalmente el cronómetro de un juego (por ejemplo si hay un problema con la mesa), cerrar el juego anticipadamente para proceder a facturar, o reasignar la mesera encargada si hubo un cambio de turno del personal.

**Historial de juegos** — Tabla paginada con todas las partidas pasadas. Permite buscar por fecha, mesa, jugador o mesera. Cada registro muestra el tiempo total jugado, el consumo generado y el monto facturado. Útil para resolver dudas o reclamos de clientes sobre partidas anteriores.

---

### Pedidos (Kanban)

Vista tipo tablero de trabajo para hacer seguimiento a todos los pedidos de productos que se generan durante la operación, tanto desde las mesas de juego como desde la barra.

**Tablero Kanban** — Tres columnas representan el ciclo de vida de cada pedido: **Pendiente** (recién llegado, aún no atendido), **En preparación** (ya fue tomado por quien lo prepara) y **Entregado** (llegó al cliente). Los pedidos avanzan de columna conforme se actualiza su estado, ya sea desde el panel o desde la app de la mesera.

**Tarjetas de pedido** — Cada pedido aparece como una tarjeta con toda la información relevante: el nombre del producto, la cantidad pedida, la mesa o cuenta de barra de donde proviene, el nombre de la mesera que lo tomó, y la hora en que se registró. Las tarjetas más antiguas se destacan visualmente para evitar que se queden sin atender.

**Actualización en tiempo real** — El tablero no necesita recarga manual. Cuando una mesera registra un pedido desde su dispositivo, aparece automáticamente en la columna "Pendiente" del panel del administrador o cajero, en cuestión de segundos, gracias a la conexión WebSocket permanente.

**Filtros** — El tablero puede filtrarse por mesa específica, por mesera, por origen del pedido (juego de billar o cuenta de barra) y por sucursal. Esto es especialmente útil en locales concurridos donde hay muchos pedidos simultáneos y se necesita priorizar por área.

---

### Barra / Bar Admin

Módulo dedicado a gestionar las cuentas de consumo que se abren directamente en la barra del local, independientemente de una mesa de juego. Es ideal para clientes que solo vienen a consumir sin jugar.

**Cuentas de barra abiertas** — Listado de todas las cuentas de barra activas en este momento, organizadas por mesera. Cada cuenta muestra el nombre de la mesera responsable, los productos que ya se han pedido, el total acumulado y el tiempo que lleva abierta. El administrador puede ver de un vistazo cuántas cuentas están activas y cuál es su estado.

**Gestión de ítems por cuenta** — Desde el detalle de una cuenta, el administrador puede agregar nuevos productos manualmente, cambiar el estado de un ítem (pendiente, preparado, entregado, cancelado) o eliminar un ítem si fue registrado por error. Cada cambio queda registrado con hora y usuario que lo realizó.

**Historial de cuentas cerradas** — Lista de todas las cuentas de barra que ya fueron cerradas y cobradas, con la posibilidad de buscar por fecha, mesera o monto. Permite revisar lo que ocurrió en turnos anteriores y resolver cualquier discrepancia.

**Detalle de cuenta** — Vista completa de una cuenta individual: cada producto pedido con su cantidad, precio unitario y subtotal; la mesera responsable; el tiempo total que estuvo abierta; y el monto final cobrado. Si la cuenta fue cobrada dentro de un juego, también muestra el vínculo con la partida correspondiente.

---

### Caja y Facturación

Módulo para el cajero que controla el flujo de dinero del turno: desde que abre caja hasta que la cierra y entrega el reporte al administrador.

**Panel del turno activo** — Vista principal que el cajero ve durante su turno. Muestra quién está trabajando, a qué hora abrió caja, cuántas facturas ha emitido y cuánto dinero lleva acumulado en el turno. Todo actualizado en tiempo real. Si el cajero cierra el navegador y vuelve a entrar, el turno sigue activo y los datos se recuperan automáticamente.

**Abrir turno de caja** — Al inicio del día o del turno, el cajero declara el monto con el que empieza la caja (el dinero físico que tiene en el cajón). Este dato queda registrado y se usa después para calcular la diferencia al cierre.

**Cerrar turno de caja** — Al finalizar, el cajero cuenta el dinero físico y lo ingresa en el sistema. El panel muestra automáticamente el monto que el sistema espera (suma de todas las facturas del turno) y calcula la diferencia. Si hay sobrante o faltante, queda registrado con hora y usuario para auditoría posterior.

**Listado de facturas del turno** — Tabla con todas las facturas emitidas durante el turno activo. Tiene búsqueda por nombre o número de factura, y filtros por método de pago (efectivo, tarjeta, transferencia). Cada fila muestra el monto total, el estado (emitida/anulada) y un enlace al detalle completo.

**Detalle de factura** — Vista completa de una factura: todos los conceptos cobrados (tiempo de juego por jugador, productos consumidos), los subtotales de cada concepto, el descuento aplicado si lo hubo, el total final y el método de pago utilizado. También muestra quién emitió la factura y a qué hora.

**Facturar un juego** — Cuando un juego termina, el cajero abre el modal de facturación desde el panel o desde el detalle del juego. El sistema ya tiene calculado el tiempo de cada jugador y el consumo de productos; el cajero solo confirma los montos, aplica descuento si corresponde, registra el método de pago y emite la factura con un clic.

**Anular factura** — Si una factura fue emitida por error, el cajero puede anularla ingresando obligatoriamente el motivo. La anulación queda registrada con el motivo, la hora y el usuario que la realizó. La factura no desaparece del historial, queda marcada como anulada para mantener la trazabilidad contable.

**Historial de turnos anteriores** — Lista paginada de todos los turnos cerrados, con el nombre del cajero, las horas de apertura y cierre, el total facturado y si hubo diferencia de caja. Desde cada registro se puede descargar el reporte completo de ese turno en PDF o Excel.

---

### Productos y Categorías

Gestión del catálogo de lo que se vende en el local: bebidas, snacks, accesorios o cualquier artículo que se ofrezca a los clientes.

**Catálogo de productos** — Tabla completa con todos los productos disponibles. Incluye búsqueda por nombre, filtro por categoría, columna de precio, imagen en miniatura y un toggle de disponibilidad que el administrador puede activar o desactivar al instante para sacar un producto del menú sin borrarlo (por ejemplo si se agotó temporalmente). Los cambios son visibles de inmediato para las meseras en su app.

**Creación y edición de producto** — Formulario completo para registrar o modificar un producto: nombre, categoría a la que pertenece, precio de venta al cliente, imagen representativa, y una opción para indicar si ese producto debe descontar stock del inventario al venderse. Esto permite tener en el menú ítems de servicio (como tiempo de juego extra) junto a ítems físicos con inventario controlado.

**Gestor de categorías** — Lista de todas las categorías del catálogo (por ejemplo: Bebidas, Licores, Snacks, Accesorios). El administrador puede crear nuevas categorías, editar los nombres existentes, eliminar las que no se usen, y reorganizarlas con drag-and-drop para que aparezcan en el orden deseado en el menú de la app de meseras.

---

### Inventario

Control del stock físico de productos en cada sucursal, con alertas automáticas para evitar quedarse sin existencias durante la operación.

**Stock actual por sucursal** — Tabla que muestra todos los productos que llevan control de inventario, con la cantidad disponible actualmente en la sucursal seleccionada. Cada producto tiene un indicador de nivel visual: verde cuando el stock está por encima del mínimo definido, ámbar cuando está cerca del límite, y rojo cuando ya está por debajo del mínimo y requiere reabastecimiento urgente.

**Ajuste de stock manual** — Formulario para registrar movimientos de inventario: entradas de mercancía nueva, correcciones por conteo físico o bajas por producto dañado. Cada ajuste requiere indicar el tipo de movimiento y el motivo, lo que genera un registro auditado con fecha, hora y usuario responsable.

**Historial de movimientos** — Registro cronológico de todos los cambios de stock de la sucursal. Se puede filtrar por producto, tipo de movimiento (entrada, venta, ajuste) y rango de fechas. Permite rastrear exactamente cuándo, cómo y por qué cambió el inventario de cualquier producto.

**Alertas de stock mínimo** — Cuando uno o más productos están por debajo del mínimo configurado, aparece un banner fijo en la parte superior de la pantalla visible para el administrador en cualquier sección del panel. La alerta desaparece automáticamente cuando el stock es repuesto y el ajuste queda registrado.

---

### Meseras (Personal de Servicio)

Gestión del equipo de meseras que opera en el local y atiende a los clientes desde la app móvil.

**Tabla de meseras** — Lista de todo el personal de servicio con foto de perfil, nombre completo, estado actual (activa/inactiva) y la fecha y hora de su última actividad registrada en el sistema. El administrador puede ver rápidamente quién está trabajando y quién no, y activar o desactivar una mesera con un solo clic.

**Registro y edición de mesera** — Formulario para dar de alta o actualizar los datos de una mesera: nombre completo, nombre de usuario para la app, contraseña, foto de perfil y sucursal asignada. Al crear una nueva mesera el sistema genera un PIN temporal que se muestra una única vez al administrador para que se lo entregue al empleado — por seguridad no queda almacenado ni visible en ninguna otra pantalla.

**Actividad de la mesera** — Perfil detallado de una mesera específica con su historial de trabajo: cuántos juegos ha atendido, cuántos pedidos ha registrado, el consumo total que ha generado en ventas y el periodo de tiempo consultado. Esta información es la base para calcular comisiones y evaluar el rendimiento del personal.

---

### Cajeros

Administración de las cuentas de usuario que tienen acceso a la caja del local.

**Lista de cajeros** — Tabla con todos los cajeros registrados, su nombre de usuario, la sucursal a la que están asignados y su estado (activo/inactivo). El administrador puede crear nuevos cajeros, editar sus datos o desactivar su acceso si ya no trabaja en el local, todo sin eliminar su historial de turnos anteriores.

**Estado activo / inactivo** — Un cajero inactivo no puede iniciar sesión ni abrir un turno de caja. Esta distinción permite mantener el historial completo de un empleado aunque ya no esté trabajando, sin borrar información ni afectar los reportes de turnos pasados.

---

### Asignaciones

Control operativo de qué mesera atiende qué mesas durante el turno de trabajo.

**Asignación mesera-mesa** — Vista que permite al administrador asignar una mesera específica a una o varias mesas del local para el turno activo. Cuando una mesera está asignada a una mesa, los pedidos que ella registre desde su app quedan vinculados a esa mesa automáticamente. Si hay un cambio de personal durante el turno, el administrador reasigna las mesas desde esta pantalla en segundos, sin interrumpir los juegos en curso.

---

### Comisiones

Sistema de cálculo y seguimiento de las comisiones que gana cada mesera por sus ventas de productos.

**Configuración de comisión por producto** — El administrador define para cada producto cuál es el "precio de barra", es decir, el costo interno del producto. La diferencia entre el precio de venta al cliente y este precio de barra se convierte en la comisión que gana la mesera por cada unidad vendida. Esta configuración es flexible: se puede ajustar producto por producto y se puede modificar cuando los costos cambien.

**Ventas por mesera en un turno** — Vista de detalle que muestra todos los productos que vendió una mesera específica durante un turno seleccionado: qué vendió, cuántas unidades, a qué precio, y cuánta comisión generó cada ítem. Al final muestra el total de comisión acumulada para ese turno.

**Panel de comisiones** — Resumen consolidado de las comisiones generadas por todo el personal en un periodo de tiempo. Permite al administrador saber cuánto debe pagar de comisión a cada mesera antes de que terminen el turno o la semana, y llevar el control sin hacer cálculos manuales.

---

### Turnos

Historial y detalle de todos los turnos de caja que se han abierto y cerrado en el local.

**Listado de turnos** — Tabla paginada con todos los turnos registrados: cajero a cargo, fecha y hora de apertura, fecha y hora de cierre, total facturado durante el turno y si hubo diferencia de caja al cierre. Se puede filtrar por cajero, por fecha o por sucursal para encontrar rápidamente un turno específico.

**Detalle de turno** — Vista completa de un turno seleccionado: todas las facturas emitidas con sus montos, el total de ingresos desglosado por método de pago (efectivo, tarjeta, transferencia), el monto inicial declarado al abrir caja, el monto físico contado al cierre y la diferencia calculada. Desde aquí se puede descargar el reporte de cierre en PDF o Excel.

---

### Reportes

Centro de inteligencia del negocio. Gráficas y tablas que transforman los datos operativos en información útil para tomar decisiones.

**Ingresos diarios** — Gráfica de barras que muestra los ingresos de cada día en el rango de fechas seleccionado. Las barras están desagregadas en dos componentes: ingresos por tiempo de juego e ingresos por consumo de productos. Esto permite entender si el negocio depende más de la operación de mesas o de las ventas de la barra.

**Ocupación de mesas** — Análisis de cuánto tiempo estuvo ocupada cada mesa en el periodo seleccionado, desglosado por franja horaria. Permite identificar cuál es la mesa más rentable del local, en qué horarios hay mayor demanda y cuándo las mesas quedan subutilizadas. Información directamente accionable para definir tarifas por horario o planear la distribución del personal.

**Ranking de productos** — Lista ordenada de productos de mayor a menor volumen de ventas, con barras horizontales proporcionales a las unidades vendidas. Se puede filtrar por categoría para comparar, por ejemplo, solo las bebidas o solo los snacks. Ideal para decidir qué productos reordenar antes, cuáles quitar del menú y cuáles promocionar.

**Rendimiento de meseras** — Tabla comparativa del desempeño de todas las meseras en el periodo: número de pedidos registrados, tiempo promedio de atención, monto total de consumo generado y comisiones acumuladas. Permite identificar a las meseras más productivas y detectar quiénes pueden necesitar apoyo o capacitación.

**Reporte de cierre de turno** — Reporte estructurado de un turno específico seleccionado desde el historial. Incluye todas las facturas, los totales por método de pago, la conciliación de caja y cualquier diferencia registrada. Es el documento que el administrador revisa al final de cada día para validar la operación.

**Exportación a Excel y PDF** — Cada uno de los reportes anteriores tiene un botón de exportar presente en su vista. El sistema genera el archivo en el servidor y lo descarga automáticamente. El Excel incluye los datos crudos para análisis adicional; el PDF está formateado para imprimir o compartir por correo.

---

### Sucursales

Gestión de los locales físicos que forman parte de la cadena de billares.

**Lista de sucursales** — Vista de todas las sucursales registradas con su nombre, dirección, teléfono y estado operativo (activa/inactiva). El administrador con rol superadmin ve todas las sucursales de la plataforma; el administrador de sucursal solo ve las que tiene asignadas. Desde aquí se puede acceder al detalle de cada local.

**Creación y edición de sucursal** — Formulario para registrar un nuevo local o actualizar los datos de uno existente: nombre, dirección completa, teléfono de contacto y estado operativo. Crear una nueva sucursal habilita la posibilidad de asignarle mesas, cajeros y meseras propias.

---

### Usuarios (Administración)

Control centralizado de quién tiene acceso al panel web y con qué nivel de permisos.

**CRUD de usuarios admin y cajero** — Lista de todos los usuarios del sistema con su nombre, rol asignado (admin o cajero) y las sucursales a las que tienen acceso. El administrador puede crear nuevas cuentas, editar las existentes, cambiar el rol o desactivar el acceso de un usuario sin borrar su historial de actividad en el sistema.

**Control de acceso por rol** — Cada usuario solo puede ver y hacer lo que su rol le permite. Un cajero no puede acceder a los módulos de configuración ni a los reportes de comisiones; un admin no puede gestionar la plataforma completa. Los permisos se aplican tanto en el frontend (menú y rutas) como en el backend (API), de forma independiente.

---

### Configuración Personal

Preferencias individuales de cada usuario autenticado, independientes de la configuración del negocio.

**Cuenta** — Datos del usuario actualmente autenticado: nombre, correo y rol. Desde aquí puede cambiar su contraseña o actualizar su información de contacto.

**Apariencia** — Selector de tema visual: modo claro, modo oscuro o seguir la preferencia del sistema operativo. El cambio aplica inmediatamente en toda la interfaz sin recargar la página.

**Notificaciones** — Preferencias sobre qué tipos de alertas recibir y cómo: alertas de stock, alertas de mesas, eventos de caja. Cada usuario puede configurar lo que es relevante para su rol sin afectar a los demás.

**Display** — Opciones de visualización como densidad de las tablas (compacto o estándar), formato de fechas y otras preferencias de presentación de datos.

---

### Panel Superadmin (Plataforma)

Portal de administración global de toda la plataforma Genos Billar Tools. Solo accesible para el equipo que opera la plataforma como servicio.

**Gestión de billares** — Lista de todos los negocios registrados en la plataforma con su nombre, estado (activo/inactivo/suspendido) y el plan de suscripción que tienen contratado. Desde aquí el superadmin puede ver el estado de salud general de cada cliente y acceder al detalle de cualquier billar.

**Detalle de billar** — Vista completa de un billar específico: datos del negocio, administradores asignados, suscripción activa (plan, fecha de inicio, fecha de vencimiento, monto pagado) y estado operativo. Permite activar o suspender el acceso de un billar con un solo clic, por ejemplo ante un pago vencido.

**Gestión de administradores** — CRUD de cuentas de administrador vinculadas a cada billar. El superadmin puede crear un nuevo admin para un billar, editar sus datos, cambiar la sucursal asignada o desactivar su acceso. Cada admin tiene visibilidad solo sobre el billar al que está vinculado.

**Suscripciones y planes** — Gestión completa del modelo de negocio de la plataforma. El superadmin define los planes disponibles (demo, básico, pro) con sus límites (máximo de admins, cajas, cajeros y meseras) y los precios por periodo (mensual, semestral, anual). Desde aquí también asigna o renueva la suscripción de cada billar y puede consultar el historial de pagos y vigencia de cada cuenta.

---

## Características Principales

### Tiempo Real
- Actualización automática de mesas, juegos y pedidos vía **WebSocket (Socket.io)**
- Sin necesidad de refrescar la página — el panel se mantiene sincronizado con la operación del local
- Kanban de pedidos actualizado al instante cuando una mesera registra un pedido desde la app móvil

### Multi-Sucursal
- Un solo panel para gestionar múltiples locales desde la misma cuenta
- Filtros globales por sucursal en todas las vistas operativas
- Reportes consolidados o por sucursal individual

### Sistema de Suscripciones por Planes
| Plan | Admins | Cajas | Cajeros | Meseras |
|------|--------|-------|---------|---------|
| Demo | 1 | 1 | 0 | 1 |
| Pro | 2 | 2 | 3 | 6 |
| (configurable) | — | — | — | — |
- Periodos: mensual, semestral, anual
- Gestión desde el portal superadmin

### Sistema de Comisiones para Personal
- Precio de costo de barra configurable por producto
- Cálculo automático de comisión por ventas de cada mesera
- Reporte de comisiones por turno y por mesera

### Control de Caja y Turnos
- Apertura y cierre de turno con monto inicial declarado
- Conciliación automática: monto sistema vs. monto físico contado
- Historial completo de turnos con reporte de cierre descargable

### Reportes y Exportación
- Gráficas interactivas con **Recharts**
- Exportación a **Excel y PDF** directamente desde cada reporte
- Filtros por rango de fechas, sucursal y tipo de dato

### Seguridad
- Tokens de acceso almacenados **solo en memoria** (nunca en localStorage)
- Refresh token en **cookie httpOnly** — no accesible desde JavaScript
- Renovación automática de sesión sin interrumpir al usuario
- Guards por rol en cada ruta protegida

### Usabilidad
- Interfaz basada en **shadcn/ui + Tailwind CSS** — moderna, limpia y responsive
- Modo oscuro / modo claro configurable por usuario
- Navegación por teclado y accesibilidad en componentes de formulario

---

## Integraciones Técnicas

| Tecnología | Uso |
|-----------|-----|
| **React 18 + TypeScript** | Interfaz de usuario tipada |
| **Vite** | Build ultrarrápido |
| **React Router v6** | Navegación con rutas protegidas por rol |
| **React Query (TanStack)** | Caché de datos del servidor, refetch automático |
| **Zustand** | Estado global: auth, sucursal activa, UI |
| **Socket.io** | Eventos en tiempo real (mesas, pedidos, juegos) |
| **React Hook Form + Zod** | Formularios validados con esquema tipado |
| **Recharts** | Gráficas de reportes |
| **Axios** | Cliente HTTP con interceptores de auth |
| **shadcn/ui + Radix UI** | Componentes accesibles y personalizables |
| **Tailwind CSS** | Estilos utilitarios responsivos |

---

## Flujo Operativo Típico

```
Admin abre turno de caja
        ↓
Mesera asignada a mesas
        ↓
Cliente llega → Mesa marcada "Ocupada" → Juego iniciado
        ↓
Mesera toma pedidos desde app móvil → Aparecen en Kanban del panel
        ↓
Cajero ve pedidos pendientes en tiempo real → Marca como entregado
        ↓
Juego finaliza → Cajero factura (tiempo + consumos) → Factura registrada en turno
        ↓
Fin del turno → Cajero cierra caja → Sistema genera reporte de cierre
        ↓
Admin descarga reporte en Excel o PDF
```

---

## Público Objetivo

- Propietarios y administradores de billares y salones de juego
- Negocios con 1 a múltiples sucursales
- Locales que buscan digitalizar su operación (pedidos, caja, inventario)
- Negocios con personal de servicio (meseras) que necesitan control de comisiones

---

## Beneficios Clave

1. **Visibilidad total** — Sabes en todo momento qué pasa en cada mesa de tu local
2. **Menos errores en caja** — Conciliación automática al cierre de turno
3. **Control de personal** — Registro de actividad, comisiones y productividad de cada mesera
4. **Inventario siempre actualizado** — Alertas de stock bajo sin necesidad de conteo manual
5. **Decisiones basadas en datos** — Reportes de ingresos, ocupación y productos top
6. **Operación en tiempo real** — Panel y app de meseras sincronizados al instante
7. **Escalable** — Funciona para un local o para una cadena de múltiples sucursales
