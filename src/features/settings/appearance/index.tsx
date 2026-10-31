import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Apariencia'
      desc='Personaliza la apariencia del sistema. Cambia entre el tema claro y oscuro.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
