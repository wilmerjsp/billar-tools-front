import { createFileRoute } from '@tanstack/react-router'
import { CajerosPage } from '@/features/cajeros/pages/cajeros-page'

export const Route = createFileRoute('/_authenticated/cajeros/')({
  component: CajerosPage,
})
