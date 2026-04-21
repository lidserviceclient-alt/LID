import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const financeResolverStore = createResolverStore(
  async (days, page, size) => backofficeApi.financeCollection(days, page, size),
  (days, page, size) => JSON.stringify({ days, page, size })
);

export function useFinanceResolver(days = 30, page = 0, size = 50) {
  return financeResolverStore.useResolver(days, page, size);
}

export async function reloadFinanceResolver(days = 30, page = 0, size = 50) {
  return financeResolverStore.load([days, page, size], { force: true });
}
