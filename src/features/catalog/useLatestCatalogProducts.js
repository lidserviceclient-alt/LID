import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLatestCatalogProducts } from "@/services/productService";
import { useCatalogBootstrap } from "@/features/catalog/CatalogBootstrapContext";

export function useLatestCatalogProducts(limit = 30) {
  const bootstrap = useCatalogBootstrap();
  const isHomeRoute = Boolean(bootstrap?.isHomeRoute);
  const seededList = useMemo(() => {
    const list = Array.isArray(bootstrap?.globalCollection?.latestProducts)
      ? bootstrap.globalCollection.latestProducts
      : [];
    return list.slice(0, Math.max(Number(limit) || 1, 1));
  }, [bootstrap?.globalCollection?.latestProducts, limit]);

  const query = useQuery({
    queryKey: ["latest-catalog-products", limit],
    queryFn: () => getLatestCatalogProducts(limit),
    enabled: !isHomeRoute,
    initialData: isHomeRoute ? seededList : undefined,
    staleTime: 30 * 1000,
    refetchOnMount: false,
    retry: 1,
  });

  if (isHomeRoute) {
    return {
      ...query,
      data: seededList,
      isLoading: Boolean(bootstrap?.isGlobalCollectionLoading) && seededList.length === 0,
      error: bootstrap?.globalCollectionError || null,
    };
  }

  return query;
}
