import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const blogPostsResolverStore = createResolverStore(
  async (page = 0, size = 10) => backofficeApi.blogPosts(page, size),
  (page = 0, size = 10) => JSON.stringify({ page, size })
);

export function useBlogPostsResolver(page = 0, size = 10) {
  return blogPostsResolverStore.useResolver(page, size);
}

export async function reloadBlogPostsResolver(page = 0, size = 10) {
  return blogPostsResolverStore.load([page, size], { force: true });
}
