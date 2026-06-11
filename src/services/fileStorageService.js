import api from "./api";

const MEDIA_CACHE_TTL_MS = 10_000;

const mediaCache = new Map();
const mediaRequests = new Map();

function mediaCacheKey({ folder = "", q = "", page = 0, size = 24 } = {}) {
  return JSON.stringify({
    folder: `${folder || ""}`.trim(),
    q: `${q || ""}`.trim(),
    page: Number(page) || 0,
    size: Number(size) || 24,
  });
}

function invalidateMediaCache() {
  mediaCache.clear();
  mediaRequests.clear();
}

export async function uploadFile(file, { folder, overwrite = false } = {}) {
  const form = new FormData();
  form.append("file", file);
  form.append("overwrite", `${overwrite}`);
  if (folder) {
    form.append("folder", folder);
  }
  const res = await api.post("/api/v1/storage/upload", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  invalidateMediaCache();
  return res?.data;
}

export async function uploadFiles(files, { folder, overwrite = false } = {}) {
  const form = new FormData();
  Array.from(files || []).forEach((file) => form.append("files", file));
  form.append("overwrite", `${overwrite}`);
  if (folder) {
    form.append("folder", folder);
  }
  const res = await api.post("/api/v1/storage/upload-bulk", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  invalidateMediaCache();
  return res?.data;
}

export async function listMedia({ folder = "", q = "", page = 0, size = 24, force = false } = {}) {
  const key = mediaCacheKey({ folder, q, page, size });
  const cached = mediaCache.get(key);
  if (!force && cached && Date.now() - cached.at < MEDIA_CACHE_TTL_MS) {
    return cached.data;
  }
  if (!force && mediaRequests.has(key)) {
    return mediaRequests.get(key);
  }

  const request = api.get("/api/v1/storage/media", {
    params: {
      ownerScope: "PARTNER",
      folder: folder || undefined,
      q: q || undefined,
      page,
      size,
    },
  }).then((res) => {
    const data = res?.data;
    mediaCache.set(key, { data, at: Date.now() });
    return data;
  }).finally(() => {
    mediaRequests.delete(key);
  });

  mediaRequests.set(key, request);
  return request;
}

export async function deleteFile(objectKey) {
  await api.delete("/api/v1/storage/delete", { params: { objectKey } });
  invalidateMediaCache();
}
