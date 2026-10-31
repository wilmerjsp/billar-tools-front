import { isAxiosError } from 'axios'

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Envelope de error del backend: { success: false, error: { code, message, details } }
interface ApiErrorBody {
  error?: { code?: string; message?: string } | null
  message?: string
  detail?: string
}

function extractApiErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const body = data as ApiErrorBody
  if (body.error && typeof body.error === 'object' && body.error.message) {
    return body.error.message
  }
  if (typeof body.message === 'string' && body.message) return body.message
  if (typeof body.detail === 'string' && body.detail) return body.detail
  return null
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado'
): string {
  if (isAxiosError(error)) {
    const fromApi = extractApiErrorMessage(error.response?.data)
    if (fromApi) return fromApi
    if (!error.response) return 'No se pudo conectar con el servidor'
    return fallback
  }
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}
