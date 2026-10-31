import { createFileRoute } from '@tanstack/react-router'
import { JuegosActivosPage } from '@/features/juegos/pages/juegos-activos-page'

export const Route = createFileRoute('/_authenticated/juegos/')({
  component: JuegosActivosPage,
})
