import { apiRequest } from './http'

let cached = null
let inflight = null

export async function getPublicAppConfig() {
  if (cached) return cached
  if (inflight) return inflight
  inflight = apiRequest('/api/v1/public/app-config')
    .then((data) => {
      cached = data || null
      return cached
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

