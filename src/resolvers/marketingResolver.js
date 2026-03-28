import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const marketingCampaignsResolverStore = createResolverStore(
  async (page, size, status) => backofficeApi.marketingCampaigns(page, size, status),
  (page, size, status) => JSON.stringify({ page, size, status: status || "" })
);

const marketingNewsletterResolverStore = createResolverStore(
  async (page, size, status, q) => backofficeApi.newsletterCollection(page, size, status, q),
  (page, size, status, q) => JSON.stringify({ page, size, status: status || "", q: q || "" })
);

export function useMarketingCampaignsResolver(page = 0, size = 50, status = "") {
  return marketingCampaignsResolverStore.useResolver(page, size, status);
}

export function useMarketingNewsletterResolver(page = 0, size = 50, status = "", q = "") {
  return marketingNewsletterResolverStore.useResolver(page, size, status, q);
}

export async function reloadMarketingCampaignsResolver(page = 0, size = 50, status = "") {
  return marketingCampaignsResolverStore.load([page, size, status], { force: true });
}

export async function reloadMarketingNewsletterResolver(page = 0, size = 50, status = "", q = "") {
  return marketingNewsletterResolverStore.load([page, size, status, q], { force: true });
}
