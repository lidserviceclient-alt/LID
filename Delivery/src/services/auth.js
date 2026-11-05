import { apiRequest } from './http'

// Le jeton d'acces ne vit qu'en memoire (une XSS ne peut plus le lire) ; la session est restauree par
// /auth/refresh grace au cookie HttpOnly (voir RequireAuth).
const LEGACY_TOKEN_KEY = 'lid_delivery_access_token'
let accessTokenInMemory = null
let refreshPromise = null;

export const SESSION_ENDED_EVENT = 'lid:session-ended'
const SESSION_ENDED_KEY = 'lid_session_ended'
export const SESSION_ENDED_MESSAGE =
  'Votre compte a été désactivé ou votre session a expiré. Reconnectez-vous ou contactez l\'administration.'

// Memorise (le temps de la navigation vers /login) que la session a ete invalidee par le serveur
function markSessionEnded() {
  try { sessionStorage.setItem(SESSION_ENDED_KEY, '1') } catch { /* sans incidence */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_ENDED_EVENT))
}

export function peekSessionEndedNotice() {
  try {
    return sessionStorage.getItem(SESSION_ENDED_KEY) ? SESSION_ENDED_MESSAGE : ''
  } catch {
    return ''
  }
}

export function clearSessionEndedNotice() {
  try { sessionStorage.removeItem(SESSION_ENDED_KEY) } catch { /* sans incidence */ }
}


const RATE_LIMIT_MAX_ATTEMPTS = 3
const RATE_LIMIT_MAX_WAIT_MS = 5000
const RATE_LIMIT_DEFAULT_WAIT_MS = 1000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 429 : on respecte Retry-After (borne) puis on reessaie, sans jamais vider la session
async function withRateLimitRetry(task) {
  const deadline = Date.now() + RATE_LIMIT_MAX_WAIT_MS
  for (let attempt = 1; ; attempt++) {
    try {
      return await task()
    } catch (err) {
      if (err?.status !== 429 || attempt >= RATE_LIMIT_MAX_ATTEMPTS) throw err
      const wait = Math.min(err.retryAfterMs ?? RATE_LIMIT_DEFAULT_WAIT_MS, deadline - Date.now())
      if (wait < 0 || (err.retryAfterMs ?? 0) > RATE_LIMIT_MAX_WAIT_MS) throw err
      await sleep(wait)
    }
  }
}

try { localStorage.removeItem(LEGACY_TOKEN_KEY) } catch { /* sans incidence */ }

export function getAccessToken() {
  return accessTokenInMemory
}

// Indice local (sans secret) qu'une session a existe sur cet appareil : sans lui, inutile d'appeler /auth/refresh
// (pas de cookie => 400 inutile a la premiere ouverture).
const SESSION_HINT_KEY = 'lid_delivery_session_hint'

export function hasSessionHint() {
  try { return localStorage.getItem(SESSION_HINT_KEY) === '1' } catch { return true }
}

function setSessionHint(on) {
  try {
    if (on) localStorage.setItem(SESSION_HINT_KEY, '1')
    else localStorage.removeItem(SESSION_HINT_KEY)
  } catch { /* sans incidence */ }
}

export function setAccessToken(token) {
  accessTokenInMemory = token || null
  if (token) setSessionHint(true)
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
    setSessionHint(false)
    throw new Error('Accès refusé: compte non livreur')
  }
  return decoded
}

export async function loginDelivery(phoneNumber, password) {
  const payload = { phoneNumber, password }
  let data
  try {
    data = await withRateLimitRetry(() =>
      apiRequest('/api/v1/auth/login/local/delivery', { method: 'POST', body: payload }),
    )
  } catch (err) {
    if (err?.status === 401) err.message = 'Numéro ou code de connexion incorrect.'
    else if (err?.status === 429) err.message = 'Trop de tentatives. Patientez quelques instants avant de réessayer.'
    else if (err?.status === 403 && (!err.message || err.message === 'Forbidden')) {
      err.message = 'Compte désactivé. Contactez l\'administration.'
    }
    throw err
  }
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
  if (!hasSessionHint()) {
    const err = new Error('Aucune session à restaurer')
    err.status = 401
    err.noSession = true
    throw err
  }
  refreshPromise = runExclusiveRefresh(() =>
    withRateLimitRetry(() => apiRequest('/api/v1/auth/refresh', { method: 'POST' })),
  )
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
      // Seul un refus explicite du serveur (401/403) invalide la session. Reseau coupe, timeout, 429 ou 5xx :
      // le livreur reste connecte, la restauration sera retentee (sinon il serait deconnecte a chaque coupure 4G).
      if (error?.status !== 401 && error?.status !== 403) throw error
      clearAccessToken()
      setSessionHint(false)
      markSessionEnded()
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
    setSessionHint(false)
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
