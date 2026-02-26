import { apiRequest } from './http'
import { clearAccessToken, getAccessToken } from './auth'

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
  return authedRequest('/api/backoffice/notifications', { params: { page, size, since } })
}

export function getNotificationsCount(since) {
  return authedRequest('/api/backoffice/notifications/count', { params: { since } })
}

