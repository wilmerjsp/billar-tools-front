import { ContentSection } from '../components/content-section'
import { PreferenciasForm } from './preferencias-form'

export function SettingsPreferencias() {
  return (
    <ContentSection
      title='Preferencias'
      desc='Activa o desactiva opciones del panel. Estos ajustes se guardan en este navegador.'
    >
      <PreferenciasForm />
    </ContentSection>
  )
}
