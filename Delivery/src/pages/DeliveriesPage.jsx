import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, QrCode, RefreshCw, Search, X } from 'lucide-react'

import { getShipments, scanShipment } from '../services/logistics'

const MotionDiv = motion.div

const TABS = [
  { label: 'Toutes', value: '' },
  { label: 'À récupérer', value: 'EN_PREPARATION' },
  { label: 'En transit', value: 'EN_COURS' },
  { label: 'Livrées', value: 'LIVREE' },
  { label: 'Échecs', value: 'ECHEC' },
]

function toStatusUi(status) {
  const s = `${status || ''}`.trim().toUpperCase()
  if (s === 'EN_PREPARATION') return { label: 'À récupérer', className: 'bg-slate-100 text-slate-700' }
  if (s === 'EN_COURS') return { label: 'En transit', className: 'bg-sky-100 text-sky-700' }
  if (s === 'LIVREE') return { label: 'Livrée', className: 'bg-emerald-100 text-emerald-700' }
  if (s === 'ECHEC') return { label: 'Échec', className: 'bg-rose-100 text-rose-700' }
  return { label: s || '-', className: 'bg-slate-100 text-slate-700' }
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return `${value}`
  return d.toLocaleDateString('fr-FR', { dateStyle: 'medium' })
}

export default function DeliveriesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shipmentsPage, setShipmentsPage] = useState(null)
  const [q, setQ] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [manualQr, setManualQr] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const scanTimerRef = useRef(null)

  const status = `${searchParams.get('status') || ''}`.trim().toUpperCase()

  const activeTab = useMemo(() => {
    const found = TABS.find((t) => t.value === status)
    return found || TABS[0]
  }, [status])

  const load = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getShipments({
        page: 0,
        size: 25,
        status: activeTab.value,
        q: q.trim(),
      })
      setShipmentsPage(data || null)
    } catch (err) {
      setShipmentsPage(null)
      setError(err?.message || 'Impossible de charger les missions.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab.value])

  const shipments = Array.isArray(shipmentsPage?.content) ? shipmentsPage.content : []

  const stopScan = () => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }
  }

  const submitScan = async (qrValue) => {
    const qr = `${qrValue || ''}`.trim()
    if (!qr || scanLoading) return
    setScanLoading(true)
    setScanError('')
    try {
      const detail = await scanShipment(qr)
      if (detail?.id) {
        localStorage.setItem('lid_last_scanned_shipment', JSON.stringify(detail))
        try {
          const raw = localStorage.getItem('lid_scanned_shipments')
          const list = raw ? JSON.parse(raw) : []
          const items = Array.isArray(list) ? list : []
          const next = [detail, ...items.filter((x) => x?.id && x.id !== detail.id)].slice(0, 30)
          localStorage.setItem('lid_scanned_shipments', JSON.stringify(next))
        } catch {}
        stopScan()
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
    }
  }

  useEffect(() => {
    if (!scanOpen) {
      stopScan()
      setScanError('')
      setScanLoading(false)
      return
    }

    const start = async () => {
      const host = typeof window !== 'undefined' ? `${window.location?.hostname || ''}`.trim() : ''
      const isLocalhost = host === 'localhost' || host === '127.0.0.1'
      const isSecure = typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false
      if (!isSecure && !isLocalhost) {
        setScanError(
          'La caméra nécessite HTTPS sur mobile. Ouvre l’app en https (ou utilise la saisie manuelle du QR).'
        )
        return
      }

      const hasBarcodeDetector = typeof window !== 'undefined' && typeof window.BarcodeDetector === 'function'
      if (!hasBarcodeDetector) {
        setScanError('Scan caméra indisponible sur ce navigateur. Utilise la saisie manuelle du QR.')
        return
      }
      if (!navigator?.mediaDevices?.getUserMedia) {
        setScanError('Caméra indisponible (API navigateur manquante). Utilise la saisie manuelle du QR.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play()
        }
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
        scanTimerRef.current = setInterval(async () => {
          const v = videoRef.current
          if (!v || scanLoading) return
          try {
            const codes = await detector.detect(v)
            const first = Array.isArray(codes) && codes.length > 0 ? codes[0] : null
            const raw = first?.rawValue
            if (raw) {
              await submitScan(raw)
            }
          } catch {}
        }, 450)
      } catch (err) {
        setScanError(err?.message || 'Caméra indisponible (autorisation refusée ou contexte non sécurisé).')
      }
    }

    start()
    return () => stopScan()
  }, [scanOpen, scanLoading])

  const applySearch = (event) => {
    event.preventDefault()
    load()
  }

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
            <p className="font-display text-lg font-semibold text-slate-900">Mes missions</p>
            <p className="mt-1 text-xs text-slate-500">Filtre, recherche, et actions terrain.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--lid-accent)] px-3 py-2 text-xs font-bold text-white"
            >
              <QrCode size={16} />
              Scanner
            </button>
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

        <form onSubmit={applySearch} className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (ID, commande, transporteur...)"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white/70 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none focus:border-[var(--lid-accent)]"
            />
          </div>
        </form>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const active = t.value === activeTab.value
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setSearchParams(t.value ? { status: t.value } : {})}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  active
                    ? 'bg-[var(--lid-accent-soft)] text-[var(--lid-accent)]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="space-y-3">
        {shipments.length === 0 && !isLoading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
            Aucune mission pour ce filtre.
          </div>
        ) : (
          shipments.map((s) => {
            const badge = toStatusUi(s?.status)
            return (
              <button
                key={s?.id}
                type="button"
                onClick={() => navigate(`/deliveries/${encodeURIComponent(s.id)}`)}
                className="lid-card w-full rounded-[28px] p-4 text-left transition hover:-translate-y-[1px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {s?.trackingId || s?.id}
                    </p>
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
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${badge.className}`}>
                      {badge.label}
                    </span>
                    <ChevronRight className="text-slate-400" size={18} />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">ETA</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(s?.eta)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Frais</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{s?.cost ?? '-'}</p>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </section>

      {scanOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold text-slate-900">Scan QR</p>
                <p className="mt-1 text-xs text-slate-500">Scanne le QR de la commande pour passer en transit.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopScan()
                  setScanOpen(false)
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                <video ref={videoRef} className="h-56 w-full object-cover" muted playsInline />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Saisie manuelle</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={manualQr}
                    onChange={(e) => setManualQr(e.target.value)}
                    placeholder="Contenu QR (SHIP:... ou ORDER:...)"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-[var(--lid-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => submitScan(manualQr)}
                    disabled={scanLoading}
                    className="shrink-0 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {scanLoading ? '...' : 'Valider'}
                  </button>
                </div>
              </div>

              {scanError ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  {scanError}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </MotionDiv>
  )
}
