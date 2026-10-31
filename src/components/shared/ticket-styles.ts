// CSS de impresión embebido para tickets térmicos de 80 mm.
// Los componentes de ticket son autocontenidos: incluyen este CSS en un
// <style> interno, por lo que son los únicos estilos que aplican al imprimir
// (la ventana/iframe de impresión no hereda el CSS de la app).
// @page 80mm sin márgenes = papel térmico de 80 mm.
export const receiptStyles = `
body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.2;
    margin: 0;
    padding: 0;
}

/* 74mm de contenido + 3mm de padding por lado = 80mm de papel */
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
.receipt-items .jugadores { font-size: 9px; color: #444; }
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

@media print {
    @page {
        size: 80mm 297mm;
        margin: 0;
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
`
