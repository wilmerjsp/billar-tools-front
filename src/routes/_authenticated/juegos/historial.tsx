import { createFileRoute } from '@tanstack/react-router'
import { JuegosHistorialPage } from '@/features/juegos/pages/juegos-historial-page'

export const Route = createFileRoute('/_authenticated/juegos/historial')({
  component: JuegosHistorialPage,
})
