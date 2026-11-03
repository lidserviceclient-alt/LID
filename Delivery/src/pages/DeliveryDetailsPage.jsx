import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CloudOff,
  Flag,
  KeyRound,
  MapPin,
  MessageCircle,
  MessageSquare,
  Navigation,
  Phone,
  QrCode,
  RefreshCw,
  ScanLine,
  Wallet,
} from 'lucide-react'

import LiveTrackingMap from '../components/map/LiveTrackingMap'
import { useShipmentDetailResolver } from '../context/LogisticsResolverContext'
import { useGeolocation } from '../hooks/useGeolocation'
import { geocodeAddress } from '../services/geocoding'
import { getDrivingRoute } from '../services/routing'
import { getShipmentTimeline, normalizeShipmentQr, scanShipment } from '../services/logistics'
import { getPendingFor, runOrQueue, subscribeQueue } from '../services/offlineQueue'
import { directionsLink, smsLink, telLink, vibrate, whatsappLink } from '../utils/contact'

const MotionDiv = motion.div

/** Motifs d'échec prédéfinis : un tap, et un message clair pour le client. */
const FAILURE_REASONS = [
  {
    key: 'absent',
    label: 'Client absent',
    customer: "Notre livreur s'est présenté mais vous étiez absent. Nous vous recontactons pour convenir d'un nouveau passage.",
  },
  {
    key: 'unreachable',
    label: 'Client injoignable',
    customer: "Notre livreur n'a pas réussi à vous joindre. Nous vous recontactons pour convenir d'un nouveau passage.",
  },
  {
    key: 'address',
    label: 'Adresse introuvable',
    customer: "Notre livreur n'a pas trouvé l'adresse indiquée. Nous vous recontactons pour la préciser.",
  },
  {
    key: 'refused',
    label: 'Colis refusé',
    customer: 'La livraison a été refusée sur place. Notre équipe revient vers vous rapidement.',
  },
  {
    key: 'access',
    label: 'Accès impossible',
    customer: "Notre livreur n'a pas pu accéder au lieu de livraison. Nous vous recontactons pour convenir d'un nouveau passage.",
  },
  {
    key: 'damaged',
    label: 'Colis endommagé',
    customer: 'Un problème a été constaté sur votre colis. Notre équipe revient vers vous rapidement.',
  },
  { key: 'other', label: 'Autre motif', customer: '' },
]

const ARRIVED_MARK = 'arrivé'

function toStatusUi(status) {
  const s = `${status || ''}`.trim().toUpperCase()
  if (s === 'EN_PREPARATION') return { label: 'À récupérer', className: 'bg-neutral-200 text-neutral-800' }
  if (s === 'EN_COURS') return { label: 'En livraison', className: 'bg-blue-100 text-blue-800' }
  if (s === 'LIVREE') return { label: 'Livrée', className: 'bg-green-100 text-green-800' }
  if (s === 'ECHEC') return { label: 'Échec', className: 'bg-red-100 text-red-800' }
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

function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return `${value}`
  return d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function ContactButton({ href, label, icon, className, external }) {
  const Icon = icon
  if (!href) {
    return (
      <span className="flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl bg-neutral-100 text-xs font-bold text-neutral-400">
        <Icon size={20} /> {label}
      </span>
    )
  }
  return (
    <a
      href={href}
      onClick={() => vibrate(15)}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-bold active:scale-[0.97] transition-transform ${className}`}
    >
      <Icon size={20} /> {label}
    </a>
  )
}

export default function DeliveryDetailsPage() {
  const navigate = useNavigate()
  const { shipmentId } = useParams()
  const id = `${shipmentId || ''}`.trim()

  const [destination, setDestination] = useState(null)
  const [route, setRoute] = useState(null)
  const [follow, setFollow] = useState(true)
  const [actionError, setActionError] = useState('')
  const [actionInfo, setActionInfo] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const [deliveryCode, setDeliveryCode] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLocked, setIsLocked] = useState(true)
  const [manualQr, setManualQr] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [unlockLoading, setUnlockLoading] = useState(false)
  const [showFailureSheet, setShowFailureSheet] = useState(false)
  const [failureReason, setFailureReason] = useState('')
  const [failureComment, setFailureComment] = useState('')
  const [timeline, setTimeline] = useState([])
  const [pending, setPending] = useState(() => getPendingFor(id))

  const { position: currentPos, error: gpsError, permission: gpsPermission } = useGeolocation()
  const { data: detail, error, isLoading, refresh } = useShipmentDetailResolver(id, { enabled: Boolean(id) })
  const status = `${detail?.status || ''}`.trim().toUpperCase()
  const statusUi = useMemo(() => toStatusUi(detail?.status), [detail?.status])
  const items = Array.isArray(detail?.items) ? detail.items : []
  const routeTimerRef = useRef(null)
  const isUpdating = Boolean(busyAction)

  useEffect(() => {
    setPending(getPendingFor(id))
    return subscribeQueue(() => setPending(getPendingFor(id)))
  }, [id])

  const pendingDeliver = pending.some((action) => action.type === 'deliver')
  const pendingFailure = pending.some((action) => action.type === 'failure')
  const pendingArrived = pending.some((action) => action.type === 'arrived')

  const loadTimeline = useCallback(async () => {
    if (!id || (typeof navigator !== 'undefined' && navigator.onLine === false)) return
    try {
      const list = await getShipmentTimeline(id)
      setTimeline(Array.isArray(list) ? list : [])
    } catch {
      // l'historique est un complément : la page reste utilisable sans lui
    }
  }, [id])

  useEffect(() => {
    if (!detail?.id || isLocked) return
    loadTimeline()
  }, [detail?.id, detail?.status, isLocked, loadTimeline])

  const lastEvent = timeline.length > 0 ? timeline[timeline.length - 1] : null
  const arrived = pendingArrived || (status === 'EN_COURS' && `${lastEvent?.comment || ''}`.includes(ARRIVED_MARK))

  useEffect(() => {
    // Le colis doit avoir été scanné (preuve de prise en charge) avant d'afficher la mission à récupérer
    if (status === 'EN_COURS' || status === 'LIVREE' || status === 'ECHEC') {
      setIsLocked(false)
      return
    }
    try {
      const lastScanned = sessionStorage.getItem('lid_last_scanned_shipment')
      const scannedObj = lastScanned ? JSON.parse(lastScanned) : null
      if (`${scannedObj?.id}` === id) {
        setIsLocked(false)
        return
      }
      setIsLocked(true)
    } catch {
      setIsLocked(true)
    }
  }, [status, id])

  const rescan = async (rawQr) => {
    const qr = normalizeShipmentQr(rawQr)
    if (!qr || unlockLoading) return

    setUnlockLoading(true)
    setUnlockError('')
    try {
      const scannedDetail = await scanShipment(qr)
      if (!scannedDetail?.id) {
        throw new Error('Expédition introuvable.')
      }
      vibrate([40, 40, 40])
      sessionStorage.setItem('lid_last_scanned_shipment', JSON.stringify(scannedDetail))
      setManualQr('')
      if (`${scannedDetail.id}` !== id) {
        navigate(`/deliveries/${encodeURIComponent(scannedDetail.id)}`, { replace: true })
        return
      }
      setIsLocked(false)
      await refresh()
    } catch (err) {
      vibrate(200)
      setUnlockError(
        !err?.status ? 'Pas de réseau : le scan doit être fait en ligne.' : err?.message || 'Impossible de valider ce code QR.',
      )
    } finally {
      setUnlockLoading(false)
    }
  }

  useEffect(() => {
    if (isLocked) return

    let canceled = false
    const run = async () => {
      const lat = Number(detail?.customerLatitude)
      const lng = Number(detail?.customerLongitude)
      if (detail?.customerLatitude != null && Number.isFinite(lat) && Number.isFinite(lng)) {
        setDestination({ lat, lng, label: `${detail?.customerAddress || ''}`.trim() || 'Destination' })
        return
      }
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
  }, [detail?.customerAddress, detail?.customerLatitude, detail?.customerLongitude, isLocked])

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

  /** Exécute une action du livreur ; hors ligne, elle part dans la file de rejeu. */
  const runAction = async (type, payload, { onDone } = {}) => {
    if (!id || isUpdating) return
    setBusyAction(type)
    setActionError('')
    setActionInfo('')
    try {
      const { queued } = await runOrQueue(type, id, payload)
      if (queued) {
        vibrate([20, 60, 20])
        setActionInfo("Pas de réseau : l'action est enregistrée sur le téléphone et sera envoyée automatiquement.")
      } else {
        vibrate(40)
      }
      onDone?.(queued)
      if (!queued) {
        await Promise.allSettled([refresh(), loadTimeline()])
      }
    } catch (err) {
      vibrate(200)
      if (type === 'deliver') setDeliveryCode('')
      setActionError(err?.message || 'Action impossible. Réessayez.')
    } finally {
      setBusyAction('')
    }
  }

  const signalArrival = () => runAction('arrived', {})

  const submitFailure = () => {
    const reason = FAILURE_REASONS.find((r) => r.key === failureReason)
    const comment = `${failureComment || ''}`.trim()
    if (!reason) {
      setActionError('Choisissez un motif.')
      return
    }
    if (reason.key === 'other' && !comment) {
      setActionError('Précisez le motif.')
      return
    }
    const issue = reason.key === 'other' ? comment : comment ? `${reason.label} — ${comment}` : reason.label
    runAction(
      'failure',
      { deliveryIssueComment: issue, customerFacingComment: reason.customer || undefined },
      {
        onDone: () => {
          setShowFailureSheet(false)
          setFailureReason('')
          setFailureComment('')
        },
      },
    )
  }

  const confirmDelivered = (codeValue = deliveryCode) => {
    const code = `${codeValue || ''}`.replace(/\D/g, '')
    if (code.length !== 4 || isUpdating) return
    runAction(
      'deliver',
      { code },
      {
        onDone: (queued) => {
          setDeliveryCode('')
          if (!queued) {
            vibrate([60, 40, 120])
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 2200)
          }
        },
      },
    )
  }

  const onCodeChange = (value) => {
    const digits = `${value || ''}`.replace(/\D/g, '').slice(0, 4)
    setDeliveryCode(digits)
    if (digits.length === 4) confirmDelivered(digits)
  }

  const distance = route?.distanceMeters != null ? formatDistance(route.distanceMeters) : null
  const duration = route?.durationSeconds != null ? formatDuration(route.durationSeconds) : null
  const routeInfoLabel = useMemo(() => {
    if (!detail) return 'Chargement de la mission...'
    if (gpsError) return gpsError
    if (gpsPermission === 'denied') {
      return 'Autorisation GPS refusée. Active la localisation dans les réglages du navigateur.'
    }
    if (!currentPos) return 'Position livreur en attente'
    if (!destination) return 'Destination indisponible'
    if (!route) return 'Itinéraire indisponible'
    return null
  }, [currentPos, destination, detail, gpsError, gpsPermission, route])

  if (!detail && isLoading) {
    return <div className="py-16 text-center font-semibold text-neutral-500">Chargement de la mission…</div>
  }

  if (!detail && error) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="font-semibold text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => refresh().catch(() => {})}
          className="rounded-2xl bg-black px-6 py-3 font-bold text-white"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (isLocked && !isLoading && detail) {
    return (
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
      >
        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-neutral-200">
          <QrCode size={48} className="text-neutral-500" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 mb-2">Scan requis</h2>
        <p className="text-neutral-600 font-medium mb-8 max-w-xs">
          Pour accéder aux détails et démarrer la livraison, scannez d'abord le QR code du colis.
        </p>
        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => navigate('/deliveries')}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <ScanLine size={20} /> Scanner maintenant
          </button>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3 shadow-sm">
            <p className="text-sm font-bold text-neutral-900">Ou entrer le code du colis</p>
            <input
              value={manualQr}
              onChange={(event) => setManualQr(event.target.value.toUpperCase())}
              placeholder="Code colis, ex: A7K2P"
              className="w-full rounded-xl bg-neutral-100 px-4 py-3 font-mono text-lg font-bold outline-none focus:ring-2 focus:ring-[#6aa200]"
            />
            <button
              onClick={() => rescan(manualQr)}
              disabled={unlockLoading || !normalizeShipmentQr(manualQr)}
              className="w-full rounded-xl bg-[#4d7600] px-4 py-3 font-bold text-white disabled:opacity-50"
            >
              {unlockLoading ? 'Vérification...' : 'Valider le code'}
            </button>
            {unlockError ? <p className="text-sm font-semibold text-red-700">{unlockError}</p> : null}
          </div>
        </div>
      </MotionDiv>
    )
  }

  const phone = `${detail?.customerPhone || ''}`.trim()
  const directions = directionsLink({
    latitude: detail?.customerLatitude,
    longitude: detail?.customerLongitude,
    address: detail?.customerAddress,
  })
  const greeting = `Bonjour, je suis votre livreur LID pour la commande ${detail?.orderId || ''}.`

  return (
    <>
      <MotionDiv
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="space-y-4 pb-20"
      >
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-200">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusUi.className}`}>
                {statusUi.label}
              </span>
              <h1 className="mt-2 text-2xl font-black text-neutral-900 break-words">{detail?.customerName || 'Client'}</h1>
              <p className="text-sm font-semibold text-neutral-600">
                Commande {detail?.orderId || '-'}
                {detail?.handoffCode ? ` · colis ${detail.handoffCode}` : ''}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 text-base font-semibold text-neutral-900">
            <MapPin size={18} className="mt-1 shrink-0 text-neutral-600" />
            <span className="break-words">{detail?.customerAddress || 'Adresse non renseignée'}</span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <ContactButton href={telLink(phone)} label="Appeler" icon={Phone} className="bg-green-600 text-white" />
            <ContactButton
              href={whatsappLink(phone, greeting)}
              label="WhatsApp"
              icon={MessageCircle}
              className="bg-[#25D366]/15 text-[#0b6b34]"
              external
            />
            <ContactButton href={smsLink(phone)} label="SMS" icon={MessageSquare} className="bg-blue-100 text-blue-800" />
            <ContactButton
              href={directions}
              label="Itinéraire"
              icon={Navigation}
              className="bg-neutral-900 text-white"
              external
            />
          </div>

          <div
            className={`mt-4 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
              detail?.paid ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-900'
            }`}
          >
            <Wallet size={18} className="mt-0.5 shrink-0" />
            <span>
              {detail?.paid
                ? `Commande payée en ligne (${formatMoney(detail?.orderTotal, detail?.currency)}) : rien à encaisser.`
                : "Paiement non confirmé : n'encaissez rien et contactez l'administration avant la remise."}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-200">
          {pending.length > 0 ? (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              <CloudOff size={18} className="mt-0.5 shrink-0" />
              <span>
                {pendingDeliver
                  ? 'Remise enregistrée sur le téléphone : elle sera confirmée dès le retour du réseau.'
                  : pendingFailure
                    ? 'Échec enregistré sur le téléphone : il sera envoyé dès le retour du réseau.'
                    : 'Arrivée enregistrée : elle sera envoyée dès le retour du réseau.'}
              </span>
            </div>
          ) : null}

          {actionInfo && pending.length === 0 ? (
            <div className="mb-4 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-800">{actionInfo}</div>
          ) : null}

          {actionError ? (
            <div role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {actionError}
            </div>
          ) : null}

          {status === 'EN_COURS' && !pendingDeliver && !pendingFailure ? (
            <div className="space-y-4">
              {!arrived ? (
                <button
                  type="button"
                  onClick={signalArrival}
                  disabled={isUpdating}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 text-base font-bold text-white disabled:opacity-60 active:scale-[0.98] transition-transform"
                >
                  {busyAction === 'arrived' ? <RefreshCw className="animate-spin" size={20} /> : <Flag size={20} />}
                  Je suis arrivé chez le client
                </button>
              ) : (
                <p className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900">
                  <Flag size={18} /> Arrivée signalée au client
                </p>
              )}

              <div>
                <label htmlFor="delivery-code" className="mb-2 block text-base font-black text-neutral-900">
                  Code de remise du client
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={22} />
                    <input
                      id="delivery-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="4 chiffres"
                      value={deliveryCode}
                      onChange={(e) => onCodeChange(e.target.value)}
                      disabled={isUpdating}
                      className="h-16 w-full rounded-2xl border-2 border-neutral-300 bg-white pl-12 pr-4 font-mono text-3xl font-black tracking-[0.4em] text-neutral-900 outline-none focus:border-[#4d7600] placeholder:text-base placeholder:tracking-normal placeholder:font-semibold placeholder:text-neutral-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => confirmDelivered()}
                    disabled={deliveryCode.length !== 4 || isUpdating}
                    className="h-16 w-16 shrink-0 rounded-2xl bg-[#4d7600] text-white flex items-center justify-center disabled:opacity-40"
                    aria-label="Confirmer la remise"
                  >
                    {busyAction === 'deliver' ? <RefreshCw className="animate-spin" /> : <CheckCircle2 size={28} />}
                  </button>
                </div>
                <p className="mt-2 text-xs font-semibold text-neutral-500">
                  Le client a reçu ce code par e-mail. La remise est validée dès le 4e chiffre.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActionError('')
                  setShowFailureSheet(true)
                }}
                disabled={isUpdating}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-white font-bold text-red-700 disabled:opacity-50"
              >
                <AlertTriangle size={18} /> Livraison impossible
              </button>
            </div>
          ) : null}

          {status === 'LIVREE' ? (
            <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-4 text-green-900">
              <CheckCircle2 size={28} className="shrink-0" />
              <div>
                <p className="text-lg font-black">Colis livré</p>
                <p className="text-sm font-semibold">Remise confirmée par le code du client.</p>
              </div>
            </div>
          ) : null}

          {status === 'ECHEC' && !pendingDeliver ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-900">
                <p className="font-black">Échec signalé</p>
                {detail?.deliveryIssueComment ? (
                  <p className="mt-1 text-sm font-semibold">Motif : {detail.deliveryIssueComment}</p>
                ) : null}
                <p className="mt-1 text-sm font-semibold">Tentatives : {detail?.failedAttempts || 0}</p>
              </div>
              <p className="text-sm font-semibold text-neutral-700">
                Pour relancer la livraison, scannez de nouveau le colis (ou saisissez son code).
              </p>
              <div className="flex gap-2">
                <input
                  value={manualQr}
                  onChange={(event) => setManualQr(event.target.value.toUpperCase())}
                  placeholder={detail?.handoffCode || 'Code colis'}
                  className="h-12 min-w-0 flex-1 rounded-2xl bg-neutral-100 px-4 font-mono text-lg font-bold outline-none focus:ring-2 focus:ring-[#6aa200]"
                />
                <button
                  type="button"
                  onClick={() => rescan(manualQr)}
                  disabled={unlockLoading || !normalizeShipmentQr(manualQr)}
                  className="h-12 rounded-2xl bg-black px-5 font-bold text-white disabled:opacity-50"
                >
                  {unlockLoading ? '…' : 'Relancer'}
                </button>
              </div>
              {unlockError ? <p className="text-sm font-semibold text-red-700">{unlockError}</p> : null}
            </div>
          ) : null}

          {detail?.codeLocked ? (
            <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Code client verrouillé après trop d'essais : appelez l'administration pour le débloquer.
            </p>
          ) : null}
        </div>

        <div className="relative h-[240px] w-full overflow-hidden rounded-3xl bg-neutral-100 shadow-sm border border-neutral-200">
          <LiveTrackingMap current={currentPos} destination={destination} route={route} follow={follow} className="h-full w-full" />
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <div className="flex-1 rounded-xl bg-white/95 px-3 py-2 text-sm font-bold text-neutral-900 shadow">
              {distance && duration ? `${distance} · ${duration}` : routeInfoLabel || '--'}
            </div>
            <button
              onClick={() => setFollow(!follow)}
              className="bg-white p-3 rounded-xl shadow-lg border border-neutral-100"
              aria-label={follow ? 'Arrêter de suivre ma position' : 'Suivre ma position'}
            >
              <RefreshCw size={20} className={follow ? 'text-[#4d7600]' : 'text-neutral-400'} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-200">
          <h3 className="mb-2 font-black text-neutral-900">Articles ({items.length})</h3>
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
              <span className="text-neutral-800 font-semibold">
                x{item.quantity} {item.productName}
              </span>
              <span className="font-bold">{formatMoney(item.lineTotal ?? item.unitPrice, detail?.currency)}</span>
            </div>
          ))}
        </div>

        {timeline.length > 0 ? (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-200">
            <h3 className="mb-3 font-black text-neutral-900">Historique</h3>
            <ol className="space-y-3">
              {[...timeline].reverse().map((entry) => (
                <li key={entry.id} className="flex gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-900">
                      {entry.statusLabel || entry.status}
                      <span className="ml-2 font-semibold text-neutral-500">{formatDateTime(entry.changedAt)}</span>
                    </p>
                    {entry.comment ? <p className="text-sm text-neutral-700 break-words">{entry.comment}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </MotionDiv>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowSuccess(false)}
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
              <p className="text-neutral-600 font-medium">Bon travail. Le colis est remis.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFailureSheet ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 28, opacity: 0 }}
              className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">Pourquoi la livraison est impossible ?</h3>
                  <p className="text-sm text-neutral-600">Le client et l'administration sont prévenus automatiquement.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {FAILURE_REASONS.map((reason) => {
                  const active = reason.key === failureReason
                  return (
                    <button
                      key={reason.key}
                      type="button"
                      onClick={() => {
                        setFailureReason(reason.key)
                        setActionError('')
                      }}
                      aria-pressed={active}
                      className={`min-h-12 rounded-2xl border-2 px-3 py-2 text-sm font-bold ${
                        active ? 'border-red-600 bg-red-600 text-white' : 'border-neutral-200 bg-white text-neutral-800'
                      }`}
                    >
                      {reason.label}
                    </button>
                  )
                })}
              </div>

              <textarea
                rows={3}
                value={failureComment}
                onChange={(event) => setFailureComment(event.target.value)}
                placeholder={failureReason === 'other' ? 'Décrivez le problème (obligatoire)' : 'Précision pour l’administration (facultatif)'}
                className="mt-3 w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-900 outline-none focus:border-[#6aa200] focus:ring-2 focus:ring-[#6aa200]/20"
              />

              {actionError ? (
                <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{actionError}</div>
              ) : null}

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (isUpdating) return
                    setShowFailureSheet(false)
                  }}
                  className="h-12 flex-1 rounded-2xl border border-neutral-300 bg-white px-4 font-bold text-neutral-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={submitFailure}
                  disabled={isUpdating || !failureReason || (failureReason === 'other' && !`${failureComment}`.trim())}
                  className="h-12 flex-1 rounded-2xl bg-red-600 px-4 font-bold text-white disabled:opacity-50"
                >
                  {busyAction === 'failure' ? 'Envoi…' : "Confirmer l'échec"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
