import { useEffect, useMemo, useState } from "react";
import { Crown, Eye, RefreshCcw, Search, WalletCards } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const formatDate = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("fr-FR");
};

const formatMoney = (value, currency = "XOF") => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "XOF",
    maximumFractionDigits: 0
  }).format(amount);
};

const subscriptionStatusUi = (status) => {
  const normalized = `${status || ""}`.toUpperCase();
  if (normalized === "ACTIVE") return { label: "Actif", variant: "success" };
  if (normalized === "PENDING_PAYMENT") return { label: "Paiement attendu", variant: "warning" };
  if (normalized === "PAST_DUE") return { label: "En retard", variant: "destructive" };
  return { label: normalized || "-", variant: "outline" };
};

const invoiceStatusUi = (status) => {
  const normalized = `${status || ""}`.toUpperCase();
  if (normalized === "PAID") return { label: "Payée", variant: "success" };
  if (normalized === "PENDING") return { label: "En attente", variant: "warning" };
  if (normalized === "FAILED") return { label: "Échec", variant: "destructive" };
  if (normalized === "CANCELLED") return { label: "Annulée", variant: "outline" };
  if (normalized === "EXPIRED") return { label: "Expirée", variant: "neutral" };
  return { label: normalized || "-", variant: "outline" };
};

const planUi = (planCode) => {
  const normalized = `${planCode || "STANDARD"}`.toUpperCase();
  if (normalized === "PREMIUM") return { label: "Premium", variant: "warning" };
  return { label: "Standard", variant: "neutral" };
};

function StatCard({ label, value, help }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      {help ? <p className="mt-1 text-xs text-muted-foreground">{help}</p> : null}
    </Card>
  );
}

function InvoiceTable({ invoices = [], onMarkPaid, actionLoading }) {
  if (!invoices.length) {
    return <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">Aucune facture.</div>;
  }
  return (
    <Table>
      <THead>
        <TRow>
          <TCell>Facture</TCell>
          <TCell>Plan</TCell>
          <TCell>Montant</TCell>
          <TCell>Statut</TCell>
          <TCell>Échéance</TCell>
          <TCell>Payée le</TCell>
          <TCell className="text-right">Actions</TCell>
        </TRow>
      </THead>
      <tbody>
        {invoices.map((invoice) => {
          const status = invoiceStatusUi(invoice?.status);
          return (
            <TRow key={invoice.id}>
              <TCell>
                <div className="font-medium text-foreground">#{invoice.id}</div>
                <div className="max-w-[220px] truncate text-xs text-muted-foreground">{invoice.paydunyaInvoiceToken || "-"}</div>
              </TCell>
              <TCell><Badge {...planUi(invoice.planCode)} /></TCell>
              <TCell>{formatMoney(invoice.amount, invoice.currency)}</TCell>
              <TCell><Badge {...status} /></TCell>
              <TCell>{formatDate(invoice.dueAt)}</TCell>
              <TCell>{formatDate(invoice.paidAt)}</TCell>
              <TCell className="text-right">
                {invoice.status === "PENDING" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={actionLoading === invoice.id}
                    onClick={() => onMarkPaid(invoice)}
                  >
                    Marquer payée
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TCell>
            </TRow>
          );
        })}
      </tbody>
    </Table>
  );
}

export default function PartnerSubscriptions() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [q, setQ] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [detail, setDetail] = useState(null);
  const [events, setEvents] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [planActionLoading, setPlanActionLoading] = useState(false);
  const [invoiceActionLoading, setInvoiceActionLoading] = useState(null);
  const [planForm, setPlanForm] = useState({ planCode: "STANDARD", comment: "" });

  const rows = data?.subscriptionsPage?.content || [];
  const overview = data?.overview || {};
  const recentInvoices = data?.recentInvoices || [];

  const totalPages = useMemo(() => Math.max(1, Number(data?.subscriptionsPage?.totalPages || 1)), [data]);

  const loadCollection = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const res = await backofficeApi.partnerSubscriptions(nextPage, size, q);
      setData(res);
      setPage(nextPage);
    } catch (err) {
      setError(err?.message || "Impossible de charger les abonnements.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (partner) => {
    if (!partner?.partnerId) return;
    setSelectedPartner(partner);
    setDetail(null);
    setEvents(null);
    setDetailError("");
    setDetailLoading(true);
    setPlanForm({
      planCode: partner?.subscription?.planCode || "STANDARD",
      comment: ""
    });
    try {
      const [subscriptionRes, eventsRes] = await Promise.all([
        backofficeApi.partnerSubscription(partner.partnerId, 0, 10),
        backofficeApi.partnerSubscriptionEvents(partner.partnerId, 0, 20)
      ]);
      setDetail(subscriptionRes);
      setEvents(eventsRes);
      setPlanForm((prev) => ({
        ...prev,
        planCode: subscriptionRes?.subscription?.planCode || prev.planCode
      }));
    } catch (err) {
      setDetailError(err?.message || "Impossible de charger le détail abonnement.");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadCollection(0);
  }, [size]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadCollection(0);
  };

  const handleForcePlan = async () => {
    if (!selectedPartner?.partnerId) return;
    setPlanActionLoading(true);
    setDetailError("");
    try {
      await backofficeApi.updatePartnerSubscriptionPlan(selectedPartner.partnerId, planForm);
      await Promise.all([loadDetail(selectedPartner), loadCollection(page)]);
    } catch (err) {
      setDetailError(err?.message || "Impossible de modifier le plan.");
    } finally {
      setPlanActionLoading(false);
    }
  };

  const handleMarkPaid = async (invoice) => {
    if (!invoice?.id) return;
    setInvoiceActionLoading(invoice.id);
    setDetailError("");
    try {
      await backofficeApi.markPartnerSubscriptionInvoicePaid(invoice.id);
      await Promise.all([
        selectedPartner ? loadDetail(selectedPartner) : Promise.resolve(),
        loadCollection(page)
      ]);
    } catch (err) {
      setDetailError(err?.message || "Impossible de marquer la facture payée.");
    } finally {
      setInvoiceActionLoading(null);
    }
  };

  const closeDetail = () => {
    setSelectedPartner(null);
    setDetail(null);
    setEvents(null);
    setDetailError("");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Abonnements partenaires"
        subtitle="Suivi des plans, renouvellements, factures PayDunya et actions manuelles."
        rightSlot={
          <Button variant="outline" onClick={() => loadCollection(page)} isLoading={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Premium actifs" value={overview.activePremiumCount ?? 0} />
        <StatCard label="Factures en attente" value={overview.pendingInvoiceCount ?? 0} />
        <StatCard label="En délai de grâce" value={overview.pastDueCount ?? 0} />
        <StatCard label="Payé 30 jours" value={formatMoney(overview.paidAmountLast30Days || 0)} />
      </div>

      <Card className="p-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Partenaires</h2>
            <p className="text-sm text-muted-foreground">Vue opérationnelle des plans et paiements en cours.</p>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Rechercher partenaire..."
                className="pl-9"
              />
            </div>
            <Button type="submit" isLoading={loading}>Rechercher</Button>
          </div>
        </form>

        {error ? <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

        <div className="mt-5">
          <Table>
            <THead>
              <TRow>
                <TCell>Partenaire</TCell>
                <TCell>Plan</TCell>
                <TCell>Statut</TCell>
                <TCell>Prochaine échéance</TCell>
                <TCell>Factures attente</TCell>
                <TCell className="text-right">Actions</TCell>
              </TRow>
            </THead>
            <tbody>
              {rows.length === 0 ? (
                <TRow>
                  <TCell colSpan={6} className="text-center text-muted-foreground">
                    {loading ? "Chargement..." : "Aucun abonnement trouvé."}
                  </TCell>
                </TRow>
              ) : rows.map((row) => {
                const plan = planUi(row?.subscription?.planCode);
                const status = subscriptionStatusUi(row?.subscription?.status);
                return (
                  <TRow key={row.partnerId}>
                    <TCell>
                      <div className="font-medium text-foreground">{row.partnerName || row.partnerId}</div>
                      <div className="text-xs text-muted-foreground">{row.partnerEmail || row.partnerId}</div>
                    </TCell>
                    <TCell><Badge {...plan} /></TCell>
                    <TCell><Badge {...status} /></TCell>
                    <TCell>{formatDate(row?.subscription?.nextBillingAt)}</TCell>
                    <TCell>
                      <span className="font-medium">{row?.pendingInvoices?.length || 0}</span>
                    </TCell>
                    <TCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => loadDetail(row)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Détail
                      </Button>
                    </TCell>
                  </TRow>
                );
              })}
            </tbody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Page {page + 1} / {totalPages}</span>
            <Select value={size} onChange={(event) => setSize(Number(event.target.value) || 20)} className="w-24">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 0 || loading} onClick={() => loadCollection(page - 1)}>Précédent</Button>
            <Button variant="outline" disabled={page + 1 >= totalPages || loading} onClick={() => loadCollection(page + 1)}>Suivant</Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <WalletCards className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Factures récentes</h2>
            <p className="text-sm text-muted-foreground">Dernières traces de paiement d'abonnement.</p>
          </div>
        </div>
        <InvoiceTable invoices={recentInvoices} onMarkPaid={handleMarkPaid} actionLoading={invoiceActionLoading} />
      </Card>

      <Modal
        isOpen={Boolean(selectedPartner)}
        onClose={closeDetail}
        title={selectedPartner?.partnerName || "Abonnement partenaire"}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={closeDetail}>Fermer</Button>
            <Button onClick={handleForcePlan} isLoading={planActionLoading}>Appliquer le plan</Button>
          </>
        }
      >
        {detailLoading ? (
          <div className="text-sm text-muted-foreground">Chargement du détail...</div>
        ) : (
          <div className="space-y-6">
            {detailError ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{detailError}</div> : null}

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Plan courant</p>
                <div className="mt-2"><Badge {...planUi(detail?.subscription?.planCode)} /></div>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Statut</p>
                <div className="mt-2"><Badge {...subscriptionStatusUi(detail?.subscription?.status)} /></div>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground">Fin de période</p>
                <p className="mt-2 text-sm font-medium">{formatDate(detail?.subscription?.currentPeriodEnd)}</p>
              </Card>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-foreground">Action admin</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                <Select
                  value={planForm.planCode}
                  onChange={(event) => setPlanForm((prev) => ({ ...prev, planCode: event.target.value }))}
                >
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM">Premium</option>
                </Select>
                <Input
                  value={planForm.comment}
                  onChange={(event) => setPlanForm((prev) => ({ ...prev, comment: event.target.value }))}
                  placeholder="Commentaire de changement de plan"
                />
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-foreground">Factures</h3>
              <InvoiceTable
                invoices={detail?.invoicesPage?.content || detail?.recentInvoices || []}
                onMarkPaid={handleMarkPaid}
                actionLoading={invoiceActionLoading}
              />
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-foreground">Historique</h3>
              <div className="space-y-3">
                {(events?.content || []).length === 0 ? (
                  <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">Aucun événement.</div>
                ) : (events?.content || []).map((event) => (
                  <div key={event.id} className="rounded-lg border border-border p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-medium text-foreground">{event.type}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{event.details || "-"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Source: {event.source || "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
