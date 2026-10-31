/**
 * Persiste únicamente los datos de presentación del usuario (nombre, email).
 * No almacena credenciales ni tokens — solo info de display no sensible.
 */

const KEY = 'user_display'

interface UserDisplay {
  nombre: string
  email: string
  usuario?: string
}

export function saveUserDisplay(info: UserDisplay): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(info))
  } catch {
    // localStorage puede estar bloqueado (modo privado extremo, etc.)
  }
}

export function loadUserDisplay(): UserDisplay | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserDisplay
  } catch {
    return null
  }
}

export function clearUserDisplay(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // noop
  }
}
