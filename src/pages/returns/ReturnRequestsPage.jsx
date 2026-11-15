import { useEffect, useMemo, useState } from "react";
import { Search, Filter, RefreshCcw } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import RefundSlaPanel from "../../components/orders/RefundSlaPanel.jsx";
import ReturnDetailModal from "../../components/returns/ReturnDetailModal.jsx";
import { RETURN_STATUS_OPTIONS as statusOptions, mapReturnStatusLabel as mapStatusLabel, formatReturnDate as formatDate } from "../../components/returns/returnUtils.js";
import { Table, THead, TRow, TCell } from "../../components/ui/Table.jsx";
import { reloadReturnsResolver, useReturnsResolver } from "../../resolvers/returnsResolver.js";

/** Sous-page « Demandes de retour » : liste filtrable + traitement dans la modale de détail. */
export default function ReturnRequestsPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailId, setDetailId] = useState(null);
  const returnsEntry = useReturnsResolver(page, size, status, q.trim());

  useEffect(() => {
    setLoading(returnsEntry.loading);
    setError(returnsEntry.error);
    setData(returnsEntry.data);
  }, [returnsEntry.data, returnsEntry.error, returnsEntry.loading]);

  const refreshList = async (nextPage = page, nextStatus = status, nextQuery = q.trim()) => {
    setLoading(true);
    setError("");
    try {
      const refreshed = await reloadReturnsResolver(nextPage, size, nextStatus, nextQuery);
      setData(refreshed);
      return refreshed;
    } catch (err) {
      const message = err?.message || "Impossible de recharger les retours.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

  const resetFilters = () => {
    setQ("");
    setStatus("");
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refreshList().catch(() => {})} disabled={loading}>
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={resetFilters}>
          <RefreshCcw className="h-4 w-4" />
          Réinitialiser
        </Button>
      </div>

      <RefundSlaPanel reloadKey={data} compactLink="/returns/remboursements" />

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
                    <Button size="sm" variant="outline" onClick={() => setDetailId(row.id)}>
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

      <ReturnDetailModal
        returnId={detailId}
        onClose={() => setDetailId(null)}
        onChanged={() => refreshList(page, status, q.trim())}
      />
    </div>
  );
}
