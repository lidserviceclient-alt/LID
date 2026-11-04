import PageSEO from "@/components/PageSEO";
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  ChevronDown, 
  Eye, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Calendar,
  User,
  CreditCard,
  Package,
  QrCode,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";
import { useReactToPrint } from 'react-to-print';
import Receipt from '../../components/Receipt';
import { resolveBackendAssetUrl } from "@/services/categoryService";
import Avatar from '@/components/Avatar';
import { getMyOrder, listMyOrders, updateMyOrder } from '@/services/partnerBackofficeOrderService';
import { usePartnerBackofficeBootstrap } from '@/features/partnerBackoffice/PartnerBackofficeBootstrapContext';
import { toast } from "sonner";
import {
  STATUS_LABELS,
  effectiveStatus,
  money,
  normalizeShipments,
  readableShopName,
  settlementLabel,
  statusGroup,
  toNumber,
} from "@/utils/partnerOrders";

const STATUS_CONFIG = {
  'Completed': { label: 'Livré', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  'Processing': { label: 'En cours', icon: Truck, color: 'bg-blue-100 text-blue-700' },
  'Pending': { label: 'En attente', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  'Cancelled': { label: 'Annulé', icon: XCircle, color: 'bg-red-100 text-red-700' },
};

// Libellés d'état : une seule source (utils/partnerOrders) pour l'en-tête, la liste et le pied du détail.
const REAL_STATUS_LABELS = STATUS_LABELS;

const PARTNER_ACTIONS = {
  PAID: ["PROCESSING", "READY_TO_DELIVER", "CANCELED"],
  PROCESSING: ["READY_TO_DELIVER", "CANCELED"],
};

const PARTNER_ACTION_LABELS = {
  PROCESSING: "Démarrer la préparation",
  READY_TO_DELIVER: "Colis prêt pour le livreur",
  CANCELED: "Annuler la commande",
};

const PARTNER_ACTION_HINTS = {
  PROCESSING: "Vous commencez à rassembler et emballer les articles ; le client ne peut plus annuler et vous voyez ses coordonnées.",
  READY_TO_DELIVER: "Le colis est emballé et attend le livreur : il devient disponible pour la livraison et la commande ne pourra plus être annulée.",
  CANCELED: "Possible tant que le colis n'est pas prêt pour le livreur. Le client payé est remboursé automatiquement.",
};

const SHIPPED_STATUSES = ["READY_TO_DELIVER", "DELIVERY_IN_PROGRESS", "DELIVERY_FAILED", "DELIVERED"];

/** Pourquoi aucune action n'est proposee (null si des actions existent). */
const noActionReason = (rawStatus) => {
  if (PARTNER_ACTIONS[rawStatus]) return null;
  if (SHIPPED_STATUSES.includes(rawStatus)) return "Commande déjà envoyée pour livraison : annulation impossible (CGV art. 12). La suite est gérée par la logistique.";
  if (rawStatus === "PENDING") return "En attente du paiement du client : rien à préparer pour l'instant.";
  return "Commande clôturée : aucune action possible.";
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

/** Part du partenaire : partnerSubtotal, sinon somme des lignes, sinon montant de la commande. */
const partnerShare = (o) => {
  const subtotal = toNumber(o?.partnerSubtotal);
  if (subtotal !== null) return subtotal;
  const lines = Array.isArray(o?.items) ? o.items : [];
  const sum = lines.reduce((acc, line) => acc + (toNumber(line?.lineTotal) ?? ((toNumber(line?.price) ?? 0) * (toNumber(line?.quantity) ?? 0))), 0);
  if (lines.length > 0 && sum > 0) return sum;
  return toNumber(o?.amount) ?? 0;
};

const normalizeListOrder = (o) => {
  const displayNumber = `${o?.orderNumber || ""}`.trim() || `ORD-${o?.id}`;
  const rawStatus = effectiveStatus(o?.status, o?.shipments);
  return {
    id: displayNumber,
    rawId: o?.id,
    orderNumber: o?.orderNumber || null,
    customer: {
      name: o?.customerName || "Client",
      email: o?.customerEmail || "",
    },
    items: [],
    shipments: normalizeShipments(o?.shipments),
    total: partnerShare(o),
    net: toNumber(o?.partnerNet),
    settlement: settlementLabel(o?.settlementStatus, o?.settlementEligibleAt),
    status: statusGroup(rawStatus),
    rawStatus,
    date: formatDate(o?.createdAt),
  };
};

const buildDetail = (base, detail) => {
  const items = Array.isArray(detail?.items) ? detail.items : [];
  const rawStatus = effectiveStatus(detail?.status ?? base.rawStatus, detail?.shipments ?? base.shipments);
  const shipments = detail?.shipments ? normalizeShipments(detail.shipments) : base.shipments;
  return {
    ...base,
    id: `${detail?.orderNumber || ""}`.trim() || base.id,
    total: detail ? partnerShare(detail) : base.total,
    net: toNumber(detail?.partnerNet) ?? base.net,
    settlement: settlementLabel(detail?.settlementStatus, detail?.settlementEligibleAt) || base.settlement,
    status: statusGroup(rawStatus),
    rawStatus,
    date: formatDate(detail?.createdAt) || base.date,
    customer: {
      name: detail?.customerName || base.customer?.name || "Client",
      email: detail?.customerEmail || base.customer?.email || "",
    },
    shopName: readableShopName(detail?.shopName || detail?.partnerName),
    multiSeller: detail ? Boolean(detail.multiSeller) : Boolean(base.multiSeller),
    shipments,
    items: items.map((i) => {
      const quantity = toNumber(i?.quantity) ?? 0;
      const price = toNumber(i?.price ?? i?.unitPrice) ?? 0;
      return {
        name: i?.name || "Produit",
        quantity,
        price,
        lineTotal: toNumber(i?.lineTotal) ?? price * quantity,
        image: resolveBackendAssetUrl(i?.imageUrl || i?.mainImageUrl) || "/imgs/logo.png",
      };
    }),
  };
};

const MULTI_SELLER_CANCEL_MESSAGE =
  "Cette commande contient des articles d'autres vendeurs : vous ne pouvez pas l'annuler seul. Contactez l'administration pour toute annulation ou remboursement.";

/** Modale de confirmation accessible (remplace window.confirm) avec retour d'erreur visible. */
function ConfirmActionModal({ title, message, confirmLabel, danger, busy, error, onConfirm, onCancel, infoOnly }) {
  const confirmRef = useRef(null);
  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => { if (!busy) onCancel(); }} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="partner-confirm-title" aria-describedby="partner-confirm-desc" className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="partner-confirm-title" className="text-lg font-bold text-gray-900">{title}</h2>
        <p id="partner-confirm-desc" className="mt-2 text-sm text-gray-600">{message}</p>
        {error ? (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Retour
          </button>
          {infoOnly ? null : (
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-800"}`}
          >
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </button>
          )}
        </div>
      </div>
    </div>
  );
}

const CONFIRM_COPY = {
  READY_TO_DELIVER: {
    title: "Le colis est-il prêt pour le livreur ?",
    message: "Il sera proposé à la livraison et la commande ne pourra plus être annulée. Le code colis et son QR seront alors disponibles.",
    confirmLabel: "Oui, colis prêt",
    danger: false,
  },
  CANCELED: {
    title: "Annuler cette commande ?",
    message: "Cette action est définitive. Le client payé est remboursé automatiquement.",
    confirmLabel: "Annuler la commande",
    danger: true,
  },
};

export default function Orders() {
  const bootstrap = usePartnerBackofficeBootstrap();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusDraft, setStatusDraft] = useState("");
  const [confirm, setConfirm] = useState(null); // { action, busy, error }
  const [detailError, setDetailError] = useState("");

  // Create a ref for the component to be printed
  const componentRef = useRef();

  // Handle printing
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: selectedOrder ? `Recu-${selectedOrder.id}` : 'Recu',
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const page = await listMyOrders({ page: 0, size: 200 });
      const content = Array.isArray(page?.content) ? page.content : [];
      setOrders(content.map(normalizeListOrder));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bootstrap?.routeKey !== 'orders') {
      return;
    }
    if (!bootstrap?.isResolved) {
      setLoading(true);
      return;
    }
    if (bootstrap?.data) {
      const content = Array.isArray(bootstrap.data?.content) ? bootstrap.data.content : [];
      setOrders(content.map(normalizeListOrder));
      setLoading(false);
      return;
    }
    setOrders([]);
    setLoading(false);
  }, [bootstrap]);

  const openOrder = async (order) => {
    if (!order?.rawId) return;
    setDetailError("");
    try {
      const detail = await getMyOrder(order.rawId);
      setStatusDraft("");
      setSelectedOrder(buildDetail(order, detail));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Impossible d'ouvrir cette commande.");
    }
  };

  const runAction = async (action) => {
    if (!selectedOrder) return;
    const viaModal = Boolean(CONFIRM_COPY[action]);
    if (viaModal) setConfirm({ action, busy: true, error: "" });
    try {
      await updateMyOrder(selectedOrder.rawId, { status: action, comment: "Statut mis à jour par le partenaire" });
      const detail = await getMyOrder(selectedOrder.rawId);
      const next = buildDetail(selectedOrder, detail);
      setSelectedOrder(next);
      setStatusDraft("");
      setConfirm(null);
      refresh().catch(() => {});
      toast.success(`Commande : ${REAL_STATUS_LABELS[next.rawStatus] || "mise à jour"}.`);
    } catch (err) {
      const message = err?.response?.data?.message || "Action impossible sur cette commande.";
      if (viaModal) setConfirm({ action, busy: false, error: message });
      else toast.error(message);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = useMemo(() => orders.length, [orders]);

  const selectedStatusLabel = selectedOrder ? (REAL_STATUS_LABELS[selectedOrder.rawStatus] || "—") : "";
  const hasShipments = Boolean(selectedOrder?.shipments?.length);

  // Données du ticket : part du partenaire uniquement, montants numériques.
  const receiptOrder = selectedOrder ? {
    id: selectedOrder.id,
    date: selectedOrder.date,
    customer: { name: selectedOrder.customer?.name },
    items: selectedOrder.items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price, lineTotal: i.lineTotal })),
    subtotal: selectedOrder.total,
    total: selectedOrder.total,
    totalLabel: "TOTAL (VOTRE PART)",
    netAmount: selectedOrder.net,
    settlementLabel: selectedOrder.settlement,
    paymentStatus: selectedStatusLabel,
    qrValue: selectedOrder.shipments?.find((sh) => sh.qrPayload)?.qrPayload || undefined,
    qrCaption: selectedOrder.shipments?.find((sh) => sh.handoffCode)?.handoffCode || undefined,
    shipmentCodes: (selectedOrder.shipments || []).map((sh) => sh.handoffCode).filter(Boolean),
  } : null;

  return (
    <div className="p-6 max-w-7xl mx-auto h-screen flex flex-col">
      <PageSEO title="Commandes" noindex />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-500 text-sm mt-1">Suivez et gérez vos ventes (montants : votre part)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
            Total: {totalOrders} commandes
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            aria-label="Rechercher une commande"
            placeholder="Rechercher par numéro ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Processing', 'Completed', 'Pending', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-black text-white shadow-lg shadow-black/20'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'All' ? 'Tout' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
          <div className="col-span-2">Commande</div>
          <div className="col-span-3">Client</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Vos ventes</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>Chargement...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const StatusIcon = STATUS_CONFIG[order.status].icon;
              return (
                <motion.div
                  key={order.id}
                  layoutId={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`group flex flex-col md:grid md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center cursor-pointer border-l-4 ${order.status === 'Completed' ? 'border-green-500 bg-green-50/20' : 'border-transparent'}`}
                  onClick={() => openOrder(order)}
                >
                  <div className="col-span-2 font-medium text-gray-900 flex items-center gap-2 break-all">
                    {order.status === 'Completed' && <CheckCircle2 size={16} className="text-green-500" />}
                    {order.id}
                  </div>

                  <div className="col-span-3 flex items-center gap-3">
                    <Avatar name={order.customer.name} className="w-8 h-8 shrink-0" textClassName="text-xs" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{order.customer.name}</p>
                      <p className="text-xs text-gray-500 truncate">{order.customer.email}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    {order.date}
                  </div>

                  <div className="col-span-2">
                    <p className="font-bold text-gray-900">{money(order.total)}</p>
                    {order.net !== null ? <p className="text-xs text-gray-500">À percevoir (net) : {money(order.net)}</p> : null}
                  </div>

                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[order.status].color}`}>
                      <StatusIcon size={12} />
                      {REAL_STATUS_LABELS[order.rawStatus] || STATUS_CONFIG[order.status].label}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button aria-label={`Voir la commande ${order.id}`} className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>Aucune commande trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900">Détails Commande</h2>
                  <p className="text-sm text-gray-500 break-all">{selectedOrder.id}</p>
                  {selectedOrder.shopName ? <p className="text-xs text-gray-500">Boutique : {selectedOrder.shopName}</p> : null}
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Fermer le détail"
                  className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-gray-900"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status Card : même statut que le pied du détail */}
                <div className={`p-4 rounded-xl ${STATUS_CONFIG[selectedOrder.status].color}`}>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const StatusIcon = STATUS_CONFIG[selectedOrder.status].icon;
                      return <StatusIcon size={24} />;
                    })()}
                    <div>
                      <p className="font-bold">{selectedStatusLabel}</p>
                      <p className="text-xs opacity-80">
                        {hasShipments ? "Statut de votre colis" : "Statut de la commande"}
                        {selectedOrder.date ? ` · passée le ${selectedOrder.date}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Package size={16} /> Produits
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.items.length === 0 ? <p className="text-sm text-gray-500">Détail des articles indisponible.</p> : null}
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                        </div>
                        <div className="font-bold text-gray-900 whitespace-nowrap">
                          {money(item.lineTotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Delivery QR Code : un QR par colis */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <QrCode size={16} /> QR Code Livraison
                  </h3>
                  {selectedOrder.shipments.filter((sh) => sh.qrPayload).length > 0 ? (
                    <div className="space-y-4">
                      {selectedOrder.shipments.filter((sh) => sh.qrPayload).map((sh, index, list) => (
                        <div key={sh.key} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2">
                          {list.length > 1 ? <p className="text-xs font-semibold text-gray-600">Colis {index + 1} sur {list.length}</p> : null}
                          <div style={{ height: "auto", margin: "0 auto", maxWidth: 160, width: "100%" }}>
                            <QRCode
                              size={256}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              value={sh.qrPayload}
                              viewBox={`0 0 256 256`}
                            />
                          </div>
                          {sh.handoffCode ? (
                            <p className="font-mono text-lg font-bold tracking-[0.25em] text-gray-900">{sh.handoffCode}</p>
                          ) : null}
                          <p className="text-xs text-gray-500">
                            {REAL_STATUS_LABELS[effectiveStatus("", [sh])] || "Colis"}
                            {sh.trackingNumber ? ` · Suivi ${sh.trackingNumber}` : ""}
                          </p>
                          <p className="text-xs text-gray-500 text-center">
                            {sh.status === "LIVREE" || sh.status === "DELIVERED" ? "Colis remis au client." : "À présenter au livreur lors de la récupération du colis."}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                      Le code et le QR du colis apparaissent une fois le colis marqué « prêt » pour le livreur.
                    </p>
                  )}
                </div>

                <div className="h-px bg-gray-100" />

                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={16} /> Client
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={selectedOrder.customer.name} className="w-10 h-10 shrink-0 border border-gray-200" textClassName="text-sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{selectedOrder.customer.name}</p>
                        <p className="text-sm text-gray-500 break-all">{selectedOrder.customer.email}</p>
                      </div>
                    </div>
                    {selectedOrder.settlement ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                        <CreditCard size={14} />
                        Règlement : {selectedOrder.settlement}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-1 text-lg font-bold text-gray-900">
                  <span>Vos ventes</span>
                  <span>{money(selectedOrder.total)}</span>
                </div>
                {selectedOrder.net !== null ? (
                  <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-700">
                    <span>À percevoir (net après commission, frais et livraison)</span>
                    <span className="whitespace-nowrap pl-2">{money(selectedOrder.net)}</span>
                  </div>
                ) : <div className="mb-4" />}
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Statut</p>
                  <p className="mb-2 text-sm font-medium text-gray-900">{selectedStatusLabel}</p>
                  {(PARTNER_ACTIONS[selectedOrder.rawStatus] || []).length > 0 ? (
                    <>
                      <label htmlFor="partner-order-action" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Action</label>
                      <select
                        id="partner-order-action"
                        value={statusDraft}
                        onChange={(e) => setStatusDraft(e.target.value)}
                        aria-describedby={statusDraft ? "partner-order-action-hint" : undefined}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium"
                      >
                        <option value="">Choisir une action…</option>
                        {PARTNER_ACTIONS[selectedOrder.rawStatus].map((s) => (
                          <option key={s} value={s} title={PARTNER_ACTION_HINTS[s]}>{PARTNER_ACTION_LABELS[s]}</option>
                        ))}
                      </select>
                      {statusDraft ? (
                        <p id="partner-order-action-hint" className="mt-2 text-xs text-gray-500">{statusDraft === "CANCELED" && selectedOrder.multiSeller ? "Commande multi-vendeurs : annulation via l'administration." : PARTNER_ACTION_HINTS[statusDraft]}</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-xs text-gray-500">{noActionReason(selectedOrder.rawStatus)}</p>
                  )}
                  {detailError ? <p role="alert" className="mt-2 text-xs text-red-700">{detailError}</p> : null}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePrint()}
                    className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm"
                  >
                    Imprimer le ticket
                  </button>
                  <button
                    disabled={!statusDraft}
                    onClick={() => {
                      if (!statusDraft) return;
                      if (CONFIRM_COPY[statusDraft]) setConfirm({ action: statusDraft, busy: false, error: "" });
                      else runAction(statusDraft);
                    }}
                    className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 font-medium text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Appliquer
                  </button>
                </div>

                {/* Hidden Receipt Component for Printing */}
                <div className="hidden">
                  <div ref={componentRef}>
                    <Receipt order={receiptOrder} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {confirm && CONFIRM_COPY[confirm.action] ? (
        <ConfirmActionModal
          {...CONFIRM_COPY[confirm.action]}
          {...(confirm.action === "CANCELED" && selectedOrder?.multiSeller
            ? { title: "Annulation impossible ici", message: MULTI_SELLER_CANCEL_MESSAGE, infoOnly: true, danger: false }
            : {})}
          busy={confirm.busy}
          error={confirm.error}
          onConfirm={() => runAction(confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      ) : null}
    </div>
  );
}
