import { createFileRoute } from '@tanstack/react-router'
import { ReportesPage } from '@/features/reportes/pages/reportes-page'

export const Route = createFileRoute('/_authenticated/reportes/')({
  component: ReportesPage,
})
