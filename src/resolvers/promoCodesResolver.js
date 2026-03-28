import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const promoCodesResolverStore = createResolverStore(
  async (days) => backofficeApi.promoCodesCollection(days),
  (days) => JSON.stringify({ days })
);

export function usePromoCodesResolver(days) {
  return promoCodesResolverStore.useResolver(days);
}

export async function reloadPromoCodesResolver(days) {
  return promoCodesResolverStore.load([days], { force: true });
}
