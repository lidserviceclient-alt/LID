import api from "./api";

const BASE = "/api/v1/backoffice/partners/me/invoices";

/** Factures de commission LID et avoirs du partenaire connecté (jamais ceux des autres : 404 côté API). */
export async function listMyInvoices({ page = 0, size = 20 } = {}) {
  const res = await api.get(BASE, { params: { page, size } });
  return res?.data;
}

/** Ouvre le document HTML (imprimable, « Enregistrer au format PDF ») dans un nouvel onglet. */
export async function openMyInvoiceDocument(id) {
  if (!id) return;
  const { data } = await api.get(`${BASE}/${id}/document`, {
    responseType: "text",
    transformResponse: [(raw) => raw],
    headers: { Accept: "text/html, application/json;q=0.5" },
  });
  const url = URL.createObjectURL(new Blob([data], { type: "text/html;charset=utf-8" }));
  const win = window.open(url, "_blank", "noopener");
  if (!win) {
    window.location.assign(url);
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
