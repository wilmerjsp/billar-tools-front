import { useState } from 'react'
import {
  CreditCard,
  Plus,
  Pencil,
  DollarSign,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
} from 'lucide-react'
import { format, parseISO, isPast, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  usePlanes,
  useSuscripcionesBillares,
  useRevocarSuscripcion,
} from '../hooks/use-suscripciones'
import { useBillaresSa } from '../../billares/hooks/use-billares-sa'
import { PlanFormDialog } from '../components/plan-form-dialog'
import { PlanEditDialog } from '../components/plan-edit-dialog'
import { PlanPreciosDialog } from '../components/plan-precios-dialog'
import { SuscripcionRenovarDialog } from '../components/suscripcion-renovar-dialog'
import type { PlanSuscripcion, SuscripcionDetalle } from '../types'
import type { Billar } from '@/types/models'
import { showApiError } from '@/lib/handle-server-error'

const PERIODO_LABELS: Record<string, string> = {
  mes: 'Mensual',
  semestre: 'Semestral',
  anual: 'Anual',
}

function PrecioBadge({ precio }: { precio: string }) {
  return (
    <span className='inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums'>
      ${precio}
    </span>
  )
}

function DiasRestantes({ fechaFin, activa }: { fechaFin: string; activa: boolean }) {
  const fin = parseISO(fechaFin)
  const dias = differenceInDays(fin, new Date())

  if (!activa || dias < 0) {
    return <span className='text-xs text-destructive'>Vencida</span>
  }
  if (dias === 0) {
    return <span className='text-xs font-medium text-orange-500'>Vence hoy</span>
  }
  if (dias <= 7) {
    return (
      <span className='inline-flex items-center gap-1 text-xs font-medium text-orange-500'>
        <Clock className='h-3 w-3' />
        {dias}d
      </span>
    )
  }
  return (
    <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
      <Clock className='h-3 w-3' />
      {dias}d
    </span>
  )
}

// ── Planes tab ────────────────────────────────────────────────────────────────

function PlanesTab() {
  const { data: planes, isLoading, isError } = usePlanes()
  const [openCreate, setOpenCreate] = useState(false)
  const [editPlan, setEditPlan] = useState<PlanSuscripcion | null>(null)
  const [preciosPlan, setPreciosPlan] = useState<PlanSuscripcion | null>(null)

  return (
    <>
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Configura los planes disponibles y sus precios por periodo.
        </p>
        <Button size='sm' onClick={() => setOpenCreate(true)}>
          <Plus className='h-4 w-4' />
          Nuevo plan
        </Button>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className='text-center'>Admins</TableHead>
              <TableHead className='text-center'>Cajas</TableHead>
              <TableHead className='text-center'>Cajeros</TableHead>
              <TableHead className='text-center'>Meseras</TableHead>
              <TableHead>Precios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className='h-4 w-16' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={8} className='py-10 text-center text-muted-foreground'>
                  <AlertCircle className='mx-auto mb-2 h-6 w-6' />
                  Error al cargar los planes
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && planes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className='py-10 text-center text-muted-foreground'>
                  No hay planes creados. Crea el primero.
                </TableCell>
              </TableRow>
            )}

            {planes?.map((plan: PlanSuscripcion) => (
              <TableRow key={plan.id}>
                <TableCell className='font-medium capitalize'>{plan.nombre}</TableCell>
                <TableCell className='text-center tabular-nums'>{plan.max_admins}</TableCell>
                <TableCell className='text-center tabular-nums'>{plan.max_cajas}</TableCell>
                <TableCell className='text-center tabular-nums'>{plan.max_cajeros}</TableCell>
                <TableCell className='text-center tabular-nums'>{plan.max_meseras}</TableCell>
                <TableCell>
                  {plan.precios.length === 0 ? (
                    <span className='text-xs text-muted-foreground/60'>Sin precios</span>
                  ) : (
                    <div className='flex flex-wrap gap-1'>
                      {plan.precios.map((p) => (
                        <TooltipProvider key={p.periodo}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <PrecioBadge precio={p.precio} />
                            </TooltipTrigger>
                            <TooltipContent>{PERIODO_LABELS[p.periodo]}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={plan.activo ? 'default' : 'secondary'}>
                    {plan.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-1'>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-8 w-8'
                            onClick={() => setEditPlan(plan)}
                          >
                            <Pencil className='h-3.5 w-3.5' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar límites</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-8 w-8'
                            onClick={() => setPreciosPlan(plan)}
                          >
                            <DollarSign className='h-3.5 w-3.5' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Gestionar precios</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PlanFormDialog open={openCreate} onOpenChange={setOpenCreate} />
      <PlanEditDialog
        plan={editPlan}
        open={editPlan !== null}
        onOpenChange={(v) => { if (!v) setEditPlan(null) }}
      />
      <PlanPreciosDialog
        plan={preciosPlan}
        open={preciosPlan !== null}
        onOpenChange={(v) => { if (!v) setPreciosPlan(null) }}
      />
    </>
  )
}

// ── Suscripciones tab ─────────────────────────────────────────────────────────

function SuscripcionStatusBadge({ suscripcion }: { suscripcion: SuscripcionDetalle }) {
  const vencida = isPast(parseISO(suscripcion.fecha_fin))
  if (!suscripcion.activa) {
    return (
      <Badge variant='destructive' className='gap-1'>
        <Ban className='h-3 w-3' />
        Revocada
      </Badge>
    )
  }
  if (vencida) {
    return (
      <Badge variant='destructive' className='gap-1'>
        <XCircle className='h-3 w-3' />
        Vencida
      </Badge>
    )
  }
  return (
    <Badge className={cn('gap-1 bg-green-600 hover:bg-green-700')}>
      <CheckCircle2 className='h-3 w-3' />
      Activa
    </Badge>
  )
}

function SuscripcionesTab() {
  const { data: billares, isLoading: loadingBillares, isError: errorBillares } = useBillaresSa()
  const billarIds = billares?.map((b: Billar) => b.id) ?? []
  const suscripcionesQueries = useSuscripcionesBillares(billarIds)
  const revocarMutation = useRevocarSuscripcion()

  const [renovarState, setRenovarState] = useState<{
    billar: Billar
    suscripcion: SuscripcionDetalle | null
  } | null>(null)

  const [revocarState, setRevocarState] = useState<{
    billar: Billar
    suscripcion: SuscripcionDetalle
  } | null>(null)

  function getSuscripcion(billarId: number): {
    data: SuscripcionDetalle | null
    isLoading: boolean
    isError: boolean
    status404: boolean
  } {
    if (!billares) return { data: null, isLoading: false, isError: false, status404: false }
    const idx = billarIds.indexOf(billarId)
    if (idx === -1) return { data: null, isLoading: false, isError: false, status404: false }
    const q = suscripcionesQueries[idx]
    const status404 =
      q?.isError &&
      (q.error as { response?: { status?: number } })?.response?.status === 404
    return {
      data: q?.data ?? null,
      isLoading: q?.isLoading ?? false,
      isError: q?.isError ?? false,
      status404: status404 ?? false,
    }
  }

  async function handleRevocar() {
    if (!revocarState) return
    try {
      await revocarMutation.mutateAsync(revocarState.billar.id)
      toast.success(`Suscripción de "${revocarState.billar.nombre}" revocada`)
    } catch (error) {
      showApiError(error)
    } finally {
      setRevocarState(null)
    }
  }

  // 9 columns: Billar, Plan, Periodo, Inicio, Vencimiento, Días rest., Monto, Estado, Acciones
  const SKELETON_COLS = 9

  return (
    <>
      <p className='text-sm text-muted-foreground'>
        Estado de suscripción por billar. Puedes renovar, asignar o revocar desde aquí.
      </p>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Billar</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Días rest.</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingBillares &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: SKELETON_COLS }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className='h-4 w-20' />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {errorBillares && (
              <TableRow>
                <TableCell colSpan={SKELETON_COLS} className='py-10 text-center text-muted-foreground'>
                  <AlertCircle className='mx-auto mb-2 h-6 w-6' />
                  Error al cargar los billares
                </TableCell>
              </TableRow>
            )}

            {!loadingBillares && !errorBillares && billares?.length === 0 && (
              <TableRow>
                <TableCell colSpan={SKELETON_COLS} className='py-10 text-center text-muted-foreground'>
                  No hay billares registrados.
                </TableCell>
              </TableRow>
            )}

            {billares?.map((billar: Billar) => {
              const { data: sus, isLoading, status404 } = getSuscripcion(billar.id)
              const canRevocar = sus?.activa === true && !isPast(parseISO(sus.fecha_fin))

              return (
                <TableRow key={billar.id}>
                  <TableCell className='font-medium'>{billar.nombre}</TableCell>

                  {isLoading ? (
                    <TableCell colSpan={7}>
                      <Skeleton className='h-4 w-48' />
                    </TableCell>
                  ) : sus ? (
                    <>
                      <TableCell className='capitalize'>{sus.plan.nombre}</TableCell>
                      <TableCell>{PERIODO_LABELS[sus.periodo]}</TableCell>
                      <TableCell className='tabular-nums text-sm text-muted-foreground'>
                        {format(parseISO(sus.fecha_inicio), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell className='tabular-nums text-sm'>
                        {format(parseISO(sus.fecha_fin), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <DiasRestantes fechaFin={sus.fecha_fin} activa={sus.activa} />
                      </TableCell>
                      <TableCell className='tabular-nums'>${sus.monto_cobrado}</TableCell>
                      <TableCell>
                        <SuscripcionStatusBadge suscripcion={sus} />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell colSpan={6}>
                        <span className='text-sm text-muted-foreground'>
                          {status404 ? 'Sin suscripción' : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>Sin plan</Badge>
                      </TableCell>
                    </>
                  )}

                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-7 gap-1 text-xs'
                              onClick={() => setRenovarState({ billar, suscripcion: sus })}
                            >
                              <RefreshCw className='h-3 w-3' />
                              {sus ? 'Renovar' : 'Asignar'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {sus ? 'Renovar o cambiar plan' : 'Asignar plan de pago'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {sus && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-7 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive'
                                disabled={!canRevocar || revocarMutation.isPending}
                                onClick={() => setRevocarState({ billar, suscripcion: sus })}
                              >
                                <Ban className='h-3 w-3' />
                                Revocar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {canRevocar
                                ? 'Desactivar suscripción inmediatamente'
                                : 'La suscripción ya está vencida o revocada'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {renovarState && (
        <SuscripcionRenovarDialog
          billarId={renovarState.billar.id}
          billarNombre={renovarState.billar.nombre}
          suscripcion={renovarState.suscripcion}
          open={renovarState !== null}
          onOpenChange={(v) => { if (!v) setRenovarState(null) }}
        />
      )}

      <AlertDialog
        open={revocarState !== null}
        onOpenChange={(v) => { if (!v) setRevocarState(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar suscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se desactivará la suscripción de{' '}
              <span className='font-semibold'>{revocarState?.billar.nombre}</span> de
              inmediato. Los usuarios del billar perderán acceso al sistema. Esta
              acción se puede revertir renovando el plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revocarMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={revocarMutation.isPending}
              onClick={handleRevocar}
            >
              Sí, revocar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SuscripcionesSuperAdminPage() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center gap-3'>
        <CreditCard className='h-6 w-6' />
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Suscripciones</h1>
          <p className='text-muted-foreground'>
            Gestiona los planes y suscripciones de los billares
          </p>
        </div>
      </div>

      <Tabs defaultValue='planes'>
        <TabsList>
          <TabsTrigger value='planes'>Planes</TabsTrigger>
          <TabsTrigger value='suscripciones'>Suscripciones</TabsTrigger>
        </TabsList>

        <TabsContent value='planes' className='mt-4 flex flex-col gap-4'>
          <PlanesTab />
        </TabsContent>

        <TabsContent value='suscripciones' className='mt-4 flex flex-col gap-4'>
          <SuscripcionesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
