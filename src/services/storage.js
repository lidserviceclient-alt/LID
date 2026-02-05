function defaultFileName(file) {
  const ext = typeof file?.name === "string" && file.name.includes(".") ? file.name.split(".").pop() : "";
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return ext ? `${id}.${ext}` : id;
}

export function uploadPublicFile(file, { folder = "uploads", filename, onProgress } = {}) {
  if (!file) return Promise.reject(new Error("Fichier manquant"));

  return new Promise((resolve, reject) => {
    Promise.resolve()
      .then(async () => {
        const { getDownloadURL, ref, uploadBytesResumable } = await import("firebase/storage");
        const { getStorageClient } = await import("../firebase.js");
        const storage = await getStorageClient();

        const safeFolder = `${folder}`.replace(/^\/+|\/+$/g, "");
        const safeName = filename || defaultFileName(file);
        const fileRef = ref(storage, `${safeFolder}/${safeName}`);

        const task = uploadBytesResumable(fileRef, file, { contentType: file.type || undefined });
        task.on(
          "state_changed",
          (snapshot) => {
            if (typeof onProgress === "function" && snapshot.totalBytes > 0) {
              onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
            }
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve({ url, fullPath: task.snapshot.ref.fullPath });
          }
        );
      })
      .catch((err) => reject(err));
  });
}
