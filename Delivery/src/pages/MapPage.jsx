import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigation, RefreshCw } from 'lucide-react'

import LiveTrackingMap from '../components/map/LiveTrackingMap'
import { useGeolocation } from '../hooks/useGeolocation'
import { geocodeAddress } from '../services/geocoding'
import { getDrivingRoute } from '../services/routing'
import { getShipmentDetail, getShipments } from '../services/logistics'

const MotionDiv = motion.div

function openExternalNav(address) {
  const addr = `${address || ''}`.trim()
  if (!addr) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}&travelmode=driving`
  window.open(url, '_blank', 'noopener,noreferrer')
}

function toLabel(status) {
  const s = `${status || ''}`.trim().toUpperCase()
  if (s === 'EN_PREPARATION') return 'À récupérer'
  if (s === 'EN_COURS') return 'En cours'
  if (s === 'LIVREE') return 'Livrée'
  if (s === 'ECHEC') return 'Échec'
  return s || '-'
}

export default function MapPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shipments, setShipments] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [destination, setDestination] = useState(null)
  const [route, setRoute] = useState(null)
  const [follow, setFollow] = useState(true)

  const { position: currentPos, error: gpsError } = useGeolocation()

  const routeTimerRef = useRef(null)

  const loadShipments = async () => {
    setIsLoading(true)
    setError('')
    try {
      const page = await getShipments({ page: 0, size: 12, status: 'EN_COURS' })
      const list = Array.isArray(page?.content) ? page.content : []
      setShipments(list)
      if (!selectedId && list[0]?.id) {
        setSelectedId(list[0].id)
      }
    } catch (err) {
      setShipments([])
      setError(err?.message || 'Impossible de charger les missions.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadShipments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let canceled = false
    const run = async () => {
      if (!selectedId) {
        setSelectedDetail(null)
        setDestination(null)
        return
      }
      try {
        const detail = await getShipmentDetail(selectedId)
        if (canceled) return
        setSelectedDetail(detail || null)
        const addr = `${detail?.customerAddress || ''}`.trim()
        if (!addr) {
          setDestination(null)
          return
        }
        const geo = await geocodeAddress(addr)
        if (canceled) return
        setDestination(geo)
      } catch (err) {
        if (canceled) return
        setSelectedDetail(null)
        setDestination(null)
        setError(err?.message || 'Impossible de charger la mission.')
      }
    }
    run()
    return () => {
      canceled = true
    }
  }, [selectedId])

  useEffect(() => {
    if (routeTimerRef.current) {
      clearTimeout(routeTimerRef.current)
      routeTimerRef.current = null
    }

    if (!currentPos || !destination) {
      setRoute(null)
      return
    }

    routeTimerRef.current = setTimeout(async () => {
      try {
        const r = await getDrivingRoute(currentPos, destination)
        setRoute(r)
      } catch {
        setRoute(null)
      }
    }, 900)

    return () => {
      if (routeTimerRef.current) {
        clearTimeout(routeTimerRef.current)
        routeTimerRef.current = null
      }
    }
  }, [currentPos, destination])

  const headerChips = useMemo(() => {
    const chips = []
    if (selectedDetail?.trackingId) {
      chips.push({ label: selectedDetail.trackingId })
    }
    if (selectedDetail?.status) {
      chips.push({ label: toLabel(selectedDetail.status) })
    }
    if (currentPos?.accuracy) {
      chips.push({ label: `GPS ±${Math.round(currentPos.accuracy)}m` })
    }
    return chips
  }, [currentPos?.accuracy, selectedDetail?.status, selectedDetail?.trackingId])

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-4"
    >
      {(error || gpsError) && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error || gpsError}
        </div>
      )}

      <section className="lid-card rounded-[28px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">Carte</p>
            <p className="mt-1 text-xs text-slate-500">Ta position + la destination (si disponible).</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFollow((v) => !v)}
              className={`rounded-2xl px-3 py-2 text-xs font-bold transition ${
                follow ? 'bg-[var(--lid-accent-soft)] text-[var(--lid-accent)]' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {follow ? 'Suivi ON' : 'Suivi OFF'}
            </button>
            <button
              type="button"
              onClick={loadShipments}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              <RefreshCw size={16} />
              {isLoading ? '...' : 'Maj'}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <LiveTrackingMap
            className="h-[420px]"
            current={currentPos}
            destination={destination}
            route={route}
            follow={follow}
            interactive={!follow}
          />
          {headerChips.length ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {headerChips.map((c) => (
                <span key={c.label} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {c.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => openExternalNav(selectedDetail?.customerAddress)}
            disabled={!selectedDetail?.customerAddress}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-3xl bg-[var(--lid-accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Navigation size={18} />
            Navigation
          </button>
        </div>
      </section>

      <section className="lid-card rounded-[28px] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Missions en cours</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {shipments.length === 0 && !isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
              Aucune mission EN_COURS.
            </div>
          ) : (
            shipments.map((s) => {
              const active = `${s?.id || ''}` === `${selectedId || ''}`
              return (
                <button
                  key={s?.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`min-w-[220px] rounded-3xl border p-4 text-left transition ${
                    active
                      ? 'border-[var(--lid-accent)] bg-[var(--lid-accent-soft)]'
                      : 'border-slate-200 bg-white/70 hover:bg-white'
                  }`}
                >
                  <p className={`text-sm font-semibold ${active ? 'text-slate-900' : 'text-slate-900'}`}>
                    {s?.trackingId || s?.id}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Cmd <span className="font-semibold text-slate-700">{s?.orderId || '-'}</span>
                  </p>
                </button>
              )
            })
          )}
        </div>
      </section>
    </MotionDiv>
  )
}

