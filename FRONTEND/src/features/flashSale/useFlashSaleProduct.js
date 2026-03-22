import { useQuery } from '@tanstack/react-query'
import { getFeaturedCatalogProducts } from '@/services/productService'

export function useFlashSaleProduct(limit = 1) {
  return useQuery({
    queryKey: ['flash-sale-product', limit],
    queryFn: async () => {
      const list = await getFeaturedCatalogProducts(limit)
      return Array.isArray(list) ? list : []
    },
    select: (list) => (Array.isArray(list) && list.length ? list[0] : null),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
  })
}

