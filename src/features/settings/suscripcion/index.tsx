import { ContentSection } from '../components/content-section'
import { SuscripcionInfo } from './suscripcion-info'

export function SettingsSuscripcion() {
  return (
    <ContentSection
      title='Suscripción'
      desc='Estado de tu suscripción, plan contratado y uso de los límites.'
    >
      <SuscripcionInfo />
    </ContentSection>
  )
}
