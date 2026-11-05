import PageSEO from "@/components/PageSEO";
import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listMyInvoices, openMyInvoiceDocument } from "@/services/partnerBackofficeInvoiceService";

const PAGE_SIZE = 20;

const money = (value, currency) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  const formatted = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
  return `${formatted} ${!currency || currency === "XOF" ? "FCFA" : currency}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? `${value}`
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
};

export default function Invoices() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    listMyInvoices({ page, size: PAGE_SIZE })
      .then((res) => !cancelled && setData(res))
      .catch(() => !cancelled && setError("Impossible de charger vos factures."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page]);

  const open = async (id) => {
    setBusyId(id);
    try {
      await openMyInvoiceDocument(id);
    } catch {
      toast.error("Impossible d'ouvrir ce document.");
    } finally {
      setBusyId(null);
    }
  };

  const rows = Array.isArray(data?.content) ? data.content : [];
  const totalPages = Number(data?.totalPages) || 0;

  return (
    <div className="space-y-4">
      <PageSEO title="Mes factures" noindex />
      <p className="text-sm text-gray-500">
        Factures de la commission LID (déduite de vos reversements) et avoirs éventuels. Ouvrez un document puis imprimez-le ou
        enregistrez-le au format PDF.
      </p>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Numéro</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">HT</th>
              <th className="px-4 py-3 text-right">TVA</th>
              <th className="px-4 py-3 text-right">TTC</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500"><Loader2 className="inline animate-spin" size={16} /> Chargement…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Aucune facture pour le moment. Elles sont émises à chaque reversement.</td></tr>
            ) : (
              rows.map((row) => {
                const credit = row.type === "CREDIT_NOTE";
                const sign = credit ? -1 : 1;
                return (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.number}
                      {credit && row.originalInvoiceNumber ? <div className="text-gray-400">sur {row.originalInvoiceNumber}</div> : null}
                    </td>
                    <td className="px-4 py-3">{formatDate(row.issuedAt)}</td>
                    <td className="px-4 py-3 text-right">{money(sign * row.totalExclTax, row.currency)}</td>
                    <td className="px-4 py-3 text-right">{money(sign * row.totalVat, row.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{money(sign * row.totalInclTax, row.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${credit ? "bg-amber-100 text-amber-700" : row.status === "CREDITED" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                        {credit ? "Avoir" : row.status === "CREDITED" ? "Annulée par avoir" : "Émise"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => open(row.id)}
                        disabled={busyId === row.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        {busyId === row.id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                        Ouvrir / imprimer
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3 text-sm text-gray-500">
        <button type="button" className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0 || loading}>Précédent</button>
        <span>Page {page + 1} / {Math.max(totalPages, 1)}</span>
        <button type="button" className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40" onClick={() => setPage((p) => p + 1)} disabled={loading || page + 1 >= totalPages}>Suivant</button>
      </div>
    </div>
  );
}
