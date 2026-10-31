# Guion — Video Tutorial: Panel Administrativo Genos Billar

> **Instrucciones de uso del guion**
> Cada sección indica: **[PANTALLA]** lo que debe verse en cámara, y el texto en voz de narrador.
> Las notas entre paréntesis `(acción)` son indicaciones de cámara/ratón, no se leen en voz alta.

---

## Introducción general

**[PANTALLA: logo o pantalla de inicio de sesión]**

> Bienvenido al tutorial del panel administrativo de Genos Billar.
> Este panel centraliza toda la operación de tu billar: desde controlar las mesas y los juegos en tiempo real, hasta gestionar inventario, caja, comisiones y reportes.
>
> A lo largo de este video vamos a recorrer cada módulo del sistema, explicar para qué sirve y mostrar cómo usarlo paso a paso.
> Empecemos.

---

## 1. Inicio de sesión

**[PANTALLA: página `/sign-in`]**

> Lo primero que verás al entrar al sistema es la pantalla de inicio de sesión.
> Aquí ingresas tu correo electrónico y tu contraseña.
>
> (escribir credenciales y hacer clic en "Iniciar sesión")
>
> Si tienes habilitada la verificación en dos pasos, el sistema te pedirá un código OTP que llegará a tu correo o aplicación de autenticación.
>
> Si olvidaste tu contraseña, usa el enlace "¿Olvidaste tu contraseña?" para iniciar el proceso de recuperación.
>
> Una vez autenticado, el sistema detecta automáticamente tu rol: superadmin, admin o cajero, y muestra solo las opciones que tienes permitidas.

---

## 2. Dashboard — Vista general

**[PANTALLA: página principal `/`]**

> Al ingresar, lo primero que verás es el Dashboard o tablero principal.
> Esta pantalla te da una fotografía instantánea del estado actual del billar.
>
> En la parte superior encontrarás las **tarjetas KPI**: ingresos del día, mesas ocupadas, pedidos pendientes y el total de juegos activos.
>
> Debajo, verás el **mapa de mesas**: una representación visual del piso del billar donde puedes ver de un vistazo cuáles mesas están disponibles, ocupadas o en mantenimiento.
>
> También hay un widget de **pedidos pendientes** que te alerta si hay órdenes sin gestionar.
>
> Por último, la gráfica de **ingresos** te muestra la tendencia de ventas reciente.
>
> Toda esta información se actualiza en tiempo real. No necesitas recargar la página.

---

## 3. Mesas

**[PANTALLA: `/mesas`]**

> El módulo de **Mesas** es el corazón de la operación. Aquí administras todas las mesas físicas del billar.

### ¿Qué muestra?

> Verás una cuadrícula de tarjetas, una por cada mesa. Cada tarjeta muestra el número de mesa, su nombre o tipo, y un indicador de estado con color:
>
> - **Verde — Disponible:** la mesa está libre y lista para usar.
> - **Rojo — Ocupada:** hay un juego activo en esta mesa.
> - **Amarillo — Reservada:** la mesa está apartada.
> - **Gris — Mantenimiento:** fuera de servicio temporalmente.

### Filtros

> En la parte superior puedes filtrar por estado: Todas, Disponible, Ocupada, Reservada o Mantenimiento. Esto es útil cuando tienes muchas mesas y quieres ver solo las disponibles rápidamente.

### Crear una mesa nueva

> (hacer clic en "Nueva Mesa")
>
> Se abre un formulario donde defines: el número de mesa, su nombre o descripción opcional, el tipo (pool, snooker, carambola) y la tarifa por hora. Completa los campos y guarda.

### Acciones sobre una mesa

> (hacer clic sobre una tarjeta de mesa disponible)
>
> Al hacer clic en una mesa se abre el panel de acciones. Desde aquí puedes:
>
> - **Iniciar un juego** en esa mesa.
> - **Hacer un pedido rápido** de productos directamente desde la mesa.
> - **Editar** los datos de la mesa (número, tipo, tarifa).
> - Cambiar su estado a Mantenimiento si es necesario.
>
> Todo lo que hagas aquí se refleja instantáneamente en el Dashboard y en el módulo de Juegos.

---

## 4. Juegos Activos

**[PANTALLA: `/juegos`]**

> El módulo de **Juegos Activos** muestra en tiempo real todos los juegos que están ocurriendo en este momento.

### Sección "Juegos Activos"

> Cada tarjeta de juego muestra: el número de mesa, el tiempo transcurrido en formato cronómetro, el estado (En juego o Pausado), y el costo acumulado según la tarifa por hora.
>
> (hacer clic en una tarjeta de juego)
>
> Al hacer clic en un juego se abre el **panel de detalle**. Aquí puedes:
>
> - Ver el resumen completo: hora de inicio, jugadores, productos consumidos y subtotal.
> - **Pausar o reanudar** el juego.
> - **Finalizar** el juego, lo que detiene el cronómetro y lo mueve a la sección de pendientes de cobro.

### Sección "Pendientes de cobro"

> (señalar la sección naranja en la parte inferior)
>
> Cuando un juego se finaliza, aparece aquí con una etiqueta naranja. Esto le indica al cajero que hay una cuenta por cobrar.
>
> (hacer clic en "Registrar cobro")
>
> Se abre el modal de **facturación**. El sistema calcula automáticamente el total sumando el tiempo de juego más los consumos. Seleccionas el método de pago —efectivo, tarjeta u otro— y confirmas. El sistema genera la factura y libera la mesa.

---

## 5. Pedidos

**[PANTALLA: `/pedidos`]**

> El módulo de **Pedidos** funciona como un tablero Kanban para gestionar los pedidos de productos que hacen los clientes desde sus mesas.

### Las columnas

> Hay dos columnas principales:
>
> - **Pendientes:** pedidos recién enviados que aún no han sido atendidos.
> - **Aceptados:** pedidos que ya fueron aceptados y están siendo preparados.

### Flujo de un pedido

> (señalar una tarjeta en la columna Pendientes)
>
> Cada tarjeta muestra: el número de mesa o juego de origen, los productos solicitados con sus cantidades, y el total.
>
> Para gestionar un pedido tienes tres opciones:
>
> 1. **Aceptar:** el pedido pasa a la columna "Aceptados" y la cocina o barra sabe que debe prepararlo.
> 2. **Rechazar:** se abre un diálogo donde escribes el motivo del rechazo. El sistema notifica al origen.
> 3. Cuando el pedido ya está listo y fue entregado, desde la columna "Aceptados" haces clic en **Marcar entregado**, seleccionas el método de pago y confirmas.
>
> Este módulo se actualiza en tiempo real: cuando llega un nuevo pedido desde la app de meseras o desde la mesa, aparece automáticamente sin necesidad de recargar.

---

## 6. Barra — Admin

**[PANTALLA: `/barra-admin`]**

> El módulo de **Barra Admin** es el punto de venta de la barra del billar. Permite abrir cuentas para clientes y gestionarlas de forma independiente a las mesas.

### Panel izquierdo: cuentas abiertas

> (señalar la columna izquierda)
>
> Aquí ves la lista de todas las cuentas abiertas en este momento, con su identificador, descripción opcional y total acumulado.

### Crear una cuenta nueva

> (hacer clic en "Nueva cuenta")
>
> Puedes agregar una descripción para identificar la cuenta, por ejemplo el nombre del cliente. Al confirmar, la cuenta aparece en la lista y queda seleccionada.

### Gestionar una cuenta

> (hacer clic en una cuenta)
>
> En el panel derecho ves el detalle completo: los ítems agregados, sus cantidades, precios y el total.
>
> (hacer clic en "Agregar ítem")
>
> Buscas el producto por nombre, defines la cantidad y lo agregas. El total se actualiza al instante.

### Cobrar una cuenta

> (hacer clic en "Cobrar")
>
> Se abre el diálogo de cobro con el total final. Seleccionas el método de pago y confirmas. La cuenta se cierra y queda registrada en el historial.

### Historial de barra

> **[PANTALLA: `/barra-admin/historial`]**
>
> En el historial puedes consultar todas las cuentas cerradas, con fecha, descripción y monto cobrado. También puedes hacer clic en cualquier cuenta para ver su detalle completo.

---

## 7. Caja

**[PANTALLA: `/caja`]**

> El módulo de **Caja** controla el flujo de dinero en efectivo del billar a través del concepto de turnos.

### ¿Qué es un turno?

> Un turno es el período de trabajo de un cajero. Tiene un momento de apertura con un monto inicial, y un cierre con el recuento final.

### Abrir turno

> (hacer clic en "Abrir turno")
>
> Ingresas el monto inicial en caja —el efectivo con el que empiezas el turno— y confirmas. A partir de ese momento, todas las transacciones en efectivo se asocian a este turno.

### Vista del turno activo

> Mientras el turno está abierto, verás en la tarjeta: el nombre del cajero, la hora de apertura, el monto inicial y el **total acumulado**: la suma de todos los pagos recibidos durante el turno.

### Facturas del turno

> (señalar la tabla de facturas)
>
> Debajo del resumen aparece el listado de todas las facturas generadas en este turno: juegos, pedidos y cuentas de barra cobrados. Puedes ver el detalle de cada una.

### Cerrar turno

> (hacer clic en "Cerrar turno")
>
> Ingresas el monto físico que tienes en caja. El sistema compara ese valor con el monto que debería haber según las transacciones —llamado "monto sistema"— y muestra la **diferencia**. Una diferencia en verde indica sobrante, en rojo indica faltante.
>
> Al confirmar, el turno queda cerrado y archivado.

### Historial de turnos

> **[PANTALLA: `/turnos`]**
>
> En esta sección puedes consultar todos los turnos anteriores, filtrar por cajero o por fecha, y hacer clic en cualquier turno para ver su resumen detallado con todas las facturas.

---

## 8. Inventario

**[PANTALLA: `/inventario`]**

> El módulo de **Inventario** controla el stock de todos los productos del billar.

### Alertas de stock

> (señalar el banner superior si hay alertas)
>
> Si algún producto tiene stock crítico o por debajo del mínimo, aparece un banner de alerta en la parte superior para que actúes de inmediato.

### Pestaña: Stock actual

> La tabla principal muestra todos los productos con su stock actual y su nivel mínimo configurado.
>
> El color del stock te indica el estado:
> - **Verde:** nivel saludable.
> - **Amarillo:** stock bajo, cerca del mínimo.
> - **Rojo:** stock crítico, por debajo del mínimo.
>
> Puedes filtrar la tabla para ver solo los productos en estado "Stock bajo" o "Crítico", o buscar por nombre.

### Ajustar stock

> (hacer clic en "Ajustar" en un producto)
>
> Se abre el modal de ajuste. Seleccionas el tipo: **Entrada** si estás registrando una compra o reposición, o **Ajuste** si corriges el conteo manualmente. Ingresas la cantidad y el motivo. Al guardar, el stock se actualiza y el movimiento queda registrado.

### Pestaña: Movimientos

> Aquí tienes el historial completo de todos los cambios de stock: quién hizo el ajuste, cuándo, cuánto y por qué. Puedes filtrar por tipo de movimiento o buscar por producto.

---

## 9. Productos

**[PANTALLA: `/productos`]**

> El módulo de **Productos** es el catálogo de todo lo que se vende en el billar: bebidas, snacks, alquiler de accesorios, etc.

### Vista principal

> Verás la lista de todos los productos con su nombre, categoría, precio y estado (activo/inactivo).

### Agregar un producto

> (hacer clic en "Nuevo Producto")
>
> El formulario pide: nombre, categoría, precio de venta, precio de costo opcional, descripción y si es un producto que maneja inventario. Al activar el inventario, también defines el stock mínimo.

### Editar o desactivar

> (hacer clic en el menú de opciones de un producto)
>
> Puedes editar cualquier dato del producto, o desactivarlo para que ya no aparezca disponible en pedidos y ventas sin necesidad de eliminarlo.

---

## 10. Categorías

**[PANTALLA: `/categorias`]**

> Las **Categorías** permiten agrupar los productos para facilitar su búsqueda en el punto de venta.
>
> Aquí puedes crear, editar o eliminar categorías. Por ejemplo: "Bebidas", "Alimentos", "Accesorios de billar".
>
> Estas categorías aparecen como filtros en los módulos de Pedidos y Barra cuando se agrega un ítem.

---

## 11. Meseras

**[PANTALLA: `/meseras`]**

> El módulo de **Meseras** gestiona el personal de servicio que atiende las mesas.

### Vista principal

> Se muestra la lista de meseras registradas con foto de perfil, nombre completo y estado (activa/inactiva).

### Registrar una mesera

> (hacer clic en "Nueva Mesera")
>
> Ingresas nombre completo, número de teléfono, correo y foto opcional. Al guardar, la mesera queda disponible para ser asignada a mesas y para registrar ventas.

### Editar o desactivar

> Desde el menú de opciones puedes editar los datos de una mesera o desactivarla temporalmente si no está trabajando.

---

## 12. Asignación de Mesas

**[PANTALLA: `/asignaciones`]**

> El módulo de **Asignación de Mesas** define qué mesera es responsable de atender qué mesas durante su turno.

### ¿Cómo funciona?

> (señalar la fila de avatares de meseras)
>
> En la parte superior ves todas las meseras disponibles. Cada una muestra cuántas mesas tiene asignadas.
>
> (hacer clic en una mesera)
>
> Al seleccionarla, el panel se divide en dos columnas:
> - **Izquierda — Mesas asignadas:** las que ya están a cargo de esta mesera.
> - **Derecha — Disponibles para asignar:** mesas que no tienen ninguna mesera asignada.

### Asignar mesas

> (seleccionar una o varias mesas del panel derecho)
>
> Puedes seleccionar una o varias mesas usando los checkboxes. Haces clic en "Asignar" y quedan registradas bajo esa mesera.

### Gestionar asignaciones existentes

> En el panel izquierdo puedes seleccionar asignaciones y:
> - **Activar/Desactivar:** si la mesera no está atendiendo una mesa temporalmente.
> - **Quitar:** eliminar la asignación completamente.

---

## 13. Cajeros

**[PANTALLA: `/cajeros`]**

> El módulo de **Cajeros** administra los usuarios que tienen acceso al módulo de Caja.

### Registrar un cajero

> (hacer clic en "Nuevo Cajero")
>
> Ingresas nombre, correo, y contraseña inicial. Este usuario podrá iniciar sesión con el rol de cajero y gestionar los turnos de caja.

### Lista de cajeros

> Puedes ver todos los cajeros activos, editar sus datos o desactivar su acceso sin eliminar su historial de turnos.

---

## 14. Comisiones

**[PANTALLA: `/comisiones`]**

> El módulo de **Comisiones** permite configurar y consultar las comisiones que ganan las meseras por las ventas de productos.

### Pestaña: Configuración (solo Admin/Superadmin)

> (hacer clic en la pestaña "Configuración")
>
> Aquí defines el porcentaje de comisión por producto o por categoría. Por ejemplo: "Cervezas → 10% de comisión por unidad vendida".
>
> (hacer clic en "Nueva configuración")
>
> Seleccionas el producto, defines el porcentaje y guardas. Puedes configurar diferentes porcentajes para diferentes productos.

### Pestaña: Ventas

> (hacer clic en la pestaña "Ventas")
>
> Esta tabla muestra el resumen de ventas por mesera en un período seleccionado: cuántas unidades de cada producto vendió y la comisión acumulada.
>
> Desde aquí el administrador puede hacer el cálculo de pagos al final del período.

---

## 15. Sucursales

**[PANTALLA: `/sucursales`]**

> El módulo de **Sucursales** permite gestionar las diferentes sedes o locales del billar.

> Aquí puedes registrar cada sucursal con su nombre, dirección y datos de contacto. Si tu negocio tiene varios locales, este módulo te permite centralizar su administración desde un solo panel.
>
> (hacer clic en "Nueva Sucursal")
>
> Completa el formulario con los datos del local y guarda. Los usuarios y mesas pueden luego asociarse a su sucursal correspondiente.

---

## 16. Usuarios

**[PANTALLA: `/usuarios`]**

> El módulo de **Usuarios** gestiona todas las cuentas del sistema con acceso al panel administrativo.

> Aquí puedes crear usuarios con rol **Admin** o **Cajero**, editar sus datos y desactivar cuentas.
>
> Recuerda que los roles determinan qué módulos puede ver cada usuario:
> - **Superadmin:** acceso total al sistema y a todos los billares.
> - **Admin:** gestión completa del billar asignado.
> - **Cajero:** acceso limitado a Caja, Juegos y Pedidos.

---

## 17. Reportes

**[PANTALLA: `/reportes`]**

> El módulo de **Reportes** te da análisis detallados del desempeño del billar en el período que elijas.

### Filtro de fechas

> (señalar los selectores de fecha)
>
> Lo primero es definir el rango de fechas: fecha de inicio y fecha de fin. Por defecto el sistema muestra los últimos 30 días.

### Pestaña: Ingresos

> Muestra una gráfica de barras con los ingresos diarios. Puedes ver la tendencia de ventas, identificar los días más activos y comparar semanas.

### Pestaña: Mesas

> Muestra el índice de ocupación de cada mesa: cuántas horas estuvo en uso durante el período seleccionado. Esto te ayuda a identificar las mesas más populares y las que menos se usan.

### Pestaña: Productos

> Muestra el ranking de productos más vendidos por unidades y por ingresos generados. Útil para decisiones de compra e inventario.

### Pestaña: Meseras

> Muestra el rendimiento individual de cada mesera: número de pedidos atendidos, total en ventas y comisiones generadas.

---

## 18. Configuración de cuenta

**[PANTALLA: `/settings`]**

> En el menú de configuración, accesible desde tu perfil en la esquina superior derecha, puedes:
>
> - **Perfil:** actualizar tu nombre, foto y datos de contacto.
> - **Cuenta:** cambiar tu correo o contraseña.
> - **Apariencia:** cambiar entre modo claro y modo oscuro, y ajustar el tamaño de fuente.
> - **Notificaciones:** configurar qué alertas quieres recibir.

---

## Cierre del video

**[PANTALLA: Dashboard]**

> Eso es todo lo que necesitas saber para usar el panel administrativo de Genos Billar.
>
> Para resumir el flujo operativo del día a día:
>
> 1. El cajero **abre su turno** en el módulo de Caja.
> 2. El personal **inicia juegos** desde el módulo de Mesas.
> 3. Las meseras gestionan **pedidos** desde su app, que llegan al módulo de Pedidos.
> 4. Al terminar un juego, el cajero **registra el cobro** desde Juegos Activos.
> 5. Al final del turno, el cajero **cierra su turno** y registra el efectivo en caja.
> 6. El administrador revisa los **reportes** para tomar decisiones.
>
> Si tienes dudas o necesitas soporte, no dudes en contactar al equipo de Genos.
> ¡Hasta la próxima!

---

*Documento generado el 2026-05-23 — v1.0*
