import { apiRequest } from './http'
import { clearAccessToken, getAccessToken } from './auth'

const notificationsInflight = new Map()

async function authedRequest(path, options) {
  const token = getAccessToken()
  if (!token) {
    const err = new Error('Non authentifié')
    err.status = 401
    throw err
  }
  try {
    return await apiRequest(path, { ...(options || {}), token })
  } catch (err) {
    if (err?.status === 401) {
      clearAccessToken()
    }
    throw err
  }
}

export function getNotifications({ page = 0, size = 20, since } = {}) {
  const params = { page, size, since }
  const key = JSON.stringify({
    page,
    size,
    since: since ?? '',
  })

  const inflight = notificationsInflight.get(key)
  if (inflight) {
    return inflight
  }

  const request = authedRequest('/api/backoffice/notifications', { params }).finally(() => {
    notificationsInflight.delete(key)
  })

  notificationsInflight.set(key, request)
  return request
}

export function getNotificationsCount(since) {
  return authedRequest('/api/backoffice/notifications/count', { params: { since } })
}
