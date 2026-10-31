import { toast } from 'sonner'

/**
 * Imprime un ticket abriéndolo en una ventana dedicada y llamando a
 * window.print() dentro de ella.
 *
 * Se usa en lugar del iframe oculto de react-to-print porque en navegadores
 * de tablet (iOS Safari, algunos Android) el diálogo de impresión ignora el
 * iframe e imprime la página visible.
 *
 * El nodo debe ser autocontenido: sus estilos deben viajar en un <style>
 * interno (ver components/shared/ticket-styles.ts), ya que la ventana nueva
 * no hereda el CSS de la app.
 *
 * Importante: llamar directamente desde el handler del click (sin awaits
 * previos) para que el bloqueador de pop-ups no cancele el window.open.
 */
export function printTicket(content: HTMLElement | null, title = 'Ticket') {
  if (!content) return

  const win = window.open('', '_blank', 'width=420,height=640')
  if (!win) {
    toast.error(
      'No se pudo abrir la ventana de impresión. Revisa el bloqueador de pop-ups.'
    )
    return
  }

  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title.replace(/</g, '&lt;')}</title>
</head>
<body>${content.innerHTML}</body>
</html>`)
  win.document.close()

  // Pequeña espera para que la ventana termine de renderizar antes de
  // abrir el diálogo de impresión (necesario en móviles/tablets)
  setTimeout(() => {
    win.focus()
    win.print()
    // En escritorio cierra la ventana al terminar; en tablets el evento
    // puede no dispararse y la ventana queda abierta (el usuario la cierra)
    win.onafterprint = () => win.close()
  }, 300)
}
