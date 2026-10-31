import { createFileRoute } from '@tanstack/react-router'
import { UsuariosPage } from '@/features/usuarios/pages/usuarios-page'

export const Route = createFileRoute('/_authenticated/usuarios/')({
  component: UsuariosPage,
})
