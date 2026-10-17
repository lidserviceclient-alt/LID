import { apiRequest } from './http'

// Le jeton d'acces ne vit qu'en memoire (une XSS ne peut plus le lire) ; la session est restauree par
// /auth/refresh grace au cookie HttpOnly (voir RequireAuth).
const LEGACY_TOKEN_KEY = 'lid_delivery_access_token'
let accessTokenInMemory = null
let refreshPromise = null;

try { localStorage.removeItem(LEGACY_TOKEN_KEY) } catch { /* sans incidence */ }

export function getAccessToken() {
  return accessTokenInMemory
}

export function setAccessToken(token) {
  accessTokenInMemory = token || null
  if (!token) {
    // Donnees client gardees le temps d'une mission : jamais au-dela de la session
    try { sessionStorage.removeItem('lid_last_scanned_shipment') } catch { /* sans incidence */ }
  }
}

// Le refresh token est a usage unique : un seul rafraichissement a la fois entre les onglets
function runExclusiveRefresh(task) {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request('lid-delivery-auth-refresh', task)
  }
  return task()
}

export function clearAccessToken() {
  setAccessToken(null)
}

export function isTokenExpired(token) {
  const payload = decodeJwt(token)
  const exp = Number(payload?.exp)
  if (!Number.isFinite(exp) || exp <= 0) return false
  return Date.now() >= exp * 1000
}

function normalizeRoles(payload) {
  const roles = Array.isArray(payload?.roles) ? payload.roles : payload?.role ? [payload.role] : []
  return roles.map((r) => `${r}`.trim().replace(/^ROLE_/, '')).filter(Boolean)
}

function assertDeliveryRole(token) {
  const decoded = decodeJwt(token)
  const normalized = normalizeRoles(decoded)
  if (!normalized.includes('LIVREUR')) {
    clearAccessToken()
    throw new Error('Accès refusé: compte non livreur')
  }
  return decoded
}

export async function loginDelivery(phoneNumber, password) {
  const payload = { phoneNumber, password }
  const data = await apiRequest('/api/v1/auth/login/local/delivery', { method: 'POST', body: payload })
  const token = data?.accessToken
  if (!token) {
    throw new Error('Token manquant dans la réponse')
  }
  assertDeliveryRole(token)
  setAccessToken(token)
  return token
}

export async function loginLocal(phoneNumber, password) {
  return loginDelivery(phoneNumber, password)
}

export async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise
  }
  refreshPromise = runExclusiveRefresh(() => apiRequest('/api/v1/auth/refresh', { method: 'POST' }))
    .then((data) => {
      const token = data?.accessToken
      if (!token) {
        throw new Error('Token manquant dans la réponse')
      }
      assertDeliveryRole(token)
      setAccessToken(token)
      return token
    })
    .catch((error) => {
      clearAccessToken()
      throw error
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

export async function logout() {
  try {
    await apiRequest('/api/v1/auth/logout', { method: 'POST' })
  } catch {
    // ignore
  } finally {
    clearAccessToken()
  }
}

export function getAuthenticatedUser() {
  const token = getAccessToken()
  if (!token || isTokenExpired(token)) {
    clearAccessToken()
    return null
  }
  const payload = decodeJwt(token)
  if (!payload) return null
  return {
    userId: payload?.sub ? String(payload.sub) : '',
    email: payload?.email ? String(payload.email) : '',
    firstName: payload?.firstName ? String(payload.firstName) : '',
    lastName: payload?.lastName ? String(payload.lastName) : '',
    phoneNumber: payload?.phoneNumber ? String(payload.phoneNumber) : '',
    roles: normalizeRoles(payload),
  }
}

export async function authorizedApiRequest(path, options = {}) {
  let token = getAccessToken()
  if (!token || isTokenExpired(token)) {
    token = await refreshSession()
  }
  try {
    return await apiRequest(path, { ...(options || {}), token })
  } catch (err) {
    if (err?.status !== 401) {
      throw err
    }
    token = await refreshSession()
    return apiRequest(path, { ...(options || {}), token })
  }
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
