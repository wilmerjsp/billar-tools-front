import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Cuenta'
      desc='Administra la seguridad de tu cuenta. Actualiza tu contraseña de acceso.'
    >
      <AccountForm />
    </ContentSection>
  )
}
