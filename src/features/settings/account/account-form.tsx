import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useChangePassword } from '@/features/auth/hooks/use-change-password'
import { showApiError } from '@/lib/handle-server-error'
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

const accountFormSchema = z
  .object({
    contrasena_actual: z
      .string()
      .min(1, 'Ingresa tu contraseña actual.'),
    contrasena_nueva: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
    contrasena_confirmacion: z
      .string()
      .min(1, 'Confirma tu nueva contraseña.'),
  })
  .refine((data) => data.contrasena_nueva === data.contrasena_confirmacion, {
    message: 'Las contraseñas no coinciden.',
    path: ['contrasena_confirmacion'],
  })

type AccountFormValues = z.infer<typeof accountFormSchema>

export function AccountForm() {
  const changePassword = useChangePassword()
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      contrasena_actual: '',
      contrasena_nueva: '',
      contrasena_confirmacion: '',
    },
  })

  function onSubmit(data: AccountFormValues) {
    changePassword.mutate(
      {
        current_password: data.contrasena_actual,
        new_password: data.contrasena_nueva,
        confirm_new_password: data.contrasena_confirmacion,
      },
      {
        onSuccess: () => {
          toast.success('Contraseña actualizada correctamente')
          form.reset()
        },
        onError: (error) => showApiError(error),
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='contrasena_actual'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña actual</FormLabel>
              <FormControl>
                <Input type='password' placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='contrasena_nueva'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <Input type='password' placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='contrasena_confirmacion'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nueva contraseña</FormLabel>
              <FormControl>
                <Input type='password' placeholder='••••••••' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={changePassword.isPending}>
          {changePassword.isPending ? 'Actualizando…' : 'Actualizar contraseña'}
        </Button>
      </form>
    </Form>
  )
}
