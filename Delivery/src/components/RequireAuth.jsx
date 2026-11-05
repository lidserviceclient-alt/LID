import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { SESSION_ENDED_EVENT, clearAccessToken, decodeJwt, getAccessToken, isTokenExpired, refreshSession } from '../services/auth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const [status, setStatus] = useState('checking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    async function ensureSession() {
      let token = getAccessToken()
      if (!token || isTokenExpired(token)) {
        try {
          token = await refreshSession()
        } catch (err) {
          // Seul un refus explicite (401/403) ferme l'acces ; reseau, 429 ou 5xx : session conservee, on reessaiera
          if (err?.status !== 401 && err?.status !== 403) {
            if (active) setStatus('busy')
            return
          }
          clearAccessToken()
          if (active) setStatus('unauthorized')
          return
        }
      }

      const payload = decodeJwt(token)
      const roles = Array.isArray(payload?.roles) ? payload.roles : payload?.role ? [payload.role] : []
      const normalized = roles.map((r) => `${r}`.trim().replace(/^ROLE_/, '')).filter(Boolean)
      if (!normalized.includes('LIVREUR')) {
        clearAccessToken()
        if (active) setStatus('unauthorized')
        return
      }
      if (active) setStatus('authorized')
    }

    ensureSession()
    // Session invalidee en cours d'utilisation (compte desactive, jeton revoque) : retour a la connexion
    const onSessionEnded = () => {
      if (active) setStatus('unauthorized')
    }
    window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded)
    return () => {
      active = false
      window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded)
    }
  }, [attempt])

  if (status === 'checking') {
    return null
  }

  if (status === 'busy') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-neutral-300 text-sm">Trop de requêtes. Patientez un instant puis réessayez.</p>
        <button
          type="button"
          onClick={() => {
            setStatus('checking')
            setAttempt((n) => n + 1)
          }}
          className="bg-[#6aa200] text-white font-bold py-3 px-6 rounded-xl"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (status !== 'authorized') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
