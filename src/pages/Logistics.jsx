import { useEffect, useMemo, useState, useRef } from "react";
import { Download, Plus, Search, Settings2, Truck, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import ShippingLabel from "../components/ShippingLabel.jsx";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";

const CARRIERS_STORAGE_KEY = "lid.backoffice.shipping.carriers";

function formatMoney(value) {
  if (value === null || value === undefined) return "-";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n))} FCFA`;
}

function formatEta(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
}

function toShipmentStatusLabel(status) {
  if (status === "EN_PREPARATION") return "En préparation";
  if (status === "EN_COURS") return "En transit";
  if (status === "LIVREE") return "Livrée";
  if (status === "ECHEC") return "Échec";
  return status || "-";
}

function buildQrUrl(data, size = 96) {
  const safe = String(data || "").trim();
  if (!safe) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(safe)}`;
}

function loadCarriers() {
  try {
    const raw = localStorage.getItem(CARRIERS_STORAGE_KEY);
    if (!raw) return ["DHL Express", "La Poste", "Jumia Force"];
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return ["DHL Express", "La Poste", "Jumia Force"];
    return list.map((x) => String(x)).filter(Boolean);
  } catch {
    return ["DHL Express", "La Poste", "Jumia Force"];
  }
}

function saveCarriers(carriers) {
  localStorage.setItem(CARRIERS_STORAGE_KEY, JSON.stringify(carriers));
}

export default function Logistics() {
  const [kpis, setKpis] = useState({ inTransitCount: 0, avgDelayDays: 0, avgCost: 0 });
  const [kpisError, setKpisError] = useState("");

  const [shipmentsPage, setShipmentsPage] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [status, setStatus] = useState("");
  const [carrier, setCarrier] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [carriers, setCarriers] = useState(() => loadCarriers());
  const [isCarriersOpen, setIsCarriersOpen] = useState(false);
  const [newCarrier, setNewCarrier] = useState("");

  const [isShipmentOpen, setIsShipmentOpen] = useState(false);
  const [shipmentSaving, setShipmentSaving] = useState(false);
  const [shipmentError, setShipmentError] = useState("");
  const [shipmentForm, setShipmentForm] = useState({
    orderId: "",
    carrier: "",
    trackingId: "",
    status: "EN_PREPARATION",
    eta: "",
    cost: ""
  });

  const [delivered, setDelivered] = useState([]);
  const [deliveredLoading, setDeliveredLoading] = useState(true);
  const [deliveredError, setDeliveredError] = useState("");

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalValue, setQrModalValue] = useState("");
  const [qrModalTitle, setQrModalTitle] = useState("");
  const [qrCopyState, setQrCopyState] = useState("");

  // Company Info for Printing
  const [companyInfo, setCompanyInfo] = useState(null);

  // Printing
  const [printOrder, setPrintOrder] = useState(null);
  const labelRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: labelRef,
    documentTitle: printOrder ? `Invoice-${printOrder.orderId}` : 'Invoice',
    onAfterPrint: () => setPrintOrder(null)
  });

  useEffect(() => {
    if (printOrder) {
      handlePrint();
    }
  }, [printOrder, handlePrint]);

  useEffect(() => {
    backofficeApi.appConfig().then(setCompanyInfo).catch(() => {});
  }, []);

  const initPrint = async (shipmentId) => {
    try {
      const details = await backofficeApi.shipment(shipmentId);
      setPrintOrder({
        ...details,
        id: details.orderId,
        trackingId: details.trackingId,
        createdAt: details.scannedAt || new Date().toISOString(),
        customerName: details.customerName,
        shippingAddress: details.customerAddress,
        phone: details.customerPhone,
        carrier: details.carrier,
        weight: "1.2 kg", 
        qrValue: `SHIP:${details.id}`
      });
    } catch (e) {
      console.error("Failed to fetch shipment details for print", e);
    }
  };

  useEffect(() => {
    backofficeApi
      .logisticsKpis(30)
      .then((data) => {
        setKpis({
          inTransitCount: Number.isFinite(data?.inTransitCount) ? data.inTransitCount : 0,
          avgDelayDays: Number.isFinite(data?.avgDelayDays) ? data.avgDelayDays : 0,
          avgCost: data?.avgCost ?? 0
        });
      })
      .catch((err) => {
        setKpisError(err?.message || "Impossible de charger les KPIs.");
      });
  }, []);

  async function refreshDelivered() {
    setDeliveredLoading(true);
    setDeliveredError("");
    try {
      const data = await backofficeApi.shipments(0, 10, "LIVREE", "", "");
      const list = Array.isArray(data?.content) ? data.content : [];
      setDelivered(list);
    } catch (err) {
      setDeliveredError(err?.message || "Impossible de charger les livraisons effectuées.");
    } finally {
      setDeliveredLoading(false);
    }
  }

  useEffect(() => {
    refreshDelivered();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const timer = setTimeout(() => {
      backofficeApi
        .shipments(page, size, status, carrier, q.trim())
        .then((data) => {
          if (cancelled) return;
          setShipmentsPage(data);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err?.message || "Impossible de charger les expéditions.");
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
  }, [carrier, page, q, size, status]);

  const rows = useMemo(() => {
    const list = Array.isArray(shipmentsPage?.content) ? shipmentsPage.content : [];
    return list.map((s) => ({
      id: s.id,
      trackingId: s.trackingId || "-",
      orderId: s.orderId || "-",
      carrier: s.carrier || "-",
      status: toShipmentStatusLabel(s.status),
      rawStatus: s.status || "",
      eta: formatEta(s.eta),
      cost: formatMoney(s.cost),
      qr: s?.id && s.status !== "LIVREE" ? `SHIP:${s.id}` : null
    }));
  }, [shipmentsPage]);

  async function copyToClipboard(value) {
    const text = String(value || "").trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setQrCopyState("Copié");
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        setQrCopyState("Copié");
      } catch {
        setQrCopyState("Impossible");
      }
    }
  }

  function openQrModal(value, title) {
    setQrModalValue(String(value || "").trim());
    setQrModalTitle(String(title || "").trim());
    setQrCopyState("");
    setQrModalOpen(true);
  }

  function closeQrModal() {
    setQrModalOpen(false);
    setQrModalValue("");
    setQrModalTitle("");
    setQrCopyState("");
  }

  const meta = useMemo(() => {
    const totalPages = Number.isFinite(shipmentsPage?.totalPages) ? shipmentsPage.totalPages : 1;
    const totalElements = Number.isFinite(shipmentsPage?.totalElements) ? shipmentsPage.totalElements : 0;
    return { totalPages, totalElements };
  }, [shipmentsPage]);

  function openShipmentModal() {
    setShipmentError("");
    setIsShipmentOpen(true);
    setShipmentForm({
      orderId: "",
      carrier: carrier || "",
      trackingId: "",
      status: "EN_PREPARATION",
      eta: "",
      cost: ""
    });
  }

  function closeShipmentModal() {
    if (shipmentSaving) return;
    setIsShipmentOpen(false);
    setShipmentError("");
  }

  async function saveShipment() {
    if (!shipmentForm.orderId.trim()) {
      setShipmentError("ID de commande requis.");
      return;
    }
    const payload = {
      orderId: shipmentForm.orderId.trim(),
      carrier: shipmentForm.carrier || null,
      trackingId: shipmentForm.trackingId || null,
      status: shipmentForm.status,
      eta: shipmentForm.eta ? shipmentForm.eta : null,
      cost: shipmentForm.cost !== "" ? Number(shipmentForm.cost) : null
    };
    if (payload.cost !== null && (!Number.isFinite(payload.cost) || payload.cost < 0)) {
      setShipmentError("Coût invalide.");
      return;
    }

    setShipmentSaving(true);
    setShipmentError("");
    try {
      await backofficeApi.upsertShipment(payload);
      const data = await backofficeApi.shipments(page, size, status, carrier, q.trim());
      setShipmentsPage(data);
      await refreshDelivered();
      closeShipmentModal();
    } catch (err) {
      setShipmentError(err?.message || "Impossible d’enregistrer l’expédition.");
    } finally {
      setShipmentSaving(false);
    }
  }

  function exportShipmentsCsv() {
    const header = ["Tracking ID", "Commande", "Transporteur", "Statut", "ETA", "Coût"];
    const csvRows = [
      header.join(";"),
      ...rows.map((r) =>
        [r.trackingId, r.orderId, r.carrier, r.status, r.eta, r.cost]
          .map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`)
          .join(";")
      )
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expeditions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function persistCarriers(next) {
    const cleaned = Array.from(new Set(next.map((x) => String(x).trim()).filter(Boolean)));
    setCarriers(cleaned);
    saveCarriers(cleaned);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Logistique & Livraison"
        subtitle="Suivi des expéditions et performance transporteurs."
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsCarriersOpen(true)}>
              <Settings2 className="h-4 w-4" />
              Configurer transporteurs
            </Button>
            <Button className="gap-2" onClick={openShipmentModal}>
              <Plus className="h-4 w-4" />
              Nouvelle expédition
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Colis en transit</p>
          <p className="text-2xl font-bold text-foreground">{new Intl.NumberFormat("fr-FR").format(kpis.inTransitCount)}</p>
          <p className="text-xs text-muted-foreground">{kpisError ? kpisError : "Basé sur le statut EN_COURS"}</p>
        </Card>
        <Card className="space-y-2 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Délai moyen</p>
          <p className="text-2xl font-bold text-foreground">{kpis.avgDelayDays.toFixed(1)} jours</p>
          <p className="text-xs text-muted-foreground">Délai moyen sur livraisons clôturées</p>
        </Card>
        <Card className="space-y-2 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Coût moyen</p>
          <p className="text-2xl font-bold text-foreground">{formatMoney(kpis.avgCost)}</p>
          <p className="text-xs text-muted-foreground">Moyenne des expéditions avec coût renseigné</p>
        </Card>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <SectionHeader title="Suivi des expéditions" subtitle="Derniers statuts reçus" />

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-56 space-y-1">
              <p className="text-xs text-muted-foreground">Statut</p>
              <Select
                value={status}
                onChange={(e) => {
                  setPage(0);
                  setStatus(e.target.value);
                }}
              >
                <option value="">Tous</option>
                <option value="EN_PREPARATION">En préparation</option>
                <option value="EN_COURS">En transit</option>
                <option value="LIVREE">Livrée</option>
                <option value="ECHEC">Échec</option>
              </Select>
            </div>
            <div className="w-full sm:w-56 space-y-1">
              <p className="text-xs text-muted-foreground">Transporteur</p>
              <Select
                value={carrier}
                onChange={(e) => {
                  setPage(0);
                  setCarrier(e.target.value);
                }}
              >
                <option value="">Tous</option>
                {carriers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-72 space-y-1">
              <p className="text-xs text-muted-foreground">Recherche</p>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Tracking / ID commande..."
                  value={q}
                  onChange={(e) => {
                    setPage(0);
                    setQ(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="flex-1" />
            <Button variant="outline" className="gap-2" onClick={exportShipmentsCsv} disabled={rows.length === 0}>
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>
        <Table>
          <THead>
            <TRow>
              <TCell>Tracking ID</TCell>
              <TCell>Commande</TCell>
              <TCell>Transporteur</TCell>
              <TCell>Statut</TCell>
              <TCell>ETA</TCell>
              <TCell>Coût</TCell>
              <TCell>Actions</TCell>
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
              </TRow>
            ) : rows.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Aucune expédition.</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              rows.map((item) => (
                <TRow key={item.id}>
                  <TCell className="font-mono text-xs font-semibold">{item.trackingId}</TCell>
                  <TCell className="font-semibold text-foreground">{item.orderId}</TCell>
                  <TCell>{item.carrier}</TCell>
                  <TCell>
                    <Badge label={item.status} />
                  </TCell>
                  <TCell>{item.eta}</TCell>
                  <TCell>{item.cost}</TCell>
                  <TCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => initPrint(item.id)}
                        title="Imprimer Facture"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      {item.qr ? (
                        <button
                          type="button"
                          onClick={() => openQrModal(item.qr, item.orderId)}
                          className="rounded-md border border-border bg-white p-1 hover:bg-muted/30"
                          title="Voir QR Code"
                        >
                          <img
                            src={buildQrUrl(item.qr, 84)}
                            alt={`QR ${item.orderId}`}
                            className="h-8 w-8"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-muted/20" />
                      )}
                    </div>
                  </TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
        <div className="p-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {new Intl.NumberFormat("fr-FR").format(meta.totalElements)} expéditions • page {page + 1}/{meta.totalPages}
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

      <Card className="p-4 space-y-4">
        <SectionHeader title="Livraisons effectuées" subtitle="Dernières livraisons clôturées (statut LIVREE)" />
        <Table>
          <THead>
            <TRow>
              <TCell>Tracking ID</TCell>
              <TCell>Commande</TCell>
              <TCell>Transporteur</TCell>
              <TCell>ETA</TCell>
              <TCell>Coût</TCell>
            </TRow>
          </THead>
          <tbody>
            {deliveredLoading ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Chargement…</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : deliveredError ? (
              <TRow>
                <TCell className="text-red-600 text-sm">{deliveredError}</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : delivered.length === 0 ? (
              <TRow>
                <TCell className="text-muted-foreground text-sm">Aucune livraison effectuée.</TCell>
                <TCell />
                <TCell />
                <TCell />
                <TCell />
              </TRow>
            ) : (
              delivered.map((s) => (
                <TRow key={s.id}>
                  <TCell className="font-mono text-xs font-semibold">{s.trackingId || "-"}</TCell>
                  <TCell className="font-semibold text-foreground">{s.orderId || "-"}</TCell>
                  <TCell>{s.carrier || "-"}</TCell>
                  <TCell>{formatEta(s.eta)}</TCell>
                  <TCell>{formatMoney(s.cost)}</TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        <ShippingLabel ref={labelRef} order={printOrder} company={companyInfo} />
      </div>

      <Modal
        isOpen={qrModalOpen}
        onClose={closeQrModal}
        title={qrModalTitle ? `QR - ${qrModalTitle}` : "QR"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeQrModal}>
              Fermer
            </Button>
            <Button
              onClick={() => copyToClipboard(qrModalValue)}
              disabled={!qrModalValue}
            >
              {qrCopyState ? qrCopyState : "Copier le code"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            {qrModalValue ? (
              <img
                src={buildQrUrl(qrModalValue, 260)}
                alt="QR"
                className="h-64 w-64 rounded-xl border border-border bg-white"
                referrerPolicy="no-referrer"
              />
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Saisie manuelle</p>
            <Input value={qrModalValue} readOnly />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCarriersOpen}
        onClose={() => setIsCarriersOpen(false)}
        title="Transporteurs"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCarriersOpen(false)}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                persistCarriers(carriers);
                setIsCarriersOpen(false);
              }}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Liste des transporteurs</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Cette liste est utilisée dans les filtres et lors de la création d’une expédition (stockée localement sur ce navigateur).
            </p>
          </div>

          <div className="flex gap-2">
            <Input placeholder="Ajouter un transporteur..." value={newCarrier} onChange={(e) => setNewCarrier(e.target.value)} />
            <Button
              variant="outline"
              onClick={() => {
                const name = newCarrier.trim();
                if (!name) return;
                persistCarriers([...carriers, name]);
                setNewCarrier("");
              }}
            >
              Ajouter
            </Button>
          </div>

          <div className="grid gap-2">
            {carriers.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aucun transporteur.</div>
            ) : (
              carriers.map((c) => (
                <div key={c} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="text-sm font-medium">{c}</div>
                  <Button variant="destructive" size="sm" onClick={() => persistCarriers(carriers.filter((x) => x !== c))}>
                    Supprimer
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isShipmentOpen}
        onClose={closeShipmentModal}
        title="Nouvelle expédition"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeShipmentModal} disabled={shipmentSaving}>
              Annuler
            </Button>
            <Button onClick={saveShipment} disabled={shipmentSaving}>
              {shipmentSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Commande</p>
            <Input
              placeholder="ID de commande (ex: cmd-xxx ou UUID)"
              value={shipmentForm.orderId}
              onChange={(e) => setShipmentForm((p) => ({ ...p, orderId: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Astuce: copie l’ID depuis la page Commandes.</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Transporteur</p>
            <Select value={shipmentForm.carrier} onChange={(e) => setShipmentForm((p) => ({ ...p, carrier: e.target.value }))}>
              <option value="">Sélectionner…</option>
              {carriers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Statut</p>
            <Select value={shipmentForm.status} onChange={(e) => setShipmentForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="EN_PREPARATION">En préparation</option>
              <option value="EN_COURS">En transit</option>
              <option value="LIVREE">Livrée</option>
              <option value="ECHEC">Échec</option>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Tracking ID</p>
            <Input value={shipmentForm.trackingId} onChange={(e) => setShipmentForm((p) => ({ ...p, trackingId: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">ETA</p>
            <Input type="date" value={shipmentForm.eta} onChange={(e) => setShipmentForm((p) => ({ ...p, eta: e.target.value }))} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Coût</p>
            <Input
              type="number"
              min={0}
              placeholder="Ex: 2500"
              value={shipmentForm.cost}
              onChange={(e) => setShipmentForm((p) => ({ ...p, cost: e.target.value }))} 
            />
          </div>

          {shipmentError ? (
            <div className="md:col-span-2 p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50 text-sm text-red-700 dark:text-red-200">
              {shipmentError}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
