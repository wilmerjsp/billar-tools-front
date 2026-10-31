import api from '@/lib/axios'
import { type Producto, type CategoriaProducto } from '@/types/models'

export interface ComboItemPayload {
  producto_id: number
  cantidad: number
}

export interface ProductoPayload {
  categoria_id: number
  nombre: string
  descripcion?: string
  precio: number
  precio_costo?: number
  imagen_url?: string
  disponible: boolean
  lleva_inventario: boolean
  es_combo?: boolean
  combo_items?: ComboItemPayload[]
  stock_inicial?: number
  stock_minimo?: number
}

export const productosService = {
  getAll: (params?: { categoria_id?: number }) =>
    api.get<Producto[]>('/api/v1/productos', { params }).then(r => r.data),
  create: (data: ProductoPayload) =>
    api.post<Producto>('/api/v1/productos', data).then(r => r.data),
  update: (id: number, data: Partial<ProductoPayload>) =>
    api.patch<Producto>(`/api/v1/productos/${id}`, data).then(r => r.data),
  toggleDisponibilidad: (id: number, disponible: boolean) =>
    api.patch(`/api/v1/productos/${id}/disponibilidad`, { disponible }).then(r => r.data),
  getCategorias: () =>
    api.get<CategoriaProducto[]>('/api/v1/productos/categorias').then(r => r.data),
  createCategoria: (data: Omit<CategoriaProducto, 'id'>) =>
    api.post<CategoriaProducto>('/api/v1/productos/categorias', data).then(r => r.data),
  updateCategoria: (id: number, data: Partial<Omit<CategoriaProducto, 'id'>>) =>
    api.patch<CategoriaProducto>(`/api/v1/productos/categorias/${id}`, data).then(r => r.data),
  delete: (id: number) =>
    api.delete(`/api/v1/productos/${id}`).then(r => r.data),
  deleteMany: (ids: number[]) =>
    Promise.all(ids.map(id => api.delete(`/api/v1/productos/${id}`).then(r => r.data))),
  cargarInventarioDefault: () =>
    api.post('/api/v1/productos/cargar-inventario-default').then(r => r.data),
}
