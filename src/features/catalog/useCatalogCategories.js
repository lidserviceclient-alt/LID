import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCatalogCategories } from "@/services/categoryService";
import { useCatalogBootstrap } from "@/features/catalog/CatalogBootstrapContext";

// Staging's database has no seeded categories yet; fall back to fixture
// data there so the menu isn't empty. The dynamic import keeps the fixture
// out of the production bundle entirely (Vite strips the dead branch since
// import.meta.env.MODE is statically known at build time).
const STAGING_FALLBACK_ENABLED = import.meta.env.MODE === "staging";

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

  const isLoading = Boolean(bootstrap?.isGlobalCollectionLoading) && !bootstrapCategories;
  const data = bootstrapCategories || query.data || [];
  const needsStagingFallback = STAGING_FALLBACK_ENABLED && !isLoading && data.length === 0;

  const [mockCategories, setMockCategories] = useState(null);
  useEffect(() => {
    if (needsStagingFallback && !mockCategories) {
      import("@/features/catalog/mockCategories").then((mod) => {
        setMockCategories(mod.MOCK_CATEGORIES);
      });
    }
  }, [needsStagingFallback, mockCategories]);

  return {
    data: needsStagingFallback ? (mockCategories || []) : data,
    isLoading,
    error: bootstrap?.globalCollectionError || query.error || null,
  };
}
