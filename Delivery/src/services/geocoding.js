const CACHE_KEY = 'lid_delivery_geocode_v1'
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed
  } catch {
    return {}
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache || {}))
  } catch {
    // ignore
  }
}

export async function geocodeAddress(address) {
  const q = `${address || ''}`.trim()
  if (!q) return null
  const key = q.toLowerCase()

  const cache = loadCache()
  const cached = cache[key]
  if (cached && cached.ts && Date.now() - cached.ts < MAX_AGE_MS) {
    return cached.value || null
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'fr',
    },
  })
  if (!res.ok) {
    return null
  }
  const json = await res.json()
  const first = Array.isArray(json) ? json[0] : null
  if (!first?.lat || !first?.lon) {
    cache[key] = { ts: Date.now(), value: null }
    saveCache(cache)
    return null
  }

  const value = {
    lat: Number(first.lat),
    lng: Number(first.lon),
    label: first.display_name ? `${first.display_name}` : q,
  }

  if (!Number.isFinite(value.lat) || !Number.isFinite(value.lng)) {
    cache[key] = { ts: Date.now(), value: null }
    saveCache(cache)
    return null
  }

  cache[key] = { ts: Date.now(), value }
  saveCache(cache)
  return value
}

