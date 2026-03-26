const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const IS_DEV = Boolean(import.meta.env.DEV)

const WINDOW_ORIGIN =
  typeof window !== 'undefined' && window.location ? `${window.location.protocol}//${window.location.host}` : ''

const INFERRED_API_BASE_URL =
  typeof window !== 'undefined' &&
  window.location &&
  window.location.hostname &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? `${window.location.protocol}//${window.location.host}/lid`
    : 'http://localhost:9000'

const API_BASE_URL = ENV_API_BASE_URL || (IS_DEV && WINDOW_ORIGIN ? WINDOW_ORIGIN : INFERRED_API_BASE_URL)

function buildUrl(path, params) {
  const url = new URL(path, API_BASE_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      const s = `${value}`.trim()
      if (!s) return
      url.searchParams.set(key, s)
    })
  }
  return url.toString()
}

async function parseJsonSafe(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest(path, { method = 'GET', token, params, body, headers } = {}) {
  const url = buildUrl(path, params)
  const res = await fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  const data = await parseJsonSafe(res)
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.errorMessage || data.message)) ||
      res.statusText ||
      'Erreur API'
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}
