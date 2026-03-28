import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const categoriesResolverStore = createResolverStore(async () => {
  const data = await backofficeApi.categories();
  return Array.isArray(data) ? data : [];
}, () => "categories");

export function useCategoriesResolver() {
  return categoriesResolverStore.useResolver();
}

export async function reloadCategoriesResolver() {
  return categoriesResolverStore.load([], { force: true });
}
