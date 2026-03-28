import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const loyaltyResolverStore = createResolverStore(
  async (q, page, size, topLimit) => backofficeApi.loyaltyCollection(q, page, size, topLimit),
  (q, page, size, topLimit) => JSON.stringify({ q: q || "", page, size, topLimit })
);

export function useLoyaltyResolver(q = "", page = 0, size = 10, topLimit = 10) {
  return loyaltyResolverStore.useResolver(q, page, size, topLimit);
}

export async function reloadLoyaltyResolver(q = "", page = 0, size = 10, topLimit = 10) {
  return loyaltyResolverStore.load([q, page, size, topLimit], { force: true });
}
