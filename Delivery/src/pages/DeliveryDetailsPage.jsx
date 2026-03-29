import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, KeyRound, Navigation, PhoneCall, RefreshCw, Check, ScanLine, QrCode } from 'lucide-react'

import LiveTrackingMap from '../components/map/LiveTrackingMap'
import { useShipmentDetailResolver } from '../context/LogisticsResolverContext'
import { useGeolocation } from '../hooks/useGeolocation'
import { geocodeAddress } from '../services/geocoding'
import { getDrivingRoute } from '../services/routing'
import { confirmDelivery, updateShipmentStatus } from '../services/logistics'

const MotionDiv = motion.div

function toStatusUi(status) {
  const s = `${status || ''}`.trim().toUpperCase()
  if (s === 'EN_PREPARATION') return { label: 'À récupérer', className: 'bg-neutral-100 text-neutral-700' }
  if (s === 'EN_COURS') return { label: 'En transit', className: 'bg-blue-50 text-blue-700' }
  if (s === 'LIVREE') return { label: 'Livrée', className: 'bg-green-50 text-green-700' }
  if (s === 'ECHEC') return { label: 'Échec', className: 'bg-red-50 text-red-700' }
  return { label: s || '-', className: 'bg-neutral-100 text-neutral-700' }
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

function formatDuration(seconds) {
  const s = Number(seconds)
  if (!Number.isFinite(s) || s <= 0) return null
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h} h ${mm}`
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

  const [destination, setDestination] = useState(null)
  const [route, setRoute] = useState(null)
  const [follow, setFollow] = useState(true)
  const [actionError, setActionError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [deliveryCode, setDeliveryCode] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLocked, setIsLocked] = useState(true)

  const { position: currentPos } = useGeolocation()
  const { data: detail, error, isLoading, refresh } = useShipmentDetailResolver(id, { enabled: Boolean(id) })
  const statusUi = useMemo(() => toStatusUi(detail?.status), [detail?.status])
  const items = Array.isArray(detail?.items) ? detail.items : []
  const routeTimerRef = useRef(null)

  useEffect(() => {
    const status = `${detail?.status || ''}`.trim().toUpperCase()
    if (status === 'EN_COURS' || status === 'LIVREE') {
      setIsLocked(false)
      return
    }
    try {
      const lastScanned = localStorage.getItem('lid_last_scanned_shipment')
      const scannedObj = lastScanned ? JSON.parse(lastScanned) : null
      setIsLocked(`${scannedObj?.id || ''}` !== id)
    } catch {
      setIsLocked(true)
    }
  }, [detail?.status, id])

  useEffect(() => {
    if (isLocked) return

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
  }, [detail?.customerAddress, isLocked])

  useEffect(() => {
    if (isLocked) {
      setRoute(null)
      return
    }

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
        const nextRoute = await getDrivingRoute(currentPos, destination)
        setRoute(nextRoute)
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
  }, [currentPos, destination, isLocked])

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
    setActionError('')
    try {
      await updateShipmentStatus(id, 'ECHEC')
      await refresh()
    } catch (err) {
      setActionError(err?.message || 'Impossible de mettre à jour le statut.')
    } finally {
      setIsUpdating(false)
    }
  }

  const confirmDelivered = async () => {
    if (!id || isUpdating) return
    const code = `${deliveryCode || ''}`.trim()
    if (!code) return
    setIsUpdating(true)
    setActionError('')
    try {
      await confirmDelivery(id, code)
      setDeliveryCode('')
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        refresh().catch(() => {})
      }, 2500)
    } catch (err) {
      setActionError(err?.message || 'Impossible de confirmer la livraison.')
    } finally {
      setIsUpdating(false)
    }
  }

  const distance = route?.distanceMeters != null ? formatDistance(route.distanceMeters) : null
  const duration = route?.durationSeconds != null ? formatDuration(route.durationSeconds) : null

  if (isLocked && !isLoading && detail) {
    return (
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
      >
        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-neutral-200">
          <QrCode size={48} className="text-neutral-400" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Scan requis</h2>
        <p className="text-neutral-500 font-medium mb-8 max-w-xs">
          Pour accéder aux détails et démarrer la livraison, vous devez d'abord scanner le QR code du colis.
        </p>
        <button
          onClick={() => navigate('/deliveries')}
          className="w-full max-w-xs bg-black text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <ScanLine size={20} /> Scanner maintenant
        </button>
      </MotionDiv>
    )
  }

  return (
    <>
      <MotionDiv
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="space-y-4 pb-20"
      >
        <div className="relative h-[280px] w-full overflow-hidden rounded-3xl bg-neutral-100 shadow-sm border border-neutral-200">
          <LiveTrackingMap
            current={currentPos}
            destination={destination}
            route={route}
            follow={follow}
            className="h-full w-full"
          />

          <div className="absolute bottom-4 left-4 right-4 flex gap-3">
            <button
              onClick={openNavigation}
              className="flex-1 bg-black text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <Navigation size={18} /> Navigation
            </button>
            <button
              onClick={() => setFollow(!follow)}
              className="bg-white p-3 rounded-xl shadow-lg border border-neutral-100"
            >
              <RefreshCw size={20} className={follow ? 'text-[#6aa200]' : 'text-neutral-400'} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-neutral-900">{detail?.customerName || 'Client'}</h1>
              <p className="text-neutral-500 font-medium mt-1">{detail?.customerAddress || 'Adresse non définie'}</p>
            </div>
            <button onClick={callCustomer} className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 transition hover:bg-green-200">
              <PhoneCall size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-neutral-50 p-4 rounded-2xl">
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Distance</p>
              <p className="text-xl font-black text-neutral-900">{distance || '--'}</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-2xl">
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Temps estimé</p>
              <p className="text-xl font-black text-neutral-900">{duration || '--'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900">Articles ({items.length})</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusUi.className}`}>{statusUi.label}</span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-50 last:border-0">
                <span className="text-neutral-700 font-medium">x{item.quantity} {item.productName}</span>
                <span className="font-bold">{formatMoney(item.lineTotal ?? item.unitPrice, detail?.currency)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
          <h3 className="font-bold text-neutral-900 mb-4">Validation livraison</h3>

          {(actionError || error) && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {actionError || error}
            </div>
          )}

          <div className="flex gap-3">
            <div className="relative flex-1">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Code client (4 chiffres)"
                value={deliveryCode}
                onChange={(e) => setDeliveryCode(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-neutral-50 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-[#6aa200] transition-all placeholder:text-neutral-400"
              />
            </div>
            <button
              onClick={confirmDelivered}
              disabled={!deliveryCode || isUpdating}
              className="bg-[#6aa200] text-white px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5a8a00] transition-colors"
            >
              {isUpdating ? <RefreshCw className="animate-spin" /> : <CheckCircle2 size={24} />}
            </button>
          </div>

          <button
            onClick={markFailure}
            disabled={isUpdating}
            className="w-full mt-4 py-3 text-red-600 font-bold text-sm bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            Signaler un problème
          </button>
        </div>
      </MotionDiv>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-green-600" strokeWidth={4} />
              </div>
              <h2 className="text-2xl font-black text-neutral-900 mb-2">Livraison validée !</h2>
              <p className="text-neutral-500 font-medium">Bon travail. La commande est clôturée.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
