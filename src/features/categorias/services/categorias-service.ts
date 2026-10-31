import api from '@/lib/axios'
import { type CategoriaProducto } from '@/types/models'

export interface CreateCategoriaDto {
  nombre: string
  icono?: string
  orden?: number
  activa: boolean
}

export interface UpdateCategoriaDto {
  nombre?: string
  icono?: string
  orden?: number
  activa?: boolean
}

export const categoriasService = {
  getAll: () =>
    api
      .get<CategoriaProducto[]>('/api/v1/productos/categorias')
      .then((r) => r.data),

  create: (dto: CreateCategoriaDto) =>
    api
      .post<CategoriaProducto>('/api/v1/productos/categorias', dto)
      .then((r) => r.data),

  update: (id: number, dto: UpdateCategoriaDto) =>
    api
      .patch<CategoriaProducto>(`/api/v1/productos/categorias/${id}`, dto)
      .then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/api/v1/productos/categorias/${id}`).then((r) => r.data),

  deleteMany: (ids: number[]) =>
    Promise.all(ids.map((id) => api.delete(`/api/v1/productos/categorias/${id}`).then((r) => r.data))),
}
