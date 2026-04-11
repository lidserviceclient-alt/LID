import { Navigate, useLocation } from 'react-router-dom'
import { clearAccessToken, decodeJwt, getAccessToken, isTokenExpired } from '../services/auth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const token = getAccessToken()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (isTokenExpired(token)) {
    clearAccessToken()
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const payload = decodeJwt(token)
  const roles = Array.isArray(payload?.roles) ? payload.roles : payload?.role ? [payload.role] : []
  const normalized = roles.map((r) => `${r}`.trim().replace(/^ROLE_/, '')).filter(Boolean)
  if (!normalized.includes('LIVREUR')) {
    clearAccessToken()
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
