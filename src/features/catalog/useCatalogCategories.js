import { useQuery } from "@tanstack/react-query";
import { getCatalogCategories } from "@/services/categoryService";
import { useCatalogBootstrap } from "@/features/catalog/CatalogBootstrapContext";

export function useCatalogCategories() {
  const bootstrap = useCatalogBootstrap();
  const bootstrapCategories = Array.isArray(bootstrap?.globalCollection?.categories)
    ? bootstrap.globalCollection.categories
    : null;

  const query = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: getCatalogCategories,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    enabled: false,
    retry: 1,
  });

  return {
    data: bootstrapCategories || query.data || [],
    isLoading: Boolean(bootstrap?.isGlobalCollectionLoading) && !bootstrapCategories,
    error: bootstrap?.globalCollectionError || query.error || null,
  };
}
