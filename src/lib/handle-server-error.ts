import { toast } from 'sonner'
import { getErrorMessage } from '@/types/api'

// Id compartido: el onError global (main.tsx) y los onError locales reaccionan
// al mismo error; con el mismo id sonner reemplaza el toast en vez de apilarlo.
// El handler local corre después del global, así que su mensaje es el que queda.
export const API_ERROR_TOAST_ID = 'api-error'

export function showApiError(error: unknown, fallback?: string) {
  toast.error(getErrorMessage(error, fallback), { id: API_ERROR_TOAST_ID })
}

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  showApiError(error, 'Algo salió mal. Intenta de nuevo.')
}
