import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useSuperAdminAuthStore } from '@/stores/superadmin-auth-store'
import superAdminApi from '@/lib/superadmin-api'
import { authUserFromToken } from '@/lib/jwt'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { showApiError } from '@/lib/handle-server-error'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Ingresa tu correo electrónico' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña')
    .min(7, 'La contraseña debe tener al menos 7 caracteres'),
})

interface SuperAdminAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function SuperAdminAuthForm({ className, redirectTo, ...props }: SuperAdminAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useSuperAdminAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await superAdminApi.post<unknown>('/api/v1/auth/admin/login', {
        email: data.email,
        password: data.password,
      })

      const responseData = response.data as Record<string, unknown>
      const token =
        typeof (responseData?.data as Record<string, unknown>)?.access_token === 'string'
          ? (responseData.data as Record<string, unknown>).access_token as string
          : typeof responseData?.access_token === 'string'
            ? responseData.access_token as string
            : null

      if (!token) throw new Error('La respuesta del servidor no contiene el access token')

      const user = authUserFromToken(token, data.email)
      auth.setAccessToken(token)
      auth.setUser(user)

      const targetPath =
        redirectTo && redirectTo.startsWith('/superadmin') ? redirectTo : '/superadmin'
      navigate({ to: targetPath, replace: true })
      toast.success(`Bienvenido, ${user.nombre}`)
    } catch (error) {
      showApiError(error, 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
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
                <Input placeholder='admin@ejemplo.com' {...field} />
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
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Ingresar
        </Button>
      </form>
    </Form>
  )
}
