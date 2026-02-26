export async function getDrivingRoute(from, to) {
  if (!from || !to) return null
  const a = { lat: Number(from.lat), lng: Number(from.lng) }
  const b = { lat: Number(to.lat), lng: Number(to.lng) }
  if (![a.lat, a.lng, b.lat, b.lng].every(Number.isFinite)) return null

  const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return null
  const json = await res.json()
  const route = json?.routes?.[0]
  const coords = route?.geometry?.coordinates
  if (!Array.isArray(coords) || coords.length < 2) return null

  return {
    distanceMeters: Number(route.distance),
    durationSeconds: Number(route.duration),
    coordinates: coords
      .map((c) => (Array.isArray(c) && c.length >= 2 ? { lng: Number(c[0]), lat: Number(c[1]) } : null))
      .filter((c) => c && Number.isFinite(c.lat) && Number.isFinite(c.lng)),
  }
}

