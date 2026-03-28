import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const financeResolverStore = createResolverStore(
  async (days, size) => backofficeApi.financeCollection(days, size),
  (days, size) => JSON.stringify({ days, size })
);

export function useFinanceResolver(days = 30, size = 50) {
  return financeResolverStore.useResolver(days, size);
}

export async function reloadFinanceResolver(days = 30, size = 50) {
  return financeResolverStore.load([days, size], { force: true });
}
