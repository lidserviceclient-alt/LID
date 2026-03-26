import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getFeaturedCatalogProducts } from '@/services/productService'
import { useCatalogBootstrap } from '@/features/catalog/CatalogBootstrapContext'

export function useFlashSaleProduct(limit = 1) {
  const bootstrap = useCatalogBootstrap()
  const isHomeRoute = Boolean(bootstrap?.isHomeRoute)
  const seededList = useMemo(() => {
    const list = Array.isArray(bootstrap?.globalCollection?.featuredProducts)
      ? bootstrap.globalCollection.featuredProducts
      : []
    return list.slice(0, Math.max(Number(limit) || 1, 1))
  }, [bootstrap?.globalCollection?.featuredProducts, limit])

  const query = useQuery({
    queryKey: ['flash-sale-product', limit],
    queryFn: async () => {
      const list = await getFeaturedCatalogProducts(limit)
      return Array.isArray(list) ? list : []
    },
    enabled: !isHomeRoute,
    initialData: isHomeRoute ? seededList : undefined,
    select: (list) => (Array.isArray(list) && list.length ? list[0] : null),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnMount: false,
    retry: 1,
  })

  if (isHomeRoute) {
    return {
      ...query,
      data: seededList[0] || null,
      isLoading: Boolean(bootstrap?.isGlobalCollectionLoading) && seededList.length === 0,
      error: bootstrap?.globalCollectionError || null,
    }
  }

  return query
}
