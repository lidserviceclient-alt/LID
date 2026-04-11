import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { QrCode, Search, X, Package, MapPin } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

import { DEFAULT_DELIVERY_BOOTSTRAP_PARAMS, useDeliveryBootstrap, useShipmentDetailResolver } from '../context/LogisticsResolverContext'
import { getShipments, scanShipment } from '../services/logistics'

const TABS = [
  { label: 'Toutes', value: '' },
  { label: 'À récupérer', value: 'EN_PREPARATION' },
  { label: 'En transit', value: 'EN_COURS' },
  { label: 'Livrées', value: 'LIVREE' },
  { label: 'Échecs', value: 'ECHEC' },
]

function toStatusUi(status) {
  const s = `${status || ''}`.trim().toUpperCase()
  if (s === 'EN_PREPARATION') return { label: 'À récupérer', className: 'bg-neutral-100 text-neutral-600' }
  if (s === 'EN_COURS') return { label: 'En transit', className: 'bg-blue-50 text-blue-700' }
  if (s === 'LIVREE') return { label: 'Livrée', className: 'bg-green-50 text-green-700' }
  if (s === 'ECHEC') return { label: 'Échec', className: 'bg-red-50 text-red-700' }
  return { label: s || '-', className: 'bg-neutral-100 text-neutral-600' }
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return `${value}`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function DeliveriesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [appliedQ, setAppliedQ] = useState('')
  const [filteredPage, setFilteredPage] = useState(null)
  const [filteredError, setFilteredError] = useState('')
  const [filteredLoading, setFilteredLoading] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [manualQr, setManualQr] = useState('')
  const html5QrCodeRef = useRef(null)
  const isScanningRef = useRef(false)

  const status = `${searchParams.get('status') || ''}`.trim().toUpperCase()
  const activeTab = useMemo(() => TABS.find((t) => t.value === status) || TABS[0], [status])
  const bootstrapParams = useMemo(
    () => ({
      ...DEFAULT_DELIVERY_BOOTSTRAP_PARAMS,
      status: '',
      q: '',
    }),
    [],
  )
  const { data, error: bootstrapError, isLoading: bootstrapLoading } = useDeliveryBootstrap(bootstrapParams)
  const { prime } = useShipmentDetailResolver(null, { enabled: false })
  const isUsingBootstrapList = !activeTab.value && !appliedQ
  const shipments = Array.isArray(
    isUsingBootstrapList ? data?.deliveriesPage?.content : filteredPage?.content,
  )
    ? (isUsingBootstrapList ? data?.deliveriesPage?.content : filteredPage?.content)
    : []
  const error = isUsingBootstrapList ? bootstrapError : filteredError
  const isLoading = isUsingBootstrapList ? bootstrapLoading : filteredLoading

  useEffect(() => {
    setQ('')
    setAppliedQ('')
    setFilteredPage(null)
    setFilteredError('')
  }, [activeTab.value])

  useEffect(() => {
    if (isUsingBootstrapList) {
      setFilteredPage(null)
      setFilteredError('')
      setFilteredLoading(false)
      return
    }

    let cancelled = false

    const run = async () => {
      setFilteredLoading(true)
      setFilteredError('')
      try {
        const page = await getShipments({
          page: 0,
          size: DEFAULT_DELIVERY_BOOTSTRAP_PARAMS.size,
          status: activeTab.value,
          q: appliedQ,
        })
        if (cancelled) return
        setFilteredPage(page || null)
      } catch (err) {
        if (cancelled) return
        setFilteredPage(null)
        setFilteredError(err?.message || 'Impossible de charger les missions.')
      } finally {
        if (!cancelled) {
          setFilteredLoading(false)
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [activeTab.value, appliedQ, isUsingBootstrapList])

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
    const qr = `${qrValue || ''}`.trim()
    if (!qr || isScanningRef.current) return

    isScanningRef.current = true
    setScanLoading(true)
    setScanError('')
    await stopScan()

    try {
      const detail = await scanShipment(qr)
      if (detail?.id) {
        localStorage.setItem('lid_last_scanned_shipment', JSON.stringify(detail))
        prime(detail)
        setScanOpen(false)
        setManualQr('')
        navigate(`/deliveries/${encodeURIComponent(detail.id)}`)
        return
      }
      setScanError('Scan OK mais expédition introuvable.')
    } catch (err) {
      setScanError(err?.message || 'Impossible de démarrer la livraison.')
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
        setScanError(`Erreur caméra: ${err?.message || 'Inconnue'}`)
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      stopScan()
    }
  }, [scanOpen])

  const applySearch = (event) => {
    event.preventDefault()
    setAppliedQ(q.trim())
  }

  return (
    <div className="pb-24 space-y-6">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-neutral-900">Missions</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setScanOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              <QrCode size={18} /> Scanner
            </button>
          </div>
        </div>

        <form onSubmit={applySearch} className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-neutral-50 border-none rounded-xl py-3 pl-12 pr-4 font-medium outline-none focus:ring-2 focus:ring-[#6aa200]"
          />
        </form>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => {
            const active = tab.value === activeTab.value
            return (
              <button
                key={tab.label}
                onClick={() => setSearchParams(tab.value ? { status: tab.value } : {})}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                  active ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {shipments.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-neutral-400" />
            </div>
            <p className="text-neutral-500 font-medium">Aucune mission trouvée</p>
          </div>
        ) : (
          shipments.map((shipment) => {
            const badge = toStatusUi(shipment?.status)
            return (
              <button
                key={shipment?.id}
                onClick={() => navigate(`/deliveries/${encodeURIComponent(shipment.id)}`)}
                className="w-full bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
                    <h3 className="font-bold text-neutral-900 mt-2 text-lg">#{shipment?.trackingId || shipment?.id}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">ETA</p>
                    <p className="font-mono font-bold text-neutral-900">{formatDate(shipment?.eta)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <MapPin size={16} />
                  <span className="truncate font-medium">{shipment?.customerAddress || 'Adresse inconnue'}</span>
                </div>
              </button>
            )
          })
        )}
      </div>

      {scanOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="p-4 flex justify-between items-center text-white">
            <h2 className="font-bold text-lg">Scanner QR Code</h2>
            <button onClick={() => setScanOpen(false)} className="p-2 bg-white/10 rounded-full">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 relative bg-black">
            <div id="reader" className="w-full h-full object-cover"></div>
          </div>
          <div className="p-6 bg-white rounded-t-3xl">
            <p className="text-center font-bold text-neutral-900 mb-2">Ou saisir le code QR manuellement</p>
            <p className="text-center text-sm text-neutral-500 mb-4">
              Saisissez exactement le code affiché sous le QR, par exemple <span className="font-mono">SHIP:123</span>.
            </p>
            <div className="flex gap-2">
              <input
                value={manualQr}
                onChange={(e) => setManualQr(e.target.value)}
                className="flex-1 bg-neutral-100 rounded-xl px-4 py-3 font-mono font-bold outline-none focus:ring-2 focus:ring-[#6aa200]"
                placeholder="Code QR, ex: SHIP:123"
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
