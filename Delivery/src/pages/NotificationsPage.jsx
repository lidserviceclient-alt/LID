import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { RefreshCw, Package, Check, X } from 'lucide-react'
import { getNotifications } from '../services/notifications'

const MotionDiv = motion.div

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return `${value}`
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(null)

  const load = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getNotifications({ page: 0, size: 50 })
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

  const rawList = Array.isArray(page?.content) ? page.content : []
  
  // Filter for new orders only (assuming "ORDER" related keywords or specific summary)
  const list = rawList.filter(n => {
    const s = (n?.summary || "").toLowerCase();
    const p = (n?.path || "").toLowerCase();
    return s.includes("commande") || s.includes("order") || p.includes("/orders");
  });

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-neutral-900">Activité récente</h2>
        <button
          onClick={load}
          disabled={isLoading}
          className="p-2 rounded-full bg-white shadow-sm border border-neutral-200 text-neutral-600 hover:text-[#6aa200] transition-colors"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {list.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Package size={24} className="text-neutral-400" />
            </div>
            <p className="text-neutral-500 font-medium">Aucune nouvelle commande.</p>
          </div>
        ) : (
          list.map((n) => (
            <div key={n?.id} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex gap-4">
              <div className="h-10 w-10 rounded-full bg-[#6aa200]/10 flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-[#6aa200]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-neutral-900 text-sm">{n?.summary || 'Nouvelle commande'}</p>
                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                   Détails de la mission disponibles.
                </p>
                <p className="text-[10px] text-neutral-400 mt-2">{formatDate(n?.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                 <div className="h-2 w-2 rounded-full bg-[#6aa200]" />
              </div>
            </div>
          ))
        )}
      </div>
    </MotionDiv>
  )
}
