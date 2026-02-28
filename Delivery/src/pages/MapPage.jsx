import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigation, RefreshCw, MapPin } from 'lucide-react'

import LiveTrackingMap from '../components/map/LiveTrackingMap'
import { useGeolocation } from '../hooks/useGeolocation'
import { geocodeAddress } from '../services/geocoding'
import { getDrivingRoute } from '../services/routing'
import { getShipmentDetail, getShipments } from '../services/logistics'

function openExternalNav(address) {
  const addr = `${address || ''}`.trim()
  if (!addr) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}&travelmode=driving`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function MapPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shipments, setShipments] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [destination, setDestination] = useState(null)
  const [route, setRoute] = useState(null)
  const [follow, setFollow] = useState(true)

  const { position: currentPos, error: gpsError } = useGeolocation()
  const routeTimerRef = useRef(null)

  const loadShipments = async () => {
    setIsLoading(true)
    setError('')
    try {
      const page = await getShipments({ page: 0, size: 12, status: 'EN_COURS' })
      const list = Array.isArray(page?.content) ? page.content : []
      setShipments(list)
      if (!selectedId && list[0]?.id) {
        setSelectedId(list[0].id)
      }
    } catch (err) {
      setShipments([])
      setError(err?.message || 'Impossible de charger les missions.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadShipments()
  }, [])

  useEffect(() => {
    let canceled = false
    const run = async () => {
      if (!selectedId) {
        setSelectedDetail(null)
        setDestination(null)
        return
      }
      try {
        const detail = await getShipmentDetail(selectedId)
        if (canceled) return
        setSelectedDetail(detail || null)
        const addr = `${detail?.customerAddress || ''}`.trim()
        if (!addr) {
          setDestination(null)
          return
        }
        const geo = await geocodeAddress(addr)
        if (canceled) return
        setDestination(geo)
      } catch (err) {
        if (canceled) return
        setSelectedDetail(null)
        setDestination(null)
        setError(err?.message || 'Impossible de charger la mission.')
      }
    }
    run()
    return () => {
      canceled = true
    }
  }, [selectedId])

  useEffect(() => {
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
        const r = await getDrivingRoute(currentPos, destination)
        setRoute(r)
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
  }, [currentPos, destination])

  const eta = useMemo(() => {
    if (!route || !route.summary) return null
    const durationMin = Math.round(route.summary.totalTime / 60)
    const distanceKm = (route.summary.totalDistance / 1000).toFixed(1)
    return { duration: durationMin, distance: distanceKm }
  }, [route])

  return (
    <div className="space-y-4 pb-24 h-[calc(100vh-180px)] flex flex-col">
      {(error || gpsError) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 mx-4">
          {error || gpsError}
        </div>
      )}

      <div className="flex-1 relative rounded-3xl overflow-hidden shadow-sm border border-neutral-200 mx-4 bg-neutral-100">
        <LiveTrackingMap
          className="w-full h-full"
          current={currentPos}
          destination={destination}
          route={route}
          follow={follow}
          interactive={!follow}
        />
        
        {/* ETA & Distance Overlay */}
        {eta && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg z-10">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Trajet estimé</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{eta.duration} min</span>
              <span className="text-sm font-medium text-neutral-300">({eta.distance} km)</span>
            </div>
          </div>
        )}
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setFollow((v) => !v)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
              follow ? 'bg-black text-white' : 'bg-white text-neutral-600'
            }`}
          >
            <MapPin size={20} />
          </button>
          <button
            onClick={loadShipments}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg text-neutral-600 active:bg-neutral-50"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => openExternalNav(selectedDetail?.customerAddress)}
            disabled={!selectedDetail?.customerAddress}
            className="w-full bg-[#6aa200] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Navigation size={18} />
            Lancer Navigation
          </button>
        </div>
      </div>

      {/* Horizontal List of Active Missions */}
      <div className="pl-4">
        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Missions actives</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 pr-4 scrollbar-hide">
          {shipments.length === 0 ? (
            <div className="w-full bg-white p-4 rounded-2xl border border-neutral-100 text-neutral-500 text-sm">
              Aucune course en cours.
            </div>
          ) : (
            shipments.map((s) => {
              const active = s.id === selectedId
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`min-w-[200px] p-4 rounded-2xl border text-left transition-all ${
                    active
                      ? 'bg-black text-white border-black shadow-lg'
                      : 'bg-white text-neutral-900 border-neutral-200'
                  }`}
                >
                  <p className="font-bold text-lg">#{s.trackingId || s.id.slice(0, 6)}</p>
                  <p className={`text-xs mt-1 ${active ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {s.customerAddress || 'Adresse inconnue'}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
