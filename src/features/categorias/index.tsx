import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategorias as useCategoriasQuery } from './hooks/use-categorias'
import { CategoriasDialogs } from './components/categorias-dialogs'
import { CategoriasPrimaryButtons } from './components/categorias-primary-buttons'
import { CategoriasProvider } from './components/categorias-provider'
import { CategoriasTable } from './components/categorias-table'

const route = getRouteApi('/_authenticated/categorias/')

export function Categorias() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data = [], isLoading, isError } = useCategoriasQuery()

  return (
    <CategoriasProvider>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Categorías</h2>
            <p className='text-muted-foreground'>
              Gestiona las categorías de productos del billar.
            </p>
          </div>
          <CategoriasPrimaryButtons />
        </div>

        {isLoading && (
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        )}

        {isError && (
          <p className='text-destructive'>
            Error al cargar las categorías. Intenta de nuevo.
          </p>
        )}

        {!isLoading && !isError && (
          <CategoriasTable data={data} search={search} navigate={navigate} />
        )}
      </Main>

      <CategoriasDialogs />
    </CategoriasProvider>
  )
}
