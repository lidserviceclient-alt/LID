import { useEffect, useRef, useState } from 'react'

export function useGeolocation(options) {
  const watchIdRef = useRef(null)
  const firstFixTimerRef = useRef(null)
  const [position, setPosition] = useState(null)
  const [error, setError] = useState('')
  const [permission, setPermission] = useState('prompt')

  useEffect(() => {
    let canceled = false

    const clearFirstFixTimer = () => {
      if (firstFixTimerRef.current) {
        clearTimeout(firstFixTimerRef.current)
        firstFixTimerRef.current = null
      }
    }

    const applyPosition = (p) => {
      if (canceled) return
      clearFirstFixTimer()
      setError('')
      setPosition({
        lat: p.coords.latitude,
        lng: p.coords.longitude,
        accuracy: p.coords.accuracy,
        heading: p.coords.heading,
        speed: p.coords.speed,
        ts: p.timestamp,
      })
    }

    const applyError = (err) => {
      if (canceled) return
      clearFirstFixTimer()
      const msg =
        err?.code === 1
          ? "Autorisation GPS refusée. Active la localisation pour afficher la carte."
          : err?.code === 2
            ? 'Position GPS indisponible. Vérifie que la localisation de l’appareil est activée.'
            : err?.code === 3
              ? 'Temps d’attente GPS dépassé. Active le GPS puis réessaie.'
              : err?.message || 'Erreur de géolocalisation.'
      setError(msg)
    }

    const run = async () => {
      if (!navigator?.geolocation) {
        if (!canceled) setError("Géolocalisation non supportée sur cet appareil.")
        return
      }

      if (!window.isSecureContext) {
        if (!canceled) {
          setError("La géolocalisation nécessite une page sécurisée (HTTPS ou localhost fiable).")
        }
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

      firstFixTimerRef.current = setTimeout(() => {
        if (canceled) return
        setError('Position GPS en attente. Vérifie que le GPS est activé et que le navigateur a bien l’autorisation.')
      }, 15000)

      navigator.geolocation.getCurrentPosition(applyPosition, applyError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000,
        ...(options || {}),
      })

      watchIdRef.current = navigator.geolocation.watchPosition(
        applyPosition,
        applyError,
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
      clearFirstFixTimer()
      if (watchIdRef.current !== null && navigator?.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [options])

  return { position, error, permission }
}
