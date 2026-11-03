import { confirmDelivery, markArrived, updateShipmentStatus } from './logistics'

/**
 * File d'actions du livreur à rejouer quand le réseau revient (arrivée, échec, remise avec code).
 * Le serveur accepte les rejeux sans effet de bord : une action déjà appliquée renvoie un succès.
 */
const STORAGE_KEY = 'lid_delivery_pending_actions'
const REJECTED_KEY = 'lid_delivery_rejected_actions'
export const QUEUE_FLUSHED_EVENT = 'lid:queue-flushed'

const EXECUTORS = {
  arrived: (action) => markArrived(action.shipmentId),
  failure: (action) =>
    updateShipmentStatus(action.shipmentId, 'ECHEC', {
      deliveryIssueComment: action.payload?.deliveryIssueComment,
      customerFacingComment: action.payload?.customerFacingComment,
    }),
  deliver: (action) => confirmDelivery(action.shipmentId, action.payload?.code),
}

const listeners = new Set()
let flushing = null
let autoFlushStarted = false

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function write(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list))
  } catch {
    // stockage indisponible : la file reste en mémoire le temps de l'appel
  }
  listeners.forEach((listener) => {
    try {
      listener()
    } catch {
      // ignore
    }
  })
}

/** Erreur sans réponse du serveur (hors ligne, coupure, délai) : l'action peut être rejouée. */
export function isNetworkError(error) {
  if (!error) return false
  if (error.status) return error.status >= 502 && error.status <= 504
  return error instanceof TypeError || /network|fetch|load failed/i.test(`${error.message || ''}`)
}

export function getPendingActions() {
  return read(STORAGE_KEY)
}

export function getPendingFor(shipmentId) {
  const id = `${shipmentId}`
  return read(STORAGE_KEY).filter((action) => `${action.shipmentId}` === id)
}

export function getRejectedActions() {
  return read(REJECTED_KEY)
}

export function dismissRejected(key) {
  write(
    REJECTED_KEY,
    read(REJECTED_KEY).filter((action) => action.key !== key),
  )
}

export function subscribeQueue(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function enqueue(action) {
  const list = read(STORAGE_KEY).filter((item) => item.key !== action.key)
  list.push(action)
  write(STORAGE_KEY, list)
}

/**
 * Exécute l'action ; sans réseau elle est mise en file et rejouée automatiquement.
 * @returns {{ queued: boolean, result?: any }}
 */
export async function runOrQueue(type, shipmentId, payload = {}) {
  const action = {
    key: `${type}:${shipmentId}`,
    type,
    shipmentId: `${shipmentId}`,
    payload,
    createdAt: new Date().toISOString(),
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    enqueue(action)
    return { queued: true }
  }
  try {
    const result = await EXECUTORS[type](action)
    return { queued: false, result }
  } catch (error) {
    if (isNetworkError(error)) {
      enqueue(action)
      return { queued: true }
    }
    throw error
  }
}

/** Rejoue la file dans l'ordre ; s'arrête à la première coupure réseau. */
export function flushQueue() {
  if (flushing) return flushing
  flushing = (async () => {
    let done = 0
    for (const action of read(STORAGE_KEY)) {
      const executor = EXECUTORS[action.type]
      if (!executor) continue
      try {
        await executor(action)
        done += 1
        write(
          STORAGE_KEY,
          read(STORAGE_KEY).filter((item) => item.key !== action.key),
        )
      } catch (error) {
        if (isNetworkError(error)) break
        // Refus métier (code faux, colis réaffecté...) : retiré de la file et signalé au livreur
        write(
          STORAGE_KEY,
          read(STORAGE_KEY).filter((item) => item.key !== action.key),
        )
        write(REJECTED_KEY, [
          ...read(REJECTED_KEY).filter((item) => item.key !== action.key),
          { ...action, error: error?.message || 'Action refusée par le serveur.', rejectedAt: new Date().toISOString() },
        ])
        done += 1
      }
    }
    if (done > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(QUEUE_FLUSHED_EVENT))
    }
    return done
  })().finally(() => {
    flushing = null
  })
  return flushing
}

/** Rejeu au retour du réseau, au retour au premier plan et toutes les 30 s. */
export function startQueueAutoFlush() {
  if (autoFlushStarted || typeof window === 'undefined') return
  autoFlushStarted = true
  const tryFlush = () => {
    if (navigator.onLine === false || read(STORAGE_KEY).length === 0) return
    flushQueue().catch(() => {})
  }
  window.addEventListener('online', tryFlush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tryFlush()
  })
  window.setInterval(tryFlush, 30_000)
  tryFlush()
}
