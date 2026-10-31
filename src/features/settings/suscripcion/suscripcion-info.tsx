import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  Lock,
  XCircle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { isAxiosError } from 'axios'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useMiSuscripcion } from './use-mi-suscripcion'
import type { EstadoSuscripcion, MiSuscripcion, UsoRecurso } from './types'

const PERIODO_LABELS: Record<string, string> = {
  mes: 'Mensual',
  semestre: 'Semestral',
  anual: 'Anual',
}

function EstadoBadge({ estado }: { estado: EstadoSuscripcion }) {
  if (estado === 'inactiva') {
    return (
      <Badge variant='destructive' className='gap-1'>
        <Ban className='h-3 w-3' />
        Inactiva
      </Badge>
    )
  }
  if (estado === 'vencida') {
    return (
      <Badge variant='destructive' className='gap-1'>
        <XCircle className='h-3 w-3' />
        Vencida
      </Badge>
    )
  }
  return (
    <Badge className='gap-1 bg-green-600 hover:bg-green-700'>
      <CheckCircle2 className='h-3 w-3' />
      Activa
    </Badge>
  )
}

function DiasRestantes({ dias, estado }: { dias: number; estado: EstadoSuscripcion }) {
  if (estado !== 'activa' || dias < 0) {
    return <span className='text-sm font-medium text-destructive'>Vencida</span>
  }
  if (dias === 0) {
    return <span className='text-sm font-medium text-orange-500'>Vence hoy</span>
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-sm tabular-nums',
        dias <= 7 ? 'font-medium text-orange-500' : 'text-foreground'
      )}
    >
      <Clock className='h-3.5 w-3.5' />
      {dias} {dias === 1 ? 'día' : 'días'}
    </span>
  )
}

function DetalleItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <div className='text-sm'>{children}</div>
    </div>
  )
}

function UsoBar({ label, uso }: { label: string; uso: UsoRecurso }) {
  const pct = uso.maximo > 0 ? Math.min((uso.actual / uso.maximo) * 100, 100) : 0
  const enLimite = uso.actual >= uso.maximo

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-sm'>
        <span>{label}</span>
        <span
          className={cn(
            'tabular-nums',
            enLimite ? 'font-medium text-orange-500' : 'text-muted-foreground'
          )}
        >
          {uso.actual} / {uso.maximo}
        </span>
      </div>
      <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className={cn(
            'h-full rounded-full transition-all',
            enLimite ? 'bg-orange-500' : 'bg-primary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function SuscripcionSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-7 w-32' />
        <Skeleton className='h-6 w-20' />
      </div>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-4 w-24' />
          </div>
        ))}
      </div>
      <Separator />
      <div className='space-y-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-2 w-full' />
          </div>
        ))}
      </div>
    </div>
  )
}

function SuscripcionDetalle({ suscripcion }: { suscripcion: MiSuscripcion }) {
  const { plan, uso } = suscripcion

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs text-muted-foreground'>Plan actual</p>
          <h4 className='text-xl font-semibold capitalize'>{plan.nombre}</h4>
        </div>
        <EstadoBadge estado={suscripcion.estado} />
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
        <DetalleItem label='Periodo'>
          {PERIODO_LABELS[suscripcion.periodo] ?? suscripcion.periodo}
        </DetalleItem>
        <DetalleItem label='Monto cobrado'>
          <span className='tabular-nums'>${suscripcion.monto_cobrado}</span>
        </DetalleItem>
        <DetalleItem label='Días restantes'>
          <DiasRestantes dias={suscripcion.dias_restantes} estado={suscripcion.estado} />
        </DetalleItem>
        <DetalleItem label='Inicio'>
          <span className='tabular-nums'>
            {format(parseISO(suscripcion.fecha_inicio), 'dd MMM yyyy', { locale: es })}
          </span>
        </DetalleItem>
        <DetalleItem label='Vencimiento'>
          <span className='tabular-nums'>
            {format(parseISO(suscripcion.fecha_fin), 'dd MMM yyyy', { locale: es })}
          </span>
        </DetalleItem>
      </div>

      {suscripcion.estado !== 'activa' && (
        <div className='flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm'>
          <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-destructive' />
          <p>
            Tu suscripción no está activa. Contacta al administrador del sistema
            para renovarla y recuperar el acceso completo.
          </p>
        </div>
      )}

      <Separator />

      <div className='space-y-4'>
        <div>
          <h4 className='text-sm font-medium'>Uso del plan</h4>
          <p className='text-xs text-muted-foreground'>
            Recursos utilizados frente al límite de tu plan.
          </p>
        </div>
        <UsoBar label='Administradores' uso={uso.admins} />
        <UsoBar label='Cajeros' uso={uso.cajeros} />
        <UsoBar label='Meseras' uso={uso.meseras} />
        <UsoBar label='Cajas' uso={uso.cajas} />
      </div>
    </div>
  )
}

export function SuscripcionInfo() {
  const { data, isLoading, isError, error } = useMiSuscripcion()

  if (isLoading) return <SuscripcionSkeleton />

  if (isError) {
    const esNoPropietario = isAxiosError(error) && error.response?.status === 403
    return (
      <div className='flex flex-col items-center gap-2 py-10 text-center text-muted-foreground'>
        {esNoPropietario ? (
          <>
            <Lock className='h-6 w-6' />
            <p className='text-sm'>
              Solo el propietario de la cuenta puede ver la información de la
              suscripción.
            </p>
          </>
        ) : (
          <>
            <AlertCircle className='h-6 w-6' />
            <p className='text-sm'>
              No se pudo cargar la información de la suscripción. Intenta de nuevo
              más tarde.
            </p>
          </>
        )}
      </div>
    )
  }

  if (!data) return null

  return <SuscripcionDetalle suscripcion={data} />
}
