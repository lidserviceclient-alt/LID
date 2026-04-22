import { authorizedApiRequest, decodeJwt, getAccessToken } from './auth'

export function getKpis(days = 30) {
  return authorizedApiRequest('/api/v1/backoffice/logistics/kpis', { params: { days } })
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
  return authorizedApiRequest('/api/v1/backoffice/logistics/delivery-bootstrap', {
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

  return authorizedApiRequest('/api/v1/backoffice/logistics/shipments/details/collection', {
    params: { ids: safeIds.join(',') },
  })
}

export function getShipments({ page = 0, size = 20, status = '', carrier = '', q = '' } = {}) {
  return authorizedApiRequest('/api/v1/backoffice/logistics/shipments', {
    params: { page, size, status, carrier, q },
  })
}

export function getShipmentDetail(id) {
  return authorizedApiRequest(`/api/v1/backoffice/logistics/shipments/${encodeURIComponent(id)}`)
}

export function updateShipmentStatus(id, status, { deliveryIssueComment, customerFacingComment } = {}) {
  return authorizedApiRequest(`/api/v1/backoffice/logistics/shipments/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    body: { status, deliveryIssueComment, customerFacingComment },
  })
}

export function scanShipment(qr, { courierReference, courierName, courierPhone } = {}) {
  const normalizedQr = normalizeShipmentQr(qr)
  const token = getAccessToken()
  const payload = decodeJwt(token)
  const inferredName = `${payload?.firstName || ''} ${payload?.lastName || ''}`.trim()
  const inferredRef = payload?.email || payload?.sub || ''
  return authorizedApiRequest('/api/v1/backoffice/logistics/shipments/scan', {
    method: 'POST',
    body: {
      qr: normalizedQr,
      courierReference: courierReference || inferredRef || null,
      courierName: courierName || inferredName || null,
      courierPhone: courierPhone || null,
    },
  })
}

export function normalizeShipmentQr(qr) {
  const raw = `${qr || ''}`.trim()
  if (!raw) return ''
  const shortCode = raw.replace(/[^a-z0-9]/gi, '').toUpperCase()
  return shortCode.length === 5 ? shortCode : raw
}

export function confirmDelivery(id, code) {
  return authorizedApiRequest(`/api/v1/backoffice/logistics/shipments/${encodeURIComponent(id)}/deliver`, {
    method: 'POST',
    body: { code },
  })
}
