import { createFileRoute } from '@tanstack/react-router'
import { JuegoResumenPage } from '@/features/juegos/pages/juego-resumen-page'

export const Route = createFileRoute('/_authenticated/juegos/$juegoId')({
  component: JuegoResumenPage,
})
