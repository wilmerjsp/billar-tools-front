import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { usePreferencesStore } from '@/stores/preferences-store'

export function PreferenciasForm() {
  const solicitarMontoRecibido = usePreferencesStore(
    (s) => s.solicitarMontoRecibido,
  )
  const setSolicitarMontoRecibido = usePreferencesStore(
    (s) => s.setSolicitarMontoRecibido,
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-row items-center justify-between gap-4 rounded-lg border p-4'>
        <div className='space-y-0.5'>
          <Label htmlFor='solicitar-monto-recibido' className='text-base'>
            Solicitar monto recibido al entregar
          </Label>
          <p className='text-sm text-muted-foreground'>
            Muestra la casilla para ingresar el dinero recibido y calcular el
            vuelto al entregar un pedido en efectivo.
          </p>
        </div>
        <Switch
          id='solicitar-monto-recibido'
          checked={solicitarMontoRecibido}
          onCheckedChange={setSolicitarMontoRecibido}
        />
      </div>
    </div>
  )
}
