import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp } from 'lucide-react'

import { DEFAULT_DELIVERY_BOOTSTRAP_PARAMS, useDeliveryBootstrap } from '../context/LogisticsResolverContext'

const MotionDiv = motion.div

function formatNumber(value) {
  if (value === null || value === undefined) return '-'
  const n = Number(value)
  if (!Number.isFinite(n)) return `${value}`
  return new Intl.NumberFormat('fr-FR').format(n)
}

export default function HistoryPage() {
  const { data, isLoading, error, refresh } = useDeliveryBootstrap(DEFAULT_DELIVERY_BOOTSTRAP_PARAMS)
  const kpis = data?.kpis || null
  const delivered = Array.isArray(data?.deliveredPage?.content) ? data.deliveredPage.content : []

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
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">30 jours</p>
            <p className="font-display mt-1 text-lg font-semibold text-slate-900">Performance</p>
            <p className="mt-1 text-xs text-slate-500">Synthèse KPI (bootstrap logistique partagé).</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {isLoading ? '...' : 'Maj'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">En cours</p>
            <p className="font-display mt-1 text-2xl font-semibold text-slate-900">{formatNumber(kpis?.inTransitCount)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Délai</p>
            <p className="font-display mt-1 text-2xl font-semibold text-slate-900">{formatNumber(kpis?.avgDelayDays)}j</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Coût</p>
            <p className="font-display mt-1 text-2xl font-semibold text-slate-900">{kpis?.avgCost ?? '-'}</p>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--lid-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--lid-accent)]">
          <TrendingUp size={14} />
          Indicateurs opérationnels
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <section className="lid-card rounded-[28px] p-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">Dernières livraisons clôturées</h2>
        <p className="mt-1 text-xs text-slate-500">Statut LIVREE (10 dernières).</p>

        <div className="mt-4 space-y-2">
          {delivered.length === 0 && !isLoading ? (
            <p className="text-sm text-slate-500">Aucune livraison clôturée.</p>
          ) : (
            delivered.map((s) => (
              <div key={s?.id} className="rounded-[28px] border border-slate-200 bg-white/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{s?.trackingId || s?.id}</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">LIVRÉE</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Commande: <span className="font-semibold text-slate-700">{s?.orderId || '-'}</span>
                  {s?.carrier ? <> • <span className="font-semibold text-slate-700">{s.carrier}</span></> : null}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </MotionDiv>
  )
}
