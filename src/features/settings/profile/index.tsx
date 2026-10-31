import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Perfil del billar'
      desc='Información general del billar. Estos datos se muestran en facturas y reportes.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
