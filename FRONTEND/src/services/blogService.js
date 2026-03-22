import api from "./api";
import { resolveBackendAssetUrl } from "./categoryService";

export function normalizeBlogPost(dto) {
  const imageUrl = `${dto?.imageUrl || ""}`.trim();
  return {
    id: `${dto?.id || ""}`.trim(),
    title: `${dto?.title || ""}`.trim(),
    excerpt: `${dto?.excerpt || ""}`.trim(),
    content: `${dto?.content || ""}`.trim(),
    imageUrl,
    image: resolveBackendAssetUrl(imageUrl) || "/imgs/logo.png",
    category: `${dto?.category || ""}`.trim(),
    date: dto?.date || null,
    author: `${dto?.author || ""}`.trim(),
    featured: Boolean(dto?.featured),
    readTime: `${dto?.readTime || ""}`.trim()
  };
}

export async function getBlogPosts() {
  const res = await api.get("/api/v1/blog/posts");
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(normalizeBlogPost).filter((p) => p?.id && p?.title);
}

export async function getBlogPost(id) {
  const res = await api.get(`/api/v1/blog/posts/${encodeURIComponent(id)}`);
  return normalizeBlogPost(res?.data);
}

