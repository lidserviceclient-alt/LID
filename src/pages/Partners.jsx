import { useEffect, useMemo, useState } from "react";
import { Check, X, Eye } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Label from "../components/ui/Label.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tous" },
  { value: "UNDER_REVIEW", label: "En revue" },
  { value: "VERIFIED", label: "Approuvés" },
  { value: "REJECTED", label: "Refusés" },
  { value: "STEP_1_PENDING", label: "Étape 1" },
  { value: "STEP_2_PENDING", label: "Étape 2" },
  { value: "STEP_3_PENDING", label: "Étape 3" },
  { value: "STEP_4_PENDING", label: "Étape 4" }
];

const formatDate = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("fr-FR");
};

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(amount);
};

const csvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const todayInput = () => new Date().toISOString().slice(0, 10);

const statusUi = (status) => {
  const s = `${status || ""}`.trim().toUpperCase();
  if (s === "VERIFIED") return { label: "Approuvé", variant: "success" };
  if (s === "UNDER_REVIEW") return { label: "En revue", variant: "warning" };
  if (s === "REJECTED") return { label: "Refusé", variant: "destructive" };
  if (s.startsWith("STEP_")) return { label: "En inscription", variant: "neutral" };
  return { label: s || "-", variant: "outline" };
};

function DocumentPreview({ label, url }) {
  if (!url) {
    return <div className="text-muted-foreground">{label}: -</div>;
  }
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <a className="text-xs font-medium text-primary underline" href={url} target="_blank" rel="noreferrer">
          Ouvrir
        </a>
      </div>
    </div>
  );
}

export default function Partners() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const [detailPartnerId, setDetailPartnerId] = useState("");
  const [paymentPartnerId, setPaymentPartnerId] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [transactionData, setTransactionData] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState("");
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionFilters, setTransactionFilters] = useState({ fromDate: todayInput(), toDate: todayInput() });
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedPartnerSummary, setSelectedPartnerSummary] = useState(null);

  const statusOptions = useMemo(() => STATUS_OPTIONS, []);

  const loadPartners = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await backofficeApi.partners(nextPage, size, status, q);
      setData(res);
      setPage(nextPage);
    } catch (err) {
      setError(err?.message || "Impossible de charger les partenaires.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    if (!id) return;
    setDetailLoading(true);
    setDetailError("");
    try {
      const res = await backofficeApi.partner(id);
      setDetail(res);
    } catch (err) {
      setDetailError(err?.message || "Impossible de charger le partenaire.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadTransactions = async (id, nextPage = 0, filters = transactionFilters) => {
    if (!id) return;
    setTransactionLoading(true);
    setTransactionError("");
    try {
      const res = await backofficeApi.partnerTransactions(id, filters.fromDate, filters.toDate, nextPage, 10);
      setTransactionData(res);
      setTransactionPage(nextPage);
    } catch (err) {
      setTransactionError(err?.message || "Impossible de charger les transactions partenaire.");
      setTransactionData(null);
    } finally {
      setTransactionLoading(false);
    }
  };

  useEffect(() => {
    loadPartners(0).catch(() => {});
  }, [size, status]);

  const rows = Array.isArray(data?.content) ? data.content : [];
  const totalPages = Number.isFinite(Number(data?.totalPages)) ? Number(data.totalPages) : 0;
  const transactionRows = Array.isArray(transactionData?.content) ? transactionData.content : [];
  const transactionTotalPages = Number.isFinite(Number(transactionData?.totalPages)) ? Number(transactionData.totalPages) : 0;

  const exportTransactionsCsv = () => {
    if (!paymentPartnerId || transactionRows.length === 0) return;
    const csvRows = [
      ["Date", "Commande", "Statut", "Brut", "Livraison", "Retour", "Marge", "Net", "Reference"],
      ...transactionRows.map((row) => [
        formatDate(row.transactionDate),
        row.orderId ? `ORD-${row.orderId}` : "-",
        row.payoutStatus || "-",
        formatMoney(row.grossAmount),
        formatMoney(row.shippingAllocation),
        formatMoney(row.returnCostAllocation),
        formatMoney(row.marginAmount),
        formatMoney(row.netAmount),
        row.payoutReference || "-"
      ])
    ];
    const blob = new Blob([csvRows.map((row) => row.map(csvValue).join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `partner-transactions-${paymentPartnerId}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const openDetail = async (id) => {
    setDetailPartnerId(id);
    setDetail(null);
    setRejectComment("");
    await loadDetail(id);
  };

  const inspectPartnerPayments = async (partner) => {
    const partnerId = partner?.partnerId;
    if (!partnerId) return;
    setSelectedPartnerSummary(partner || null);
    setPaymentPartnerId(partnerId);
    setTransactionData(null);
    setTransactionError("");
    setTransactionPage(0);
    await loadTransactions(partnerId, 0, transactionFilters);
  };

  const closeDetail = () => {
    setDetailPartnerId("");
    setDetail(null);
    setRejectComment("");
    setConfirmAction(null);
  };

  const approve = async () => {
    if (!detailPartnerId) return;
    setDecisionLoading(true);
    try {
      await backofficeApi.approvePartner(detailPartnerId);
      await loadDetail(detailPartnerId);
      if (paymentPartnerId === detailPartnerId) {
        await loadTransactions(paymentPartnerId, transactionPage, transactionFilters);
      }
      await loadPartners(page);
    } catch (err) {
      setDetailError(err?.message || "Action impossible.");
    } finally {
      setDecisionLoading(false);
      setConfirmAction(null);
    }
  };

  const reject = async () => {
    if (!detailPartnerId) return;
    setDecisionLoading(true);
    try {
      await backofficeApi.rejectPartner(detailPartnerId, { comment: rejectComment });
      await loadDetail(detailPartnerId);
      if (paymentPartnerId === detailPartnerId) {
        await loadTransactions(paymentPartnerId, transactionPage, transactionFilters);
      }
      await loadPartners(page);
    } catch (err) {
      setDetailError(err?.message || "Action impossible.");
    } finally {
      setDecisionLoading(false);
      setConfirmAction(null);
    }
  };

  const headerRight = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-60">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (nom, email, boutique)…"
        />
      </div>
      <div className="w-44">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
        />
      </div>
      <Button variant="outline" onClick={() => loadPartners(0)} disabled={loading}>
        {loading ? "Chargement..." : "Rechercher"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Partenaires"
        subtitle="Gérez les inscriptions, approuvez ou refusez les partenaires."
        rightSlot={headerRight}
      />

      {error ? (
        <div className="rounded-lg border border-border bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <Table>
          <THead>
            <TRow>
              <TCell>Partenaire</TCell>
              <TCell>Boutique</TCell>
              <TCell>Catégorie</TCell>
              <TCell>Statut</TCell>
              <TCell>Créé</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {rows.map((row) => {
              const ui = statusUi(row?.registrationStatus);
              const fullName = `${row?.firstName || ""} ${row?.lastName || ""}`.trim() || "-";
              return (
                <TRow key={row.partnerId}>
                  <TCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">{fullName}</div>
                      <div className="text-xs text-muted-foreground">{row?.email || "-"}</div>
                    </div>
                  </TCell>
                  <TCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">{row?.shopName || "-"}</div>
                      <div className="text-xs text-muted-foreground">{row?.phoneNumber || "-"}</div>
                    </div>
                  </TCell>
                  <TCell>{row?.mainCategoryName || "-"}</TCell>
                  <TCell>
                    <Badge label={ui.label} variant={ui.variant} />
                  </TCell>
                  <TCell className="text-xs text-muted-foreground">{formatDate(row?.createdAt)}</TCell>
                  <TCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => inspectPartnerPayments(row)}>
                        Paiements
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openDetail(row.partnerId)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              );
            })}
          </tbody>
        </Table>

        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="text-xs text-muted-foreground">
            Page {page + 1} / {Math.max(totalPages, 1)}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 0 || loading} onClick={() => loadPartners(page - 1)}>
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || totalPages === 0 || page >= totalPages - 1}
              onClick={() => loadPartners(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <SectionHeader
          title="Gestion des paiements partenaire"
          subtitle={
            selectedPartnerSummary
              ? `Ledger et transactions de ${selectedPartnerSummary.shopName || `${selectedPartnerSummary.firstName || ""} ${selectedPartnerSummary.lastName || ""}`.trim() || "ce partenaire"}.`
              : "Sélectionnez un partenaire pour afficher son tableau de paiements."
          }
          rightSlot={
            selectedPartnerSummary ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  value={transactionFilters.fromDate}
                  onChange={(e) => setTransactionFilters((s) => ({ ...s, fromDate: e.target.value }))}
                  className="w-[165px]"
                />
                <Input
                  type="date"
                  value={transactionFilters.toDate}
                  onChange={(e) => setTransactionFilters((s) => ({ ...s, toDate: e.target.value }))}
                  className="w-[165px]"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadTransactions(paymentPartnerId, 0, transactionFilters)}
                  disabled={transactionLoading || !paymentPartnerId}
                >
                  {transactionLoading ? "Chargement..." : "Filtrer"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTransactionsCsv}
                  disabled={transactionLoading || transactionRows.length === 0}
                >
                  Export CSV
                </Button>
              </div>
            ) : null
          }
        />

        {selectedPartnerSummary ? (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Partenaire</div>
              <div className="font-semibold text-foreground">
                {`${selectedPartnerSummary.firstName || ""} ${selectedPartnerSummary.lastName || ""}`.trim() || "-"}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Boutique</div>
              <div className="font-semibold text-foreground">{selectedPartnerSummary.shopName || "-"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Email</div>
              <div className="font-semibold text-foreground">{selectedPartnerSummary.email || "-"}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="text-xs text-muted-foreground">Statut</div>
              <div className="mt-1">
                <Badge {...statusUi(selectedPartnerSummary.registrationStatus)} />
              </div>
            </div>
          </div>
        ) : null}

        {transactionError ? <div className="text-sm text-destructive">{transactionError}</div> : null}

        <Table>
          <THead>
            <TRow>
              <TCell>Date</TCell>
              <TCell>Commande</TCell>
              <TCell>Statut</TCell>
              <TCell>Brut</TCell>
              <TCell>Livraison</TCell>
              <TCell>Retour</TCell>
              <TCell>Marge</TCell>
              <TCell>Net</TCell>
              <TCell>Référence</TCell>
            </TRow>
          </THead>
          <tbody>
            {!selectedPartnerSummary ? (
              <TRow>
                <TCell>Sélectionnez un partenaire via le bouton “Paiements”.</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : transactionLoading ? (
              <TRow>
                <TCell>Chargement...</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : transactionRows.length === 0 ? (
              <TRow>
                <TCell>Aucune transaction sur cette période.</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              transactionRows.map((row) => (
                <TRow key={`ledger-${row.id}`}>
                  <TCell>{formatDate(row.transactionDate)}</TCell>
                  <TCell>{row.orderId ? `ORD-${row.orderId}` : "-"}</TCell>
                  <TCell>{row.payoutStatus || "-"}</TCell>
                  <TCell>{formatMoney(row.grossAmount)}</TCell>
                  <TCell>{formatMoney(row.shippingAllocation)}</TCell>
                  <TCell>{formatMoney(row.returnCostAllocation)}</TCell>
                  <TCell>{formatMoney(row.marginAmount)}</TCell>
                  <TCell className="font-semibold text-foreground">{formatMoney(row.netAmount)}</TCell>
                  <TCell>{row.payoutReference || "-"}</TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>

        {selectedPartnerSummary ? (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {transactionPage + 1} / {Math.max(transactionTotalPages, 1)}</span>
            <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={transactionPage <= 0 || transactionLoading}
                  onClick={() => loadTransactions(paymentPartnerId, Math.max(0, transactionPage - 1), transactionFilters)}
                >
                Précédent
              </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={transactionLoading || transactionTotalPages === 0 || transactionPage >= transactionTotalPages - 1}
                  onClick={() => loadTransactions(paymentPartnerId, transactionPage + 1, transactionFilters)}
                >
                Suivant
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Modal
        isOpen={Boolean(detailPartnerId)}
        onClose={closeDetail}
        title="Détails partenaire"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <div className="text-xs text-muted-foreground font-mono">{detailPartnerId || ""}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={closeDetail}>
                Fermer
              </Button>
              <Button
                variant="destructive"
                onClick={() => setConfirmAction("reject")}
                disabled={decisionLoading || detailLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Refuser
              </Button>
              <Button
                onClick={() => setConfirmAction("approve")}
                disabled={decisionLoading || detailLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                Approuver
              </Button>
            </div>
          </div>
        }
      >
        {detailLoading ? (
          <div className="text-sm text-muted-foreground">Chargement...</div>
        ) : detailError ? (
          <div className="text-sm text-destructive">{detailError}</div>
        ) : detail ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Nom</div>
                <div className="font-semibold text-foreground">
                  {`${detail.firstName || ""} ${detail.lastName || ""}`.trim() || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-semibold text-foreground">{detail.email || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Téléphone</div>
                <div className="font-semibold text-foreground">{detail.phoneNumber || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Statut</div>
                <div className="mt-1">
                  <Badge {...statusUi(detail.registrationStatus)} />
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Boutique</div>
                <div className="font-semibold text-foreground">{detail.shopName || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Catégorie principale</div>
                <div className="font-semibold text-foreground">{detail.mainCategoryId ?? "-"}</div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Adresse</div>
                <div className="font-semibold text-foreground">{detail.headOfficeAddress || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Ville / Pays</div>
                <div className="font-semibold text-foreground">
                  {[detail.city, detail.country].filter(Boolean).join(" / ") || "-"}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Contrat</div>
                <Badge label={detail.contractAccepted ? "Accepté" : "Non accepté"} variant={detail.contractAccepted ? "success" : "warning"} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Documents</div>
                <div className="mt-2 grid gap-3">
                  <DocumentPreview label="Registre commerce" url={detail.businessRegistrationDocumentUrl} />
                  <DocumentPreview label="Pièce identité" url={detail.idDocumentUrl} />
                  <DocumentPreview label="NINEA" url={detail.nineaDocumentUrl} />
                </div>
              </div>
            </div>

            {confirmAction === "reject" ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="text-sm font-semibold text-foreground">Confirmer le refus</div>
                <div className="space-y-2">
                  <Label htmlFor="rejectComment">Motif (optionnel)</Label>
                  <Input
                    id="rejectComment"
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Ex: documents incomplets"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={decisionLoading}>
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={reject} disabled={decisionLoading}>
                    {decisionLoading ? "Traitement..." : "Confirmer"}
                  </Button>
                </div>
              </div>
            ) : null}

            {confirmAction === "approve" ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="text-sm font-semibold text-foreground">Confirmer l’approbation</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={decisionLoading}>
                    Annuler
                  </Button>
                  <Button onClick={approve} disabled={decisionLoading}>
                    {decisionLoading ? "Traitement..." : "Confirmer"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Aucun contenu.</div>
        )}
      </Modal>
    </div>
  );
}
