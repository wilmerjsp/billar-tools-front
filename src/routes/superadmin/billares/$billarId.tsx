import { createFileRoute } from '@tanstack/react-router'
import { BillarDetallePage } from '@/features/superadmin/billares/pages/billar-detalle-page'

export const Route = createFileRoute('/superadmin/billares/$billarId')({
  component: function BillarDetalleRoute() {
    const { billarId } = Route.useParams()
    return <BillarDetallePage billarId={Number(billarId)} />
  },
})
