// Résultat de POST /storage/upload-bulk : 200 avec, par fichier, success=false et errorMessage (ex. conflit 409).
export const isDuplicateUploadItem = (item) =>
  !item?.success && /existe déjà|already exist|\b409\b|conflict/i.test(`${item?.errorMessage || ""}`);

export const DUPLICATE_NOT_REPLACED_MESSAGE = "Fichier déjà existant, non remplacé";

export function countDuplicateUploads(res) {
  return (Array.isArray(res?.files) ? res.files : []).filter(isDuplicateUploadItem).length;
}

export function emptyUploadMessage(res) {
  return countDuplicateUploads(res) > 0 ? DUPLICATE_NOT_REPLACED_MESSAGE : "Aucune image n'a été uploadée.";
}

export function skippedUploadNotice(res) {
  const n = countDuplicateUploads(res);
  return n > 0 ? `${n} fichier(s) déjà existant(s), non remplacé(s).` : "";
}
