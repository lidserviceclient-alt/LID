import { useCallback, useEffect, useState } from "react";
import { Phone, Printer } from "lucide-react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Drawer from "../ui/Drawer.jsx";
import ShipmentLegsPanel from "./ShipmentLegsPanel.jsx";
import ShipmentShippingCost from "./ShipmentShippingCost.jsx";
import { LaneBadge } from "./ShipmentBadges.jsx";
import { backofficeApi } from "../../services/api.js";
import { useLogistics } from "../../pages/logistics/LogisticsContext.jsx";
import {
  OTHER_COURIER,
  SOURCE_LABEL,
  STATUS_OPTIONS,
  courierLabel,
  formatDateTime,
  formatIdle,
  formatMoney,
  laneLabel,
  qrValueOf,
  shipperLabel,
  statusLabel
} from "../../pages/logistics/logisticsUtils.js";

/** Panneau latéral d'un colis (détail, affectation, incident, coût réel, trajets, historique). */
export default function ShipmentDrawer() {
  const { selected, closeShipment } = useLogistics();
  const s = selected?.shipment || {};
  const isOpen = Boolean(selected);
  return (
    <Drawer isOpen={isOpen} onClose={closeShipment} title={isOpen ? `Colis ${s.orderId || `#${s.id}`}` : "Colis"} width="w-full sm:w-[34rem]">
      {/* Remonté à chaque colis : les saisies du panneau repartent de zéro */}
      {isOpen ? <ShipmentDetail key={s.id} /> : null}
    </Drawer>
  );
}

function ShipmentDetail() {
  const { selected, activeCouriers, updatedAt, refresh, setSelectedItem, initPrint, openQrModal, closeShipment, goTo } = useLogistics();
  const s = selected.shipment || {};
  const selectedQr = qrValueOf(s);

  const [timeline, setTimeline] = useState([]);
  const [timelineError, setTimelineError] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [assignOther, setAssignOther] = useState("");
  const [depotReason, setDepotReason] = useState("");
  const [customerMessage, setCustomerMessage] = useState(s.customerFacingComment || "");
  const [actionBusy, setActionBusy] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");

  const loadTimeline = useCallback(async (id) => {
    if (!id) return;
    try {
      const list = await backofficeApi.shipmentTimeline(id);
      setTimeline(Array.isArray(list) ? list : []);
      setTimelineError("");
    } catch (err) {
      setTimelineError(err?.message || "Historique indisponible.");
    }
  }, []);

  // L'historique suit le suivi : rechargé à chaque mise à jour reçue
  useEffect(() => {
    if (s.id) loadTimeline(s.id);
  }, [s.id, updatedAt, loadTimeline]);

  async function runAction(key, action, successMessage) {
    setActionBusy(key);
    setActionError("");
    setActionInfo("");
    try {
      const result = await action();
      setActionInfo(successMessage);
      if (result && typeof result === "object" && result.id) {
        setSelectedItem((prev) => (prev ? { ...prev, shipment: { ...prev.shipment, ...result } } : prev));
      }
      refresh();
    } catch (err) {
      setActionError(err?.message || "Action impossible.");
    } finally {
      setActionBusy("");
    }
  }

  function assignCourier() {
    const id = s.id;
    if (assignTo === OTHER_COURIER) {
      // Saisie libre (compte livreur hors liste) : le serveur complète nom et téléphone si le compte existe
      const email = assignOther.trim();
      if (!email) return;
      runAction("assign", () => backofficeApi.assignShipmentCourier(id, { courierUser: email }), `Colis affecté à ${email}.`);
      return;
    }
    const courier = activeCouriers.find((c) => c.email === assignTo);
    if (!courier) return;
    runAction(
      "assign",
      () =>
        backofficeApi.assignShipmentCourier(id, {
          courierUser: courier.email,
          courierName: courierLabel(courier),
          courierPhone: courier.phoneNumber || undefined
        }),
      `Colis affecté à ${courierLabel(courier)}.`
    );
  }

  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap gap-2">
        <LaneBadge lane={selected.lane} status={s.status} />
        {selected.late ? (
          <span className="rounded-full bg-rose-500/15 px-3 py-0.5 text-xs font-semibold text-rose-700">
            Sans mouvement {formatIdle(selected.idleMinutes)}
          </span>
        ) : null}
        <span className="rounded-full border border-border bg-muted/30 px-3 py-0.5 text-xs">Échecs de livraison : {s.failedAttempts ?? 0}</span>
        {s.codeLocked ? (
          <span className="rounded-full border border-red-300 bg-red-50 px-3 py-0.5 text-xs text-red-700">Code client verrouillé (trop d'essais)</span>
        ) : null}
        {s.paid === false ? (
          <span className="rounded-full bg-amber-500/15 px-3 py-0.5 text-xs font-semibold text-amber-700">Paiement non confirmé</span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => initPrint(s.id)}>
          <Printer className="h-4 w-4" /> Imprimer la facture
        </Button>
        {selectedQr ? (
          <Button variant="outline" size="sm" onClick={() => openQrModal(selectedQr, s.orderId)}>
            QR / code de remise
          </Button>
        ) : null}
      </div>

      <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
        <dt className="text-muted-foreground">Statut</dt>
        <dd className="col-span-2">{laneLabel(selected.lane, s.status)}</dd>
        <dt className="text-muted-foreground">Tracking ID</dt>
        <dd className="col-span-2 font-mono">{s.trackingId || "-"}</dd>
        <dt className="text-muted-foreground">Expéditeur</dt>
        <dd className="col-span-2">{shipperLabel(s)}</dd>
        {s.shipperType === "PARTNER" ? (
          <>
            <dt className="text-muted-foreground">Mode logistique</dt>
            <dd className="col-span-2">
              {s.logisticsMode === "VIA_WAREHOUSE"
                ? s.warehouseReceivedAt
                  ? `B · via l'entrepôt — reçu le ${new Date(s.warehouseReceivedAt).toLocaleString("fr-FR")}`
                  : "B · via l'entrepôt — en collecte, à réceptionner"
                : "A · enlèvement direct chez le partenaire"}
            </dd>
          </>
        ) : null}
        <dt className="text-muted-foreground">Client</dt>
        <dd className="col-span-2 font-medium">{s.customerName || "-"}</dd>
        <dt className="text-muted-foreground">Téléphone</dt>
        <dd className="col-span-2">
          {s.customerPhone ? (
            <a className="inline-flex items-center gap-1 text-primary hover:underline" href={`tel:${s.customerPhone}`}>
              <Phone className="h-3 w-3" /> {s.customerPhone}
            </a>
          ) : (
            "-"
          )}
        </dd>
        <dt className="text-muted-foreground">Adresse</dt>
        <dd className="col-span-2 break-words">{s.customerAddress || "-"}</dd>
        <dt className="text-muted-foreground">Livreur</dt>
        <dd className="col-span-2">
          {s.courierName || s.courierUser || "Non affecté"}
          {s.courierPhone ? (
            <a className="ml-2 text-primary hover:underline" href={`tel:${s.courierPhone}`}>
              {s.courierPhone}
            </a>
          ) : null}
        </dd>
        <dt className="text-muted-foreground">Transporteur</dt>
        <dd className="col-span-2">{s.carrier || "-"}</dd>
        <dt className="text-muted-foreground">Code colis</dt>
        <dd className="col-span-2 font-mono">{s.handoffCode || "-"}</dd>
        <dt className="text-muted-foreground">ETA</dt>
        <dd className="col-span-2">{formatDateTime(s.eta)}</dd>
        <dt className="text-muted-foreground">Coût</dt>
        <dd className="col-span-2">{formatMoney(s.cost)}</dd>
        {s.customerFacingComment && s.status !== "ECHEC" ? (
          <>
            <dt className="text-muted-foreground">Message client</dt>
            <dd className="col-span-2 whitespace-pre-wrap break-words">{s.customerFacingComment}</dd>
          </>
        ) : null}
      </dl>

      {s.status !== "LIVREE" && !s.awaitsWarehouseReceipt ? (
        <div className="space-y-2 rounded-lg border border-border p-3">
          <p className="font-semibold">{s.courierUser ? "Réaffecter" : "Affecter un livreur"}</p>
          <div className="flex gap-2">
            <Select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} aria-label="Livreur">
              <option value="">Choisir un livreur actif…</option>
              {activeCouriers.map((c) => (
                <option key={c.id} value={c.email}>
                  {courierLabel(c)} — {c.toPickup + c.inTransit} en cours
                </option>
              ))}
              <option value={OTHER_COURIER}>Autre compte (saisir l'e-mail)…</option>
            </Select>
            <Button
              onClick={assignCourier}
              disabled={!assignTo || (assignTo === OTHER_COURIER && !assignOther.trim()) || Boolean(actionBusy)}
              isLoading={actionBusy === "assign"}
            >
              Affecter
            </Button>
          </div>
          {assignTo === OTHER_COURIER ? (
            <Input
              type="email"
              placeholder="E-mail du compte livreur"
              value={assignOther}
              onChange={(e) => setAssignOther(e.target.value)}
              aria-label="E-mail du compte livreur"
            />
          ) : null}
          {activeCouriers.length === 0 ? <p className="text-xs text-muted-foreground">Aucun livreur actif.</p> : null}
        </div>
      ) : null}

      {s.awaitsWarehouseReceipt ? (
        <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50/60 p-3 dark:bg-amber-500/5">
          <p className="font-semibold">Option B : collecte vers l'entrepôt LID</p>
          <p className="text-xs text-muted-foreground">
            La livraison au client s'affecte après la réception à l'entrepôt. Affectez la collecte, suivez le retrait et
            réceptionnez le colis (avec contrôle) depuis la sous-page « Collectes & entrepôt ».
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              closeShipment();
              goTo("collections");
            }}
          >
            Ouvrir les collectes
          </Button>
        </div>
      ) : null}

      {/* Grille par zone : zone du client, livraison facturee et cout reel du trajet */}
      {s.id ? <ShipmentShippingCost shipmentId={s.id} cost={s.cost} onSaved={refresh} /> : null}

      {s.logisticsMode === "VIA_WAREHOUSE" ? (
        <div className="space-y-2">
          <p className="font-semibold">Trajets du colis</p>
          <ShipmentLegsPanel shipmentId={s.id} refreshKey={updatedAt ? updatedAt.getTime() : 0} />
        </div>
      ) : null}

      {s.status === "ECHEC" || s.codeLocked ? (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="font-semibold">Incident de livraison</p>
          {s.status === "ECHEC" ? (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs font-semibold">Motif transmis par le livreur</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{s.deliveryIssueComment || "Aucun motif détaillé."}</p>
            </div>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            disabled={Boolean(actionBusy)}
            isLoading={actionBusy === "unlock"}
            onClick={() => runAction("unlock", () => backofficeApi.unlockShipmentCode(s.id), "Code client débloqué.")}
          >
            Débloquer le code
          </Button>
          {s.status === "ECHEC" ? (
            <>
              <div className="space-y-2">
                <p className="text-xs font-medium">Message client affiché dans le suivi</p>
                <textarea
                  rows={4}
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  placeholder="Ex: Nous n'avons pas pu finaliser la livraison aujourd'hui. Notre équipe reviendra vers vous avec un nouveau créneau."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">Ce message est visible côté client dans le suivi de commande.</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={Boolean(actionBusy)}
                    isLoading={actionBusy === "message"}
                    onClick={() =>
                      runAction(
                        "message",
                        () =>
                          backofficeApi.updateShipmentStatus(s.id, {
                            status: "ECHEC",
                            deliveryIssueComment: s.deliveryIssueComment || null,
                            customerFacingComment: customerMessage || null
                          }),
                        "Message client mis à jour."
                      )
                    }
                  >
                    Mettre à jour le message client
                  </Button>
                  <Button
                    size="sm"
                    disabled={Boolean(actionBusy)}
                    isLoading={actionBusy === "retry"}
                    onClick={() =>
                      runAction(
                        "retry",
                        () => backofficeApi.updateShipmentStatus(s.id, { status: "EN_COURS", customerFacingComment: customerMessage || null }),
                        "Livraison relancée."
                      )
                    }
                  >
                    Relancer la livraison
                  </Button>
                </div>
              </div>
              <div className="space-y-2 border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">
                  Retour dépôt : la commande sera annulée et remboursée. Motif obligatoire, conservé dans l'historique.
                </p>
                <textarea
                  rows={2}
                  value={depotReason}
                  onChange={(e) => setDepotReason(e.target.value)}
                  placeholder="Ex : client injoignable après 3 passages"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!depotReason.trim() || Boolean(actionBusy)}
                  isLoading={actionBusy === "depot"}
                  onClick={() => runAction("depot", () => backofficeApi.returnShipmentToDepot(s.id, depotReason.trim()), "Colis renvoyé au dépôt, commande annulée.")}
                >
                  Retour dépôt
                </Button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {actionError ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{actionError}</div> : null}
      {actionInfo ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">{actionInfo}</div> : null}

      <div>
        <p className="mb-2 font-semibold">Historique</p>
        {timelineError ? <p className="text-red-600">{timelineError}</p> : null}
        {timeline.length === 0 && !timelineError ? (
          <p className="text-muted-foreground">Aucun évènement.</p>
        ) : (
          <ol className="relative space-y-3 border-l border-border pl-4">
            {[...timeline].reverse().map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                <p className="font-medium text-foreground">
                  {STATUS_OPTIONS.some((o) => o.value === entry.status) ? statusLabel(entry.status) : entry.statusLabel || entry.status}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{formatDateTime(entry.changedAt)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {SOURCE_LABEL[entry.source] || entry.source}
                  {entry.actorLabel || entry.actorId ? ` · ${entry.actorLabel || entry.actorId}` : ""}
                </p>
                {entry.comment ? <p className="mt-0.5 break-words text-foreground">{entry.comment}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
