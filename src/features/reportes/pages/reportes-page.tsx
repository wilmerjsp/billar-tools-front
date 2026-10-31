import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IngresosDiarios } from '../components/ingresos-diarios'
import { OcupacionMesas } from '../components/ocupacion-mesas'
import { RendimientoMeseras } from '../components/rendimiento-meseras'
import { VentasProductos } from '../components/ventas-productos'

function getDefaultFechaInicio() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

function getDefaultFechaFin() {
  return new Date().toISOString().split('T')[0]
}

export function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState(getDefaultFechaInicio)
  const [fechaFin, setFechaFin] = useState(getDefaultFechaFin)

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-6 flex flex-col gap-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Reportes</h1>
          <p className='text-sm text-muted-foreground'>
            Análisis y estadísticas del billar
          </p>
        </div>

        <div className='mb-6 flex flex-wrap items-end gap-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='fecha-inicio'>Fecha inicio</Label>
            <Input
              id='fecha-inicio'
              type='date'
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className='w-40'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='fecha-fin'>Fecha fin</Label>
            <Input
              id='fecha-fin'
              type='date'
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className='w-40'
            />
          </div>
        </div>

        <Tabs defaultValue='ingresos' className='space-y-4'>
          <div className='w-full overflow-x-auto pb-1'>
            <TabsList>
              <TabsTrigger value='ingresos'>Ingresos</TabsTrigger>
              <TabsTrigger value='mesas'>Mesas</TabsTrigger>
              <TabsTrigger value='productos'>Productos</TabsTrigger>
              <TabsTrigger value='meseras'>Meseras</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='ingresos' className='space-y-4'>
            <IngresosDiarios fechaInicio={fechaInicio} fechaFin={fechaFin} />
          </TabsContent>

          <TabsContent value='mesas' className='space-y-4'>
            <OcupacionMesas fechaInicio={fechaInicio} fechaFin={fechaFin} />
          </TabsContent>

          <TabsContent value='productos' className='space-y-4'>
            <VentasProductos fechaInicio={fechaInicio} fechaFin={fechaFin} />
          </TabsContent>

          <TabsContent value='meseras' className='space-y-4'>
            <RendimientoMeseras fechaInicio={fechaInicio} fechaFin={fechaFin} />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
