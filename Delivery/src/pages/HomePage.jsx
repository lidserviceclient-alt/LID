import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, RefreshCw } from 'lucide-react'

import { getKpis, getShipments } from '../services/logistics'

const MotionDiv = motion.div

const STATUS_KEY = 'lid_delivery_status'

function getSavedStatus() {
  try {
    const s = localStorage.getItem(STATUS_KEY)
    return s || 'AVAILABLE'
  } catch {
    return 'AVAILABLE'
  }
}

function saveStatus(value) {
  try {
    localStorage.setItem(STATUS_KEY, value)
  } catch {
    // ignore
  }
}

function formatNumber(value) {
  if (value === null || value === undefined) return '-'
  const n = Number(value)
  if (!Number.isFinite(n)) return `${value}`
  return new Intl.NumberFormat('fr-FR').format(n)
}

function toCourierStatusUi(value) {
  const s = `${value || ''}`.trim().toUpperCase()
  if (s === 'AVAILABLE') return { label: 'Disponible', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  if (s === 'DELIVERING') return { label: 'En livraison', className: 'bg-sky-50 text-sky-700 border-sky-200' }
  if (s === 'OFFLINE') return { label: 'Hors ligne', className: 'bg-slate-100 text-slate-700 border-slate-200' }
  return { label: 'Disponible', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
}

function toShipmentStatusUi(status) {
  const s = `${status || ''}`.trim().toUpperCase()
  if (s === 'EN_PREPARATION') return { label: 'À récupérer', className: 'bg-slate-100 text-slate-700' }
  if (s === 'EN_COURS') return { label: 'En cours', className: 'bg-sky-100 text-sky-700' }
  if (s === 'LIVREE') return { label: 'Livrée', className: 'bg-emerald-100 text-emerald-700' }
  if (s === 'ECHEC') return { label: 'Échec', className: 'bg-rose-100 text-rose-700' }
  return { label: s || '-', className: 'bg-slate-100 text-slate-700' }
}

export default function HomePage() {
  const navigate = useNavigate()
  const [courierStatus, setCourierStatus] = useState(getSavedStatus())
  const [kpis, setKpis] = useState(null)
  const [active, setActive] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const courierStatusUi = useMemo(() => toCourierStatusUi(courierStatus), [courierStatus])

  const load = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [k, page] = await Promise.all([
        getKpis(30),
        getShipments({ page: 0, size: 4, status: 'EN_COURS' }),
      ])
      setKpis(k || null)
      setActive(Array.isArray(page?.content) ? page.content : [])
    } catch (err) {
      setKpis(null)
      setActive([])
      setError(err?.message || 'Impossible de charger le tableau de bord.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = (next) => {
    setCourierStatus(next)
    saveStatus(next)
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-4"
    >
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="lid-card rounded-[28px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Aujourd’hui</p>
            <p className="font-display mt-1 text-xl font-semibold text-slate-900">Tableau de bord</p>
            <p className="mt-1 text-xs text-slate-500">Pensé mobile : rapide, lisible, actionnable.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-bold ${courierStatusUi.className}`}>
              {courierStatusUi.label}
            </span>
            <button
              type="button"
              onClick={load}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              <RefreshCw size={16} />
              {isLoading ? '...' : 'Maj'}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { key: 'AVAILABLE', label: 'Disponible' },
            { key: 'DELIVERING', label: 'En livraison' },
            { key: 'OFFLINE', label: 'Hors ligne' },
          ].map((o) => {
            const active = courierStatus === o.key
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => updateStatus(o.key)}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition ${
                  active
                    ? 'border-[var(--lid-accent)] bg-[var(--lid-accent-soft)] text-[var(--lid-accent)]'
                    : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">En cours</p>
            <p className="font-display mt-1 text-2xl font-semibold text-slate-900">
              {formatNumber(kpis?.inTransitCount)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Délai</p>
            <p className="font-display mt-1 text-2xl font-semibold text-slate-900">
              {formatNumber(kpis?.avgDelayDays)}j
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Coût</p>
            <p className="font-display mt-1 text-2xl font-semibold text-slate-900">{kpis?.avgCost ?? '-'}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/deliveries?status=EN_PREPARATION')}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-3xl bg-[var(--lid-accent)] px-4 py-3 text-sm font-semibold text-white"
          >
            Commencer la tournée
            <ArrowRight size={18} />
          </button>
          <Link
            to="/map"
            className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800"
          >
            Carte
          </Link>
        </div>
      </section>

      <section className="lid-card rounded-[28px] p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">Missions actives</p>
            <p className="mt-1 text-xs text-slate-500">Dernières livraisons EN_COURS.</p>
          </div>
          <Link to="/deliveries?status=EN_COURS" className="text-xs font-bold text-[var(--lid-accent)]">
            Voir tout
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {active.length === 0 && !isLoading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
              Aucune mission en cours.
            </div>
          ) : (
            active.map((s) => {
              const badge = toShipmentStatusUi(s?.status)
              return (
                <Link
                  key={s?.id}
                  to={`/deliveries/${encodeURIComponent(s.id)}`}
                  className="block rounded-[28px] border border-slate-200 bg-white/70 p-4 transition hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{s?.trackingId || s?.id}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Cmd <span className="font-semibold text-slate-700">{s?.orderId || '-'}</span>
                        {s?.carrier ? (
                          <>
                            {' '}
                            • <span className="font-semibold text-slate-700">{s.carrier}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>
    </MotionDiv>
  )
}
