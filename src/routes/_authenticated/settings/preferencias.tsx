import { createFileRoute } from '@tanstack/react-router'
import { SettingsPreferencias } from '@/features/settings/preferencias'

export const Route = createFileRoute('/_authenticated/settings/preferencias')({
  component: SettingsPreferencias,
})
