import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const messagesResolverStore = createResolverStore(
  async (page, size) => backofficeApi.messages(page, size),
  (page, size) => JSON.stringify({ page, size })
);

export function useMessagesResolver(page = 0, size = 50) {
  return messagesResolverStore.useResolver(page, size);
}

export async function reloadMessagesResolver(page = 0, size = 50) {
  return messagesResolverStore.load([page, size], { force: true });
}
