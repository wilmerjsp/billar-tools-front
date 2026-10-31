import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosService, type ProductoPayload } from '../services/productos-service'
import { type CategoriaProducto } from '@/types/models'

export function useProductos(categoriaId?: number) {
  return useQuery({
    queryKey: ['productos', categoriaId],
    queryFn: () =>
      productosService.getAll(categoriaId ? { categoria_id: categoriaId } : undefined),
    staleTime: 1000 * 30,
  })
}

export function useCategorias() {
  return useQuery({
    queryKey: ['productos-categorias'],
    queryFn: () => productosService.getCategorias(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useProductoMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['productos'] })

  const create = useMutation({
    mutationFn: (data: ProductoPayload) => productosService.create(data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<ProductoPayload>
    }) => productosService.update(id, data),
    onSuccess: invalidate,
  })

  const toggleDisponibilidad = useMutation({
    mutationFn: ({ id, disponible }: { id: number; disponible: boolean }) =>
      productosService.toggleDisponibilidad(id, disponible),
    onSuccess: invalidate,
  })

  const deleteMuchos = useMutation({
    mutationFn: (ids: number[]) => productosService.deleteMany(ids),
    onSuccess: invalidate,
  })

  return { create, update, toggleDisponibilidad, deleteMuchos }
}

export function useCargarInventarioDefault() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => productosService.cargarInventarioDefault(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['productos-categorias'] })
    },
  })
}

export function useCategoriaMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['productos-categorias'] })

  const createCategoria = useMutation({
    mutationFn: (data: Omit<CategoriaProducto, 'id'>) =>
      productosService.createCategoria(data),
    onSuccess: invalidate,
  })

  const updateCategoria = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<Omit<CategoriaProducto, 'id'>>
    }) => productosService.updateCategoria(id, data),
    onSuccess: invalidate,
  })

  return { createCategoria, updateCategoria }
}
