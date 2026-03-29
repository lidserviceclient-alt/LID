import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigation, RefreshCw, MapPin } from 'lucide-react'

import LiveTrackingMap from '../components/map/LiveTrackingMap'
import {
  DEFAULT_DELIVERY_BOOTSTRAP_PARAMS,
  useDeliveryBootstrap,
  useShipmentDetailResolver,
  useShipmentDetailsPrefetch,
} from '../context/LogisticsResolverContext'
import { useGeolocation } from '../hooks/useGeolocation'
import { geocodeAddress } from '../services/geocoding'
import { getDrivingRoute } from '../services/routing'

function openExternalNav(address) {
  const addr = `${address || ''}`.trim()
  if (!addr) return
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}&travelmode=driving`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function MapPage() {
  const [selectedId, setSelectedId] = useState('')
  const [destination, setDestination] = useState(null)
  const [route, setRoute] = useState(null)
  const [follow, setFollow] = useState(true)

  const { position: currentPos, error: gpsError } = useGeolocation()
  const routeTimerRef = useRef(null)
  const { data, error, isLoading, refresh } = useDeliveryBootstrap(DEFAULT_DELIVERY_BOOTSTRAP_PARAMS)
  const shipments = Array.isArray(data?.activeShipments) ? data.activeShipments : []

  useShipmentDetailsPrefetch(shipments.map((shipment) => shipment?.id), { enabled: shipments.length > 0 })

  const { data: selectedDetail, error: detailError } = useShipmentDetailResolver(selectedId, {
    enabled: Boolean(selectedId),
  })

  useEffect(() => {
    if (!selectedId && shipments[0]?.id) {
      setSelectedId(String(shipments[0].id))
      return
    }
    if (selectedId && shipments.length > 0 && shipments.every((shipment) => String(shipment?.id) !== String(selectedId))) {
      setSelectedId(String(shipments[0]?.id || ''))
    }
  }, [selectedId, shipments])

  useEffect(() => {
    let canceled = false
    const run = async () => {
      const addr = `${selectedDetail?.customerAddress || ''}`.trim()
      if (!addr) {
        setDestination(null)
        return
      }
      try {
        const geo = await geocodeAddress(addr)
        if (canceled) return
        setDestination(geo)
      } catch {
        if (canceled) return
        setDestination(null)
      }
    }
    run()
    return () => {
      canceled = true
    }
  }, [selectedDetail?.customerAddress])

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
  }, [currentPos, destination])

  const eta = useMemo(() => {
    if (!route?.summary) return null
    const durationMin = Math.round(route.summary.totalTime / 60)
    const distanceKm = (route.summary.totalDistance / 1000).toFixed(1)
    return { duration: durationMin, distance: distanceKm }
  }, [route])

  return (
    <div className="space-y-4 pb-24 h-[calc(100vh-180px)] flex flex-col">
      {(error || detailError || gpsError) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 mx-4">
          {error || detailError || gpsError}
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

        {eta && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg z-10">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Trajet estimé</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{eta.duration} min</span>
              <span className="text-sm font-medium text-neutral-300">({eta.distance} km)</span>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setFollow((value) => !value)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
              follow ? 'bg-black text-white' : 'bg-white text-neutral-600'
            }`}
          >
            <MapPin size={20} />
          </button>
          <button
            onClick={refresh}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg text-neutral-600 active:bg-neutral-50"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

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

      <div className="pl-4">
        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Missions actives</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 pr-4 scrollbar-hide">
          {shipments.length === 0 ? (
            <div className="w-full bg-white p-4 rounded-2xl border border-neutral-100 text-neutral-500 text-sm">
              Aucune course en cours.
            </div>
          ) : (
            shipments.map((shipment) => {
              const active = String(shipment.id) === String(selectedId)
              return (
                <button
                  key={shipment.id}
                  onClick={() => setSelectedId(String(shipment.id))}
                  className={`min-w-[200px] p-4 rounded-2xl border text-left transition-all ${
                    active ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-neutral-900 border-neutral-200'
                  }`}
                >
                  <p className="font-bold text-lg">#{shipment.trackingId || shipment.id}</p>
                  <p className={`text-xs mt-1 ${active ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {shipment.customerAddress || 'Adresse inconnue'}
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
