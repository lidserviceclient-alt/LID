import { useEffect, useState } from 'react'

import { getPendingActions, getRejectedActions, startQueueAutoFlush, subscribeQueue } from '../services/offlineQueue'
import { isRealtimeConnected, subscribeRealtimeState } from '../services/realtime'

/** Réseau du téléphone, connexion temps réel et actions en attente d'envoi. */
export function useConnectivity() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false))
  const [realtime, setRealtime] = useState(() => isRealtimeConnected())
  const [pending, setPending] = useState(() => getPendingActions())
  const [rejected, setRejected] = useState(() => getRejectedActions())

  useEffect(() => {
    startQueueAutoFlush()
    const update = () => setOnline(navigator.onLine !== false)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    const unsubscribeRealtime = subscribeRealtimeState(setRealtime)
    const unsubscribeQueue = subscribeQueue(() => {
      setPending(getPendingActions())
      setRejected(getRejectedActions())
    })
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      unsubscribeRealtime()
      unsubscribeQueue()
    }
  }, [])

  return { online, realtime, pending, rejected }
}
