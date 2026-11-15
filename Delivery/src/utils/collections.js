/**
 * Missions de collecte (option B) : regroupement par boutique, distances, libellés.
 * Une collecte = un colis à retirer chez le partenaire puis à déposer à l'entrepôt LID.
 */

export const COLLECTION_STATUS_UI = {
  A_COLLECTER: { label: 'Disponible', className: 'bg-neutral-200 text-neutral-800' },
  AFFECTEE: { label: 'À retirer', className: 'bg-amber-100 text-amber-900' },
  COLLECTEE: { label: 'Retiré · vers l’entrepôt', className: 'bg-blue-100 text-blue-800' },
  RECUE_ENTREPOT: { label: 'Reçu à l’entrepôt', className: 'bg-green-100 text-green-800' },
  ANOMALIE: { label: 'Anomalie entrepôt', className: 'bg-red-100 text-red-800' },
}

export function collectionStatusUi(item) {
  const status = item?.collection?.status
  if (status === 'COLLECTEE' && item?.collection?.depositedAt) {
    return { label: 'Déposé · réception en attente', className: 'bg-[#6aa200]/15 text-[#3f6600]' }
  }
  return COLLECTION_STATUS_UI[status] || { label: status || '-', className: 'bg-neutral-100 text-neutral-700' }
}

/** Type de mission d'un colis de livraison : direct (option A, LID) ou depuis l'entrepôt (option B). */
export function deliveryLegUi(shipment) {
  const viaWarehouse = shipment?.shipperType === 'PARTNER' && shipment?.logisticsMode === 'VIA_WAREHOUSE'
  if (viaWarehouse) return { label: 'Livraison au client · depuis l’entrepôt', className: 'bg-neutral-900 text-white' }
  if (shipment?.shipperType === 'PARTNER') return { label: 'Livraison directe · retrait boutique', className: 'bg-neutral-100 text-neutral-800' }
  return { label: 'Livraison au client', className: 'bg-neutral-100 text-neutral-800' }
}

export const COLLECTION_BADGE = { label: 'Collecte boutique → entrepôt', className: 'bg-amber-100 text-amber-900' }

/** Distance à vol d'oiseau en km (null si une position manque). */
export function distanceKm(from, to) {
  const rawLat = to?.latitude ?? to?.lat
  const rawLng = to?.longitude ?? to?.lng
  if (from?.lat == null || from?.lng == null || rawLat == null || rawLng == null) return null
  const lat1 = Number(from.lat)
  const lng1 = Number(from.lng)
  const lat2 = Number(rawLat)
  const lng2 = Number(rawLng)
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null
  const rad = (v) => (v * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatKm(km) {
  if (km == null) return ''
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`
}

/** Une boutique = un passage : mes collectes et les collectes disponibles, regroupées par partenaire. */
export function groupByPartner(mine = [], available = []) {
  const groups = new Map()
  const add = (item, own) => {
    const id = item?.partner?.partnerId || item?.shipment?.shipperId || 'inconnu'
    if (!groups.has(id)) {
      groups.set(id, { partnerId: id, partner: item?.partner || null, label: item?.partner?.name || item?.shipment?.shipperLabel || 'Boutique', items: [] })
    }
    groups.get(id).items.push({ ...item, own })
  }
  mine.forEach((item) => add(item, true))
  available.forEach((item) => add(item, false))
  return [...groups.values()].map((group) => {
    const counts = { toPickup: 0, available: 0, collected: 0, deposited: 0, late: 0 }
    let oldest = ''
    group.items.forEach((item) => {
      const status = item?.collection?.status
      if (!item.own) counts.available += 1
      else if (status === 'AFFECTEE') counts.toPickup += 1
      else if (status === 'COLLECTEE' && item?.collection?.depositedAt) counts.deposited += 1
      else if (status === 'COLLECTEE') counts.collected += 1
      if (item.late) counts.late += 1
      const created = `${item?.shipment?.createdAt || ''}`
      if (created && (!oldest || created < oldest)) oldest = created
    })
    return { ...group, counts, oldest }
  })
}
