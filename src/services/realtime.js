import { backofficeApi } from './api.js'

const DEFAULT_TOPICS = [
  'backoffice.notifications.count.updated',
  'backoffice.overview.updated',
]

let socket = null
let reconnectTimer = null
let reconnectAttempt = 0
let connectPromise = null
const listeners = new Set()
const seenEventIds = new Map()
let subscribedTopics = new Set(DEFAULT_TOPICS)

function buildWsUrl(path, wsAccess) {
  const apiBase = import.meta.env.VITE_BACKOFFICE_API_URL || 'http://localhost:9000'
  const url = new URL(path || '/api/v1/realtime/ws', apiBase)
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
      if (now - ts > 120_000) {
        seenEventIds.delete(id)
      }
    }
  }
  return false
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
      const ticketPayload = await backofficeApi.realtimeWsAccess(Array.from(subscribedTopics))
      const wsAccess = ticketPayload?.['ws-access'] || ticketPayload?.wsAccess || ticketPayload?.ticket
      if (!wsAccess) return

      const wsUrl = buildWsUrl(ticketPayload?.wsPath, wsAccess)
      socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        reconnectAttempt = 0
      }

      socket.onmessage = (event) => {
        let message = null
        try {
          message = JSON.parse(event?.data || '{}')
        } catch {
          return
        }
        if (rememberEventId(message?.eventId)) {
          return
        }
        listeners.forEach((listener) => {
          try {
            listener(message)
          } catch {
            // ignore listener errors
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
  if (reconnectTimer || listeners.size === 0 || typeof window === 'undefined') {
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

export function subscribeBackofficeRealtime(listener, topics = DEFAULT_TOPICS) {
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
