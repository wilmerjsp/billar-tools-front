import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  categoriasService,
  type CreateCategoriaDto,
  type UpdateCategoriaDto,
} from '../services/categorias-service'

const QUERY_KEY = ['categorias'] as const

export function useCategorias() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: categoriasService.getAll,
    staleTime: 1000 * 30,
  })
}

export function useCategoriasMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (dto: CreateCategoriaDto) => categoriasService.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const update = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCategoriaDto }) =>
      categoriasService.update(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const deleteMuchos = useMutation({
    mutationFn: (ids: number[]) => categoriasService.deleteMany(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return { create, update, deleteMuchos }
}
