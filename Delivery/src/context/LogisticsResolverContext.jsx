import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { getDeliveryBootstrap, getShipmentDetailsCollection } from '../services/logistics'
import { subscribeDeliveryRealtime } from '../services/realtime'

const LogisticsResolverContext = createContext(null)

const EMPTY_BOOTSTRAP = Object.freeze({
  data: null,
  error: '',
  isLoading: false,
  loaded: false,
})

const EMPTY_DETAIL = Object.freeze({
  data: null,
  error: '',
  isLoading: false,
  loaded: false,
})

export const DEFAULT_DELIVERY_BOOTSTRAP_PARAMS = Object.freeze({
  days: 30,
  page: 0,
  size: 25,
  limit: 12,
  sortKey: 'createdAt_desc',
  status: '',
  carrier: '',
  q: '',
  deliveredPage: 0,
  deliveredSize: 10,
  deliveredStatus: 'LIVREE',
  deliveredCarrier: '',
  deliveredQ: '',
})

function normalizeBootstrapParams(params = {}) {
  return {
    days: params.days ?? '',
    page: params.page ?? 0,
    size: params.size ?? 20,
    limit: params.limit ?? '',
    sortKey: `${params.sortKey || ''}`.trim(),
    status: `${params.status || ''}`.trim().toUpperCase(),
    carrier: `${params.carrier || ''}`.trim(),
    q: `${params.q || ''}`.trim(),
    deliveredPage: params.deliveredPage ?? 0,
    deliveredSize: params.deliveredSize ?? 20,
    deliveredStatus: `${params.deliveredStatus || ''}`.trim().toUpperCase(),
    deliveredCarrier: `${params.deliveredCarrier || ''}`.trim(),
    deliveredQ: `${params.deliveredQ || ''}`.trim(),
  }
}

function bootstrapKey(params) {
  return JSON.stringify(normalizeBootstrapParams(params))
}

function normalizeDetailIds(ids) {
  const values = Array.isArray(ids) ? ids : [ids]
  return [...new Set(values.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0))]
}

function detailKey(id) {
  const value = Number(id)
  return Number.isFinite(value) && value > 0 ? String(value) : ''
}

export function LogisticsResolverProvider({ children }) {
  const [bootstraps, setBootstraps] = useState({})
  const [details, setDetails] = useState({})
  const bootstrapsRef = useRef({})
  const bootstrapInflightRef = useRef(new Map())
  const detailInflightRef = useRef(new Map())
  const refreshTimerRef = useRef(null)

  useEffect(() => {
    bootstrapsRef.current = bootstraps
  }, [bootstraps])

  const ensureBootstrap = async (params, { force = false } = {}) => {
    const normalized = normalizeBootstrapParams(params)
    const key = bootstrapKey(normalized)
    const current = bootstraps[key]

    if (!force && current?.loaded) {
      return current.data
    }

    const inflight = bootstrapInflightRef.current.get(key)
    if (inflight) {
      return inflight
    }

    setBootstraps((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || EMPTY_BOOTSTRAP),
        isLoading: true,
        error: '',
      },
    }))

    const request = getDeliveryBootstrap(normalized)
      .then((data) => {
        setBootstraps((prev) => ({
          ...prev,
          [key]: {
            data: data || null,
            error: '',
            isLoading: false,
            loaded: true,
          },
        }))
        return data || null
      })
      .catch((err) => {
        setBootstraps((prev) => ({
          ...prev,
          [key]: {
            data: prev[key]?.data || null,
            error: err?.message || 'Impossible de charger le bootstrap logistique.',
            isLoading: false,
            loaded: true,
          },
        }))
        throw err
      })
      .finally(() => {
        bootstrapInflightRef.current.delete(key)
      })

    bootstrapInflightRef.current.set(key, request)
    return request
  }

  const primeShipmentDetail = (detail) => {
    const key = detailKey(detail?.id)
    if (!key) return
    setDetails((prev) => ({
      ...prev,
      [key]: {
        data: detail || null,
        error: '',
        isLoading: false,
        loaded: true,
      },
    }))
  }

  const ensureShipmentDetails = async (ids, { force = false } = {}) => {
    const normalizedIds = normalizeDetailIds(ids)
    if (normalizedIds.length === 0) return []

    const pendingIds = normalizedIds.filter((id) => {
      const key = detailKey(id)
      const current = details[key]
      return force || !current?.loaded
    })

    if (pendingIds.length === 0) {
      return normalizedIds.map((id) => details[detailKey(id)]?.data).filter(Boolean)
    }

    const requestKey = pendingIds.join(',')
    const inflight = detailInflightRef.current.get(requestKey)
    if (inflight) {
      return inflight
    }

    setDetails((prev) => {
      const next = { ...prev }
      pendingIds.forEach((id) => {
        const key = detailKey(id)
        next[key] = {
          ...(prev[key] || EMPTY_DETAIL),
          isLoading: true,
          error: '',
        }
      })
      return next
    })

    const request = getShipmentDetailsCollection(pendingIds)
      .then((payload) => {
        const shipments = Array.isArray(payload?.shipments) ? payload.shipments : []
        const missingIds = Array.isArray(payload?.missingIds) ? payload.missingIds.map((id) => detailKey(id)) : []
        setDetails((prev) => {
          const next = { ...prev }
          pendingIds.forEach((id) => {
            const key = detailKey(id)
            const detail = shipments.find((item) => detailKey(item?.id) === key) || null
            next[key] = {
              data: detail,
              error: missingIds.includes(key) ? 'Livraison introuvable.' : '',
              isLoading: false,
              loaded: true,
            }
          })
          return next
        })
        return shipments
      })
      .catch((err) => {
        setDetails((prev) => {
          const next = { ...prev }
          pendingIds.forEach((id) => {
            const key = detailKey(id)
            next[key] = {
              data: prev[key]?.data || null,
              error: err?.message || 'Impossible de charger la livraison.',
              isLoading: false,
              loaded: true,
            }
          })
          return next
        })
        throw err
      })
      .finally(() => {
        detailInflightRef.current.delete(requestKey)
      })

    detailInflightRef.current.set(requestKey, request)
    return request
  }

  useEffect(() => {
    ensureBootstrap(DEFAULT_DELIVERY_BOOTSTRAP_PARAMS).catch(() => {})
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeDeliveryRealtime((event) => {
      if (event?.topic !== 'delivery.shipment.updated') {
        return
      }

      const runRefresh = () => {
        const entries = bootstrapsRef.current || {}
        Object.entries(entries).forEach(([key]) => {
          try {
            const params = JSON.parse(key)
            ensureBootstrap(params, { force: true }).catch(() => {})
          } catch {
            // ignore malformed keys
          }
        })
      }

      if (refreshTimerRef.current) {
        return
      }
      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null
        runRefresh()
      }, 800)
    }, ['delivery.shipment.updated'])

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
      unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      bootstraps,
      details,
      ensureBootstrap,
      ensureShipmentDetails,
      primeShipmentDetail,
    }),
    [bootstraps, details],
  )

  return <LogisticsResolverContext.Provider value={value}>{children}</LogisticsResolverContext.Provider>
}

function useLogisticsResolverContext() {
  const context = useContext(LogisticsResolverContext)
  if (!context) {
    throw new Error('useLogisticsResolverContext must be used within LogisticsResolverProvider')
  }
  return context
}

export function useDeliveryBootstrap(params = DEFAULT_DELIVERY_BOOTSTRAP_PARAMS) {
  const resolver = useLogisticsResolverContext()
  const normalized = useMemo(() => normalizeBootstrapParams(params), [params])
  const key = useMemo(() => bootstrapKey(normalized), [normalized])
  const state = resolver.bootstraps[key] || EMPTY_BOOTSTRAP

  useEffect(() => {
    if (state.loaded || state.isLoading) return
    resolver.ensureBootstrap(normalized).catch(() => {})
  }, [normalized, resolver, state.isLoading, state.loaded])

  return {
    ...state,
    refresh: () => resolver.ensureBootstrap(normalized, { force: true }),
  }
}

export function useShipmentDetailResolver(id, { enabled = true } = {}) {
  const resolver = useLogisticsResolverContext()
  const key = detailKey(id)
  const state = resolver.details[key] || EMPTY_DETAIL

  useEffect(() => {
    if (!enabled || !key || state.loaded || state.isLoading) return
    resolver.ensureShipmentDetails([key]).catch(() => {})
  }, [enabled, key, resolver, state.isLoading, state.loaded])

  return {
    ...state,
    refresh: () => resolver.ensureShipmentDetails([key], { force: true }),
    prime: resolver.primeShipmentDetail,
  }
}

export function useShipmentDetailsPrefetch(ids, { enabled = true } = {}) {
  const resolver = useLogisticsResolverContext()
  const normalizedIds = useMemo(() => normalizeDetailIds(ids), [ids])
  const joined = normalizedIds.join(',')

  useEffect(() => {
    if (!enabled || normalizedIds.length === 0) return
    resolver.ensureShipmentDetails(normalizedIds).catch(() => {})
  }, [enabled, joined, normalizedIds, resolver])
}
