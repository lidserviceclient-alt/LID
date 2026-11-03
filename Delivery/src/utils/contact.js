import { parsePhoneNumberFromString } from 'libphonenumber-js/min'

/** Numéro au format international (+225...) ; les numéros locaux sont lus comme ivoiriens. */
export function toInternationalPhone(raw, defaultCountry = 'CI') {
  const value = `${raw || ''}`.trim()
  if (!value) return ''
  try {
    const parsed = parsePhoneNumberFromString(value, defaultCountry)
    if (parsed?.isPossible()) return parsed.number
  } catch {
    // numéro illisible : on garde la saisie brute
  }
  return value.replace(/[^\d+]/g, '')
}

export function telLink(raw) {
  const phone = toInternationalPhone(raw)
  return phone ? `tel:${phone}` : ''
}

export function smsLink(raw) {
  const phone = toInternationalPhone(raw)
  return phone ? `sms:${phone}` : ''
}

export function whatsappLink(raw, message = '') {
  const digits = toInternationalPhone(raw).replace(/\D/g, '')
  if (!digits) return ''
  const text = `${message || ''}`.trim()
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

/** Itinéraire Google Maps (ouvre l'application si elle est installée). */
export function directionsLink({ latitude, longitude, address } = {}) {
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (latitude != null && longitude != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
  }
  const addr = `${address || ''}`.trim()
  return addr ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}&travelmode=driving` : ''
}

/** Retour haptique discret (sans effet si l'appareil ne le gère pas). */
export function vibrate(pattern = 30) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern)
  } catch {
    // sans incidence
  }
}
