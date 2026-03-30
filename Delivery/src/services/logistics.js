import { apiRequest } from './http'
import { getAccessToken, clearAccessToken, decodeJwt } from './auth'

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

export function getKpis(days = 30) {
  return authedRequest('/api/v1/backoffice/logistics/kpis', { params: { days } })
}

export function getDeliveryBootstrap({
  days,
  page = 0,
  size = 20,
  limit,
  sortKey = '',
  status = '',
  carrier = '',
  q = '',
  deliveredPage = 0,
  deliveredSize = 20,
  deliveredStatus = '',
  deliveredCarrier = '',
  deliveredQ = '',
} = {}) {
  return authedRequest('/api/v1/backoffice/logistics/delivery-bootstrap', {
    params: {
      days,
      page,
      size,
      limit,
      sortKey,
      status,
      carrier,
      q,
      deliveredPage,
      deliveredSize,
      deliveredStatus,
      deliveredCarrier,
      deliveredQ,
    },
  })
}

export function getShipmentDetailsCollection(ids = []) {
  const safeIds = Array.isArray(ids)
    ? ids
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)
    : []

  return authedRequest('/api/v1/backoffice/logistics/shipments/details/collection', {
    params: { ids: safeIds.join(',') },
  })
}

export function getShipments({ page = 0, size = 20, status = '', carrier = '', q = '' } = {}) {
  return authedRequest('/api/v1/backoffice/logistics/shipments', {
    params: { page, size, status, carrier, q },
  })
}

export function getShipmentDetail(id) {
  return authedRequest(`/api/v1/backoffice/logistics/shipments/${encodeURIComponent(id)}`)
}

export function updateShipmentStatus(id, status) {
  return authedRequest(`/api/v1/backoffice/logistics/shipments/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    body: { status },
  })
}

export function scanShipment(qr, { courierReference, courierName, courierPhone } = {}) {
  const token = getAccessToken()
  const payload = decodeJwt(token)
  const inferredName = `${payload?.firstName || ''} ${payload?.lastName || ''}`.trim()
  const inferredRef = payload?.email || payload?.sub || ''
  return authedRequest('/api/v1/backoffice/logistics/shipments/scan', {
    method: 'POST',
    body: {
      qr,
      courierReference: courierReference || inferredRef || null,
      courierName: courierName || inferredName || null,
      courierPhone: courierPhone || null,
    },
  })
}

export function confirmDelivery(id, code) {
  return authedRequest(`/api/v1/backoffice/logistics/shipments/${encodeURIComponent(id)}/deliver`, {
    method: 'POST',
    body: { code },
  })
}
