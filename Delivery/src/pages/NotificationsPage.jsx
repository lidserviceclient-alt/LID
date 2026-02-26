import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getNotifications } from '../services/notifications'

const MotionDiv = motion.div

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return `${value}`
  return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(null)

  const load = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getNotifications({ page: 0, size: 20 })
      setPage(data || null)
    } catch (err) {
      setPage(null)
      setError(err?.message || 'Impossible de charger les notifications.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const list = Array.isArray(page?.content) ? page.content : []

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
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Backoffice</p>
            <p className="font-display mt-1 text-lg font-semibold text-slate-900">Notifications</p>
            <p className="mt-1 text-xs text-slate-500">Flux des dernières actions (API / backoffice).</p>
          </div>
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
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <section className="space-y-3">
        {list.length === 0 && !isLoading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
            Aucune notification.
          </div>
        ) : (
          list.map((n) => (
            <div key={n?.id} className="lid-card rounded-[28px] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{n?.summary || 'Activité'}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {n?.method ? <span className="font-semibold text-slate-700">{n.method}</span> : null}
                    {n?.path ? <span> • {n.path}</span> : null}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {n?.status ?? '-'}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">Le {formatDate(n?.createdAt)}</p>
            </div>
          ))
        )}
      </section>
    </MotionDiv>
  )
}
