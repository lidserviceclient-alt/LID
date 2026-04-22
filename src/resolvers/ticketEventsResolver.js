import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const ticketEventsResolverStore = createResolverStore(
  async (page = 0, size = 10) => backofficeApi.ticketEvents(page, size),
  (page = 0, size = 10) => JSON.stringify({ page, size })
);

export function useTicketEventsResolver(page = 0, size = 10) {
  return ticketEventsResolverStore.useResolver(page, size);
}

export async function reloadTicketEventsResolver(page = 0, size = 10) {
  return ticketEventsResolverStore.load([page, size], { force: true });
}
