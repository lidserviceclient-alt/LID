import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  CloudOff,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  Phone,
  QrCode,
  RefreshCw,
  Store,
  Warehouse,
} from 'lucide-react'

import ScanSheet from '../components/ScanSheet'
import { useCourierDay } from '../context/LogisticsResolverContext'
import { getPendingActions, runOrQueue, subscribeQueue } from '../services/offlineQueue'
import { COLLECTION_BADGE, collectionStatusUi } from '../utils/collections'
import { directionsLink, telLink, vibrate, whatsappLink } from '../utils/contact'

function ActionLink({ href, label, icon, className, external }) {
  const Icon = icon
  if (!href) return null
  return (
    <a
      href={href}
      onClick={() => vibrate(15)}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold active:scale-[0.97] transition-transform ${className}`}
    >
      <Icon size={18} /> {label}
    </a>
  )
}

function formatTime(value) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Tournée d'une boutique (option B) : retrait de tous ses colis en un passage (scan de chaque colis = preuve), puis
 * dépôt à l'entrepôt LID. La réception est faite par le personnel de l'entrepôt.
 */
export default function CollectionRoutePage() {
  const { partnerId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error, refresh } = useCourierDay()
  const [scanOpen, setScanOpen] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [selected, setSelected] = useState(() => new Set())
  const [depositing, setDepositing] = useState(false)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(() => getPendingActions())

  useEffect(() => subscribeQueue(() => setPending(getPendingActions())), [])

  const collections = data?.collections
  const items = useMemo(() => {
    const own = (collections?.mine || []).map((item) => ({ ...item, own: true }))
    const free = (collections?.available || []).map((item) => ({ ...item, own: false }))
    return [...own, ...free].filter((item) => `${item?.partner?.partnerId || item?.shipment?.shipperId}` === `${partnerId}`)
  }, [collections, partnerId])
  const partner = items[0]?.partner || null
  const warehouse = collections?.warehouse || null

  const toPickup = items.filter((i) => ['A_COLLECTER', 'AFFECTEE'].includes(i.collection?.status))
  const collected = items.filter((i) => i.own && i.collection?.status === 'COLLECTEE')
  const notDeposited = collected.filter((i) => !i.collection?.depositedAt)
  const pendingCollects = pending.filter((a) => a.type === 'collect')
  const pendingDeposits = new Set(pending.filter((a) => a.type === 'deposit').map((a) => `${a.shipmentId}`))

  // Par défaut, tous les colis retirés et pas encore déposés sont sélectionnés pour le dépôt
  useEffect(() => {
    setSelected(new Set(notDeposited.map((i) => i.shipment.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notDeposited.length])

  const onCode = async (code, proof) => {
    const outcome = await runOrQueue('collect', code, { qr: code, proof })
    if (outcome.queued) {
      setFeedback(
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900">
          <CloudOff size={16} /> Retrait {code} enregistré hors ligne : envoi automatique au retour du réseau.
        </p>,
      )
      return
    }
    const item = outcome.result
    const other = item?.partner?.partnerId && `${item.partner.partnerId}` !== `${partnerId}`
    setFeedback(
      <p className="flex items-center justify-center gap-2 rounded-2xl bg-[#6aa200]/10 p-3 text-sm font-bold text-[#3f6600]">
        <CheckCircle2 size={16} /> Colis {item?.shipment?.orderId || code} retiré
        {other ? ` (boutique ${item.partner.name})` : ''} · {Math.min(collected.length + 1, items.length)}/{items.length}
      </p>,
    )
    refresh().catch(() => {})
  }

  const deposit = async () => {
    const ids = [...selected]
    if (ids.length === 0) return
    setDepositing(true)
    setMessage('')
    let queued = 0
    let failed = ''
    for (const id of ids) {
      try {
        const outcome = await runOrQueue('deposit', id)
        if (outcome.queued) queued += 1
      } catch (err) {
        failed = err?.message || 'Dépôt refusé.'
      }
    }
    setDepositing(false)
    vibrate([40, 40, 40])
    setMessage(
      failed
        ? `Dépôt partiellement refusé : ${failed}`
        : queued
          ? `${ids.length} colis déposé(s), ${queued} en attente d’envoi (hors ligne).`
          : `${ids.length} colis déposé(s) à l’entrepôt : le personnel LID va les réceptionner.`,
    )
    refresh().catch(() => {})
  }

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const phone = partner?.phone
  const toShop = directionsLink({ latitude: partner?.latitude, longitude: partner?.longitude, address: partner?.address })
  const toWarehouse = directionsLink({
    latitude: warehouse?.latitude,
    longitude: warehouse?.longitude,
    address: warehouse?.address || 'Cocody Riviera 3, Abidjan',
  })

  return (
    <div className="pb-24 space-y-5">
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            type="button"
            onClick={() => navigate('/deliveries?tab=collect')}
            className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800"
            aria-label="Retour aux missions"
          >
            <ArrowLeft size={20} />
          </button>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${COLLECTION_BADGE.className}`}>{COLLECTION_BADGE.label}</span>
          <button
            type="button"
            onClick={() => refresh().catch(() => {})}
            className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800"
            aria-label="Actualiser"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
            <Store size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-neutral-900 truncate">{partner?.name || 'Boutique'}</h1>
            <p className="mt-1 flex items-start gap-1 text-sm font-medium text-neutral-600">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>{partner?.address || 'Adresse de retrait non renseignée : appelez la boutique.'}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <ActionLink href={telLink(phone)} label="Appeler" icon={Phone} className="bg-green-600 text-white" />
          <ActionLink
            href={whatsappLink(phone, 'Bonjour, je suis le livreur LID : je passe récupérer vos colis pour l’entrepôt LID.')}
            label="WhatsApp"
            icon={MessageCircle}
            className="bg-[#25D366]/15 text-[#0b6b34]"
            external
          />
          <ActionLink href={toShop} label="Itinéraire" icon={Navigation} className="bg-neutral-900 text-white" external />
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-semibold border border-red-200">{error}</div>
      ) : null}
      {pendingCollects.length > 0 ? (
        <div className="flex items-center gap-2 bg-amber-50 text-amber-900 p-4 rounded-2xl text-sm font-semibold border border-amber-200">
          <CloudOff size={16} /> {pendingCollects.length} retrait(s) scanné(s) hors ligne, en attente d’envoi.
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black uppercase tracking-wider text-neutral-500">
            1 · Retrait à la boutique <span className="text-neutral-400">({items.length - toPickup.length}/{items.length})</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setFeedback(null)
            setScanOpen(true)
          }}
          disabled={toPickup.length === 0}
          className="w-full h-14 bg-black text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <QrCode size={20} /> {toPickup.length > 0 ? `Scanner les colis (${toPickup.length} à retirer)` : 'Tous les colis sont retirés'}
        </button>
        <p className="px-1 text-xs font-medium text-neutral-500">
          Scannez le QR de chaque colis (ou saisissez son code) : c’est la preuve du retrait. Le code n’est connu que de la boutique.
        </p>
        {items.length === 0 && !isLoading ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-semibold">Aucune collecte en cours pour cette boutique.</p>
          </div>
        ) : (
          items.map((item) => {
            const ui = collectionStatusUi(item)
            const id = item.shipment?.id
            const canDeposit = item.own && item.collection?.status === 'COLLECTEE' && !item.collection?.depositedAt
            return (
              <label
                key={id}
                className={`flex w-full items-start gap-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm ${canDeposit ? 'cursor-pointer' : ''}`}
              >
                {canDeposit ? (
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 accent-[#6aa200]"
                    checked={selected.has(id)}
                    onChange={() => toggle(id)}
                    aria-label={`Déposer le colis ${item.shipment?.orderId}`}
                  />
                ) : (
                  <Package size={20} className="mt-0.5 shrink-0 text-neutral-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${ui.className}`}>{ui.label}</span>
                    {!item.own ? <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-700">Non affecté</span> : null}
                    {item.late ? <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700">En retard</span> : null}
                    {pendingDeposits.has(`${id}`) ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">
                        <CloudOff size={12} /> En attente d’envoi
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-base font-black text-neutral-900">Cde {item.shipment?.orderId || id}</p>
                  <p className="text-sm font-semibold text-neutral-500">
                    {item.itemCount || 0} article{item.itemCount > 1 ? 's' : ''}
                    {item.shipment?.handoffCode ? ` · ${item.shipment.handoffCode}` : ''}
                    {item.collection?.pickedUpAt ? ` · retiré à ${formatTime(item.collection.pickedUpAt)}` : ''}
                    {item.collection?.depositedAt ? ` · déposé à ${formatTime(item.collection.depositedAt)}` : ''}
                  </p>
                </div>
              </label>
            )
          })
        )}
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-black uppercase tracking-wider text-neutral-500">2 · Dépôt à l’entrepôt LID</h2>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-[#6aa200]/10 text-[#3f6600] rounded-2xl flex items-center justify-center shrink-0">
              <Warehouse size={24} />
            </div>
            <div className="min-w-0">
              <p className="font-black text-neutral-900">{warehouse?.name || 'Entrepôt LID'}</p>
              <p className="text-sm font-medium text-neutral-600">{warehouse?.address || 'Cocody Riviera 3, Abidjan'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ActionLink href={toWarehouse} label="Itinéraire entrepôt" icon={Navigation} className="bg-neutral-900 text-white" external />
          </div>
          <button
            type="button"
            onClick={deposit}
            disabled={selected.size === 0 || depositing}
            className="w-full h-14 bg-[#6aa200] text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Warehouse size={20} /> {depositing ? 'Envoi…' : `Déposé à l’entrepôt (${selected.size})`}
          </button>
          <p className="text-xs font-medium text-neutral-500">
            Remettez les colis au personnel de l’entrepôt : il les réceptionne et les contrôle. La livraison au client est
            ensuite confiée à un livreur (vous ou un autre).
          </p>
          {message ? <p className="text-sm font-bold text-neutral-800">{message}</p> : null}
        </div>
      </section>

      <ScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onCode={onCode}
        continuous
        title={`Retrait · ${partner?.name || 'boutique'}`}
        feedback={feedback}
      />
    </div>
  )
}
