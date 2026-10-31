import api from '@/lib/axios'
import type { MiSuscripcion } from './types'

export const suscripcionService = {
  // Solo el admin propietario del billar (es_propietario) puede consultarla;
  // el backend responde 403 para el resto de usuarios.
  getMiBillar: () =>
    api.get<MiSuscripcion>('/api/v1/suscripciones/mi-billar').then((r) => r.data),
}
