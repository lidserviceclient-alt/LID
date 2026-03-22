import api from "./api";
import { resolveBackendAssetUrl } from "./categoryService";

export function normalizeTicketEvent(dto) {
  const imageUrl = `${dto?.imageUrl || ""}`.trim();
  const rawPrice = dto?.price;
  const parsedPrice = rawPrice === null || rawPrice === undefined || rawPrice === "" ? null : Number(rawPrice);
  const price = Number.isFinite(parsedPrice) ? parsedPrice : null;

  return {
    id: `${dto?.id || ""}`.trim(),
    title: `${dto?.title || ""}`.trim(),
    date: dto?.date || null,
    location: `${dto?.location || ""}`.trim(),
    price,
    imageUrl,
    image: resolveBackendAssetUrl(imageUrl) || "/imgs/wall-1.jpg",
    category: `${dto?.category || ""}`.trim(),
    available: dto?.available === null || dto?.available === undefined ? true : Boolean(dto.available),
    description: `${dto?.description || ""}`.trim()
  };
}

export async function getTicketEvents() {
  const res = await api.get("/api/v1/tickets");
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(normalizeTicketEvent).filter((e) => e?.id && e?.title);
}

export async function getTicketEvent(id) {
  const res = await api.get(`/api/v1/tickets/${encodeURIComponent(id)}`);
  return normalizeTicketEvent(res?.data);
}

