# Configuración de la impresión del ticket de compra (recibo POS)

Documentación de cómo está implementada la ventana de impresión del ticket en este proyecto, pensada para replicar la funcionalidad en otro proyecto React.

## Resumen de la arquitectura

La impresión se basa en **3 piezas**:

| Pieza | Archivo en este proyecto | Rol |
|---|---|---|
| Librería `react-to-print` | `package.json` (`"react-to-print": "^3.x"`) | Abre el diálogo de impresión del navegador con solo el contenido del recibo |
| Componente `TicketTermico` | `src/features/juegos/components/ticket-termico.tsx` | Renderiza el ticket con sus estilos embebidos (incluye `@media print` y `@page` para papel térmico de 80 mm) |
| Hook `useReactToPrint` en la página | `src/features/juegos/pages/juego-resumen-page.tsx` (botón "Ticket") | Conecta un `ref` al recibo y dispara la impresión (Patrón A: ticket montado oculto) |

No hay ninguna configuración global de impresión (ni en `index.css` ni en Vite): **todo el CSS de impresión vive dentro del propio componente `SaleReceipt`** en una etiqueta `<style>`, por lo que el componente es autocontenido y portable.

## 1. Dependencia

```bash
npm install react-to-print
```

Versión usada aquí: `^3.2.0`. En la v3 la opción del hook se llama `contentRef` (en la v2 era `content: () => ref.current`).

## 2. El componente del ticket (`SaleReceipt`)

Es un componente con `React.forwardRef` (la ref apunta al `<div>` raíz, que es lo que `react-to-print` clona hacia un iframe oculto para imprimir).

### Props (contrato de datos)

```ts
interface SaleReceiptProps {
    saleData: {
        saleNumber: string;      // número de factura
        saleDate: string;        // fecha ISO
        subtotal: number;
        taxAmount: number;
        total: number;
        paymentMethod: string;
        amountReceived?: number; // efectivo recibido
        change?: number;         // cambio/vuelto
    };
    items: Array<{
        name: string;
        quantity: number;
        unit_price: number;
        line_total: number;
    }>;
    customer?: { name: string; document_number?: string; phone?: string } | null;
    employee?: { name: string; employee_id?: number };
    store?: { name: string; nit?: string };
    branch?: { name: string; address?: string; phone?: string };
    width?: "80mm" | "58mm"; // declarado pero actualmente NO usado; el ancho está fijo a 80mm en el CSS
}
```

### Formateadores

- **Moneda**: `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 })`
- **Fecha**: `date.toLocaleString("es-CO", { year, month, day, hour, minute "2-digit", hour12: true })`

### Estructura visual (secciones del ticket)

1. `.receipt-header` — nombre de la tienda (h2 centrado), NIT, dirección y teléfono de la sucursal.
2. `.receipt-details` — número de factura, fecha, vendedor.
3. `.receipt-customer` — (condicional) cliente, documento, teléfono; delimitada con bordes punteados arriba y abajo.
4. `.receipt-items` — tabla de 4 columnas: Descripción / Cant / V. Unit / Total (cantidad centrada, precios a la derecha).
5. `.receipt-totals` — Subtotal, IVA (19%) y línea de Total destacada (borde sólido superior, 14px bold).
6. `.receipt-payment` — método de pago, monto recibido y cambio (los dos últimos condicionales).
7. `.receipt-footer` — mensajes de agradecimiento, centrado, 9px.

## 3. CSS de impresión (la parte clave)

Este es el CSS completo que hace que el ticket salga bien en una impresora térmica de 80 mm. Va embebido en el componente dentro de `<style>{`...`}</style>`:

```css
/* Configuración base del documento */
body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.2;
    margin: 0;
    padding: 0;
}

/* Contenedor principal: 74mm de contenido + 3mm de padding por lado = 80mm de papel */
.receipt {
    width: 74mm;
    padding: 3mm;
    box-sizing: border-box;
    margin: 0 auto;
    background: white;
    color: black;
}

.receipt-header { text-align: center; margin-bottom: 5mm; }
.receipt-header h2 { margin: 0; font-size: 16px; font-weight: bold; }
.receipt-header div { font-size: 11px; margin: 2px 0; }

.receipt-details { margin: 5mm 0; font-size: 10px; }
.receipt-details div { margin: 3px 0; }

.receipt-customer {
    margin: 5mm 0;
    font-size: 10px;
    border-top: 1px dashed #000;
    border-bottom: 1px dashed #000;
    padding: 2mm 0;
}
.receipt-customer div { margin: 2px 0; }

.receipt-items {
    width: 100%;
    border-collapse: collapse;
    margin: 5mm 0;
    font-size: 10px;
}
.receipt-items th {
    border-bottom: 1px dashed #000;
    padding: 2px 0;
    text-align: left;
    font-weight: bold;
}
.receipt-items td { padding: 2px 0; }
.receipt-items th:nth-child(2), .receipt-items td:nth-child(2) { text-align: center; }
.receipt-items th:nth-child(3), .receipt-items td:nth-child(3),
.receipt-items th:nth-child(4), .receipt-items td:nth-child(4) { text-align: right; }

.receipt-totals {
    margin-top: 5mm;
    border-top: 1px dashed #000;
    padding-top: 2mm;
    font-size: 10px;
}
.receipt-totals div { display: flex; justify-content: space-between; margin: 2px 0; }
.receipt-totals .total-line {
    border-top: 2px solid #000;
    padding-top: 3mm;
    margin-top: 3mm;
    font-size: 14px;
    font-weight: bold;
}

.receipt-payment {
    margin-top: 3mm;
    border-top: 1px dashed #000;
    padding-top: 2mm;
    font-size: 10px;
}
.receipt-payment div { display: flex; justify-content: space-between; margin: 2px 0; }

.receipt-footer {
    margin-top: 5mm;
    text-align: center;
    font-size: 9px;
    border-top: 1px dashed #000;
    padding-top: 3mm;
}
.receipt-footer div { margin: 2px 0; }

/* Optimización para la impresión real */
@media print {
    @page {
        size: 80mm 297mm;  /* ancho de papel térmico 80mm, alto máximo tipo A4 */
        margin: 0;          /* sin márgenes del navegador */
    }
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 80mm !important;
    }
    .receipt {
        width: 74mm !important;
        padding: 3mm !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
    }
    .no-print { display: none; }
}
```

### Decisiones importantes de este CSS

- **`@page { size: 80mm 297mm; margin: 0 }`** es lo que configura la "ventana" de impresión para papel térmico: elimina los márgenes por defecto del navegador y fija el ancho de página a 80 mm. Sin esto, el diálogo de imprimir asume tamaño carta/A4.
- **74 mm + 3 mm de padding por lado = 80 mm**: el contenido nunca toca el borde físico del papel (zona no imprimible de las térmicas).
- Todo en **negro sobre blanco**, tipografías pequeñas (9–16 px) y separadores con `border dashed` (simulan la línea punteada clásica de los recibos).
- La clase utilitaria **`.no-print`** oculta cualquier elemento en la versión impresa.
- Para papel de **58 mm**, cambiar: `@page size: 58mm 297mm`, `html/body width: 58mm`, `.receipt width: 52mm`.

## 4. Disparar la impresión desde la página

### Patrón A — el recibo siempre montado pero oculto (`NewSale.tsx`)

```tsx
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import SaleReceipt from "../../components/sales/SaleReceipt";

const receiptRef = useRef<HTMLDivElement>(null);

const handlePrintReceipt = useReactToPrint({
    contentRef: receiptRef,                                    // v3: ref directa
    documentTitle: `Recibo-${completedSaleData?.saleNumber || 'VENTA'}`, // nombre del PDF/trabajo
    onAfterPrint: () => {
        console.log('Recibo impreso correctamente');
    },
});

// En el JSX: el recibo vive oculto con display:none.
// react-to-print lo clona a un iframe, así que display:none en el
// contenedor padre NO afecta la impresión.
<div style={{ display: 'none' }}>
    {completedSaleData && (
        <SaleReceipt
            ref={receiptRef}
            saleData={{ ... }}
            items={completedSaleData.items || []}
            customer={ ... }
        />
    )}
</div>

// Botón:
<button onClick={() => handlePrintReceipt()}>Imprimir recibo</button>
```

### Patrón B — renderizado bajo demanda (`SaleDetails.tsx`)

Para no tener el recibo montado permanentemente, se monta justo antes de imprimir y se desmonta después:

```tsx
const [shouldRenderReceipt, setShouldRenderReceipt] = useState(false);

const printReceipt = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Recibo-${sale?.sale_number || 'VENTA'}`,
    onAfterPrint: () => setShouldRenderReceipt(false),  // desmonta al terminar
});

const handlePrintReceipt = () => {
    setShouldRenderReceipt(true);
    // Espera a que React monte el componente antes de imprimir
    setTimeout(() => printReceipt(), 100);
};

// JSX:
{shouldRenderReceipt && (
    <div style={{ display: 'none' }}>
        <SaleReceipt ref={receiptRef} ... />
    </div>
)}
```

> Nota: el `setTimeout(100)` es un workaround para esperar el render. Una alternativa más robusta es un `useEffect` que dispare `printReceipt()` cuando `shouldRenderReceipt` pase a `true`.

## 5. Checklist para portar a otro proyecto

1. `npm install react-to-print`.
2. Copiar `src/components/sales/SaleReceipt.tsx` completo (es autocontenido: no depende de Tailwind, contextos ni servicios — solo de React).
3. En la página que imprime:
   - crear `const receiptRef = useRef<HTMLDivElement>(null)`;
   - configurar `useReactToPrint({ contentRef: receiptRef, documentTitle, onAfterPrint })`;
   - renderizar `<SaleReceipt ref={receiptRef} ... />` dentro de un `<div style={{ display: 'none' }}>`;
   - llamar la función que devuelve el hook desde el botón "Imprimir".
4. Mapear los datos de tu venta al contrato de props (`saleData`, `items`, `customer`, `store`, `branch`, `employee`).
5. Ajustar si aplica: moneda/locale (`es-CO`/COP), etiqueta de impuesto (aquí está fijo "IVA (19%)" como texto — el monto sí viene de datos), textos del pie de página, y ancho de papel (80 mm vs 58 mm).

## Cosas a tener en cuenta

- La prop `width?: "80mm" | "58mm"` está declarada pero **no implementada**: el ancho está cableado a 80 mm en el CSS. Si necesitas 58 mm, hay que parametrizar el CSS.
- La etiqueta "IVA (19%)" es texto fijo; si el otro proyecto maneja otra tasa, parametrízala.
- `react-to-print` imprime clonando el nodo a un iframe oculto y llamando `window.print()` del iframe: la ventana de impresión resultante solo contiene el ticket, no la página. El usuario final debe seleccionar la impresora térmica en el diálogo (o configurarla como predeterminada); para impresión silenciosa sin diálogo se necesitaría otra vía (modo kiosco de Chrome, Electron, o impresión ESC/POS directa), que este proyecto no usa.
