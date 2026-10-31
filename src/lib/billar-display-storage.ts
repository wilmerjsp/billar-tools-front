/**
 * Persiste únicamente los datos de presentación del billar (nombre).
 * No almacena credenciales ni información sensible — solo info de display.
 */

const KEY = 'billar_display'

interface BillarDisplay {
  nombre: string
}

export function saveBillarDisplay(info: BillarDisplay): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(info))
  } catch {
    // localStorage puede estar bloqueado (modo privado extremo, etc.)
  }
}

export function loadBillarDisplay(): BillarDisplay | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as BillarDisplay
  } catch {
    return null
  }
}

export function clearBillarDisplay(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // noop
  }
}
