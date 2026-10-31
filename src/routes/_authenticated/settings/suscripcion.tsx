import { createFileRoute } from '@tanstack/react-router'
import { SettingsSuscripcion } from '@/features/settings/suscripcion'

export const Route = createFileRoute('/_authenticated/settings/suscripcion')({
  component: SettingsSuscripcion,
})
