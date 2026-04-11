import { authorizedApiRequest } from './auth'

const notificationsInflight = new Map()

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

  const request = authorizedApiRequest('/api/v1/backoffice/notifications', { params }).finally(() => {
    notificationsInflight.delete(key)
  })

  notificationsInflight.set(key, request)
  return request
}

export function getNotificationsCount(since) {
  return authorizedApiRequest('/api/v1/backoffice/notifications/count', { params: { since } })
}
