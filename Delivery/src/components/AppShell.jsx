import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { AlertTriangle, Bell, Home, MapPinned, Package, User, X } from 'lucide-react'

import { useConnectivity } from '../hooks/useConnectivity'
import { dismissRejected } from '../services/offlineQueue'

const MotionSafeArea = ({ children, className }) => (
  <div className={`pt-safe ${className || ''}`.trim()}>{children}</div>
)

const NAV_ITEMS = [
  { to: '/deliveries', label: 'Missions', Icon: Package },
  { to: '/map', label: 'Carte', Icon: MapPinned },
  { to: '/home', label: 'Accueil', Icon: Home, isMain: true },
  { to: '/notifications', label: 'Actu', Icon: Bell },
  { to: '/profile', label: 'Profil', Icon: User },
]

function isPathActive(pathname, to) {
  if (!pathname || !to) return false
  if (to === '/home') return pathname === '/home'
  return pathname === to || pathname.startsWith(`${to}/`)
}

function ConnectionPill({ online, realtime, pendingCount }) {
  let label = 'En ligne'
  let tone = 'bg-[#6aa200]/10 text-[#3f6600] border-[#6aa200]/30'
  let dot = 'bg-[#6aa200]'
  if (!online) {
    label = pendingCount > 0 ? `Hors ligne · ${pendingCount} en attente` : 'Hors ligne'
    tone = 'bg-red-50 text-red-700 border-red-200'
    dot = 'bg-red-500'
  } else if (pendingCount > 0) {
    label = `Envoi… (${pendingCount})`
    tone = 'bg-amber-50 text-amber-800 border-amber-200'
    dot = 'bg-amber-500 animate-pulse'
  } else if (!realtime) {
    label = 'En ligne · synchro auto'
    tone = 'bg-neutral-100 text-neutral-700 border-neutral-200'
    dot = 'bg-neutral-500'
  }
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold text-xs border ${tone}`}
      title={realtime ? 'Mises à jour en temps réel' : 'Mises à jour automatiques toutes les 20 secondes'}
    >
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </div>
  )
}

function TopBar({ title, connectivity }) {
  return (
    <div className="pointer-events-auto w-full bg-white shadow-sm">
      <div className="mx-auto max-w-[430px] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200">
             <User size={20} className="text-neutral-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Livreur</span>
            <span className="text-base font-bold text-neutral-900 leading-none">{title}</span>
          </div>
        </div>
        
        <ConnectionPill
          online={connectivity.online}
          realtime={connectivity.realtime}
          pendingCount={connectivity.pending.length}
        />
      </div>
    </div>
  )
}

function BottomNav({ pathname }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div className="pointer-events-auto mx-auto max-w-[430px] bg-white border-t border-neutral-100 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-safe">
        <div className="flex items-center justify-between px-2 pt-2 pb-2">
          {NAV_ITEMS.map((item) => {
            const active = isPathActive(pathname, item.to)
            if (item.isMain) {
              return (
                <div key={item.to} className="relative -top-6">
                  <NavLink
                    to={item.to}
                    className="flex flex-col items-center justify-center"
                  >
                    <div
                      className={`h-14 w-14 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-transform ${
                        active ? 'bg-[#6aa200] scale-110' : 'bg-neutral-900'
                      }`}
                    >
                      <item.Icon size={24} className="text-white" strokeWidth={2.5} />
                    </div>
                  </NavLink>
                </div>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 w-16 py-2 transition-colors ${
                  active ? 'text-[#6aa200]' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <item.Icon size={24} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function AppShell() {
  const location = useLocation()
  const connectivity = useConnectivity()
  const isOnline = connectivity.online

  const title = useMemo(() => {
    const path = location.pathname || ''
    if (path.startsWith('/deliveries/')) return 'Livraison'
    if (path.startsWith('/deliveries')) return 'Missions'
    if (path.startsWith('/map')) return 'Carte'
    if (path.startsWith('/history')) return 'Historique'
    if (path.startsWith('/notifications')) return 'Activité'
    if (path.startsWith('/profile')) return 'Mon Profil'
    return 'Dashboard'
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-neutral-50 font-sans text-neutral-900">
      <div className="mx-auto min-h-dvh max-w-[430px] relative bg-white shadow-2xl overflow-hidden">
        <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
          <MotionSafeArea>
            <TopBar title={title} connectivity={connectivity} />
            {connectivity.rejected.map((action) => (
              <div
                key={action.key}
                className="pointer-events-auto mx-auto max-w-[430px] flex items-start gap-3 bg-red-600 px-4 py-3 text-sm font-semibold text-white"
              >
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <p className="flex-1">
                  Action non enregistrée (colis #{action.shipmentId}) : {action.error}
                </p>
                <button
                  type="button"
                  onClick={() => dismissRejected(action.key)}
                  className="-m-2 p-2"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </MotionSafeArea>
        </div>

        <main className="px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-20 h-full overflow-y-auto bg-neutral-50 min-h-screen">
          <Outlet context={{ isOnline }} />
        </main>

        <BottomNav pathname={location.pathname || ''} />
      </div>
    </div>
  )
}
