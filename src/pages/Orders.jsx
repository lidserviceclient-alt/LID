import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Download, Plus, RefreshCcw, Search } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import CreateOrderModal from "../components/orders/CreateOrderModal.jsx";
import {
  ORDER_STATUSES,
  PaymentBadge,
  SHIPMENT_LABELS,
  StatusBadge,
  formatCurrency,
  formatDate,
  statusLabel
} from "../components/orders/orderUtils.jsx";
import { backofficeApi } from "../services/api.js";

export default function Orders() {
  const navigate = useNavigate();
  const [ordersPage, setOrdersPage] = useState(null);
  const [counts, setCounts] = useState({});
  const [activeStatus, setActiveStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      backofficeApi
        .orders(page, size, "", q.trim(), activeStatus)
        .then((data) => !cancelled && setOrdersPage(data))
        .catch((err) => !cancelled && setError(err?.message || "Impossible de charger les commandes."))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeStatus, page, q, size, reloadKey]);

  useEffect(() => {
    backofficeApi
      .orderStatusCounts()
      .then((data) => setCounts(data || {}))
      .catch(() => setCounts({}));
  }, [reloadKey]);

  const rows = useMemo(() => (Array.isArray(ordersPage?.content) ? ordersPage.content : []), [ordersPage]);
  const totalPages = Number.isFinite(ordersPage?.totalPages) ? Math.max(1, ordersPage.totalPages) : 1;
  const totalElements = Number.isFinite(ordersPage?.totalElements) ? ordersPage.totalElements : 0;

  const tabs = useMemo(
    () => [{ value: "", short: "Toutes" }, ...ORDER_STATUSES].map((t) => ({ ...t, count: counts[t.value || "ALL"] })),
    [counts]
  );

  const openOrder = useCallback((order) => navigate(`/orders/${encodeURIComponent(order.orderNumber || order.id)}`), [navigate]);

  function exportCsv() {
    const header = ["Commande", "Date", "Client", "Vendeur(s)", "Articles", "Total", "Statut", "Paiement", "Livraison"];
    const csvRows = [
      header.join(";"),
      ...rows.map((o) =>
        [
          o.orderNumber || o.id,
          formatDate(o.dateCreation),
          o.customer,
          (o.sellers || []).join(", "),
          o.items,
          formatCurrency(o.total),
          statusLabel(o.currentStatus),
          o.paymentStatus || "",
          SHIPMENT_LABELS[o.shipmentStatus] || ""
        ]
          .map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`)
          .join(";")
      )
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Commandes"
        subtitle="Suivez chaque commande, de la préparation à la livraison, et gérez annulations, retours et remboursements."
        rightSlot={
          <>
            <Button variant="outline" className="gap-2" onClick={() => setReloadKey((k) => k + 1)} aria-label="Actualiser">
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
            <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle commande
            </Button>
          </>
        }
      />

      <Card className="space-y-4 p-3 sm:p-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {tabs.map((tab) => {
            const active = tab.value === activeStatus;
            return (
              <button
                key={tab.value || "ALL"}
                type="button"
                onClick={() => {
                  setActiveStatus(tab.value);
                  setPage(0);
                }}
                className={
                  "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
                  (active
                    ? "border-foreground bg-foreground text-background"
                    : "border-input text-muted-foreground hover:bg-muted hover:text-foreground")
                }
              >
                {tab.short}
                {tab.count !== undefined ? (
                  <span
                    className={
                      "rounded-full px-1.5 py-0.5 text-[10px] " + (active ? "bg-background/20" : "bg-muted text-foreground")
                    }
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="N° de commande, nom ou e-mail du client"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <Button variant="outline" className="ml-auto gap-2" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" />
            Exporter la page
          </Button>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <Table>
          <THead>
            <TRow>
              <TCell>Commande</TCell>
              <TCell className="hidden md:table-cell">Date</TCell>
              <TCell>Client</TCell>
              <TCell className="hidden xl:table-cell">Vendeur(s)</TCell>
              <TCell className="text-right">Montant</TCell>
              <TCell>Statut</TCell>
              <TCell className="hidden lg:table-cell">Paiement</TCell>
              <TCell className="hidden lg:table-cell">Livraison</TCell>
              <TCell />
            </TRow>
          </THead>
          <tbody>
            {loading ? (
              <TRow>
                <TCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  Chargement des commandes…
                </TCell>
              </TRow>
            ) : rows.length === 0 ? (
              <TRow>
                <TCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  Aucune commande ne correspond à ces filtres.
                </TCell>
              </TRow>
            ) : (
              rows.map((order) => (
                <TRow key={order.id} className="cursor-pointer" onClick={() => openOrder(order)}>
                  <TCell>
                    <div className="font-semibold text-foreground">{order.orderNumber || order.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.items} article{order.items > 1 ? "s" : ""}
                    </div>
                  </TCell>
                  <TCell className="hidden whitespace-nowrap md:table-cell">{formatDate(order.dateCreation)}</TCell>
                  <TCell className="max-w-[220px] truncate" title={order.customer}>
                    {order.customer}
                  </TCell>
                  <TCell className="hidden max-w-[180px] truncate xl:table-cell" title={(order.sellers || []).join(", ")}>
                    {(order.sellers || []).join(", ") || "-"}
                  </TCell>
                  <TCell className="whitespace-nowrap text-right font-medium">{formatCurrency(order.total)}</TCell>
                  <TCell>
                    <StatusBadge status={order.currentStatus} />
                  </TCell>
                  <TCell className="hidden lg:table-cell">
                    <PaymentBadge status={order.paymentStatus} />
                  </TCell>
                  <TCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {SHIPMENT_LABELS[order.shipmentStatus] || order.shippingMethodLabel || "-"}
                  </TCell>
                  <TCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        openOrder(order);
                      }}
                    >
                      Gérer
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {new Intl.NumberFormat("fr-FR").format(totalElements)} commande{totalElements > 1 ? "s" : ""} • page {page + 1}/
            {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-28">
              <Select
                value={`${size}`}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </Select>
            </div>
            <Button variant="outline" size="sm" disabled={page <= 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Précédent
            </Button>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
              Suivant
            </Button>
          </div>
        </div>
      </Card>

      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(created) => {
          setIsCreateOpen(false);
          if (created?.orderNumber) {
            navigate(`/orders/${encodeURIComponent(created.orderNumber)}`);
          } else {
            setPage(0);
            setReloadKey((k) => k + 1);
          }
        }}
      />
    </div>
  );
}
