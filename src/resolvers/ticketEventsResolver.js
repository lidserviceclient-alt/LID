import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const ticketEventsResolverStore = createResolverStore(async () => {
  const data = await backofficeApi.ticketEvents();
  return Array.isArray(data) ? data : [];
}, () => "ticket-events");

export function useTicketEventsResolver() {
  return ticketEventsResolverStore.useResolver();
}

export async function reloadTicketEventsResolver() {
  return ticketEventsResolverStore.load([], { force: true });
}
