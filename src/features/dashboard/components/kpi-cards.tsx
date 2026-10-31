import { useMemo } from 'react'
import { CreditCard, DollarSign, ShoppingCart, Table2 } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EstadoFactura, MesaStatus, PedidoStatus } from '@/types/enums'
import { useMesas } from '@/features/mesas/hooks/use-mesas'
import { usePedidosPendientes } from '@/features/pedidos/hooks/use-pedidos'
import { useCajas } from '@/features/caja/hooks/use-caja'
import { cajaService } from '@/features/caja/services/caja-service'

interface KPICardsProps {
  billarId: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function KPICards({ billarId }: KPICardsProps) {
  const { data: mesas, isLoading: mesasLoading } = useMesas()
  const { data: pedidos, isLoading: pedidosLoading } = usePedidosPendientes(billarId)
  const { data: cajas } = useCajas()

  // Paso 1: turno activo por cada caja (caché compartida con CajaPage)
  const turnosResults = useQueries({
    queries: (cajas ?? []).map((caja) => ({
      queryKey: ['turno-activo', caja.id] as const,
      queryFn: () => cajaService.getTurnoActivo(caja.id),
      retry: false,
      staleTime: 1000 * 30,
    })),
  })

  const turnosAbiertos = turnosResults.filter((r) => r.isSuccess).length
  const turnosSettled = cajas !== undefined && turnosResults.every((r) => !r.isPending)

  // Paso 2: IDs de turnos activos para buscar sus facturas
  const activeTurnoIds = useMemo(
    () =>
      turnosResults
        .filter((r) => r.isSuccess && r.data)
        .map((r) => r.data!.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turnosResults]
  )

  // Paso 3: facturas de cada turno activo (caché compartida con FacturasListado)
  const facturasResults = useQueries({
    queries: activeTurnoIds.map((turnoId) => ({
      queryKey: ['facturas', turnoId] as const,
      queryFn: () => cajaService.getFacturas(turnoId),
      staleTime: 1000 * 30,
    })),
  })

  // Mismo cálculo que CerrarTurnoModal: suma facturas no anuladas
  const ingresosHoy = useMemo(
    () =>
      facturasResults
        .flatMap((r) => r.data ?? [])
        .filter((f) => f.status !== EstadoFactura.ANULADA)
        .reduce((sum, f) => sum + f.total, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [facturasResults]
  )

  const ingresosLoading = !turnosSettled || facturasResults.some((r) => r.isPending)

  const mesasActivas = useMemo(
    () => (mesas ?? []).filter((m) => m.status === MesaStatus.OCUPADA).length,
    [mesas]
  )

  const pedidosPendientes = useMemo(
    () =>
      (pedidos ?? []).filter(
        (p) => p.status === PedidoStatus.PENDIENTE || p.status === PedidoStatus.ACEPTADO
      ).length,
    [pedidos]
  )

  const cards = [
    {
      title: 'Ingresos hoy',
      value: ingresosLoading ? null : formatCurrency(ingresosHoy),
      icon: DollarSign,
      description: 'Total facturado en el día',
      href: '/caja' as const,
    },
    {
      title: 'Mesas activas',
      value: mesasLoading ? null : String(mesasActivas),
      icon: Table2,
      description: 'Mesas en juego ahora',
      href: '/mesas' as const,
    },
    {
      title: 'Pedidos pendientes',
      value: pedidosLoading ? null : String(pedidosPendientes),
      icon: ShoppingCart,
      description: 'Por preparar o entregar',
      href: '/pedidos' as const,
    },
    {
      title: 'Turnos abiertos',
      value: cajas === undefined ? null : String(turnosAbiertos),
      icon: CreditCard,
      description: 'Cajas con turno activo',
      href: '/turnos' as const,
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => (
        <Link key={card.title} to={card.href} className='block'>
          <Card className='cursor-pointer transition-shadow hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
              <card.icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {card.value === null ? (
                <Skeleton className='h-8 w-24' />
              ) : (
                <div className='text-2xl font-bold'>{card.value}</div>
              )}
              <p className='text-xs text-muted-foreground'>{card.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
