import { backofficeApi } from "../services/api.js";
import { createResolverStore } from "../utils/createResolverStore.js";

const blogPostsResolverStore = createResolverStore(async () => {
  const data = await backofficeApi.blogPosts();
  return Array.isArray(data) ? data : [];
}, () => "blog-posts");

export function useBlogPostsResolver() {
  return blogPostsResolverStore.useResolver();
}

export async function reloadBlogPostsResolver() {
  return blogPostsResolverStore.load([], { force: true });
}
