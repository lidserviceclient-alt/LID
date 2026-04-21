import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const promoCodesResolverStore = createResolverStore(
  async (days, page = 0, size = 10) => backofficeApi.promoCodesCollection(days, page, size),
  (days, page = 0, size = 10) => JSON.stringify({ days, page, size })
);

export function usePromoCodesResolver(days, page = 0, size = 10) {
  return promoCodesResolverStore.useResolver(days, page, size);
}

export async function reloadPromoCodesResolver(days, page = 0, size = 10) {
  return promoCodesResolverStore.load([days, page, size], { force: true });
}
