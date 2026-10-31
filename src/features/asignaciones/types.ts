import { z } from 'zod'
export type { Asignacion } from '@/types/models'

export const asignacionBatchSchema = z.object({
  mesera_id: z.number().min(1),
  mesa_ids: z.array(z.number()).min(1, 'Selecciona al menos una mesa'),
})

export type AsignacionBatchValues = z.infer<typeof asignacionBatchSchema>
