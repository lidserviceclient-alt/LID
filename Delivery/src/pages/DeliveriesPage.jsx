import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { QrCode, Search, X, Package, MapPin, Phone, MessageCircle, Navigation, RefreshCw, CloudOff, ChevronRight, Store, Crosshair } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

import { useCourierDay, useShipmentDetailResolver } from '../context/LogisticsResolverContext'
import { courierScan, normalizeShipmentQr } from '../services/logistics'
import { getPendingActions, isNetworkError, runOrQueue, subscribeQueue } from '../services/offlineQueue'
import { COLLECTION_BADGE, deliveryLegUi, distanceKm, formatKm, groupByPartner } from '../utils/collections'
import { directionsLink, telLink, vibrate, whatsappLink } from '../utils/contact'

const GROUPS = [
  { key: 'transit', label: 'En livraison', empty: 'Aucun colis en route.' },
  { key: 'pickup', label: 'À récupérer', empty: 'Aucun colis à récupérer.' },
  { key: 'failed', label: 'Échecs à relancer', empty: 'Aucun échec.' },
  { key: 'available', label: 'Disponibles au dépôt', empty: 'Aucun colis disponible.' },
  { key: 'delivered', label: "Livrées aujourd'hui", empty: "Aucune livraison aujourd'hui." },
]

const TABS = [
  { label: 'Tout', value: '' },
  { label: 'Collectes', value: 'collect' },
  { label: 'En livraison', value: 'transit' },
  { label: 'À récupérer', value: 'pickup' },
  { label: 'Échecs', value: 'failed' },
  { label: 'Livrées', value: 'delivered' },
]

// Compatibilité des anciens liens (?status=EN_PREPARATION…)
const LEGACY_STATUS_TAB = { EN_PREPARATION: 'pickup', EN_COURS: 'transit', ECHEC: 'failed', LIVREE: 'delivered' }

function toStatusUi(status) {
  const s = `${status || ''}`.trim().toUpperCase()
  if (s === 'EN_PREPARATION') return { label: 'À récupérer', className: 'bg-neutral-200 text-neutral-800' }
  if (s === 'EN_COURS') return { label: 'En livraison', className: 'bg-blue-100 text-blue-800' }
  if (s === 'LIVREE') return { label: 'Livrée', className: 'bg-green-100 text-green-800' }
  if (s === 'ECHEC') return { label: 'Échec', className: 'bg-red-100 text-red-800' }
  return { label: s || '-', className: 'bg-neutral-100 text-neutral-700' }
}

function groupOf(shipment, mine) {
  const status = `${shipment?.status || ''}`.toUpperCase()
  if (!mine) return 'available'
  if (status === 'EN_COURS') return 'transit'
  if (status === 'EN_PREPARATION') return 'pickup'
  if (status === 'ECHEC') return 'failed'
  return 'delivered'
}

function matches(shipment, query) {
  if (!query) return true
  const haystack = [
    shipment?.orderId,
    shipment?.trackingId,
    shipment?.handoffCode,
    shipment?.customerName,
    shipment?.customerAddress,
    shipment?.customerPhone,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query.toLowerCase())
}

function formatAgo(timestamp) {
  if (!timestamp) return ''
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000))
  if (seconds < 10) return "à l'instant"
  if (seconds < 60) return `il y a ${seconds} s`
  const minutes = Math.round(seconds / 60)
  return `il y a ${minutes} min`
}

function formatTime(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/** Message explicite (en français) selon la cause de l'échec d'ouverture de la caméra. */
function cameraErrorMessage(err) {
  const raw = `${err?.name || ''} ${err?.message || err || ''}`
  if (typeof window !== 'undefined' && window.isSecureContext === false) {
    return 'La caméra nécessite une connexion sécurisée (https). Saisissez le code du colis ci-dessous.'
  }
  if (/NotAllowed|Permission|denied|SecurityError/i.test(raw)) {
    return 'Autorisez la caméra dans les réglages du navigateur, ou saisissez le code du colis ci-dessous.'
  }
  if (/NotFound|DevicesNotFound|no camera|Requested device not found|OverconstrainedError/i.test(raw)) {
    return 'Aucune caméra détectée : saisissez le code du colis ci-dessous.'
  }
  if (/NotReadable|TrackStart|Could not start|in use|AbortError/i.test(raw)) {
    return 'La caméra est utilisée par une autre application. Fermez-la ou saisissez le code du colis ci-dessous.'
  }
  if (/not supported|NotSupported|mediaDevices|undefined/i.test(raw)) {
    return 'La caméra nécessite une connexion sécurisée (https) et un navigateur compatible. Saisissez le code du colis ci-dessous.'
  }
  return 'Impossible de démarrer la caméra : saisissez le code du colis ci-dessous.'
}

function QuickLink({ href, label, icon, className, external }) {
  const Icon = icon
  if (!href) return null
  return (
    <a
      href={href}
      onClick={(event) => {
        event.stopPropagation()
        vibrate(15)
      }}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold active:scale-[0.97] transition-transform ${className}`}
    >
      <Icon size={18} /> {label}
    </a>
  )
}

function MissionCard({ shipment, group, pending, maxAttempts, onOpen, distance }) {
  const badge = toStatusUi(shipment?.status)
  const leg = deliveryLegUi(shipment)
  const canContact = group === 'transit' || group === 'pickup' || group === 'failed'
  const phone = shipment?.customerPhone
  const directions = directionsLink({
    latitude: shipment?.customerLatitude,
    longitude: shipment?.customerLongitude,
    address: shipment?.customerAddress,
  })
  return (
    <div className="w-full rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
              <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${leg.className}`}>{leg.label}</span>
              {distance != null ? <span className="text-xs font-bold text-neutral-500">{formatKm(distance)}</span> : null}
              {pending ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
                  <CloudOff size={12} /> En attente d’envoi
                </span>
              ) : null}
              {group === 'failed' ? (
                <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
                  Tentative {shipment?.failedAttempts || 0}/{maxAttempts}
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 truncate text-lg font-black text-neutral-900">
              {shipment?.customerName || `Commande ${shipment?.orderId || shipment?.id}`}
            </h3>
            <p className="text-sm font-semibold text-neutral-500">
              Cde {shipment?.orderId || '-'}
              {shipment?.handoffCode ? ` · ${shipment.handoffCode}` : ''}
              {group === 'delivered' && shipment?.deliveredAt ? ` · livrée à ${formatTime(shipment.deliveredAt)}` : ''}
            </p>
          </div>
          <ChevronRight size={22} className="mt-1 shrink-0 text-neutral-400" />
        </div>
        {group === 'available' ? (
          <p className="mt-3 text-sm font-medium text-neutral-600">Scannez le colis au dépôt pour le prendre en charge.</p>
        ) : (
          <div className="mt-3 flex items-start gap-2 text-sm text-neutral-700">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2 font-medium">{shipment?.customerAddress || 'Adresse non renseignée'}</span>
          </div>
        )}
      </button>
      {canContact && (phone || directions) ? (
        <div className="mt-3 flex gap-2">
          <QuickLink href={telLink(phone)} label="Appeler" icon={Phone} className="bg-green-600 text-white" />
          <QuickLink
            href={whatsappLink(phone, `Bonjour, je suis votre livreur LID pour la commande ${shipment?.orderId || ''}.`)}
            label="WhatsApp"
            icon={MessageCircle}
            className="bg-[#25D366]/15 text-[#0b6b34]"
            external
          />
          <QuickLink href={directions} label="Itinéraire" icon={Navigation} className="bg-neutral-900 text-white" external />
        </div>
      ) : null}
    </div>
  )
}

/** Une boutique = un passage : tous ses colis à retirer pour l'entrepôt LID. */
function PartnerCollectionCard({ group, distance, onOpen }) {
  const { counts, partner } = group
  const phone = partner?.phone
  const directions = directionsLink({ latitude: partner?.latitude, longitude: partner?.longitude, address: partner?.address })
  const parts = []
  if (counts.toPickup) parts.push(`${counts.toPickup} à retirer`)
  if (counts.available) parts.push(`${counts.available} disponible${counts.available > 1 ? 's' : ''}`)
  if (counts.collected) parts.push(`${counts.collected} vers l’entrepôt`)
  if (counts.deposited) parts.push(`${counts.deposited} déposé${counts.deposited > 1 ? 's' : ''}`)
  return (
    <div className="w-full rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${COLLECTION_BADGE.className}`}>{COLLECTION_BADGE.label}</span>
              {counts.late ? <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700">{counts.late} en retard</span> : null}
              {distance != null ? <span className="text-xs font-bold text-neutral-500">{formatKm(distance)}</span> : null}
            </div>
            <h3 className="mt-2 flex items-center gap-2 truncate text-lg font-black text-neutral-900">
              <Store size={18} className="shrink-0" /> {group.label}
            </h3>
            <p className="text-sm font-semibold text-neutral-500">
              {group.items.length} colis · {parts.join(' · ')}
            </p>
          </div>
          <ChevronRight size={22} className="mt-1 shrink-0 text-neutral-400" />
        </div>
        <div className="mt-3 flex items-start gap-2 text-sm text-neutral-700">
          <MapPin size={16} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2 font-medium">{partner?.address || 'Adresse de retrait non renseignée'}</span>
        </div>
      </button>
      {phone || directions ? (
        <div className="mt-3 flex gap-2">
          <QuickLink href={telLink(phone)} label="Appeler" icon={Phone} className="bg-green-600 text-white" />
          <QuickLink href={directions} label="Itinéraire" icon={Navigation} className="bg-neutral-900 text-white" external />
        </div>
      ) : null}
    </div>
  )
}

export default function DeliveriesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [manualQr, setManualQr] = useState('')
  const [pending, setPending] = useState(() => getPendingActions())
  const [sortMode, setSortMode] = useState('age') // age | near
  const [position, setPosition] = useState(null)
  const [positionError, setPositionError] = useState('')
  const [, setClock] = useState(0)
  const html5QrCodeRef = useRef(null)
  const isScanningRef = useRef(false)

  const rawTab = `${searchParams.get('tab') || ''}`.trim()
  const legacyStatus = `${searchParams.get('status') || ''}`.trim().toUpperCase()
  const activeTab = TABS.find((t) => t.value === (rawTab || LEGACY_STATUS_TAB[legacyStatus] || '')) || TABS[0]
  const { data, error, isLoading, updatedAt, refresh } = useCourierDay()
  const { prime } = useShipmentDetailResolver(null, { enabled: false })

  useEffect(() => subscribeQueue(() => setPending(getPendingActions())), [])
  useEffect(() => {
    const timer = window.setInterval(() => setClock((n) => n + 1), 15_000)
    return () => window.clearInterval(timer)
  }, [])

  const maxAttempts = Number(data?.maxDeliveryAttempts) || 3
  const grouped = useMemo(() => {
    const result = Object.fromEntries(GROUPS.map((g) => [g.key, []]))
    const query = q.trim()
    ;(Array.isArray(data?.shipments) ? data.shipments : []).forEach((shipment) => {
      if (matches(shipment, query)) result[groupOf(shipment, true)].push(shipment)
    })
    ;(Array.isArray(data?.available) ? data.available : []).forEach((shipment) => {
      if (matches(shipment, query)) result.available.push(shipment)
    })
    // Les plus anciens d'abord : premier arrivé, premier servi
    const byAge = (x, y) => `${x?.createdAt || ''}`.localeCompare(`${y?.createdAt || ''}`)
    result.transit.sort(byAge)
    result.pickup.sort(byAge)
    result.failed.sort(byAge)
    result.delivered.sort((x, y) => `${y?.deliveredAt || ''}`.localeCompare(`${x?.deliveredAt || ''}`))
    return result
  }, [data, q])

  // Tri par proximité : position demandée seulement quand le livreur choisit ce tri
  const chooseSort = (mode) => {
    setSortMode(mode)
    if (mode !== 'near' || position) return
    if (!navigator?.geolocation) {
      setPositionError('Géolocalisation indisponible sur cet appareil.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lng: p.coords.longitude })
        setPositionError('')
      },
      () => setPositionError('Position indisponible : activez la localisation pour trier par proximité.'),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
  }
  const distanceTo = (target) => (sortMode === 'near' && position ? distanceKm(position, target) : null)
  const byNear = (target) => (x, y) => {
    const dx = distanceTo(target(x))
    const dy = distanceTo(target(y))
    if (dx == null && dy == null) return 0
    if (dx == null) return 1
    if (dy == null) return -1
    return dx - dy
  }
  const customerPoint = (sh) => ({ latitude: sh?.customerLatitude, longitude: sh?.customerLongitude })
  if (sortMode === 'near' && position) {
    ;['transit', 'pickup', 'failed'].forEach((key) => grouped[key].sort(byNear(customerPoint)))
  }

  const collectionGroups = useMemo(() => {
    const query = q.trim().toLowerCase()
    const groups = groupByPartner(data?.collections?.mine || [], data?.collections?.available || []).filter((group) => {
      if (!query) return true
      const haystack = [group.label, group.partner?.address, group.partner?.phone, ...group.items.map((i) => i?.shipment?.orderId)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
    // Mes collectes d'abord, puis les plus anciennes (ou les plus proches)
    groups.sort((x, y) => {
      const ownX = x.counts.toPickup + x.counts.collected > 0 ? 0 : 1
      const ownY = y.counts.toPickup + y.counts.collected > 0 ? 0 : 1
      if (ownX !== ownY) return ownX - ownY
      return `${x.oldest}`.localeCompare(`${y.oldest}`)
    })
    if (sortMode === 'near' && position) groups.sort(byNear((g) => g.partner))
    return groups
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, q, sortMode, position])
  const collectCount = collectionGroups.reduce((total, g) => total + g.items.filter((i) => i?.collection?.status !== 'COLLECTEE' || !i?.collection?.depositedAt).length, 0)
  const showCollections = !activeTab.value || activeTab.value === 'collect'

  const visibleGroups = GROUPS.filter((group) => {
    if (activeTab.value === 'collect') return false
    if (!activeTab.value) return true
    if (activeTab.value === 'pickup') return group.key === 'pickup' || group.key === 'available'
    return group.key === activeTab.value
  })
  const countFor = (tab) => {
    if (tab === 'collect') return collectCount
    if (!tab) return collectCount + GROUPS.reduce((total, g) => total + (g.key === 'delivered' ? 0 : grouped[g.key].length), 0)
    if (tab === 'pickup') return grouped.pickup.length + grouped.available.length
    return grouped[tab]?.length || 0
  }
  const pendingIds = new Set(pending.map((action) => `${action.shipmentId}`))
  const totalShown = visibleGroups.reduce((total, g) => total + grouped[g.key].length, 0) + (showCollections ? collectionGroups.length : 0)

  const stopScan = async () => {
    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop()
        }
        html5QrCodeRef.current.clear()
        html5QrCodeRef.current = null
      }
    } catch (err) {
      console.error('Stop scan error', err)
    }
  }

  const submitScan = async (qrValue) => {
    const qr = normalizeShipmentQr(qrValue)
    if (!qr || isScanningRef.current) return

    isScanningRef.current = true
    setScanLoading(true)
    setScanError('')
    await stopScan()

    try {
      // Scan unique : retrait d'une collecte (option B, avant l'entrepôt) ou prise en charge d'une livraison
      const result = await courierScan(qr)
      if (result?.legType === 'COLLECTE' && result?.collection) {
        vibrate([40, 40, 40])
        refresh().catch(() => {})
        setScanOpen(false)
        setManualQr('')
        const partnerId = result.collection.partner?.partnerId || result.collection.shipment?.shipperId
        navigate(`/deliveries/collect/${encodeURIComponent(partnerId)}`)
        return
      }
      const detail = result?.delivery
      if (detail?.id) {
        vibrate([40, 40, 40])
        sessionStorage.setItem('lid_last_scanned_shipment', JSON.stringify(detail))
        prime(detail)
        refresh().catch(() => {})
        setScanOpen(false)
        setManualQr('')
        navigate(`/deliveries/${encodeURIComponent(detail.id)}`)
        return
      }
      setScanError('Scan OK mais expédition introuvable.')
    } catch (err) {
      vibrate(200)
      if (isNetworkError(err) || !err?.status) {
        // Hors ligne : seul un retrait de collecte peut être enregistré et rejoué (idempotent côté serveur)
        try {
          await runOrQueue('collect', qr, { qr, proof: 'SCAN' })
        } catch {
          // ignoré : message ci-dessous
        }
        setScanError(
          'Pas de réseau : si c’est un retrait de collecte chez une boutique, il est enregistré et sera envoyé au retour du réseau. Une prise en charge de livraison doit être faite en ligne.',
        )
      } else {
        setScanError(err?.message || 'Impossible de démarrer la livraison.')
      }
    } finally {
      setScanLoading(false)
      isScanningRef.current = false
    }
  }

  useEffect(() => {
    if (!scanOpen) {
      stopScan()
      setScanError('')
      setScanLoading(false)
      isScanningRef.current = false
      return
    }

    const timer = setTimeout(async () => {
      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode('reader')
        }

        const qrBoxSize = Math.min(window.innerWidth, window.innerHeight) * 0.7
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: qrBoxSize, height: qrBoxSize },
            aspectRatio: window.innerWidth / window.innerHeight,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          },
          (decodedText) => {
            submitScan(decodedText)
          },
          () => {},
        )
      } catch (err) {
        console.error(err)
        setScanError(cameraErrorMessage(err))
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      stopScan()
    }
  }, [scanOpen])

  return (
    <div className="pb-24 space-y-5">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-900">Mes missions</h1>
            <p className="text-xs font-semibold text-neutral-500">
              {isLoading && !updatedAt ? 'Chargement…' : updatedAt ? `Mis à jour ${formatAgo(updatedAt)}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => refresh().catch(() => {})}
              className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800"
              aria-label="Actualiser"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              className="h-12 bg-black text-white px-5 rounded-2xl text-base font-bold flex items-center gap-2"
            >
              <QrCode size={20} /> Scanner
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Client, commande, adresse…"
            className="w-full bg-neutral-100 border-none rounded-2xl py-3 pl-12 pr-10 text-base font-medium outline-none focus:ring-2 focus:ring-[#6aa200]"
          />
          {q ? (
            <button type="button" onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" aria-label="Effacer">
              <X size={18} className="text-neutral-500" />
            </button>
          ) : null}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => {
            const active = tab.value === activeTab.value
            const count = countFor(tab.value)
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setSearchParams(tab.value ? { tab: tab.value } : {})}
                className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-bold transition-colors ${
                  active ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 ${active ? 'text-white/80' : 'text-neutral-500'}`}>{count}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex items-center gap-2" role="group" aria-label="Tri des missions">
          {[
            { value: 'age', label: 'Plus anciennes' },
            { value: 'near', label: 'Proximité' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => chooseSort(option.value)}
              aria-pressed={sortMode === option.value}
              className={`flex items-center gap-1 whitespace-nowrap px-3 py-2 rounded-full text-xs font-bold ${
                sortMode === option.value ? 'bg-[#6aa200] text-white' : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              {option.value === 'near' ? <Crosshair size={14} /> : null}
              {option.label}
            </button>
          ))}
          {positionError && sortMode === 'near' ? <span className="text-xs font-semibold text-red-600">{positionError}</span> : null}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-semibold border border-red-200">
          {data ? `Dernière actualisation impossible : ${error}. Les informations affichées peuvent dater.` : error}
        </div>
      ) : null}

      {totalShown === 0 && !isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-neutral-400" />
          </div>
          <p className="text-neutral-600 font-semibold">{q ? 'Aucune mission ne correspond.' : 'Aucune mission pour le moment.'}</p>
        </div>
      ) : (
        <>
        {showCollections && (collectionGroups.length > 0 || activeTab.value === 'collect') ? (
          <section className="space-y-3">
            <h2 className="px-1 text-sm font-black uppercase tracking-wider text-neutral-500">
              Collectes boutique → entrepôt <span className="text-neutral-400">({collectionGroups.length} boutique{collectionGroups.length > 1 ? 's' : ''})</span>
            </h2>
            {collectionGroups.length === 0 ? (
              <p className="px-1 text-sm text-neutral-500">Aucune collecte à faire.</p>
            ) : (
              collectionGroups.map((group) => (
                <PartnerCollectionCard
                  key={group.partnerId}
                  group={group}
                  distance={distanceTo(group.partner)}
                  onOpen={() => navigate(`/deliveries/collect/${encodeURIComponent(group.partnerId)}`)}
                />
              ))
            )}
          </section>
        ) : null}
        {visibleGroups.map((group) => {
          const list = grouped[group.key]
          if (list.length === 0 && (!activeTab.value || group.key === 'available')) return null
          return (
            <section key={group.key} className="space-y-3">
              <h2 className="px-1 text-sm font-black uppercase tracking-wider text-neutral-500">
                {group.label} <span className="text-neutral-400">({list.length})</span>
              </h2>
              {list.length === 0 ? (
                <p className="px-1 text-sm text-neutral-500">{group.empty}</p>
              ) : (
                list.map((shipment) => (
                  <MissionCard
                    key={`${group.key}-${shipment?.id}`}
                    shipment={shipment}
                    group={group.key}
                    pending={pendingIds.has(`${shipment?.id}`)}
                    maxAttempts={maxAttempts}
                    distance={group.key === 'available' ? null : distanceTo(customerPoint(shipment))}
                    onOpen={() =>
                      group.key === 'available'
                        ? setScanOpen(true)
                        : navigate(`/deliveries/${encodeURIComponent(shipment.id)}`)
                    }
                  />
                ))
              )}
            </section>
          )
        })}
        </>
      )}

      {scanOpen && (
        <div className="fixed inset-0 z-[80] bg-black flex flex-col">
          <div className="p-4 flex justify-between items-center text-white">
            <h2 className="font-bold text-lg">Scanner QR Code</h2>
            <button onClick={() => setScanOpen(false)} className="p-2 bg-white/10 rounded-full">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 min-h-0 relative bg-black overflow-hidden">
            <div id="reader" className="w-full h-full object-cover"></div>
          </div>
          <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-white rounded-t-3xl max-h-[55dvh] overflow-y-auto">
            <p className="text-center font-bold text-neutral-900 mb-2">Ou saisir le code QR manuellement</p>
            <p className="text-center text-sm text-neutral-500 mb-4">
              Saisissez exactement le code affiché sous le QR, par exemple <span className="font-mono">A7K2P</span>.
            </p>
            <div className="flex gap-2">
              <input
                value={manualQr}
                onChange={(e) => setManualQr(e.target.value.toUpperCase())}
                className="flex-1 bg-neutral-100 rounded-xl px-4 py-3 font-mono font-bold outline-none focus:ring-2 focus:ring-[#6aa200]"
                placeholder="Code QR, ex: A7K2P"
              />
              <button
                onClick={() => submitScan(manualQr)}
                disabled={scanLoading}
                className="bg-black text-white px-6 rounded-xl font-bold disabled:opacity-50"
              >
                OK
              </button>
            </div>
            {scanError && <p className="text-red-500 text-sm font-bold text-center mt-4">{scanError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
