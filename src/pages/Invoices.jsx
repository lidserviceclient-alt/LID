import { useCallback, useEffect, useState } from "react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const PAGE_SIZE = 20;

const TYPE_OPTIONS = [
  { value: "", label: "Tous les documents" },
  { value: "COMMISSION_INVOICE", label: "Factures de commission" },
  { value: "CREDIT_NOTE", label: "Avoirs" }
];

const money = (value, currency = "XOF") => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  const formatted = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
  return `${formatted} ${currency === "XOF" ? "FCFA" : currency}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? `${value}`
    : new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
};

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Ouvre le document HTML (imprimable / enregistrable en PDF) dans un nouvel onglet. */
async function openDocument(id) {
  const blob = await backofficeApi.invoiceDocument(id);
  const html = new Blob([blob], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(html);
  const win = window.open(url, "_blank", "noopener");
  if (!win) download(html, `facture-${id}.html`);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function Invoices() {
  const [filters, setFilters] = useState({ type: "", q: "", partnerId: "", from: "", to: "" });
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await backofficeApi.invoices({ ...filters, page, size: PAGE_SIZE }));
    } catch (err) {
      setError(err?.message || "Impossible de charger les factures.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    backofficeApi.invoiceReadiness().then(setReadiness).catch(() => setReadiness(null));
  }, []);

  const setFilter = (field) => (value) => {
    setPage(0);
    setFilters((f) => ({ ...f, [field]: value }));
  };

  async function exportCsv() {
    setExporting(true);
    setError("");
    try {
      const { type, q, partnerId, from, to } = filters;
      download(await backofficeApi.invoicesExportCsv({ type, q, partnerId, from, to }), "factures-lid.csv");
    } catch (err) {
      setError(err?.message || "Impossible d'exporter les factures.");
    } finally {
      setExporting(false);
    }
  }

  async function show(id) {
    setError("");
    try {
      setDetail(await backofficeApi.invoiceDetail(id));
    } catch (err) {
      setError(err?.message || "Impossible de charger le détail.");
    }
  }

  async function open(id) {
    setError("");
    try {
      await openDocument(id);
    } catch (err) {
      setError(err?.message || "Impossible d'ouvrir le document.");
    }
  }

  async function resend(id) {
    setError("");
    setNotice("");
    try {
      const res = await backofficeApi.invoiceResend(id);
      setNotice(res?.sent ? "Document renvoyé au partenaire par e-mail." : "Aucune adresse e-mail pour ce partenaire.");
    } catch (err) {
      setError(err?.message || "Impossible de renvoyer le document.");
    }
  }

  const rows = Array.isArray(data?.content) ? data.content : [];
  const totalPages = Number(data?.totalPages) || 0;
  const totalElements = Number(data?.totalElements) || 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Factures"
        subtitle="Factures de commission LID aux partenaires et avoirs, numérotés sans interruption (LID-FAC / LID-AVO)."
        rightSlot={
          <Button type="button" onClick={exportCsv} disabled={exporting}>
            {exporting ? "Export..." : "Export CSV (comptable)"}
          </Button>
        }
      />

      {readiness && !readiness.ready ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-800">
          Émission suspendue : mentions légales de LID incomplètes ({(readiness.missing || []).join(", ")}). Renseignez-les dans
          Paramètres &gt; Boutique ; les factures des reversements des 30 derniers jours seront alors émises automatiquement.
        </div>
      ) : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm text-emerald-700">{notice}</div> : null}

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          <Select value={filters.type} onChange={(e) => setFilter("type")(e.target.value)} options={TYPE_OPTIONS} />
          <Input placeholder="Numéro, partenaire…" value={filters.q} onChange={(e) => setFilter("q")(e.target.value)} />
          <Input placeholder="Identifiant partenaire" value={filters.partnerId} onChange={(e) => setFilter("partnerId")(e.target.value)} />
          <Input type="date" aria-label="Du" value={filters.from} onChange={(e) => setFilter("from")(e.target.value)} />
          <Input type="date" aria-label="Au" value={filters.to} onChange={(e) => setFilter("to")(e.target.value)} />
        </div>

        <Table>
          <THead>
            <TRow>
              <TCell>Numéro</TCell>
              <TCell>Date</TCell>
              <TCell>Partenaire</TCell>
              <TCell>HT</TCell>
              <TCell>TVA</TCell>
              <TCell>TTC</TCell>
              <TCell>Statut</TCell>
              <TCell>Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {loading ? (
              <TRow><TCell className="text-sm text-muted-foreground">Chargement…</TCell></TRow>
            ) : rows.length === 0 ? (
              <TRow><TCell className="text-sm text-muted-foreground">Aucune facture.</TCell></TRow>
            ) : (
              rows.map((row) => {
                const credit = row.type === "CREDIT_NOTE";
                const sign = credit ? -1 : 1;
                return (
                  <TRow key={row.id}>
                    <TCell className="font-mono text-xs">
                      {row.number}
                      {credit && row.originalInvoiceNumber ? (
                        <div className="text-muted-foreground">sur {row.originalInvoiceNumber}</div>
                      ) : null}
                    </TCell>
                    <TCell>{formatDate(row.issuedAt)}</TCell>
                    <TCell>{row.partnerName || row.partnerId}</TCell>
                    <TCell>{money(sign * row.totalExclTax, row.currency)}</TCell>
                    <TCell>{money(sign * row.totalVat, row.currency)}</TCell>
                    <TCell className="font-semibold">{money(sign * row.totalInclTax, row.currency)}</TCell>
                    <TCell>
                      <Badge
                        label={credit ? "Avoir" : row.status === "CREDITED" ? "Annulée par avoir" : "Émise"}
                        variant={credit ? "warning" : row.status === "CREDITED" ? "neutral" : "success"}
                      />
                    </TCell>
                    <TCell>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => show(row.id)}>Détail</Button>
                        <Button variant="outline" size="sm" onClick={() => open(row.id)}>Document</Button>
                        <Button variant="outline" size="sm" onClick={() => resend(row.id)}>Renvoyer</Button>
                      </div>
                    </TCell>
                  </TRow>
                );
              })
            )}
          </tbody>
        </Table>

        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{totalElements} document{totalElements > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0 || loading}>Précédent</Button>
            <span>Page {page + 1} / {Math.max(totalPages, 1)}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={loading || page + 1 >= totalPages}>Suivant</Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.invoice.type === "CREDIT_NOTE" ? "Avoir" : "Facture"} ${detail.invoice.number}` : ""}
        size="lg"
        footer={
          detail ? (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDetail(null)}>Fermer</Button>
              <Button onClick={() => open(detail.invoice.id)}>Ouvrir le document</Button>
            </div>
          ) : null
        }
      >
        {detail ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Émise le</span> {formatDate(detail.invoice.issuedAt)} ·{" "}
              <span className="text-muted-foreground">Commande</span> {detail.invoice.orderId ?? "-"} ·{" "}
              <span className="text-muted-foreground">Reversement</span> {detail.invoice.settlementId ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Destinataire</span> {detail.recipientName}
              {detail.recipientAddress ? `, ${detail.recipientAddress}` : ""}
              <br />
              RCCM {detail.recipientRccm || "-"} · NINEA {detail.recipientNinea || "-"} · DFE {detail.recipientDfe || "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Émetteur</span> {detail.issuerName} · RCCM {detail.issuerRccm || "-"} · NINEA{" "}
              {detail.issuerNinea || "-"}
            </p>
            {detail.creditReason ? (
              <p><span className="text-muted-foreground">Motif</span> {detail.creditReason}</p>
            ) : null}
            <ul className="list-disc pl-5">
              {(detail.lines || []).map((line, i) => (
                <li key={i}>
                  {line.label} : HT {money(line.amountExclTax)} · TVA {money(line.vatAmount)} · TTC {money(line.amountInclTax)}
                </li>
              ))}
            </ul>
            {(detail.creditNotes || []).length > 0 ? (
              <p>
                <span className="text-muted-foreground">Avoirs liés</span> {detail.creditNotes.map((c) => c.number).join(", ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
