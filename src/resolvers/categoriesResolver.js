import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const categoriesResolverStore = createResolverStore(
  async (page = 0, size = 20) => backofficeApi.categories(page, size),
  (page = 0, size = 20) => JSON.stringify({ page, size })
);

export function useCategoriesResolver(page = 0, size = 20) {
  return categoriesResolverStore.useResolver(page, size);
}

export async function reloadCategoriesResolver(page = 0, size = 20) {
  return categoriesResolverStore.load([page, size], { force: true });
}
