## 3. Patrones de React

### 3.1 Componentes

**Regla:** Todos los componentes son funcionales con TypeScript. Prohibido usar componentes de clase.

```tsx
// ✅ CORRECTO — Componente tipado con props explícitas
interface MesaCardProps {
  mesa: Mesa
  onSelect: (id: number) => void
  isSelected?: boolean
}

export function MesaCard({ mesa, onSelect, isSelected = false }: MesaCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 cursor-pointer transition-colors",
        isSelected && "border-primary bg-primary/10"
      )}
      onClick={() => onSelect(mesa.id)}
    >
      {/* contenido */}
    </div>
  )
}

// ❌ INCORRECTO — Props con any, sin tipado
export function MesaCard({ mesa, onSelect }: any) { ... }
```

**Separación de responsabilidades:**

```
Componente de presentación     →  Solo recibe props y renderiza UI
Componente contenedor          →  Llama hooks, maneja estado, pasa props
Página (Page component)        →  Compone contenedores + layout de la vista
```

### 3.2 Hooks Personalizados

Todo acceso a datos, efectos o lógica reutilizable va en un hook. Los componentes solo consumen hooks.

```ts
// features/mesas/hooks/useMesas.ts

export function useMesas(billarId: number) {
  return useQuery({
    queryKey: ['mesas', billarId],
    queryFn: () => mesasService.getAll(billarId),
    staleTime: 1000 * 30,        // 30 segundos
    refetchOnWindowFocus: true,
  })
}

export function useMesaMutations() {
  const queryClient = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: mesasService.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesas'] })
    },
  })

  return { updateStatus }
}
```

**Reglas para hooks:**

- El nombre siempre empieza con `use`
- Un hook hace una sola cosa (Single Responsibility)
- Los hooks de datos van en `features/[modulo]/hooks/`
- Los hooks de UI global van en `src/hooks/`
- Nunca llamar a `fetch` o `axios` directamente dentro de un componente

### 3.3 Manejo de Estado

El proyecto usa **tres capas de estado**, cada una con su responsabilidad:

| Capa | Herramienta | Uso |
|------|------------|-----|
| Estado del servidor | React Query (TanStack) | Datos que vienen de la API |
| Estado global del cliente | Zustand | Auth, sucursal activa, UI global |
| Estado local del componente | `useState` / `useReducer` | Formularios, toggles, UI local |

```ts
// stores/uiStore.ts — Estado global de UI con Zustand
interface UIStore {
  sidebarOpen: boolean
  activeBillarId: number | null
  toggleSidebar: () => void
  setActiveBillar: (id: number) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeBillarId: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveBillar: (id) => set({ activeBillarId: id }),
}))
```

**Reglas de estado:**

- No usar Context API para estado frecuentemente actualizado (usar Zustand)
- Context solo para valores estáticos o que cambian muy raramente (tema, configuración del tenant)
- No usar Redux; Zustand cubre todos los casos de uso de este proyecto
- Nunca guardar datos del servidor en Zustand; React Query los maneja con caché
- `useReducer` solo si el estado local tiene más de 3 campos interdependientes

### 3.4 Memorización

```tsx
// ✅ Usar memo solo cuando el componente es costoso y recibe las mismas props frecuentemente
export const MesaMap = memo(function MesaMap({ mesas }: { mesas: Mesa[] }) {
  return ( /* render costoso */ )
})

// ✅ useMemo para cálculos costosos
const mesasOcupadas = useMemo(
  () => mesas.filter(m => m.status === 'ocupada'),
  [mesas]
)

// ✅ useCallback para funciones pasadas como props a componentes memorizados
const handleSelectMesa = useCallback((id: number) => {
  setSelectedId(id)
}, [])

// ❌ No abusar — no agregar memo/useMemo/useCallback en todos lados por defecto
// Solo donde hay un problema de rendimiento medible
```

### 3.5 Formularios

Todos los formularios usan **React Hook Form + Zod** para validación.

```tsx
// features/mesas/components/MesaForm.tsx

const mesaSchema = z.object({
  numero: z.number().min(1, "El número de mesa es requerido"),
  tipo: z.enum(['pool', 'snooker', 'carambola']),
  tarifa_por_hora: z.number().min(0, "La tarifa no puede ser negativa"),
})

type MesaFormValues = z.infer<typeof mesaSchema>

export function MesaForm({ onSubmit }: { onSubmit: (data: MesaFormValues) => void }) {
  const form = useForm<MesaFormValues>({
    resolver: zodResolver(mesaSchema),
    defaultValues: { numero: 1, tipo: 'pool', tarifa_por_hora: 0 },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de mesa</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* más campos */}
        <Button type="submit">Guardar</Button>
      </form>
    </Form>
  )
}
```

---

## Error Handling

- Wrap critical sections with `<ErrorBoundary fallback={<SectionError />}>`
- queryClient: retry < 2 unless 404; mutations use `toast.error(getErrorMessage(error))`
- Always handle 3 states: `if (isLoading) return <Skeleton>` / `if (isError) return <SectionError>` / data