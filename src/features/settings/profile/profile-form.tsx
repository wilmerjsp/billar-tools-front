import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { showApiError } from '@/lib/handle-server-error'
import { sucursalesService } from '@/features/sucursales/services/sucursales-service'
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
import { Skeleton } from '@/components/ui/skeleton'

const profileSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.auth.user)
  const billarId = user?.billares_asignados[0]

  const { data: billar, isLoading } = useQuery({
    queryKey: ['billares', billarId],
    queryFn: () => sucursalesService.getById(billarId!),
    enabled: !!billarId,
  })

  const { mutate: updateBillar, isPending } = useMutation({
    mutationFn: (data: ProfileFormValues) =>
      sucursalesService.update(billarId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billares', billarId] })
      toast.success('Información del billar actualizada.')
    },
    onError: (error) => {
      showApiError(error, 'No se pudo actualizar la información. Intenta nuevamente.')
    },
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nombre: '', direccion: '', telefono: '' },
  })

  useEffect(() => {
    if (billar) {
      form.reset({
        nombre: billar.nombre,
        direccion: billar.direccion ?? '',
        telefono: billar.telefono ?? '',
      })
    }
  }, [billar, form])

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => updateBillar(data))}
        className='space-y-6'
      >
        <FormField
          control={form.control}
          name='nombre'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del billar</FormLabel>
              <FormControl>
                <Input placeholder='Ej. Billar El Campeón' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='direccion'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder='Ej. Calle 10 # 5-23, Bogotá' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='telefono'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder='Ej. 3001234567' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </Form>
  )
}
