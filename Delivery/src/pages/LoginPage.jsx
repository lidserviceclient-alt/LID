import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'

import { loginLocal } from '../services/auth'

const MotionDiv = motion.div

function getRedirectTo(state) {
  const from = state?.from
  if (!from) return '/home'
  if (typeof from !== 'string') return '/home'
  if (!from.startsWith('/')) return '/home'
  return from
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = useMemo(() => getRedirectTo(location.state), [location.state])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const canSubmit = email.trim() && password

  const onSubmit = async (event) => {
    event.preventDefault()
    if (isLoading) return
    setError('')
    setIsLoading(true)
    try {
      await loginLocal(email.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err?.message || 'Identifiants invalides.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-dvh bg-noise"
    >
      <div className="mx-auto min-h-dvh max-w-[430px] px-4 pb-safe pt-safe">
        <header className="pt-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-[var(--lid-accent)]" />
            Accès livreur
          </div>
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-slate-950">LID Delivery</h1>
          <p className="mt-2 text-sm text-slate-600">
            Connexion rapide pour consulter tes missions et activer le suivi carte.
          </p>
        </header>

        <section className="mt-6 lid-card rounded-[32px] p-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 focus-within:border-[var(--lid-accent)]">
                <Mail size={18} className="text-slate-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="ex: rider@lid.com"
                  className="h-7 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Mot de passe</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 focus-within:border-[var(--lid-accent)]">
                <Lock size={18} className="text-slate-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-7 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-[var(--lid-accent)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(106,162,0,0.22)] disabled:opacity-40"
            >
              {isLoading ? 'Connexion…' : 'Se connecter'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
            <Link to="/explore" className="font-semibold text-slate-700 hover:text-slate-900">
              Présentation
            </Link>
            <span className="text-slate-400">© LID</span>
          </div>
        </section>
      </div>
    </MotionDiv>
  )
}

