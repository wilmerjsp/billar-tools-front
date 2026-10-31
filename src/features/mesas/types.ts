import { type Mesa } from '@/types/models'
import { TipoMesa } from '@/types/enums'
import { z } from 'zod'

export type { Mesa }

export const mesaFormSchema = z.object({
  numero: z.number().min(1, 'El número de mesa es requerido'),
  nombre: z.string().optional(),
  tipo: z.nativeEnum(TipoMesa).optional(),
  registra_tiempo: z.boolean(),
  tarifa_por_hora: z.number().min(0).optional(),
})
export type MesaFormValues = z.infer<typeof mesaFormSchema>
