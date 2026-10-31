import { ArrowLeft, Building2, CheckCircle2, Clock, Mail, MapPin, Phone, Shield, User, XCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useBillarSa, useBillarPersonal } from '../hooks/use-billares-sa'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { type BillarAdminPersonal, type BillarCajeroPersonal, type BillarMeseraPersonal } from '../types'

interface BillarDetallePageProps {
  billarId: number
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AdminRow({ admin }: { admin: BillarAdminPersonal | BillarCajeroPersonal }) {
  return (
    <div className='flex items-center justify-between py-3'>
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
          <User className='h-4 w-4 text-muted-foreground' />
        </div>
        <div>
          <p className='text-sm font-medium'>{admin.nombre}</p>
          <p className='flex items-center gap-1 text-xs text-muted-foreground'>
            <Mail className='h-3 w-3' />
            {admin.email}
          </p>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <div className='text-right text-xs text-muted-foreground'>
          <p className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            {formatDate(admin.ultimo_login)}
          </p>
        </div>
        {admin.activo ? (
          <CheckCircle2 className='h-4 w-4 text-green-500' />
        ) : (
          <XCircle className='h-4 w-4 text-muted-foreground' />
        )}
      </div>
    </div>
  )
}

function MeseraRow({ mesera }: { mesera: BillarMeseraPersonal }) {
  return (
    <div className='flex items-center justify-between py-3'>
      <div className='flex items-center gap-3'>
        {mesera.foto_url ? (
          <img
            src={mesera.foto_url}
            alt={mesera.nombre_completo}
            className='h-8 w-8 rounded-full object-cover'
          />
        ) : (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
            <User className='h-4 w-4 text-muted-foreground' />
          </div>
        )}
        <div>
          <p className='text-sm font-medium'>{mesera.nombre_completo}</p>
          <p className='text-xs text-muted-foreground'>@{mesera.usuario}</p>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <p className='text-xs text-muted-foreground'>{formatDate(mesera.created_at)}</p>
        {mesera.activa ? (
          <CheckCircle2 className='h-4 w-4 text-green-500' />
        ) : (
          <XCircle className='h-4 w-4 text-muted-foreground' />
        )}
      </div>
    </div>
  )
}

export function BillarDetallePage({ billarId }: BillarDetallePageProps) {
  const { data: billar, isLoading: loadingBillar, isError: errorBillar } = useBillarSa(billarId)
  const { data: personal, isLoading: loadingPersonal, isError: errorPersonal } = useBillarPersonal(billarId)

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center gap-3'>
        <Link
          to='/superadmin/billares'
          className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' />
          Billares
        </Link>
      </div>

      {/* Billar info */}
      {loadingBillar ? (
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded' />
          <div className='space-y-1'>
            <Skeleton className='h-7 w-48' />
            <Skeleton className='h-4 w-32' />
          </div>
        </div>
      ) : errorBillar ? (
        <p className='text-destructive'>Error al cargar el billar</p>
      ) : billar ? (
        <div className='flex items-start gap-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg border bg-muted'>
            <Building2 className='h-5 w-5' />
          </div>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-2xl font-bold tracking-tight'>{billar.nombre}</h1>
              <Badge variant={billar.activo ? 'default' : 'secondary'}>
                {billar.activo ? 'Activo' : 'Inactivo'}
              </Badge>
              {billar.es_prueba && <Badge variant='outline'>Prueba</Badge>}
            </div>
            <div className='mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
              {billar.direccion && (
                <span className='flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  {billar.direccion}
                </span>
              )}
              {billar.telefono && (
                <span className='flex items-center gap-1'>
                  <Phone className='h-3 w-3' />
                  {billar.telefono}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Personal */}
      {loadingPersonal ? (
        <div className='grid gap-4 md:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className='h-5 w-32' />
              </CardHeader>
              <CardContent className='space-y-3'>
                {[1, 2].map((j) => <Skeleton key={j} className='h-12 w-full' />)}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : errorPersonal ? (
        <p className='text-destructive'>Error al cargar el personal</p>
      ) : personal ? (
        <div className='grid gap-4 md:grid-cols-3'>
          {/* Admins */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Shield className='h-4 w-4' />
                Administradores
                <Badge variant='outline' className='ml-auto text-xs'>
                  {personal.admins.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {personal.admins.length === 0 ? (
                <p className='py-4 text-center text-sm text-muted-foreground'>Sin administradores</p>
              ) : (
                <div className='divide-y'>
                  {personal.admins.map((admin) => (
                    <AdminRow key={admin.id} admin={admin} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cajeros */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Shield className='h-4 w-4' />
                Cajeros
                <Badge variant='outline' className='ml-auto text-xs'>
                  {personal.cajeros.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {personal.cajeros.length === 0 ? (
                <p className='py-4 text-center text-sm text-muted-foreground'>Sin cajeros</p>
              ) : (
                <div className='divide-y'>
                  {personal.cajeros.map((cajero) => (
                    <AdminRow key={cajero.id} admin={cajero} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meseras */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <User className='h-4 w-4' />
                Meseras
                <Badge variant='outline' className='ml-auto text-xs'>
                  {personal.meseras.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {personal.meseras.length === 0 ? (
                <p className='py-4 text-center text-sm text-muted-foreground'>Sin meseras</p>
              ) : (
                <div className='divide-y'>
                  {personal.meseras.map((mesera) => (
                    <MeseraRow key={mesera.id} mesera={mesera} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Separator />
    </div>
  )
}
