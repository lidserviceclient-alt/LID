import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const returnsResolverStore = createResolverStore(
  async (page, size, status, q) => backofficeApi.returns(page, size, status, q),
  (page, size, status, q) => JSON.stringify({ page, size, status: status || "", q: q || "" })
);

export function useReturnsResolver(page = 0, size = 12, status = "", q = "") {
  return returnsResolverStore.useResolver(page, size, status, q);
}

export async function reloadReturnsResolver(page = 0, size = 12, status = "", q = "") {
  return returnsResolverStore.load([page, size, status, q], { force: true });
}
