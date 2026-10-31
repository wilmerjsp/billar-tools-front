import { EstadoJuego } from '@/types/enums'

export const estadoConfig: Record<
  EstadoJuego,
  { label: string; className: string }
> = {
  [EstadoJuego.EN_JUEGO]: {
    label: 'En juego',
    className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/40',
  },
  [EstadoJuego.PAUSADO]: {
    label: 'Pausado',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/40',
  },
  [EstadoJuego.CERRADO]: {
    label: 'Cerrado',
    className: 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-800',
  },
  [EstadoJuego.FINALIZADO]: {
    label: 'Por cobrar',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/40',
  },
  [EstadoJuego.FACTURADO]: {
    label: 'Facturado',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/40',
  },
}
