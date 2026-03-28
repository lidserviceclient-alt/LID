import { useEffect, useMemo, useState } from "react";
import { Search, Filter, RefreshCcw } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";
import { reloadReturnsResolver, useReturnsResolver } from "../resolvers/returnsResolver.js";

const statusOptions = [
  { value: "", label: "Tous" },
  { value: "SUBMITTED", label: "Nouveau" },
  { value: "UNDER_REVIEW", label: "En analyse" },
  { value: "APPROVED", label: "Accepté" },
      { value: "REJECTED", label: "Refusé" },
  { value: "REFUNDED", label: "Remboursé" },
  { value: "CLOSED", label: "Clos" }
];

const mapStatusLabel = (status) => {
  switch (status) {
    case "SUBMITTED":
      return "Nouveau";
    case "UNDER_REVIEW":
      return "En analyse";
    case "APPROVED":
      return "Accepté";
    case "REJECTED":
      return "Refusé";
    case "REFUNDED":
      return "Remboursé";
    case "CLOSED":
      return "Clos";
    default:
      return status || "-";
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
};

export default function Returns() {
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const returnsEntry = useReturnsResolver(page, size, status, q.trim());

  useEffect(() => {
    setLoading(returnsEntry.loading);
    setError(returnsEntry.error);
    setData(returnsEntry.data);
  }, [returnsEntry.data, returnsEntry.error, returnsEntry.loading]);

  const rows = useMemo(() => {
    const list = Array.isArray(data?.content) ? data.content : [];
    return list.map((r) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      email: r.email,
      customerPhone: r.customerPhone,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,
      items: Array.isArray(r.items) ? r.items : []
    }));
  }, [data]);

  const meta = useMemo(() => {
    const totalPages = Number.isFinite(data?.totalPages) ? data.totalPages : 1;
    const totalElements = Number.isFinite(data?.totalElements) ? data.totalElements : 0;
    return { totalPages, totalElements };
  }, [data]);

  const openDetail = async (row) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const res = await backofficeApi.returnDetail(row.id);
      setDetail(res);
      setStatusUpdate(res?.status || "");
    } catch (err) {
      setDetailError(err?.message || "Impossible de charger le retour.");
    } finally {
      setDetailLoading(false);
    }
  };

  const submitStatus = async () => {
    if (!detail?.id || !statusUpdate) return;
    setStatusSaving(true);
    try {
      const updated = await backofficeApi.updateReturnStatus(detail.id, statusUpdate);
      setDetail(updated);
      await reloadReturnsResolver(page, size, status, q.trim());
    } catch (err) {
      setDetailError(err?.message || "Impossible de mettre à jour le statut.");
    } finally {
      setStatusSaving(false);
    }
  };

  const resetFilters = () => {
    setQ("");
    setStatus("");
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Retours commandes"
        subtitle="Validez et suivez les demandes de retour"
        rightSlot={
          <Button variant="outline" size="sm" className="gap-2" onClick={resetFilters}>
            <RefreshCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
        }
      />

      <Card className="p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Recherche</div>
            <Input
              placeholder="Numéro de commande ou email"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              Filtre sur commande et email
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Statut</div>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" />
              Statut de traitement
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <div className="text-xs text-muted-foreground">Total retours</div>
            <div className="text-lg font-bold text-foreground">{meta.totalElements}</div>
            <div className="text-xs text-muted-foreground">Page {page + 1} / {meta.totalPages}</div>
          </div>
        </div>
      </Card>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card>
        <Table>
          <THead>
            <TRow>
              <TCell>ID</TCell>
              <TCell>Commande</TCell>
              <TCell>Email</TCell>
              <TCell>Téléphone</TCell>
              <TCell>Motif</TCell>
              <TCell>Articles</TCell>
              <TCell>Statut</TCell>
              <TCell>Créé le</TCell>
              <TCell className="text-right">Actions</TCell>
            </TRow>
          </THead>
          <tbody>
            {loading ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Chargement…</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : rows.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Aucun retour trouvé.</TCell>
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
              rows.map((row) => (
                <TRow key={row.id}>
                  <TCell className="font-semibold text-foreground">#{row.id}</TCell>
                  <TCell>{row.orderNumber}</TCell>
                  <TCell>{row.email}</TCell>
                  <TCell>{row.customerPhone || "-"}</TCell>
                  <TCell className="max-w-[220px] truncate" title={row.reason}>{row.reason}</TCell>
                  <TCell>{row.items.length}</TCell>
                  <TCell>
                    <Badge label={mapStatusLabel(row.status)} />
                  </TCell>
                  <TCell>{formatDate(row.createdAt)}</TCell>
                  <TCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openDetail(row)}>
                      Voir
                    </Button>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
        <div className="flex items-center justify-between p-4 text-xs text-muted-foreground">
          <span>{meta.totalElements} retours</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Détail du retour"
        size="lg"
      >
        {detailLoading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : detailError ? (
          <div className="text-sm text-red-600">{detailError}</div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Commande</div>
                <div className="font-semibold">{detail.orderNumber}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-semibold">{detail.email}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Téléphone</div>
                <div className="font-semibold">{detail.customerPhone || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Motif</div>
                <div className="font-semibold">{detail.reason}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Statut</div>
                <Badge label={mapStatusLabel(detail.status)} />
              </div>
            </div>

            {detail.details ? (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                {detail.details}
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-sm font-semibold">Articles</div>
              <div className="space-y-2">
                {(detail.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3 text-sm">
                    <div>
                      <div className="font-semibold">{item.articleName}</div>
                      <div className="text-xs text-muted-foreground">ID: {item.articleId}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">Qté: {item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Mettre à jour le statut</div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <Select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)} className="flex-1">
                  {statusOptions.filter((o) => o.value).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                <Button onClick={submitStatus} disabled={statusSaving} className="md:w-40">
                  {statusSaving ? "..." : "Mettre à jour"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
