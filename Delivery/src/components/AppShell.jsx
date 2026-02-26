import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Bell, Home, MapPinned, Package, User } from 'lucide-react'

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

function TopBar({ title, isOnline }) {
  return (
    <div className="pointer-events-auto mx-auto max-w-[430px] px-3">
      <div className="lid-glass rounded-[28px] border border-white/50 px-3.5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">LID Delivery</p>
            <p className="font-display truncate text-[15px] font-semibold text-slate-900">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">
                Hors ligne
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                En ligne
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BottomNav({ pathname }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto mx-auto max-w-[430px] px-3 pb-safe">
        <div className="relative rounded-t-[34px] border border-slate-200/70 bg-white/85 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
          <div className="flex items-end justify-between px-2 pt-3">
            {NAV_ITEMS.map((item) => {
              const active = isPathActive(pathname, item.to)
              if (item.isMain) {
                return (
                  <div key={item.to} className="relative -top-7 flex w-[84px] justify-center">
                    <NavLink
                      to={item.to}
                      className="group flex flex-col items-center justify-center"
                      aria-label={item.label}
                    >
                      <div
                        className={`grid h-[68px] w-[68px] place-items-center rounded-full border-[6px] border-white bg-[var(--lid-accent)] text-white shadow-[0_12px_28px_rgba(106,162,0,0.45)] transition ${
                          active ? 'scale-110' : 'group-active:scale-95'
                        }`}
                      >
                        <item.Icon size={26} strokeWidth={2.5} />
                      </div>
                      <span
                        className={`absolute -bottom-5 text-[10px] font-bold text-[var(--lid-accent)] transition ${
                          active ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                        }`}
                      >
                        {item.label}
                      </span>
                    </NavLink>
                  </div>
                )
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="group flex h-[56px] w-[70px] flex-col items-center justify-center gap-1 text-slate-400 transition"
                  aria-label={item.label}
                >
                  <item.Icon
                    size={22}
                    strokeWidth={active ? 2.6 : 2}
                    className={`transition ${active ? '-translate-y-1 text-[var(--lid-accent)]' : 'group-hover:text-slate-700'}`}
                  />
                  <span
                    className={`text-[10px] font-semibold transition ${
                      active ? 'translate-y-0 text-[var(--lid-accent)] opacity-100' : 'translate-y-2 opacity-0'
                    }`}
                  >
                    {item.label}
                  </span>
                  {active ? <span className="absolute bottom-2 h-1 w-1 rounded-full bg-[var(--lid-accent)]" /> : null}
                </NavLink>
              )
            })}
          </div>
          <div className="h-5" />
        </div>
      </div>
    </div>
  )
}

export default function AppShell() {
  const location = useLocation()
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const title = useMemo(() => {
    const path = location.pathname || ''
    if (path.startsWith('/deliveries/')) return 'Détails livraison'
    if (path.startsWith('/deliveries')) return 'Mes missions'
    if (path.startsWith('/map')) return 'Navigation'
    if (path.startsWith('/history')) return 'Historique'
    if (path.startsWith('/notifications')) return 'Notifications'
    if (path.startsWith('/support')) return 'Support'
    if (path.startsWith('/profile')) return 'Profil'
    return 'Tableau de bord'
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-noise">
      <div className="mx-auto min-h-dvh max-w-[430px]">
        <div className="fixed inset-x-0 top-0 z-40 pointer-events-none">
          <MotionSafeArea className="pt-3">
            <TopBar title={title} isOnline={isOnline} />
          </MotionSafeArea>
        </div>

        <main className="px-4 pb-[120px] pt-[96px]">{/* bottom nav + top bar spacing */}
          <Outlet />
        </main>

        <BottomNav pathname={location.pathname || ''} />
      </div>
    </div>
  )
}
