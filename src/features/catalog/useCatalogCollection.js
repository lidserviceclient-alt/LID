import { useQuery } from "@tanstack/react-query";
import { getCatalogCollection } from "@/services/productService";

export function useCatalogCollection(params) {
  return useQuery({
    queryKey: ["catalog-collection", params],
    queryFn: () => getCatalogCollection(params),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    retry: 1,
  });
}
