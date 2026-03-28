import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const productReviewsResolverStore = createResolverStore(
  async (page, size, status, q, productId, userId) =>
    backofficeApi.productReviews(page, size, status, q, productId, userId),
  (page, size, status, q, productId, userId) =>
    JSON.stringify({
      page,
      size,
      status: status || "",
      q: q || "",
      productId: productId || "",
      userId: userId || ""
    })
);

export function useProductReviewsResolver(page = 0, size = 20, status = "", q = "", productId = "", userId = "") {
  return productReviewsResolverStore.useResolver(page, size, status, q, productId, userId);
}

export async function reloadProductReviewsResolver(page = 0, size = 20, status = "", q = "", productId = "", userId = "") {
  return productReviewsResolverStore.load([page, size, status, q, productId, userId], { force: true });
}
