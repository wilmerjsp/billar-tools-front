import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Categorias } from '@/features/categorias'

const categoriasSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  nombre: z.string().optional().catch(''),
  activa: z
    .array(z.union([z.literal('true'), z.literal('false')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/categorias/')({
  validateSearch: categoriasSearchSchema,
  component: Categorias,
})
