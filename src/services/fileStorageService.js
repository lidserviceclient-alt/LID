import api from "./api";

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
  return res?.data;
}

export async function listMedia({ folder = "", q = "", page = 0, size = 24 } = {}) {
  const res = await api.get("/api/v1/storage/media", {
    params: {
      ownerScope: "PARTNER",
      folder: folder || undefined,
      q: q || undefined,
      page,
      size,
    },
  });
  return res?.data;
}

export async function deleteFile(objectKey) {
  await api.delete("/api/v1/storage/delete", { params: { objectKey } });
}
