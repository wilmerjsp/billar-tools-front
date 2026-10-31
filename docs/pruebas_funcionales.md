# Plan de pruebas funcionales — Genos Billar Tools (Frontend)

Conjunto de pruebas funcionales end-to-end para validar el sistema completo desde la UI, ejecutadas contra un backend real (ambiente de pruebas/staging).

## Convenciones

- **ID:** `[MÓDULO]-[número]` (ej. `CAJA-03`). Usar el ID al reportar bugs.
- **Roles:** `SA` = superadmin, `AD` = admin, `CJ` = cajero. Si no se indica rol, ejecutar con admin.
- **Resultado esperado:** lo que debe verse en la UI. Cuando aplique, verificar también persistencia (recargar la página y confirmar que el estado se mantiene).

## Preparación del ambiente (datos semilla)

Antes de ejecutar la suite, dejar el ambiente en este estado:

1. Un billar (sucursal) activo con al menos **2 cajas** creadas (ej. "Caja Principal", "Caja Barra").
2. Usuarios: 1 superadmin, 1 admin del billar, **2 cajeros** del mismo billar.
3. Al menos **2 meseras** activas registradas.
4. Mínimo 6 mesas: algunas con tarifa por hora (registran tiempo) y al menos una que no registre tiempo.
5. Catálogo: 2 categorías, 5+ productos con inventario inicial, 1 producto tipo **combo**, 1 producto **sin** control de inventario.
6. Sin turnos de caja abiertos al iniciar (estado limpio).

Dispositivos sugeridos: escritorio (Chrome/Firefox) y una tablet (los flujos de impresión tienen comportamiento específico en tablet).

---

## 1. Autenticación y sesión (AUTH)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| AUTH-01 | Login exitoso | Todos | 1. Ir a `/login` 2. Ingresar credenciales válidas | Redirige al dashboard; nombre y rol visibles en el perfil |
| AUTH-02 | Login con credenciales inválidas | — | Ingresar contraseña errónea | Mensaje de error claro; no redirige; no queda sesión |
| AUTH-03 | Persistencia de sesión al recargar | Todos | Con sesión iniciada, recargar la página (F5) | La sesión se restaura vía refresh token (cookie httpOnly); no vuelve a `/login` |
| AUTH-04 | Expiración del access token | Todos | Dejar la sesión inactiva hasta expirar el token y ejecutar una acción (ej. abrir Mesas) | La petición se reintenta transparente tras el refresh; sin error visible |
| AUTH-05 | Refresh inválido fuerza logout | Todos | Invalidar el refresh token desde backend y ejecutar una acción | Logout forzado y redirección a `/login` |
| AUTH-06 | Logout manual | Todos | Cerrar sesión desde el menú de perfil | Redirige a `/login`; volver atrás con el navegador no muestra datos |
| AUTH-07 | Token no expuesto en storage | — | Con sesión activa, inspeccionar `localStorage` y `sessionStorage` | El `access_token` NO aparece en ningún storage (solo en memoria) |
| AUTH-08 | Ruta protegida sin sesión | — | Sin sesión, navegar directo a `/mesas` | Redirige a `/login` |

## 2. Roles y permisos (ROLE)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| ROLE-01 | Menú por rol | SA/AD/CJ | Iniciar sesión con cada rol y revisar el sidebar | Cada rol ve solo sus módulos (usuarios/sucursales solo SA-AD; caja visible para CJ) |
| ROLE-02 | Cajero no accede a usuarios por URL | CJ | Navegar directo a `/usuarios` | Bloqueado por RoleGuard (redirección o página no autorizada) |
| ROLE-03 | Cajero no puede anular facturas | CJ | Abrir el listado de facturas de su turno | La opción de anular no está disponible |
| ROLE-04 | Cajero no edita productos | CJ | Ir a productos (si tiene acceso) | Sin botones de crear/editar |
| ROLE-05 | Validación de permisos en API | CJ | Con las herramientas de red, repetir manualmente una petición admin (ej. crear caja) usando el token del cajero | El API responde 403; la UI no es la única barrera |

## 3. Superadmin (SUPER)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| SUPER-01 | Dashboard global | SA | Abrir el dashboard de superadmin | Métricas agregadas de todos los billares |
| SUPER-02 | Crear billar | SA | Crear un billar nuevo con sus datos | Aparece en el listado; se puede abrir su detalle |
| SUPER-03 | Editar/desactivar billar | SA | Desactivar un billar | Los usuarios de ese billar no pueden operar |
| SUPER-04 | Crear administrador y asignar billar | SA | Crear admin y asignarlo a un billar | El admin puede iniciar sesión y solo ve su(s) billar(es) |
| SUPER-05 | Suscripciones | SA | Revisar/cambiar el estado de suscripción de un billar | El estado se refleja y restringe (o habilita) el acceso según corresponda |

## 4. Usuarios, cajeros y meseras (USER)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| USER-01 | Crear cajero | AD | Crear un cajero para la sucursal | Puede iniciar sesión; su rol de sucursal es cajero |
| USER-02 | Editar cajero | AD | Cambiar nombre/credenciales | Cambios persisten; el cajero puede entrar con la nueva credencial |
| USER-03 | Desactivar cajero | AD | Desactivar un cajero | No puede iniciar sesión; sus turnos históricos se conservan |
| USER-04 | Crear mesera | AD | Registrar una mesera nueva | Aparece en el listado y disponible para asignaciones |
| USER-05 | Asignaciones de meseras | AD | En asignaciones, asignar mesera a la jornada/zona | La asignación queda visible; los pedidos de esa mesera llegan identificados con su nombre |
| USER-06 | Validaciones de formulario | AD | Intentar guardar usuario con campos vacíos o email inválido | Mensajes de validación Zod bajo cada campo; no envía la petición |

## 5. Mesas (MESA)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| MESA-01 | Listado y estados | AD/CJ | Abrir `/mesas` | Se ven todas las mesas con su estado (libre/ocupada) diferenciado visualmente |
| MESA-02 | Crear mesa | AD | Crear mesa con número, tipo y tarifa | Aparece en el mapa; validación de tarifa negativa rechazada |
| MESA-03 | Editar mesa | AD | Cambiar la tarifa por hora de una mesa libre | El próximo juego usa la tarifa nueva; juegos en curso conservan la anterior |
| MESA-04 | Acciones bloqueadas en mesa ocupada | AD | Con un juego activo en la mesa, intentar editar/eliminar | Acciones bloqueadas mientras esté ocupada |
| MESA-05 | Iniciar juego desde la mesa | AD/CJ | Seleccionar mesa libre → iniciar juego | La mesa pasa a ocupada; el juego aparece en `/juegos` con cronómetro corriendo |
| MESA-06 | Mesa sin registro de tiempo | AD/CJ | Iniciar juego en una mesa que no registra tiempo | No corre cronómetro ni cobra tiempo; solo consumos |

## 6. Juegos (JUEGO)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| JUEGO-01 | Cronómetro y costo de tiempo | AD/CJ | Iniciar juego en mesa con tarifa; esperar unos minutos | El tiempo transcurrido y el costo acumulado se actualizan coherentes con la tarifa |
| JUEGO-02 | Agregar consumos al juego | AD/CJ | Agregar 2 productos al juego activo | Aparecen en el detalle con precio y cantidad; el total del juego los suma |
| JUEGO-03 | Resumen del juego | AD/CJ | Abrir el resumen del juego | Desglose: costo tiempo + consumos = total |
| JUEGO-04 | Facturar juego (requiere turno propio) | CJ | Con turno abierto, facturar el juego eligiendo método de pago | Modal muestra "Se registrará en [su caja] — Turno #N"; factura generada; mesa vuelve a libre |
| JUEGO-05 | Facturar sin turno propio | CJ | Sin turno abierto, intentar facturar | Mensaje "No tienes un turno de caja abierto…"; el cobro se bloquea |
| JUEGO-06 | Facturar con descuento | AD/CJ | Facturar aplicando descuento | Total a cobrar = total − descuento; la factura registra el descuento |
| JUEGO-07 | Historial de juegos | AD | Abrir historial | Juegos finalizados con fecha, mesa, total y estado de facturación |
| JUEGO-08 | Dos usuarios ven el mismo juego | AD+CJ | Admin y cajero con el juego abierto en dos navegadores; admin agrega consumo | El cajero ve el consumo aparecer sin recargar (WebSocket) |

## 7. Pedidos — kanban de mesera (PED)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| PED-01 | Pedido de mesera llega al kanban | AD/CJ | Mesera envía pedido (mesa o barra) desde su app | Aparece en la columna Pendientes en tiempo real, con nombre de la mesera |
| PED-02 | Aceptar pedido | AD/CJ | Aceptar un pedido pendiente | Pasa a Aceptados; se agrupa correctamente por origen (juego/barra) |
| PED-03 | Rechazar con motivo | AD/CJ | Rechazar indicando motivo | Estado rechazado; el motivo queda registrado y visible para la mesera |
| PED-04 | Entregar pedido de juego | AD/CJ | Marcar entregado un pedido de juego | Se agrega a los consumos del juego; sin cobro inmediato |
| PED-05 | Entregar pedido de barra con turno propio | CJ | Con turno abierto, entregar pedido de barra eligiendo método de pago | Diálogo muestra "Se registrará en [su caja] — Turno #N"; la venta queda en SU turno |
| PED-06 | Entregar pedido de barra sin turno propio | CJ | Sin turno abierto, intentar entregar | Alerta "No tienes un turno de caja abierto…"; botón Confirmar deshabilitado |
| PED-07 | Monto recibido y vuelto | CJ | Con la preferencia de monto recibido activa, entregar en efectivo ingresando un monto mayor | Calcula el vuelto; si el monto es menor al total, muestra error y no permite confirmar |
| PED-08 | Cancelar pedido aceptado | AD/CJ | Cancelar un pedido en estado aceptado | Vuelve inventario/estado consistente; desaparece del tablero |
| PED-09 | Concurrencia: dos usuarios, mismo pedido | AD+CJ | Admin y cajero ven el mismo pedido pendiente; ambos intentan aceptarlo casi a la vez | Solo uno lo procesa; el otro recibe error del API sin duplicar; el tablero se sincroniza |

## 8. Caja y turnos (CAJA)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| CAJA-01 | Crear caja (solo admin) | AD | Crear una caja nueva | Aparece en el selector; con rol cajero el botón "Crear caja" NO existe |
| CAJA-02 | Abrir turno con monto de apertura | CJ | Abrir turno en una caja libre indicando base inicial | Turno activo visible con cajero, fecha y monto inicial |
| CAJA-03 | No se puede abrir doble turno en la misma caja | AD | Con turno abierto en Caja 1, intentar abrir otro en Caja 1 | El API lo rechaza; error claro en UI |
| CAJA-04 | Un turno por usuario | CJ | Con turno abierto en Caja 1, intentar abrir turno en Caja 2 con el mismo usuario | Rechazado (regla de negocio backend); verificar mensaje |
| CAJA-05 | Registrar ingreso manual | AD/CJ | Registrar movimiento tipo ingreso con concepto y monto | Aparece en movimientos; el efectivo esperado sube |
| CAJA-06 | Registrar egreso manual | AD/CJ | Registrar egreso | Aparece en movimientos; el efectivo esperado baja |
| CAJA-07 | Resumen del turno | AD/CJ | Con ventas hechas, revisar el panel del turno | Ventas por método de pago, ingresos/egresos manuales, comisiones y efectivo esperado cuadran con las operaciones realizadas |
| CAJA-08 | Pre-cierre bloquea con pendientes | AD/CJ | Con un juego en curso o barra abierta, intentar cerrar turno | El pre-cierre lista los pendientes y no permite cerrar |
| CAJA-09 | Cerrar turno y diferencia | AD/CJ | Cerrar turno ingresando monto contado distinto al esperado | Registra diferencia (faltante/sobrante) y observaciones; la pantalla queda sin turno activo |
| CAJA-10 | Historial de turnos y detalle | AD | Abrir historial de turnos y el detalle de uno cerrado | Fechas, montos, diferencia, facturas y movimientos del turno |
| CAJA-11 | Anular factura | AD | Anular una factura del turno con motivo | Estado anulada; el total del turno se ajusta; cajero no ve la opción |
| CAJA-12 | Renombrar/eliminar caja (solo admin) | AD | Renombrar una caja; intentar eliminar una con turno abierto | Renombrado ok; eliminación con turno abierto rechazada |

## 9. Multi-caja: dos turnos simultáneos (MULTI) — escenario crítico

Preparación: Cajero A abre turno en Caja 1 y Admin B abre turno en Caja 2, sesiones simultáneas en dos navegadores.

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| MULTI-01 | Entrega se atribuye a quien entrega | CJ A | Cajero A entrega un pedido de barra | La factura queda en el turno de Caja 1; NO aparece en Caja 2 |
| MULTI-02 | Entrega cruzada | AD B | Admin B entrega otro pedido | Queda en el turno de Caja 2; los totales de Caja 1 no cambian |
| MULTI-03 | Facturar juego con dos cajas abiertas | CJ A / AD B | Cada uno factura un juego distinto | Cada factura cae en el turno del que facturó; los modales muestran la caja correcta |
| MULTI-04 | Cobro de barra automático | CJ A | Cobrar una cuenta de barra | Sin selector de turno: cobra directo en Caja 1 con línea "Se registrará en Caja 1" |
| MULTI-05 | Vista de caja del cajero restringida | CJ A | Abrir `/caja` como Cajero A | Solo ve Caja 1 (su turno); no hay selector ni datos de Caja 2 |
| MULTI-06 | Vista de caja del admin completa | AD B | Abrir `/caja` como admin | Ve el selector con ambas cajas y puede consultar los dos turnos |
| MULTI-07 | Cajero sin turno solo ve cajas libres | CJ (tercero) | Un segundo cajero sin turno entra a `/caja` | Ve solo las cajas sin turno activo; si todas están ocupadas, mensaje de espera |
| MULTI-08 | Cierres independientes | CJ A / AD B | Cada uno cierra su turno contando su efectivo | Cada cierre cuadra únicamente con sus propias operaciones; sin cruces |
| MULTI-09 | Usuario sin turno no puede cobrar | CJ (tercero) | Sin turno, intentar entregar pedido / facturar juego / cobrar barra | Las tres acciones bloqueadas con "No tienes un turno de caja abierto…" |

## 10. Barra (BARRA)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| BARRA-01 | Abrir cuenta de barra | AD/CJ | Crear cuenta de barra con descripción | Aparece en cuentas activas |
| BARRA-02 | Agregar y quitar items | AD/CJ | Agregar productos con notas; modificar cantidad | Total recalculado; inventario descuenta al confirmar según regla de negocio |
| BARRA-03 | Cobrar cuenta de barra | CJ | Cobrar una cuenta con items | Cobro directo al turno propio (sin selector); factura generada; cuenta cerrada |
| BARRA-04 | Cerrar cuenta vacía sin factura | AD/CJ | Cerrar una cuenta de barra sin items | Se cierra sin generar factura |
| BARRA-05 | Historial de barra | AD | Revisar historial con filtros de fecha | Cuentas cerradas con totales y turno en que se cobraron |
| BARRA-06 | Recibo de barra | AD/CJ | Cobrar e imprimir recibo | El recibo sale con los datos correctos (probar también en tablet) |

## 11. Productos, categorías y combos (PROD)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| PROD-01 | Crear categoría y producto | AD | Crear categoría; crear producto con precio e inventario | Disponibles al agregar consumos y en pedidos de mesera |
| PROD-02 | Editar precio | AD | Cambiar precio de un producto | Ventas nuevas usan el precio nuevo; consumos ya registrados conservan el snapshot del precio anterior |
| PROD-03 | Sin botón eliminar | AD | Revisar acciones en productos y categorías | No existe opción de eliminar (regla actual); solo desactivar/editar |
| PROD-04 | Crear combo | AD | Crear producto combo con 2+ componentes | Al venderlo, descuenta inventario de los componentes, no del combo |
| PROD-05 | Producto sin inventario | AD | Vender un producto sin control de inventario | La venta pasa sin validar stock |
| PROD-06 | Selector buscable | AD/CJ | En agregar consumo, escribir en el buscador de productos | Filtra por texto; con 50+ productos la lista responde con fluidez |

## 12. Inventario (INV)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| INV-01 | Entrada de inventario | AD | Registrar entrada (compra) de un producto | Stock aumenta; movimiento en kardex con costo |
| INV-02 | Salida/ajuste | AD | Registrar ajuste negativo con motivo | Stock disminuye; kardex registra el motivo |
| INV-03 | Descuento automático por venta | AD | Vender 2 unidades de un producto con stock conocido | Stock baja exactamente 2; kardex refleja la venta |
| INV-04 | Venta de combo descuenta componentes | AD | Vender un combo | Kardex de cada componente registra la salida |
| INV-05 | Stock insuficiente | CJ | Intentar vender más unidades que el stock | Comportamiento según regla de negocio (bloqueo o alerta), consistente entre pedidos y consumo directo |
| INV-06 | Kardex con filtros | AD | Filtrar kardex por producto y rango de fechas | Movimientos correctos con saldo acumulado coherente |

## 13. Comisiones de meseras (COMI)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| COMI-01 | Comisión generada por venta | AD | Mesera vende productos con comisión configurada; revisar comisiones del turno | Comisión calculada según configuración por producto |
| COMI-02 | Resumen por mesera | AD | Abrir ventas por mesera filtrando por turno | Totales por mesera cuadran con los pedidos entregados |
| COMI-03 | Comisiones descuentan del efectivo | AD/CJ | Revisar el resumen del turno de caja | "Comisiones de meseras" resta en el efectivo esperado |

## 14. Reportes (REP)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| REP-01 | Reporte de ventas por rango | AD | Generar reporte de ventas de un rango con datos conocidos | Totales cuadran con las facturas emitidas (verificar contra CAJA-07) |
| REP-02 | Exportar a Excel | AD | Exportar cualquier reporte a Excel | Archivo descarga y abre; datos consistentes con la pantalla |
| REP-03 | Exportar a PDF | AD | Exportar a PDF | PDF legible con los mismos totales |
| REP-04 | Reporte sin datos | AD | Rango de fechas sin actividad | Estado vacío claro; sin errores |
| REP-05 | Carga diferida | AD | Navegar a reportes por primera vez | La página carga (lazy) sin romper; skeleton visible durante la carga |

## 15. Tiempo real y resiliencia (RT)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| RT-01 | Pedido nuevo en tiempo real | AD+CJ | Con el kanban abierto en dos sesiones, mesera envía pedido | Aparece en ambas sin recargar |
| RT-02 | Reconexión de WebSocket | AD | Desconectar la red 30s y reconectar | Al volver, el estado se resincroniza (refetch); sin datos fantasma |
| RT-03 | API caída | AD | Con el backend detenido, navegar por la app | Estados de error con opción "Reintentar"; sin pantallas en blanco |
| RT-04 | Doble clic en acciones de dinero | CJ | Doble clic rápido en "Confirmar cobro" | Una sola factura (botón deshabilitado durante `isPending`) |

## 16. Impresión (IMP)

| ID | Caso | Rol | Pasos | Resultado esperado |
|----|------|-----|-------|--------------------|
| IMP-01 | Ticket de factura en escritorio | CJ | Facturar e imprimir | Ticket con datos del billar, items, totales y método de pago |
| IMP-02 | Impresión en tablet | CJ | Repetir IMP-01 desde tablet | Imprime correctamente (regresión del fix específico de tablets) |
| IMP-03 | Configuración de ticket | AD | Cambiar configuración de impresión (ver `docs/configuracion-impresion-ticket.md`) | Los cambios se reflejan en el siguiente ticket |

---

## Suite de humo (smoke test — ~15 min)

Para validar rápido después de cada despliegue, ejecutar en orden:

1. AUTH-01, AUTH-03 — entrar y recargar.
2. CAJA-02 — abrir turno.
3. MESA-05 → JUEGO-02 → JUEGO-04 — juego completo con consumo y cobro.
4. PED-01 → PED-02 → PED-05 — ciclo de pedido de mesera.
5. BARRA-01 → BARRA-03 — cuenta de barra cobrada.
6. CAJA-07 → CAJA-09 — el turno cuadra y cierra.
7. MULTI-01 y MULTI-05 — si hay dos cajas abiertas, atribución y visibilidad correctas.

## Registro de resultados

Para cada ejecución documentar: fecha, ambiente, versión (hash de commit), ejecutor, y por caso: ✅ pasa / ❌ falla / ⏭️ no aplica, con evidencia (captura) para los fallos. Los casos MULTI-* y los de permisos (ROLE-*, CAJA-01) son bloqueantes para release.
