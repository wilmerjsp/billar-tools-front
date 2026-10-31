# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Admin dashboard for a billiard hall chain (billar) built on top of the [shadcn-admin](https://github.com/satnaing/shadcn-admin) template. The app manages real-time table/game tracking, POS, inventory, staff, and reporting across multiple locations.

**Tech stack:** React 18 + TypeScript + Vite + React Router v6 + React Query (TanStack) + Zustand + React Hook Form + Zod + Axios + Socket.io + shadcn/ui + Tailwind CSS + Recharts

## Commands

> The project is being scaffolded from the shadcn-admin template. Once set up, standard commands will be:

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run preview      # Preview production build
```

## Architecture

### Folder Structure

```
src/
├── app/              # App.tsx, router.tsx, providers.tsx
├── assets/           # Static files
├── components/
│   ├── ui/           # shadcn/ui components — DO NOT edit directly
│   ├── layout/       # Sidebar, Topbar, PageHeader (from template)
│   └── shared/       # Reusable custom components: DataTable, ErrorBoundary, etc.
├── features/         # Feature modules (see below)
├── hooks/            # Global hooks: useWebSocket, useDebounce, usePermissions
├── lib/              # axios.ts, queryClient.ts, utils.ts, constants.ts
├── stores/           # Global Zustand stores (uiStore.ts)
└── types/            # api.ts, models.ts, enums.ts
```

### Feature Modules

Each feature in `src/features/` follows this internal structure:

```
features/[module]/
├── components/       # Presentational components
├── hooks/            # useQuery/useMutation hooks for this feature
├── services/         # HTTP calls (e.g., mesasService.ts)
├── pages/            # Page-level components
├── store/            # Zustand store (only if needed)
└── types.ts
```

**Modules:** `auth`, `dashboard`, `mesas`, `juegos`, `pedidos`, `caja`, `productos`, `inventario`, `meseras`, `sucursales`, `usuarios`, `reportes`

### State Management — Three Layers

| Layer | Tool | Use |
|-------|------|-----|
| Server state | React Query | API data, caching |
| Global client state | Zustand | Auth, active branch, UI state |
| Local component state | `useState` / `useReducer` | Forms, toggles |

Never put server data in Zustand. Never call `fetch`/`axios` directly in components.

### Authentication Flow

- `access_token` → stored **in memory only** (Zustand store) — never in localStorage/sessionStorage
- `refresh_token` → set by backend as **httpOnly cookie**
- On 401 → axios interceptor auto-calls `/auth/refresh` → updates store → retries request
- On refresh failure → force logout → redirect to `/login`

See `lib/axios.ts` for the interceptor pattern.

### Routing Structure

```
/login              → LoginPage (public)
/                   → ProtectedRoute → AppLayout (template layout)
  /                 → DashboardPage
  /mesas            → MesasPage
  /juegos           → JuegosActivosPage
  /pedidos          → PedidosPage
  [RoleGuard: superadmin, admin]
    /usuarios       → UsuariosPage
    /sucursales     → SucursalesPage
  [RoleGuard: superadmin, admin, cajero]
    /caja           → CajaPage
```

### Real-Time (WebSockets)

Use `useWebSocket(channel)` hook from `hooks/useWebSocket.ts`. On events, it calls `queryClient.invalidateQueries` to trigger React Query refetch — no manual state updates needed.

## Critical Rules

### Template Integration

- **Before creating any component**, check if shadcn-admin template already provides it
- `src/components/ui/` is owned by shadcn/ui CLI — never edit these files directly
- For custom variants, create a wrapper component in `components/shared/`
- Use theme color tokens (`bg-primary`, `text-muted-foreground`) — never hardcode colors
- All new pages go inside the template's `AppLayout` router children

### TypeScript

- `any` is **forbidden**. Use `unknown` + type narrowing, or add an eslint-disable comment with a documented reason
- All component props must have explicit interfaces
- Use `ApiResponse<T>` and `PaginatedResponse<T>` generics for API responses
- Enums use `PascalCase` name, `SCREAMING_SNAKE_CASE` values

### Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Components / Pages | PascalCase | `MesaCard`, `MesasPage` |
| Hooks | `use` prefix | `useMesas`, `useAuthStore` |
| Services | `Service` suffix | `mesasService` |
| Zustand stores | `Store` suffix | `useAuthStore` |
| Component files | `PascalCase.tsx` | `MesaCard.tsx` |
| Hook/util files | `camelCase.ts` | `useMesas.ts` |

### Forms

All forms use **React Hook Form + Zod**. Define a Zod schema, derive the type with `z.infer`, pass `zodResolver` to `useForm`.

### Performance

- Lazy-load all page components with `React.lazy()` in router — especially reportes
- Tables with 50+ rows require TanStack Virtual
- `memo`/`useMemo`/`useCallback` only where a measurable performance issue exists
- `console.log` is prohibited in code merged to `main`

### Imports

Always use the `@/` alias (maps to `src/`). Never use relative paths with more than 2 levels of `../`.

### Environment Variables

Access env vars only through `lib/constants.ts` → the `ENV` object (never `import.meta.env` directly in components). The file validates that required vars are defined at startup.

## API Reference

Backend API documentation is in `docs/api_endpoints for_frontend.md`. Covers: Auth, Billares, Usuarios, Meseras, Mesas, Juegos, Consumos, Caja, Facturas, Productos, Categorías, Inventario, Reportes (with Excel/PDF export).

Base URL configured via `VITE_API_URL` env var.

## User Roles

`superadmin` > `admin` > `cajero` — enforce in UI with `RoleGuard` and `usePermissions` hook. API also validates permissions independently.

## Reference Docs (load on demand)

When working on folder structure or new modules, load:
  .claude/reference/architecture.md

When working on auth, JWT, guards or permissions, load:
  .claude/reference/security.md
