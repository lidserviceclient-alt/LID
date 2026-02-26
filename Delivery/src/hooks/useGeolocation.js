import { useEffect, useRef, useState } from 'react'

export function useGeolocation(options) {
  const watchIdRef = useRef(null)
  const [position, setPosition] = useState(null)
  const [error, setError] = useState('')
  const [permission, setPermission] = useState('prompt')

  useEffect(() => {
    let canceled = false

    const run = async () => {
      if (!navigator?.geolocation) {
        if (!canceled) setError("Géolocalisation non supportée sur cet appareil.")
        return
      }

      try {
        if (navigator.permissions?.query) {
          const result = await navigator.permissions.query({ name: 'geolocation' })
          if (!canceled) setPermission(result.state || 'prompt')
          result.onchange = () => {
            if (!canceled) setPermission(result.state || 'prompt')
          }
        }
      } catch {
        // ignore
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (p) => {
          if (canceled) return
          setError('')
          setPosition({
            lat: p.coords.latitude,
            lng: p.coords.longitude,
            accuracy: p.coords.accuracy,
            heading: p.coords.heading,
            speed: p.coords.speed,
            ts: p.timestamp,
          })
        },
        (err) => {
          if (canceled) return
          const msg =
            err?.code === 1
              ? "Autorisation GPS refusée. Active la localisation pour afficher la carte."
              : err?.message || 'Erreur de géolocalisation.'
          setError(msg)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1500,
          timeout: 12000,
          ...(options || {}),
        },
      )
    }

    run()

    return () => {
      canceled = true
      if (watchIdRef.current !== null && navigator?.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [options])

  return { position, error, permission }
}

