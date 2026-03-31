import { getAccessToken } from './auth'
import { apiRequest } from './http'

const DEFAULT_TOPICS = ['delivery.shipment.updated']

let socket = null
let reconnectTimer = null
let reconnectAttempt = 0
let connectPromise = null
const listeners = new Set()
const seenEventIds = new Map()
let subscribedTopics = new Set(DEFAULT_TOPICS)

function inferApiBaseUrl() {
  const env = import.meta.env.VITE_API_BASE_URL
  if (env) return env
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const pathname = `${window.location.pathname || ''}`
      const hasLidPrefix = pathname === '/lid' || pathname.startsWith('/lid/')
      return hasLidPrefix
        ? `${window.location.protocol}//${window.location.host}/lid`
        : `${window.location.protocol}//${window.location.host}`
    }
  }
  return 'http://localhost:9000'
}

function buildWsUrl(path, wsAccess) {
  const base = inferApiBaseUrl()
  const baseUrl = new URL(base)
  const baseRoot = `${baseUrl.origin}${baseUrl.pathname.endsWith('/') ? baseUrl.pathname : `${baseUrl.pathname}/`}`
  const cleanPath = `${path || '/api/v1/realtime/ws'}`.replace(/^\/+/, '')
  const url = new URL(cleanPath, baseRoot)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('ws-access', wsAccess)
  return url.toString()
}

function rememberEventId(eventId) {
  if (!eventId) return false
  const now = Date.now()
  const previous = seenEventIds.get(eventId)
  if (previous && now - previous < 60_000) {
    return true
  }
  seenEventIds.set(eventId, now)
  if (seenEventIds.size > 500) {
    for (const [id, ts] of seenEventIds.entries()) {
      if (now - ts > 120_000) seenEventIds.delete(id)
    }
  }
  return false
}

async function requestTicket() {
  const token = getAccessToken()
  if (!token) return null
  return apiRequest('/api/v1/realtime/ws-access', {
    method: 'POST',
    token,
    body: { topics: Array.from(subscribedTopics) },
  })
}

async function connect() {
  if (connectPromise) {
    return connectPromise
  }
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }
  connectPromise = (async () => {
    try {
      const ticketPayload = await requestTicket()
      const wsAccess = ticketPayload?.['ws-access'] || ticketPayload?.wsAccess || ticketPayload?.ticket
      if (!wsAccess) return

      socket = new WebSocket(buildWsUrl(ticketPayload?.wsPath, wsAccess))

      socket.onopen = () => {
        reconnectAttempt = 0
      }

      socket.onmessage = (event) => {
        let payload = null
        try {
          payload = JSON.parse(event?.data || '{}')
        } catch {
          return
        }
        if (rememberEventId(payload?.eventId)) {
          return
        }
        listeners.forEach((listener) => {
          try {
            listener(payload)
          } catch {
            // ignore
          }
        })
      }

      socket.onclose = scheduleReconnect
      socket.onerror = scheduleReconnect
    } catch {
      scheduleReconnect()
    } finally {
      connectPromise = null
    }
  })()

  return connectPromise
}

function scheduleReconnect() {
  if (typeof window === 'undefined' || reconnectTimer || listeners.size === 0) {
    return
  }
  reconnectAttempt += 1
  const delay = Math.min(15_000, 1_000 * 2 ** Math.min(reconnectAttempt, 4))
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null
    connect().catch(() => {})
  }, delay)
}

function shutdownIfUnused() {
  if (listeners.size > 0) {
    return
  }
  if (typeof window !== 'undefined' && reconnectTimer) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  reconnectAttempt = 0
  if (socket) {
    try {
      socket.close()
    } catch {
      // ignore
    }
    socket = null
  }
}

export function subscribeDeliveryRealtime(listener, topics = DEFAULT_TOPICS) {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
    return () => {}
  }

  if (Array.isArray(topics) && topics.length > 0) {
    topics.forEach((topic) => {
      if (topic) subscribedTopics.add(String(topic))
    })
  }

  listeners.add(listener)
  connect().catch(() => {})

  return () => {
    listeners.delete(listener)
    shutdownIfUnused()
  }
}
