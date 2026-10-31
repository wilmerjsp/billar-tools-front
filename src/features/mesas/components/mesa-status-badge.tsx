import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MesaStatus } from '@/types/enums'

interface StatusConfig {
  label: string
  className: string
}

const statusConfig: Record<MesaStatus, StatusConfig> = {
  [MesaStatus.DISPONIBLE]: {
    label: 'Disponible',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  [MesaStatus.OCUPADA]: {
    label: 'Ocupada',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  [MesaStatus.RESERVADA]: {
    label: 'Reservada',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  [MesaStatus.MANTENIMIENTO]: {
    label: 'Mantenim.',
    className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
  },
}

interface MesaStatusBadgeProps {
  status: MesaStatus
}

const fallbackConfig: StatusConfig = {
  label: 'Desconocido',
  className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
}

export function MesaStatusBadge({ status }: MesaStatusBadgeProps) {
  const config = statusConfig[status] ?? fallbackConfig
  return (
    <Badge className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}
