import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, KeyRound, MapPin, Navigation, PhoneCall, RefreshCw, XCircle } from 'lucide-react'

import LiveTrackingMap from '../components/map/LiveTrackingMap'
import { useGeolocation } from '../hooks/useGeolocation'
import { geocodeAddress } from '../services/geocoding'
import { getDrivingRoute } from '../services/routing'
import { confirmDelivery, getShipmentDetail, updateShipmentStatus } from '../services/logistics'

const MotionDiv = motion.div

function toStatusUi(status) {
  const s = `${status || ''}`.trim().toUpperCase()
  if (s === 'EN_PREPARATION') return { label: 'À récupérer', className: 'bg-slate-100 text-slate-700' }
  if (s === 'EN_COURS') return { label: 'En transit', className: 'bg-sky-100 text-sky-700' }
  if (s === 'LIVREE') return { label: 'Livrée', className: 'bg-emerald-100 text-emerald-700' }
  if (s === 'ECHEC') return { label: 'Échec', className: 'bg-rose-100 text-rose-700' }
  return { label: s || '-', className: 'bg-slate-100 text-slate-700' }
}

function formatMoney(amount, currency) {
  if (amount === null || amount === undefined) return '-'
  const value = Number(amount)
  const cur = `${currency || 'XOF'}`.trim() || 'XOF'
  if (!Number.isFinite(value)) return `${amount} ${cur}`.trim()
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: cur }).format(value)
  } catch {
    return `${value} ${cur}`.trim()
  }
}

function formatEta(eta) {
  if (!eta) return '-'
  const d = new Date(eta)
  if (Number.isNaN(d.getTime())) return `${eta}`
  return d.toLocaleDateString('fr-FR', { dateStyle: 'medium' })
}

function formatDuration(seconds) {
  const s = Number(seconds)
  if (!Number.isFinite(s) || s <= 0) return null
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h}h${`${mm}`.padStart(2, '0')}`
}

function formatDistance(meters) {
  const m = Number(meters)
  if (!Number.isFinite(m) || m <= 0) return null
  if (m < 1000) return `${Math.round(m)} m`
  return `${(m / 1000).toFixed(1)} km`
}

export default function DeliveryDetailsPage() {
  const navigate = useNavigate()
  const { shipmentId } = useParams()
  const id = `${shipmentId || ''}`.trim()

  const [detail, setDetail] = useState(null)
  const [destination, setDestination] = useState(null)
  const [route, setRoute] = useState(null)
  const [follow, setFollow] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deliveryCode, setDeliveryCode] = useState('')

  const { position: currentPos, error: gpsError } = useGeolocation()

  const statusUi = useMemo(() => toStatusUi(detail?.status), [detail?.status])
  const items = Array.isArray(detail?.items) ? detail.items : []

  const routeTimerRef = useRef(null)

  const load = async () => {
    if (!id) return
    setIsLoading(true)
    setError('')
    try {
      const data = await getShipmentDetail(id)
      setDetail(data || null)
    } catch (err) {
      setDetail(null)
      setError(err?.message || 'Impossible de charger la livraison.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    let canceled = false
    const run = async () => {
      const addr = `${detail?.customerAddress || ''}`.trim()
      if (!addr) {
        setDestination(null)
        return
      }
      const geo = await geocodeAddress(addr)
      if (canceled) return
      setDestination(geo)
    }
    run()
    return () => {
      canceled = true
    }
  }, [detail?.customerAddress])

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

  const callCustomer = () => {
    const phone = `${detail?.customerPhone || ''}`.trim()
    if (!phone) return
    window.location.href = `tel:${phone}`
  }

  const openNavigation = () => {
    const addr = `${detail?.customerAddress || ''}`.trim()
    if (!addr) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}&travelmode=driving`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const markFailure = async () => {
    if (!id || isUpdating) return
    setIsUpdating(true)
    setError('')
    try {
      await updateShipmentStatus(id, 'ECHEC')
      await load()
    } catch (err) {
      setError(err?.message || 'Impossible de mettre à jour le statut.')
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmDelivered = async () => {
    if (!id || isUpdating) return
    const code = `${deliveryCode || ''}`.trim()
    if (!code) return
    setIsUpdating(true)
    setError('')
    try {
      await confirmDelivery(id, code)
      setDeliveryCode('')
      await load()
    } catch (err) {
      setError(err?.message || 'Impossible de confirmer la livraison.')
    } finally {
      setIsUpdating(false)
    }
  }

  const distance = route?.distanceMeters != null ? formatDistance(route.distanceMeters) : null
  const duration = route?.durationSeconds != null ? formatDuration(route.durationSeconds) : null

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3.5 py-2 text-sm font-semibold text-slate-800 backdrop-blur hover:bg-white"
        >
          <ChevronLeft size={18} />
          Retour
        </button>
        <Link
          to="/deliveries"
          className="rounded-2xl bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white"
        >
          Missions
        </Link>
      </div>

      {(error || gpsError) && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error || gpsError}
        </div>
      )}

      <section className="lid-card rounded-[28px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Mission</p>
            <p className="font-display mt-1 truncate text-[18px] font-semibold text-slate-900">
              {detail?.trackingId || id}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Commande{' '}
              <span className="font-semibold text-slate-700">{detail?.orderId || '-'}</span>
              {detail?.carrier ? (
                <>
                  {' '}
                  • <span className="font-semibold text-slate-700">{detail.carrier}</span>
                </>
              ) : null}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${statusUi.className}`}>
            {statusUi.label}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Total</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatMoney(detail?.orderTotal, detail?.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Paiement</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{detail?.paid ? 'Payé' : 'À encaisser'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">ETA</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatEta(detail?.eta)}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="lid-card rounded-[28px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold text-slate-900">Navigation</p>
              <p className="mt-1 text-xs text-slate-500">Position GPS en temps réel + destination.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFollow((v) => !v)}
                className={`rounded-2xl px-3 py-2 text-xs font-bold transition ${
                  follow
                    ? 'bg-[var(--lid-accent-soft)] text-[var(--lid-accent)]'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {follow ? 'Suivi ON' : 'Suivi OFF'}
              </button>
              <button
                type="button"
                onClick={openNavigation}
                disabled={!detail?.customerAddress}
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--lid-accent)] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Navigation size={18} />
                GPS
              </button>
            </div>
          </div>

          <div className="mt-4">
            <LiveTrackingMap
              className="h-[320px]"
              current={currentPos}
              destination={destination}
              route={route}
              follow={follow}
              interactive={!follow}
            />
            {(distance || duration) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {distance ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    Distance {distance}
                  </span>
                ) : null}
                {duration ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    ETA {duration}
                  </span>
                ) : null}
                {currentPos?.accuracy ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                    GPS ±{Math.round(currentPos.accuracy)}m
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="lid-card rounded-[28px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold text-slate-900">Client</p>
              <p className="mt-1 text-xs text-slate-500">Contact rapide + adresse.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={callCustomer}
                disabled={!detail?.customerPhone}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <PhoneCall size={18} />
                Appeler
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{detail?.customerName || '-'}</p>
            <p className="mt-1 text-xs text-slate-500">{detail?.customerEmail || '-'}</p>
            <div className="mt-3 flex items-start gap-2">
              <MapPin className="mt-0.5 text-slate-400" size={16} />
              <p className="text-sm font-semibold text-slate-800">{detail?.customerAddress || '-'}</p>
            </div>
          </div>
        </div>

        <div className="lid-card rounded-[28px] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold text-slate-900">Colis</p>
              <p className="mt-1 text-xs text-slate-500">Liste des articles à remettre.</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {items.length === 0 && !isLoading ? (
              <p className="text-sm text-slate-500">Aucun article.</p>
            ) : (
              items.map((it, idx) => (
                <div
                  key={`${it?.productId || 'p'}-${idx}`}
                  className="rounded-3xl border border-slate-200 bg-white/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {it?.productName || 'Produit'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {it?.unitPrice != null ? `PU ${it.unitPrice}` : 'PU -'}
                        {it?.lineTotal != null ? ` • Total ${it.lineTotal}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      x{it?.quantity ?? 1}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="lid-card rounded-[28px] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">Validation</p>
            <p className="mt-1 text-xs text-slate-500">Confirme la livraison avec le code à 4 chiffres du client.</p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={isLoading || isUpdating}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-40"
          >
            <RefreshCw size={18} />
            {isLoading ? '...' : 'Recharger'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Code client</p>
            <div className="mt-2 flex gap-2">
              <div className="relative w-full">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={deliveryCode}
                  onChange={(e) => setDeliveryCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  placeholder="0000"
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none focus:border-[var(--lid-accent)]"
                />
              </div>
              <button
                type="button"
                onClick={confirmDelivered}
                disabled={isUpdating || `${deliveryCode || ''}`.trim().length !== 4}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                <CheckCircle2 size={18} />
                Confirmer
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={markFailure}
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            <XCircle size={18} />
            Échec / reprogrammer
          </button>
        </div>
      </section>
    </MotionDiv>
  )
}
