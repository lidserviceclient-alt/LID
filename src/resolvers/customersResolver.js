import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const customersResolverStore = createResolverStore(
  async (page, size, q, segment) => backofficeApi.customerCollection(page, size, q, segment),
  (page, size, q, segment) => JSON.stringify({ page, size, q: q || "", segment: segment || "" })
);

export function useCustomersResolver(page = 0, size = 50, q = "", segment = "") {
  return customersResolverStore.useResolver(page, size, q, segment);
}

export async function reloadCustomersResolver(page = 0, size = 50, q = "", segment = "") {
  return customersResolverStore.load([page, size, q, segment], { force: true });
}
