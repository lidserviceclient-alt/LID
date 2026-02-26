import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'

import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'

const DEFAULT_CENTER = { lat: 5.3599517, lng: -4.0082563 } // Abidjan

function ensureDefaultIcons() {
  // Fix for bundled environments (Vite)
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2xUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
  })
}

function toLatLng(value) {
  if (!value) return null
  const lat = Number(value.lat)
  const lng = Number(value.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return L.latLng(lat, lng)
}

function createDotIcon(className) {
  return L.divIcon({
    className: '',
    html: `<div class="${className}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

export default function LiveTrackingMap({
  className,
  current,
  destination,
  route,
  follow = true,
  interactive = true,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const meMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const routeRef = useRef(null)

  const meIcon = useMemo(() => createDotIcon('lid-map-dot lid-map-dot--me'), [])
  const destIcon = useMemo(() => createDotIcon('lid-map-dot lid-map-dot--dest'), [])

  useEffect(() => {
    ensureDefaultIcons()
  }, [])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      detectRetina: true,
    }).addTo(map)

    map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 12)

    mapRef.current = map

    const onResize = () => {
      map.invalidateSize({ pan: false })
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handlers = ['dragging', 'scrollWheelZoom', 'doubleClickZoom', 'touchZoom', 'keyboard', 'boxZoom']
    handlers.forEach((key) => {
      const handler = map[key]
      if (!handler?.enable || !handler?.disable) return
      if (interactive) handler.enable()
      else handler.disable()
    })

    if (map.tap?.enable && map.tap?.disable) {
      if (interactive) map.tap.enable()
      else map.tap.disable()
    }
  }, [interactive])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const me = toLatLng(current)
    const dest = toLatLng(destination)

    if (me) {
      if (!meMarkerRef.current) {
        meMarkerRef.current = L.marker(me, { icon: meIcon, interactive: false }).addTo(map)
      } else {
        meMarkerRef.current.setLatLng(me)
      }
    } else if (meMarkerRef.current) {
      meMarkerRef.current.remove()
      meMarkerRef.current = null
    }

    if (dest) {
      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker(dest, { icon: destIcon, interactive: false }).addTo(map)
      } else {
        destMarkerRef.current.setLatLng(dest)
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove()
      destMarkerRef.current = null
    }

    const coords = Array.isArray(route?.coordinates) ? route.coordinates : null
    if (coords && coords.length >= 2) {
      const latlngs = coords
        .map((c) => toLatLng(c))
        .filter(Boolean)
      if (latlngs.length >= 2) {
        if (!routeRef.current) {
          routeRef.current = L.polyline(latlngs, {
            color: 'rgba(106,162,0,0.9)',
            weight: 4,
            opacity: 0.9,
          }).addTo(map)
        } else {
          routeRef.current.setLatLngs(latlngs)
        }
      }
    } else if (routeRef.current) {
      routeRef.current.remove()
      routeRef.current = null
    }

    map.invalidateSize({ pan: false })

    if (follow && me) {
      map.panTo(me, { animate: true, duration: 0.45 })
    } else if (!follow && me && dest) {
      const bounds = L.latLngBounds([me, dest])
      map.fitBounds(bounds.pad(0.22), { animate: true, duration: 0.5 })
    }
  }, [current, destination, destIcon, follow, meIcon, route])

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-slate-200 bg-white ${className || ''}`.trim()}
    >
      <div ref={containerRef} className="h-full min-h-[240px] w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/35" />
    </div>
  )
}
