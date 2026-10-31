## 1. Punto de Partida — Template de React

El admin dashboard se construye **sobre un template existente de React**, no desde cero. Esto implica una regla fundamental que rige todo el desarrollo:

> ⚠️ **Regla de Oro:** Antes de crear cualquier componente, revisar si el template ya provee uno equivalente. Extender lo que existe; nunca duplicar ni reemplazar sin justificación documentada.

**Template usado:**

- [Shadcn Admin](https://github.com/satnaing/shadcn-admin) — shadcn/ui + Tailwind + Vite + React Router

### 1.1 Qué conservar siempre del template

- **Sistema de colores** definido en `tailwind.config.js` (`--primary`, `--background`, `--muted`, etc.)
- **Variantes de componentes** (tamaños, variantes de botones, badges, etc.)
- **Tipografía** (familia, escala de tamaños)
- **Layout del sidebar / topbar** (adaptar contenido, nunca rehacer estructura)
- **Breakpoints responsivos**
- **Modo oscuro / claro** (si el template lo incluye)

### 1.3 Qué se puede y no se puede modificar

| ✅ Se puede | ❌ No se debe |
|------------|--------------|
| Cambiar colores del tema en `tailwind.config.js` | Reescribir componentes shadcn desde cero |
| Agregar variantes nuevas a componentes existentes | Crear un `Button.tsx` propio si ya existe uno |
| Extender el tema con nuevos tokens de color | Usar estilos inline (`style={{}}`) para cosas que cubre Tailwind |
| Añadir nuevas páginas siguiendo la estructura del template | Mezclar librerías de UI (no agregar MUI o Antd junto a shadcn) |
| Crear componentes propios para lógica de negocio | Usar `!important` en Tailwind para sobreescribir estilos |

---

## 2. Arquitectura del Proyecto

### 2.1 Estructura de Carpetas

```
src/
├── app/                        # Configuración global de la app
│   ├── App.tsx                 # Componente raíz
│   ├── router.tsx              # Definición de rutas
│   └── providers.tsx           # Composición de providers globales
│
├── assets/                     # Imágenes, íconos, fuentes estáticas
│
├── components/                 # Componentes reutilizables globales
│   ├── ui/                     # Componentes de shadcn/ui (NO editar directamente)
│   ├── layout/                 # Sidebar, Topbar, PageHeader, etc.
│   └── shared/                 # Componentes comunes propios: DataTable, EmptyState, etc.
│
├── features/                   # Módulos de negocio (feature-based)
│   ├── auth/
│   │   ├── components/         # LoginForm, etc.
│   │   ├── hooks/              # useAuth, useSession
│   │   ├── services/           # authService (llamadas a la API)
│   │   ├── store/              # authStore (Zustand)
│   │   └── types.ts
│   ├── dashboard/
│   ├── mesas/
│   ├── juegos/
│   ├── pedidos/
│   ├── caja/
│   ├── productos/
│   ├── inventario/
│   ├── meseras/
│   ├── sucursales/
│   ├── usuarios/
│   └── reportes/
│
├── hooks/                      # Hooks globales reutilizables
│   ├── useWebSocket.ts
│   ├── useDebounce.ts
│   └── usePermissions.ts
│
├── lib/                        # Utilidades y configuración de librerías externas
│   ├── axios.ts                # Instancia configurada de axios
│   ├── queryClient.ts          # Configuración de React Query
│   ├── utils.ts                # cn(), formatCurrency(), formatDate(), etc.
│   └── constants.ts            # Enums, constantes globales
│
├── services/                   # Capa de servicios HTTP base (si no va dentro de features)
│
├── stores/                     # Stores globales de Zustand (no de features)
│   └── uiStore.ts              # Estado de UI global (sidebar abierto, tema, etc.)
│
└── types/                      # Tipos TypeScript globales
    ├── api.ts                  # Tipos de respuestas de la API
    ├── models.ts               # Tipos de entidades (Mesa, Juego, Producto, etc.)
    └── enums.ts                # Enumeraciones compartidas
```

### 2.2 Estructura dentro de cada Feature

Cada módulo de negocio sigue la misma estructura interna:

```
features/mesas/
├── components/
│   ├── MesaCard.tsx            # Componente de presentación
│   ├── MesaMap.tsx             # Mapa visual de mesas
│   ├── MesaStatusBadge.tsx     # Badge de estado
│   └── MesaForm.tsx            # Formulario crear/editar
├── hooks/
│   ├── useMesas.ts             # useQuery para listar mesas
│   └── useMesaMutations.ts     # useMutation para crear/editar/eliminar
├── services/
│   └── mesasService.ts         # Llamadas HTTP al backend
├── pages/
│   ├── MesasPage.tsx           # Página principal del módulo
│   └── MesaDetailPage.tsx      # Vista de detalle
├── store/                      # Solo si hay estado local del módulo
│   └── mesasStore.ts
└── types.ts                    # Tipos específicos del módulo
```

---

## Template Integration Rules

- shadcn/ui components live in `src/components/ui/` — never edit directly, create wrappers in `components/shared/`
- Colors: always use theme tokens (`bg-primary`, `bg-muted`, `bg-destructive`) — never hardcoded values
- New pages go inside `AppLayout` children in router — never create a parallel layout
- Customize theme only in `tailwind.config.js` via CSS vars (`hsl(var(--primary))`)