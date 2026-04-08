import { apiRequest } from './http'

const TOKEN_KEY = 'lid_delivery_access_token'

export function getAccessToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token) {
  try {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY)
      return
    }
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore
  }
}

export function clearAccessToken() {
  setAccessToken(null)
}

export async function loginLocal(email, password) {
  const payload = { email, password }
  const data = await apiRequest('/api/v1/auth/login/local/delivery', { method: 'POST', body: payload })
  const token = data?.accessToken
  if (!token) {
    throw new Error('Token manquant dans la réponse')
  }
  const decoded = decodeJwt(token)
  const roles = Array.isArray(decoded?.roles) ? decoded.roles : decoded?.role ? [decoded.role] : []
  const normalized = roles.map((r) => `${r}`.trim().replace(/^ROLE_/, '')).filter(Boolean)
  if (!normalized.includes('LIVREUR')) {
    clearAccessToken()
    throw new Error('Accès refusé: compte non livreur')
  }
  setAccessToken(token)
  return token
}

export function decodeJwt(token) {
  if (!token) return null
  const parts = `${token}`.split('.')
  if (parts.length < 2) return null
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}
