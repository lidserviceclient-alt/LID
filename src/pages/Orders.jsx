import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Plus, Search } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(num))} FCFA`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
};

const mapStatus = (status) => {
  if (!status) return "-";
  switch (status) {
    case "CREEE":
      return "Nouvelle";
    case "PAYEE":
      return "Payée";
    case "EXPEDIEE":
      return "Expédiée";
    case "LIVREE":
      return "Livrée";
    case "ANNULEE":
      return "Annulée";
    case "REMBOURSEE":
      return "Remboursée";
    default:
      return status;
  }
};

const mapShipmentStatus = (status) => {
  if (!status) return "-";
  switch (status) {
    case "EN_PREPARATION":
      return "En préparation";
    case "EN_COURS":
      return "Remis au livreur";
    case "LIVREE":
      return "Livrée";
    case "ECHEC":
      return "Échec";
    default:
      return status;
  }
};

const statusMapping = {
  Toutes: "",
  Nouvelles: "CREEE",
  Payées: "PAYEE",
  "Expédiées": "EXPEDIEE",
  "Livrées": "LIVREE",
  Annulées: "ANNULEE",
  Remboursées: "REMBOURSEE"
};

export default function Orders() {
  const [ordersPage, setOrdersPage] = useState(null);
  const [activeStatus, setActiveStatus] = useState("Toutes");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [courierLoading, setCourierLoading] = useState(false);
  const [courierError, setCourierError] = useState("");
  const [courierDetail, setCourierDetail] = useState(null);
  const [courierFallback, setCourierFallback] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [createForm, setCreateForm] = useState({
    customerId: "",
    promoCode: "",
    lines: [{ productId: "", quantity: 1 }]
  });
  const [quote, setQuote] = useState({
    subTotal: 0,
    discountAmount: 0,
    total: 0,
    promoApplied: false,
    promoCode: "",
    promoMessage: ""
  });
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  useEffect(() => {
    const status = statusMapping[activeStatus] || "";
    let cancelled = false;
    setLoading(true);
    setError("");

    const timer = setTimeout(() => {
      backofficeApi
        .orders(page, size, status, q.trim())
        .then((data) => {
          if (cancelled) return;
          setOrdersPage(data);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err?.message || "Impossible de charger les commandes.");
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeStatus, page, q, size]);

  const rows = useMemo(() => {
    const list = Array.isArray(ordersPage?.content) ? ordersPage.content : [];
    return list.map((order) => ({
      id: order.id,
      customer: order.customer,
      items: order.items,
      channel: "Backoffice",
      total: formatCurrency(order.total),
      status: mapStatus(order.status),
      rawStatus: order.status,
      shipmentStatus: mapShipmentStatus(order.shipmentStatus),
      courierReference: order.courierReference || "-",
      courierName: order.courierName || "",
      courierPhone: order.courierPhone || "",
      courierUser: order.courierUser || "",
      courierScannedAt: order.courierScannedAt || null,
      date: formatDate(order.dateCreation)
    }));
  }, [ordersPage]);

  const meta = useMemo(() => {
    const totalPages = Number.isFinite(ordersPage?.totalPages) ? ordersPage.totalPages : 1;
    const totalElements = Number.isFinite(ordersPage?.totalElements) ? ordersPage.totalElements : 0;
    return { totalPages, totalElements };
  }, [ordersPage]);

  const tags = ["Toutes", "Nouvelles", "Payées", "Expédiées", "Livrées", "Annulées", "Remboursées"];

  const productIndex = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => {
      if (p?.id) map.set(p.id, p);
    });
    return map;
  }, [products]);

  const createTotal = useMemo(() => {
    return (createForm.lines || []).reduce((sum, line) => {
      const qty = Number(line.quantity);
      if (!Number.isFinite(qty) || qty <= 0) return sum;
      const p = productIndex.get(line.productId);
      const price = p?.price !== undefined ? Number(p.price) : 0;
      if (!Number.isFinite(price) || price < 0) return sum;
      return sum + price * qty;
    }, 0);
  }, [createForm.lines, productIndex]);

  const cleanedLinesForRequest = useMemo(() => {
    return (createForm.lines || [])
      .map((l) => ({ productId: l.productId, quantity: Number(l.quantity) }))
      .filter((l) => l.productId && Number.isFinite(l.quantity) && l.quantity > 0)
      .map((l) => ({ ...l, quantity: Math.trunc(l.quantity) }));
  }, [createForm.lines]);

  const openCourier = async (order) => {
    const fallback = {
      courierReference: order?.courierReference || "-",
      courierName: order?.courierName || "",
      courierPhone: order?.courierPhone || "",
      courierUser: order?.courierUser || "",
      courierScannedAt: order?.courierScannedAt || null,
    };
    setCourierFallback(fallback);
    setCourierDetail(null);
    setCourierError("");
    setCourierLoading(true);
    setCourierModalOpen(true);

    const key = `${fallback.courierUser || fallback.courierReference || ""}`.trim();
    if (!key || key === "-") {
      setCourierLoading(false);
      return;
    }

    try {
      const direct = await backofficeApi.user(key);
      if (direct?.id) {
        setCourierDetail(direct);
        return;
      }
    } catch {}

    try {
      const rolesToTry = ["LIVREUR", ""];
      for (const role of rolesToTry) {
        const pageResult = await backofficeApi.users(0, 20, role, key);
        const list = Array.isArray(pageResult?.content) ? pageResult.content : [];
        const match = list.find((u) => u?.id === key || `${u?.email || ""}`.trim().toLowerCase() === key.toLowerCase());
        const picked = match || list[0];
        if (picked?.id) {
          setCourierDetail(picked);
          return;
        }
      }
    } catch (e) {
      setCourierError(e?.message || "Impossible de charger les infos du livreur.");
    } finally {
      setCourierLoading(false);
    }
  };

  async function ensureCreateData() {
    const [custRes, prodRes] = await Promise.all([
      backofficeApi.customers(0, 50).catch(() => null),
      backofficeApi.products(0, 200).catch(() => null)
    ]);
    const custList = Array.isArray(custRes?.content) ? custRes.content : Array.isArray(custRes) ? custRes : [];
    const prodList = Array.isArray(prodRes?.content) ? prodRes.content : Array.isArray(prodRes) ? prodRes : [];
    setCustomers(custList);
    setProducts(prodList);
  }

  async function openCreateModal() {
    setCreateError("");
    setIsCreateOpen(true);
    await ensureCreateData();
  }

  function closeCreateModal() {
    if (createSaving) return;
    setIsCreateOpen(false);
    setCreateError("");
  }

  async function submitCreateOrder() {
    if (!createForm.customerId) {
      setCreateError("Sélectionne un client.");
      return;
    }
    if (!Array.isArray(createForm.lines) || createForm.lines.length === 0) {
      setCreateError("Ajoute au moins une ligne.");
      return;
    }
    if (cleanedLinesForRequest.length === 0) {
      setCreateError("Sélectionne au moins un produit avec une quantité valide.");
      return;
    }

    const promoCode = createForm.promoCode ? createForm.promoCode.trim() : "";
    if (promoCode && !quoteLoading && quote && quote.promoApplied === false) {
      setCreateError(quote.promoMessage || "Code promo invalide.");
      return;
    }

    setCreateSaving(true);
    setCreateError("");
    try {
      await backofficeApi.createOrder({
        customerId: createForm.customerId,
        promoCode: promoCode || undefined,
        lines: cleanedLinesForRequest
      });
      setIsCreateOpen(false);
      setCreateForm({ customerId: "", promoCode: "", lines: [{ productId: "", quantity: 1 }] });
      const status = statusMapping[activeStatus] || "";
      const data = await backofficeApi.orders(0, size, status, q.trim());
      setOrdersPage(data);
      setPage(0);
    } catch (err) {
      setCreateError(err?.message || "Impossible de créer la commande.");
    } finally {
      setCreateSaving(false);
    }
  }

  useEffect(() => {
    if (!isCreateOpen) return;
    const customerId = createForm.customerId;
    const promoCode = createForm.promoCode ? createForm.promoCode.trim() : "";

    setQuoteError("");
    setQuoteLoading(false);

    const fallback = {
      subTotal: createTotal,
      discountAmount: 0,
      total: createTotal,
      promoApplied: false,
      promoCode: promoCode || "",
      promoMessage: promoCode ? "Code promo non appliqué" : ""
    };

    if (!customerId || cleanedLinesForRequest.length === 0) {
      setQuote(fallback);
      return;
    }
    if (!promoCode) {
      setQuote({
        subTotal: createTotal,
        discountAmount: 0,
        total: createTotal,
        promoApplied: false,
        promoCode: "",
        promoMessage: ""
      });
      return;
    }

    let cancelled = false;
    setQuoteLoading(true);
    const timer = setTimeout(() => {
      backofficeApi
        .orderQuote({ customerId, promoCode, lines: cleanedLinesForRequest })
        .then((res) => {
          if (cancelled) return;
          setQuote(res);
        })
        .catch((err) => {
          if (cancelled) return;
          setQuoteError(err?.message || "Impossible d'évaluer le code promo.");
          setQuote(fallback);
        })
        .finally(() => {
          if (cancelled) return;
          setQuoteLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cleanedLinesForRequest, createForm.customerId, createForm.promoCode, createTotal, isCreateOpen]);

  async function changeOrderStatus(orderId, nextStatus) {
    if (!orderId || !nextStatus) return;
    try {
      await backofficeApi.updateOrderStatus(orderId, nextStatus);
      const status = statusMapping[activeStatus] || "";
      const data = await backofficeApi.orders(page, size, status, q.trim());
      setOrdersPage(data);
    } catch (err) {
      setError(err?.message || "Impossible de mettre à jour le statut.");
    }
  }

  function exportCsv() {
    const header = ["Commande", "Client", "Articles", "Canal", "Total", "Statut", "Livraison", "Livreur", "Date"];
    const csvRows = [
      header.join(";"),
      ...rows.map((r) =>
        [r.id, r.customer, r.items, r.channel, r.total, r.status, r.shipmentStatus, r.courierReference, r.date]
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
        subtitle="Suivez, priorisez et automatisez vos flux logistiques."
        rightSlot={
          <>
            <Button variant="outline" className="gap-2" onClick={() => setIsFilterOpen(true)}>
              <Filter className="h-4 w-4" />
              Filtrer
            </Button>
            <Button className="gap-2" onClick={openCreateModal}>
              <Plus className="h-4 w-4" />
              Nouvelle commande
            </Button>
          </>
        }
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveStatus(tag);
                setPage(0);
              }}
              className={
                tag === activeStatus
                  ? "px-4 py-2 rounded-full text-xs font-semibold border border-input bg-foreground text-background transition-colors"
                  : "px-4 py-2 rounded-full text-xs font-semibold border border-input text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              }
            >
              {tag}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-64">
              <Input
                placeholder="Rechercher une commande"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
              />
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                Recherche sur ID, nom, prénom, email
              </div>
            </div>
            <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <Table>
          <THead>
            <TRow>
              <TCell>Commande</TCell>
              <TCell>Client</TCell>
              <TCell>Articles</TCell>
              <TCell>Canal</TCell>
              <TCell>Total</TCell>
              <TCell>Statut</TCell>
              <TCell>Livraison</TCell>
              <TCell>Livreur</TCell>
              <TCell>Date</TCell>
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
                <TCell />
              </TRow>
            ) : rows.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Aucune commande.</TCell>
                <TCell />
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
              rows.map((order) => (
                <TRow key={order.id}>
                  <TCell className="font-semibold text-foreground">{order.id}</TCell>
                  <TCell>{order.customer}</TCell>
                  <TCell>{order.items}</TCell>
                  <TCell>{order.channel}</TCell>
                  <TCell>{order.total}</TCell>
                  <TCell>
                    <Badge label={order.status} />
                  </TCell>
                  <TCell>
                    <Badge label={order.shipmentStatus} />
                  </TCell>
                  <TCell>
                    <button type="button" onClick={() => openCourier(order)} className="w-full text-left">
                      <div className="font-semibold text-foreground">{order.courierName || order.courierReference}</div>
                      <div className="text-xs text-muted-foreground">
                        {[order.courierPhone, order.courierUser].filter(Boolean).join(" • ") || "-"}
                      </div>
                      {order.courierScannedAt ? (
                        <div className="text-xs text-muted-foreground">Scan: {formatDate(order.courierScannedAt)}</div>
                      ) : null}
                    </button>
                  </TCell>
                  <TCell>{order.date}</TCell>
                  <TCell className="text-right">
                    <div className="inline-flex items-center justify-end rounded-md border border-input bg-background/60 overflow-hidden">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs rounded-none"
                        onClick={() => changeOrderStatus(order.id, "EXPEDIEE")}
                        disabled={order.rawStatus === "EXPEDIEE" || order.rawStatus === "LIVREE"}
                      >
                        Expédier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs rounded-none"
                        onClick={() => changeOrderStatus(order.id, "LIVREE")}
                        disabled={order.rawStatus === "LIVREE"}
                      >
                        Livrer
                      </Button>
                    </div>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(meta.totalElements)} commandes • page{" "}
            {page + 1}/{meta.totalPages}
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
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= meta.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={courierModalOpen}
        onClose={() => {
          setCourierModalOpen(false);
          setCourierError("");
          setCourierDetail(null);
          setCourierFallback(null);
          setCourierLoading(false);
        }}
        title="Informations livreur"
        size="lg"
        footer={
          <Button
            variant="outline"
            onClick={() => {
              setCourierModalOpen(false);
              setCourierError("");
              setCourierDetail(null);
              setCourierFallback(null);
              setCourierLoading(false);
            }}
          >
            Fermer
          </Button>
        }
      >
        {courierLoading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : courierError ? (
          <div className="text-sm text-red-600">{courierError}</div>
        ) : courierDetail ? (
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Nom</div>
              <div className="font-semibold text-foreground">
                {`${courierDetail?.prenom || ""} ${courierDetail?.nom || ""}`.trim() || "-"}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-semibold text-foreground">{courierDetail?.email || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Téléphone</div>
                <div className="font-semibold text-foreground">{courierDetail?.telephone || "-"}</div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Rôle</div>
                <div className="font-semibold text-foreground">{courierDetail?.role || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">ID</div>
                <div className="font-mono text-xs text-muted-foreground">{courierDetail?.id || "-"}</div>
              </div>
            </div>
          </div>
        ) : courierFallback ? (
          <div className="space-y-3 text-sm">
            <div className="text-xs text-muted-foreground">Aucun compte correspondant trouvé.</div>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="font-semibold text-foreground">{courierFallback.courierName || "-"}</div>
              <div className="text-xs text-muted-foreground">
                {[courierFallback.courierPhone, courierFallback.courierUser || courierFallback.courierReference]
                  .filter(Boolean)
                  .join(" • ") || "-"}
              </div>
              {courierFallback.courierScannedAt ? (
                <div className="text-xs text-muted-foreground">Scan: {formatDate(courierFallback.courierScannedAt)}</div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Aucune information.</div>
        )}
      </Modal>

      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtres commandes"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                setPage(0);
                setIsFilterOpen(false);
              }}
            >
              Appliquer
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Statut</p>
            <Select
              value={activeStatus}
              onChange={(e) => {
                setActiveStatus(e.target.value);
                setPage(0);
              }}
            >
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Recherche</p>
            <Input
              placeholder="ID / nom / email..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/30 md:col-span-2 space-y-2">
            <p className="text-sm font-semibold">Notes opérationnelles</p>
            <p className="text-xs text-muted-foreground">
              Le backoffice filtre côté serveur sur l’ID de commande et les infos client (nom/prénom/email). Pagination et export utilisent les données visibles.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        title="Nouvelle commande"
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={closeCreateModal} disabled={createSaving}>
              Annuler
            </Button>
            <Button onClick={submitCreateOrder} disabled={createSaving}>
              {createSaving ? "Création..." : "Créer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Client</p>
              <Select value={createForm.customerId} onChange={(e) => setCreateForm((p) => ({ ...p, customerId: e.target.value }))}>
                <option value="">Sélectionner…</option>
                {(customers || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} • {c.email}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Lignes</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCreateForm((p) => ({ ...p, lines: [...p.lines, { productId: "", quantity: 1 }] }))
                  }
                >
                  Ajouter
                </Button>
              </div>

              <div className="space-y-3">
                {(createForm.lines || []).map((line, idx) => {
                  const product = productIndex.get(line.productId);
                  const price = product?.price !== undefined ? Number(product.price) : 0;
                  const qty = Number(line.quantity);
                  const lineTotal = Number.isFinite(price) && Number.isFinite(qty) ? price * qty : 0;
                  return (
                    <div key={idx} className="rounded-lg border border-border p-3 space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="md:col-span-2 space-y-2">
                          <p className="text-xs text-muted-foreground">Produit</p>
                          <Select
                            value={line.productId}
                            onChange={(e) =>
                              setCreateForm((p) => ({
                                ...p,
                                lines: p.lines.map((l, i) => (i === idx ? { ...l, productId: e.target.value } : l))
                              }))
                            }
                          >
                            <option value="">Sélectionner…</option>
                            {(products || [])
                              .slice()
                              .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} • {formatCurrency(p.price)}
                                </option>
                              ))}
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Quantité</p>
                          <Input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={(e) =>
                              setCreateForm((p) => ({
                                ...p,
                                lines: p.lines.map((l, i) => (i === idx ? { ...l, quantity: e.target.value } : l))
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Total ligne</span>
                        <span className="font-semibold text-foreground">{formatCurrency(lineTotal)}</span>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setCreateForm((p) => ({ ...p, lines: p.lines.filter((_, i) => i !== idx) }))
                          }
                          disabled={(createForm.lines || []).length <= 1}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Code promo</p>
              <Input
                placeholder="Ex: WELCOME10"
                value={createForm.promoCode}
                onChange={(e) => setCreateForm((p) => ({ ...p, promoCode: e.target.value }))}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{quoteLoading ? "Vérification du code..." : quote?.promoMessage ? quote.promoMessage : "Optionnel"}</span>
                {quoteError ? <span className="text-red-600">{quoteError}</span> : null}
              </div>
            </div>

            {createError ? (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200">
                {createError}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card className="p-4 space-y-3">
              <p className="text-sm font-semibold">Résumé</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nombre de lignes</span>
                  <span className="font-semibold">{(createForm.lines || []).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-semibold">{formatCurrency(quote?.subTotal ?? createTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Réduction</span>
                  <span className={`font-semibold ${Number(quote?.discountAmount) > 0 ? "text-green-600" : ""}`}>
                    -{formatCurrency(quote?.discountAmount ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-semibold">{formatCurrency(quote?.total ?? createTotal)}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground">
                La commande est créée avec statut “Nouvelle”. Les livraisons deviennent automatiques quand tu cliques “Expédier” / “Livrer”.
              </div>
            </Card>
          </div>
        </div>
      </Modal>
    </div>
  );
}
