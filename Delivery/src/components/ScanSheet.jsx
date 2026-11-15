import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

import { vibrate } from '../utils/contact'

/** Message explicite selon la cause de l'échec d'ouverture de la caméra. */
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
  return 'Impossible de démarrer la caméra : saisissez le code du colis ci-dessous.'
}

/**
 * Scanner plein écran (même présentation que la prise en charge). `onCode(code, proof)` renvoie une promesse ;
 * en mode `continuous`, le scanner reste ouvert pour enchaîner les colis d'une même boutique.
 */
export default function ScanSheet({ open, onClose, onCode, title = 'Scanner QR Code', hint, continuous = false, feedback }) {
  const [manual, setManual] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const scannerRef = useRef(null)
  const busyRef = useRef(false)
  const lastRef = useRef({ code: '', at: 0 })
  const readerId = 'collect-reader'

  const stop = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) await scannerRef.current.stop()
        scannerRef.current.clear()
        scannerRef.current = null
      }
    } catch {
      // caméra déjà arrêtée
    }
  }

  const submit = async (value, proof) => {
    const code = `${value || ''}`.trim()
    if (!code || busyRef.current) return
    // Le même QR lu plusieurs fois par seconde par la caméra : un seul envoi
    const now = Date.now()
    if (lastRef.current.code === code && now - lastRef.current.at < 2500) return
    lastRef.current = { code, at: now }
    busyRef.current = true
    setBusy(true)
    setError('')
    try {
      await onCode(code, proof)
      vibrate([40, 40, 40])
      setManual('')
      if (!continuous) onClose()
    } catch (err) {
      vibrate(200)
      setError(err?.message || 'Code refusé.')
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!open) {
      stop()
      setError('')
      return undefined
    }
    const timer = setTimeout(async () => {
      try {
        if (!scannerRef.current) scannerRef.current = new Html5Qrcode(readerId)
        const box = Math.min(window.innerWidth, window.innerHeight) * 0.7
        await scannerRef.current.start(
          { facingMode: 'environment' },
          { fps: 15, qrbox: { width: box, height: box }, aspectRatio: window.innerWidth / window.innerHeight },
          (decoded) => submit(decoded, 'SCAN'),
          () => {},
        )
      } catch (err) {
        setError(cameraErrorMessage(err))
      }
    }, 100)
    return () => {
      clearTimeout(timer)
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col">
      <div className="p-4 flex justify-between items-center text-white">
        <h2 className="font-bold text-lg">{title}</h2>
        <button type="button" onClick={onClose} className="p-2 bg-white/10 rounded-full" aria-label="Fermer">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 min-h-0 relative bg-black overflow-hidden">
        <div id={readerId} className="w-full h-full object-cover"></div>
      </div>
      <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-white rounded-t-3xl max-h-[55dvh] overflow-y-auto">
        {feedback ? <div className="mb-3">{feedback}</div> : null}
        <p className="text-center font-bold text-neutral-900 mb-2">Ou saisir le code du colis</p>
        <p className="text-center text-sm text-neutral-500 mb-4">
          {hint || (
            <>
              Code affiché sous le QR de l’étiquette, par exemple <span className="font-mono">A7K2P</span>.
            </>
          )}
        </p>
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit(manual, 'SAISIE')
            }}
            className="flex-1 bg-neutral-100 rounded-xl px-4 py-3 font-mono font-bold outline-none focus:ring-2 focus:ring-[#6aa200]"
            placeholder="Code colis, ex: A7K2P"
            aria-label="Code du colis"
          />
          <button
            type="button"
            onClick={() => submit(manual, 'SAISIE')}
            disabled={busy}
            className="bg-black text-white px-6 rounded-xl font-bold disabled:opacity-50"
          >
            OK
          </button>
        </div>
        {error ? <p className="text-red-500 text-sm font-bold text-center mt-4">{error}</p> : null}
      </div>
    </div>
  )
}
