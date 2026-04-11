import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { clearAccessToken, decodeJwt, getAccessToken, isTokenExpired, refreshSession } from '../services/auth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true

    async function ensureSession() {
      let token = getAccessToken()
      if (!token || isTokenExpired(token)) {
        try {
          token = await refreshSession()
        } catch {
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
    return () => {
      active = false
    }
  }, [])

  if (status === 'checking') {
    return null
  }

  if (status !== 'authorized') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
