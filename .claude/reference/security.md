## 4. Seguridad

### 4.1 Autenticación y Tokens JWT

```
Flujo de autenticación:
    │
    ▼
Login → POST /auth/login → { access_token, refresh_token }
    │
    ▼
access_token  → almacenar en MEMORIA (variable de módulo o Zustand)
refresh_token → almacenar en httpOnly cookie (el backend la setea)
    │
    ▼
Cada request → Authorization: Bearer <access_token>
    │
    ▼
Token expirado (401) → interceptor llama a /auth/refresh → nuevo access_token
    │
    ▼
Refresh inválido → logout forzado → redirigir a /login
```

> ⚠️ **Regla crítica de seguridad:** El `access_token` **NUNCA** se guarda en `localStorage` ni `sessionStorage`. Son vulnerables a ataques XSS. Se guarda en memoria (Zustand store en RAM) y se pierde al recargar la página, lo que es el comportamiento correcto: el `refresh_token` en cookie httpOnly se usa para restaurar la sesión.

```ts
// lib/axios.ts — Instancia con interceptores
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,          // Envía la cookie httpOnly automáticamente
})

// Inyectar token en cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Manejar expiración y refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await api.post('/auth/refresh')       // usa la cookie httpOnly
        useAuthStore.getState().setAccessToken(data.access_token)
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

### 4.2 Rutas Protegidas

```tsx
// app/router.tsx

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,              // Guard de autenticación
    children: [
      {
        element: <AppLayout />,              // Layout con sidebar/topbar del template
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/mesas', element: <MesasPage /> },
          {
            element: <RoleGuard roles={['superadmin', 'admin']} />,
            children: [
              { path: '/usuarios', element: <UsuariosPage /> },
              { path: '/sucursales', element: <SucursalesPage /> },
            ],
          },
          {
            element: <RoleGuard roles={['superadmin', 'admin', 'cajero']} />,
            children: [
              { path: '/caja', element: <CajaPage /> },
            ],
          },
        ],
      },
    ],
  },
])
```

```tsx
// components/shared/ProtectedRoute.tsx
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <FullPageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}

// components/shared/RoleGuard.tsx
interface RoleGuardProps {
  roles: UserRole[]
}

export function RoleGuard({ roles }: RoleGuardProps) {
  const { user } = useAuthStore()

  if (!user || !roles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
```

### 4.3 Autorización por Permisos en UI

Esconder elementos de UI según el rol del usuario. Nunca confiar en que ocultar en el front es suficiente — la API también valida permisos:

```tsx
// hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuthStore()

  return {
    canManageUsers: user?.rol === 'superadmin',
    canManageSucursales: user?.rol === 'superadmin',
    canAccessCaja: ['superadmin', 'admin', 'cajero'].includes(user?.rol ?? ''),
    canEditProducts: ['superadmin', 'admin'].includes(user?.rol ?? ''),
  }
}

// Uso en componente
export function TopbarActions() {
  const { canManageUsers } = usePermissions()

  return (
    <nav>
      {canManageUsers && (
        <Link to="/usuarios">Usuarios</Link>
      )}
    </nav>
  )
}
```

### 4.4 Sanitización y Prevención de XSS

```tsx
// ❌ NUNCA usar dangerouslySetInnerHTML con datos del usuario o de la API
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ React escapa automáticamente en JSX — aprovecharlo
<div>{userInput}</div>

// ✅ Si hay necesidad de renderizar HTML (ej: notas ricas), usar DOMPurify
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
```

### 4.5 Variables de Entorno

```bash
# .env.local (nunca se sube al repositorio)
VITE_API_URL=https://api.mibillar.com
VITE_WS_URL=wss://api.mibillar.com/ws

# .env.example (sí se sube, sin valores reales)
VITE_API_URL=
VITE_WS_URL=
```

```ts
// lib/constants.ts — Centralizar acceso a env vars con validación
const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) throw new Error("VITE_API_URL no está definida")

export const ENV = {
  API_URL: apiUrl,
  WS_URL: import.meta.env.VITE_WS_URL,
} as const
```

> ⚠️ **Regla:** Nunca acceder a `import.meta.env` directamente en componentes. Siempre pasar por `ENV` del módulo de constantes para poder validar y centralizar.

---