import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { KeyRound, Loader2, LogIn, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/axios'
import { authUserFromToken } from '@/lib/jwt'
import { saveUserDisplay } from '@/lib/user-display-storage'
import { cn } from '@/lib/utils'
import { type Billar } from '@/types/models'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { showApiError } from '@/lib/handle-server-error'

interface InlineError {
  icon: 'shield' | 'key'
  title: string
  description: string
}

function classifyApiError(error: unknown): InlineError | null {
  const err = error as {
    response?: { status?: number; data?: { error?: { code?: string; message?: string } } }
  }
  const code = err?.response?.data?.error?.code
  const message = err?.response?.data?.error?.message

  if (err?.response?.status === 403 && code === 'FORBIDDEN') {
    return {
      icon: 'shield',
      title: 'Acceso bloqueado',
      description:
        (message ?? 'El billar no tiene una suscripción activa.') +
        ' Contacta al administrador de la plataforma para activar o renovar la suscripción.',
    }
  }

  if (err?.response?.status === 401 && code === 'UNAUTHORIZED') {
    return {
      icon: 'key',
      title: 'Contraseña incorrecta',
      description: message ?? 'La contraseña ingresada no es correcta. Verifica e inténtalo de nuevo.',
    }
  }

  return null
}

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Ingresa tu correo electrónico' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña')
    .min(7, 'La contraseña debe tener al menos 7 caracteres'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

function extractToken(responseData: unknown): string {
  const data = responseData as Record<string, unknown>
  if (data?.data && typeof (data.data as Record<string, unknown>)?.access_token === 'string') {
    return (data.data as Record<string, unknown>).access_token as string
  }
  if (typeof data?.access_token === 'string') {
    return data.access_token as string
  }
  throw new Error('La respuesta del servidor no contiene el access token')
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null)
  const [availableBillares, setAvailableBillares] = useState<Billar[]>([])
  const [selectedBillarId, setSelectedBillarId] = useState<string>('')
  const [inlineError, setInlineError] = useState<InlineError | null>(null)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  function finalizeLogin(accessToken: string, email: string) {
    auth.setAccessToken(accessToken)
    const user = authUserFromToken(accessToken, email)
    auth.setUser(user)
    saveUserDisplay({ nombre: user.nombre, email })
    const targetPath = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/'
    navigate({ to: targetPath, replace: true })
    toast.success(`Bienvenido, ${user.nombre}`)
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setInlineError(null)
    try {
      const response = await api.post<unknown>('/api/v1/auth/admin/login', {
        email: data.email,
        password: data.password,
      })

      const provisionalToken = extractToken(response.data)
      const provisionalUser = authUserFromToken(provisionalToken, data.email)

      if (provisionalUser.billares.length <= 1) {
        // El token provisional ya contiene billar_id en sus claims — usarlo directamente
        // evita un segundo POST /login que crearía una sesión huérfana en el backend.
        finalizeLogin(provisionalToken, data.email)
      } else {
        // Múltiples billares: mostrar selector
        // Usar token provisional SOLO para esta llamada — no guardarlo en el store
        // para no disparar el hook de WebSocket con un token provisional.
        try {
          const billaresResponse = await api.get<Billar[]>('/api/v1/billares', {
            headers: { Authorization: `Bearer ${provisionalToken}` },
          })
          const billaresData = billaresResponse.data
          const assignedIds = provisionalUser.billares_asignados
          setAvailableBillares(
            (Array.isArray(billaresData) ? billaresData : []).filter((b) =>
              assignedIds.includes(b.id)
            )
          )
        } catch {
          // Si no se pueden obtener nombres, mostrar IDs como fallback
          setAvailableBillares(
            provisionalUser.billares.map((b) => ({
              id: b.billar_id,
              nombre: `Sucursal #${b.billar_id}`,
              activo: true,
              es_prueba: false,
            }))
          )
        }
        setPendingCredentials({ email: data.email, password: data.password })
      }
    } catch (error) {
      const classified = classifyApiError(error)
      if (classified) {
        setInlineError(classified)
      } else {
        showApiError(error, 'Error al iniciar sesión')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function onSelectBillar() {
    if (!pendingCredentials || !selectedBillarId) return
    setIsLoading(true)
    try {
      const response = await api.post<unknown>('/api/v1/auth/admin/login', {
        email: pendingCredentials.email,
        password: pendingCredentials.password,
        billar_id: Number(selectedBillarId),
      })
      finalizeLogin(extractToken(response.data), pendingCredentials.email)
    } catch (error) {
      showApiError(error, 'Error al seleccionar la sucursal')
    } finally {
      setIsLoading(false)
    }
  }

  if (pendingCredentials) {
    return (
      <div className={cn('grid gap-3', className)}>
        <div className='mb-1'>
          <p className='text-sm text-muted-foreground'>
            Tu cuenta tiene acceso a múltiples sucursales. Selecciona con cuál deseas trabajar.
          </p>
        </div>
        <div className='grid gap-2'>
          <label className='text-sm font-medium'>Sucursal</label>
          <Select value={selectedBillarId} onValueChange={setSelectedBillarId}>
            <SelectTrigger>
              <SelectValue placeholder='Selecciona una sucursal' />
            </SelectTrigger>
            <SelectContent>
              {availableBillares.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className='mt-2'
          disabled={isLoading || !selectedBillarId}
          onClick={onSelectBillar}
        >
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Ingresar
        </Button>
        <Button
          variant='ghost'
          size='sm'
          disabled={isLoading}
          onClick={() => setPendingCredentials(null)}
        >
          Volver
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input placeholder='usuario@ejemplo.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {inlineError && (
          <Alert variant='destructive'>
            {inlineError.icon === 'shield' ? (
              <ShieldAlert className='h-4 w-4' />
            ) : (
              <KeyRound className='h-4 w-4' />
            )}
            <AlertTitle>{inlineError.title}</AlertTitle>
            <AlertDescription>{inlineError.description}</AlertDescription>
          </Alert>
        )}

        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Ingresar
        </Button>
      </form>
    </Form>
  )
}
