# Acuerdo de Nivel de Servicio (SLA) — Genos Billar Tools

**Última actualización:** 01/07/2026
**Versión:** 1.0

Este Acuerdo de Nivel de Servicio (en adelante, "SLA") establece los compromisos de
disponibilidad, soporte y tiempos de respuesta de la plataforma **Genos Billar Tools** (el
"Servicio"), prestado por **Genos Billar Tools**, NIT **1.067.949.287** (el "Proveedor").

Este SLA complementa los Términos y Condiciones de Uso y aplica a los Clientes con
suscripción activa, con compromisos reforzados para los **Planes empresariales**.

---

## 1. Compromiso de disponibilidad

El Proveedor se compromete a mantener el Servicio disponible según el siguiente objetivo
mensual, de acuerdo con el Plan contratado:

| Plan | Disponibilidad mensual comprometida |
|------|-------------------------------------|
| Plan estándar (mensual) | **99.5%** |
| Plan semestral | **99.7%** |
| Plan anual / empresarial | **99.9%** |

> Ajusta estos valores a los que realmente puedas cumplir con tu infraestructura. Un
> compromiso incumplido genera obligaciones de crédito (cláusula 5).

**Cálculo de la disponibilidad:**

```
Disponibilidad (%) = ((Minutos totales del mes − Minutos de inactividad) / Minutos totales del mes) × 100
```

Se considera **"inactividad" (downtime)** el período en que el Servicio esté totalmente
inaccesible por causas imputables al Proveedor.

---

## 2. Exclusiones

No se computan como inactividad, ni generan créditos, las interrupciones causadas por:

1. **Mantenimientos programados** notificados con al menos **cuarenta y ocho (48) horas** de
   anticipación (ver cláusula 3).
2. Fuerza mayor o caso fortuito (desastres naturales, fallas eléctricas o de
   telecomunicaciones ajenas al Proveedor, ataques masivos, etc.).
3. Fallas de la conexión a internet, equipos o software del Cliente.
4. Uso del Servicio en contra de los Términos y Condiciones o de la documentación.
5. Suspensiones por mora en el pago o por incumplimiento del Cliente.
6. Fallas de servicios de terceros ajenos al control razonable del Proveedor.

---

## 3. Mantenimiento programado

3.1. El Proveedor podrá realizar mantenimientos para actualizar o mejorar el Servicio.

3.2. Los mantenimientos programados se notificarán con al menos **48 horas** de
anticipación y se procurará realizarlos en **horarios de baja actividad** (por ejemplo,
madrugada).

3.3. En caso de mantenimientos de emergencia por motivos de seguridad, el Proveedor
notificará tan pronto como sea posible.

---

## 4. Soporte técnico

### 4.1. Canales de soporte
- **Correo:** billartools@gmail.com
- **Teléfono / WhatsApp:** 3001770181
- **Horario de atención:** lunes a sábado, 8:00 a.m. – 8:00 p.m. (hora Colombia)

### 4.2. Clasificación de incidentes y tiempos de respuesta

El **tiempo de respuesta** es el plazo máximo para el **primer acuse y diagnóstico**, no el
tiempo de solución total.

| Severidad | Descripción | Respuesta (estándar) | Respuesta (empresarial) |
|-----------|-------------|----------------------|-------------------------|
| **Crítica (P1)** | El Servicio está caído o inutilizable para todos los usuarios | 4 horas hábiles | **1 hora** |
| **Alta (P2)** | Funcionalidad principal degradada sin solución alterna | 8 horas hábiles | **4 horas** |
| **Media (P3)** | Falla parcial con solución alterna disponible | 2 días hábiles | 1 día hábil |
| **Baja (P4)** | Consulta, mejora o error menor sin impacto operativo | 4 días hábiles | 2 días hábiles |

### 4.3. Objetivos de resolución
El Proveedor empleará esfuerzos comercialmente razonables para resolver los incidentes en el
menor tiempo posible según su severidad. Los tiempos de resolución dependen de la
complejidad y no constituyen una garantía de plazo fijo.

---

## 5. Créditos de servicio por incumplimiento

Si la disponibilidad mensual real cae por debajo del compromiso del Plan (cláusula 1), el
Cliente tendrá derecho a un **crédito de servicio** aplicable a la siguiente renovación:

| Disponibilidad mensual real | Crédito (% del valor mensual del Plan) |
|-----------------------------|----------------------------------------|
| Por debajo del compromiso y ≥ 99.0% | **10%** |
| ≥ 95.0% y < 99.0% | **25%** |
| < 95.0% | **50%** |

**Reglas de los créditos:**

1. El crédito se calcula sobre el **valor prorrateado mensual** del Plan.
2. Para planes semestrales o anuales, el crédito se calcula sobre el equivalente mensual.
3. Los créditos son la **única compensación** por incumplimiento de disponibilidad, salvo
   los derechos irrenunciables del consumidor.
4. El crédito máximo acumulable en un mes no excederá el **50%** del valor mensual.
5. Los créditos **no son canjeables por dinero**, salvo terminación del contrato por causa
   imputable al Proveedor.

### 5.1. Cómo reclamar un crédito
El Cliente debe solicitar el crédito por escrito a **billartools@gmail.com** dentro de los
**treinta (30) días calendario** siguientes al mes en que ocurrió la indisponibilidad,
indicando fechas y horas aproximadas de la afectación. El Proveedor validará contra sus
registros de monitoreo.

---

## 6. Monitoreo y reportes

El Proveedor monitorea la disponibilidad del Servicio. A solicitud de los Clientes de
Planes empresariales, podrá entregar un reporte de disponibilidad del período consultado.

---

## 7. Copias de seguridad y recuperación

7.1. El Proveedor realiza **copias de seguridad periódicas** de los datos del Servicio.

7.2. Objetivos orientativos de recuperación ante incidentes mayores (aplicables
especialmente a Planes empresariales):
- **RPO (punto de recuperación):** hasta **[p. ej. 24 horas]** de pérdida máxima de datos.
- **RTO (tiempo de recuperación):** restablecimiento en hasta **[p. ej. 8 horas]**.

> Ajusta RPO/RTO a tu capacidad real de respaldo y restauración.

---

## 8. Vigencia y modificaciones

Este SLA rige desde el **01/07/2026**. El Proveedor podrá actualizarlo notificando con
al menos **quince (15) días** de anticipación. Los cambios que reduzcan los compromisos no
afectarán negativamente un período ya pagado.

---

## 9. Contacto

- **Proveedor:** Genos Billar Tools — NIT 1.067.949.287
- **Soporte:** billartools@gmail.com · 3001770181
- **Domicilio:** KR 3cw #21-31, Montería, Colombia
