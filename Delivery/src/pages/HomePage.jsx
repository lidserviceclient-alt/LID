import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, Package, Timer, TrendingUp } from 'lucide-react'

import { DEFAULT_DELIVERY_BOOTSTRAP_PARAMS, useDeliveryBootstrap } from '../context/LogisticsResolverContext'

const STATUS_KEY = 'lid_delivery_status'

function getSavedStatus() {
  try {
    return localStorage.getItem(STATUS_KEY) || 'OFFLINE'
  } catch {
    return 'OFFLINE'
  }
}

function saveStatus(value) {
  try {
    localStorage.setItem(STATUS_KEY, value)
  } catch {}
}

function formatNumber(value) {
  if (value == null) return '-'
  return new Intl.NumberFormat('fr-FR').format(Number(value))
}

function toStatusUi(status) {
  const s = `${status || ''}`.trim().toUpperCase()
  if (s === 'EN_PREPARATION') return { label: 'À récupérer', className: 'bg-neutral-100 text-neutral-700' }
  if (s === 'EN_COURS') return { label: 'En cours', className: 'bg-blue-50 text-blue-700' }
  if (s === 'LIVREE') return { label: 'Livrée', className: 'bg-green-50 text-green-700' }
  if (s === 'ECHEC') return { label: 'Échec', className: 'bg-red-50 text-red-700' }
  return { label: s || '-', className: 'bg-neutral-100 text-neutral-700' }
}

export default function HomePage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(getSavedStatus())
  const { data } = useDeliveryBootstrap(DEFAULT_DELIVERY_BOOTSTRAP_PARAMS)

  const isOnline = status === 'AVAILABLE' || status === 'DELIVERING'
  const kpis = data?.kpis || null
  const active = Array.isArray(data?.activeShipments) ? data.activeShipments.slice(0, 5) : []

  const toggleStatus = () => {
    const next = isOnline ? 'OFFLINE' : 'AVAILABLE'
    setStatus(next)
    saveStatus(next)
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-neutral-900">Bonjour, Livreur</h1>
            <p className="text-neutral-500 font-medium">Prêt à rouler ?</p>
          </div>
          <button
            onClick={toggleStatus}
            className={`w-14 h-8 rounded-full transition-colors relative ${isOnline ? 'bg-[#6aa200]' : 'bg-neutral-200'}`}
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <button
          onClick={() => navigate('/deliveries?status=EN_PREPARATION')}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isOnline ? 'bg-black text-white shadow-lg shadow-black/20' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
          disabled={!isOnline}
        >
          {isOnline ? 'Trouver une mission' : 'Passez en ligne pour commencer'}
          {isOnline && <ArrowRight size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Courses</p>
          <p className="text-2xl font-black text-neutral-900">{formatNumber(kpis?.inTransitCount || 0)}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100">
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-3">
            <Timer size={20} />
          </div>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Temps moy.</p>
          <p className="text-2xl font-black text-neutral-900">{formatNumber(kpis?.avgDelayDays || 0)}j</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between px-2 mb-4">
          <h2 className="text-lg font-bold text-neutral-900">En cours</h2>
          <Link to="/deliveries" className="text-sm font-bold text-[#6aa200]">Voir tout</Link>
        </div>

        <div className="space-y-3">
          {active.length === 0 ? (
            <div className="bg-neutral-50 rounded-3xl p-8 text-center border border-neutral-100">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Package size={24} className="text-neutral-300" />
              </div>
              <p className="text-neutral-500 font-medium">Aucune livraison active</p>
            </div>
          ) : (
            active.map((mission) => {
              const statusUi = toStatusUi(mission?.status)
              return (
                <Link
                  key={mission.id}
                  to={`/deliveries/${mission.id}`}
                  className="block bg-white p-4 rounded-3xl shadow-sm border border-neutral-100 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} className="text-neutral-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="min-w-0 flex-1 truncate text-[13px] font-bold text-neutral-900">
                          Commande {mission.orderNumber || mission.orderId || mission.id}
                        </h3>
                        <span className={`${statusUi.className} shrink-0 text-[10px] font-bold px-2 py-1 rounded-full`}>{statusUi.label}</span>
                      </div>
                      <p className="text-neutral-500 text-sm mt-1 truncate">
                        {mission.customerAddress || 'Adresse non disponible'}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
