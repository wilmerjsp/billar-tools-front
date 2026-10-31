import { createFileRoute } from '@tanstack/react-router'
import { MeserasPage } from '@/features/meseras/pages/meseras-page'

export const Route = createFileRoute('/_authenticated/meseras/')({
  component: MeserasPage,
})
