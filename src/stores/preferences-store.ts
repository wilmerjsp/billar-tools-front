import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Preferencias de UI del panel. Persisten solo en el front (localStorage);
// no se sincronizan con el backend.

interface PreferencesState {
  solicitarMontoRecibido: boolean
  setSolicitarMontoRecibido: (value: boolean) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      solicitarMontoRecibido: true,
      setSolicitarMontoRecibido: (value) =>
        set({ solicitarMontoRecibido: value }),
    }),
    { name: 'billar-preferences' },
  ),
)
