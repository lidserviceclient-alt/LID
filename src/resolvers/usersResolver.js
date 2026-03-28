import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const usersResolverStore = createResolverStore(
  async (page, size, role, q) => backofficeApi.users(page, size, role, q),
  (page, size, role, q) => JSON.stringify({ page, size, role: role || "", q: q || "" })
);

export function useUsersResolver(page = 0, size = 200, role = "", q = "") {
  return usersResolverStore.useResolver(page, size, role, q);
}

export async function reloadUsersResolver(page = 0, size = 200, role = "", q = "") {
  return usersResolverStore.load([page, size, role, q], { force: true });
}
