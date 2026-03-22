import api from "./api";

export async function uploadFile(file, { folder } = {}) {
  const form = new FormData();
  form.append("file", file);
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

export async function deleteFile(objectKey) {
  await api.delete("/api/v1/storage/delete", { params: { objectKey } });
}

