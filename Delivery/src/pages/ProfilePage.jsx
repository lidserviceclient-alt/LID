import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, LifeBuoy, LogOut, Shield } from 'lucide-react'
import { clearAccessToken, decodeJwt, getAccessToken } from '../services/auth'

const MotionDiv = motion.div

function formatExp(exp) {
  const n = Number(exp)
  if (!Number.isFinite(n) || n <= 0) return '-'
  const d = new Date(n * 1000)
  return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const token = getAccessToken()
  const payload = decodeJwt(token)

  const email = payload?.email || '-'
  const roles = Array.isArray(payload?.roles) ? payload.roles : payload?.role ? [payload.role] : []

  const logout = () => {
    clearAccessToken()
    navigate('/login')
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-4"
    >
      <section className="lid-card rounded-[28px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Compte</p>
            <h2 className="font-display mt-1 text-xl font-semibold text-slate-900">Profil livreur</h2>
            <p className="mt-1 text-xs text-slate-500">Infos de session (JWT local).</p>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--lid-accent-soft)] text-[var(--lid-accent)]">
            <Shield size={18} />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Email</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{email}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Expiration</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatExp(payload?.exp)}</p>
          </div>
        </div>

        <div className="mt-2 rounded-2xl border border-slate-200 bg-white/70 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Rôles</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{roles.length ? roles.join(', ') : '-'}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to="/notifications"
            className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800"
          >
            <Bell size={18} />
            Notifications
          </Link>
          <Link
            to="/support"
            className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800"
          >
            <LifeBuoy size={18} />
            Support
          </Link>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>
      </section>
    </MotionDiv>
  )
}
