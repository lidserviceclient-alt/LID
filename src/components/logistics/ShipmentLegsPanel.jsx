import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Package, Truck, Warehouse } from "lucide-react";
import { backofficeApi } from "../../services/api.js";

// Fiche colis : les deux trajets (collecte partenaire -> entrepôt, livraison -> client) et leur chronologie
const SOURCE_LABEL = {
  SYSTEM: "Système",
  BACKOFFICE: "Back-office",
  DELIVERY_APP: "App livreur",
  MIGRATION: "Migration"
};

export const COLLECTION_STATUS = {
  A_COLLECTER: { label: "À collecter", cls: "bg-amber-500/15 text-amber-700" },
  AFFECTEE: { label: "Collecte affectée", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  COLLECTEE: { label: "En route vers l'entrepôt", cls: "bg-blue-500/15 text-blue-700" },
  RECUE_ENTREPOT: { label: "Reçu à l'entrepôt", cls: "bg-emerald-500/15 text-emerald-700" },
  ANOMALIE: { label: "Anomalie à la réception", cls: "bg-rose-500/15 text-rose-700" }
};

const DELIVERY_STATUS = {
  EN_ATTENTE_ENTREPOT: { label: "En attente de réception entrepôt", cls: "bg-muted text-muted-foreground" },
  A_AFFECTER: { label: "À affecter", cls: "bg-amber-500/15 text-amber-700" },
  AFFECTEE: { label: "Affectée, à récupérer", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  EN_COURS: { label: "En livraison", cls: "bg-blue-500/15 text-blue-700" },
  LIVREE: { label: "Livrée", cls: "bg-emerald-500/15 text-emerald-700" },
  ECHEC: { label: "Échec", cls: "bg-rose-500/15 text-rose-700" }
};

export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function LegBadge({ status, delivery = false, label }) {
  const map = delivery ? DELIVERY_STATUS : COLLECTION_STATUS;
  const badge = map[status] || { label: label || status || "-", cls: "bg-muted text-foreground" };
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
      {badge.label}
    </span>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2 break-words">{value}</dd>
    </>
  );
}

function LegCard({ leg, title, icon: Icon, delivery }) {
  if (!leg) return null;
  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        </p>
        <LegBadge status={leg.status} delivery={delivery} label={leg.statusLabel} />
      </div>
      <dl className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
        <Row
          label="Livreur"
          value={leg.courierName || leg.courierUser ? `${leg.courierName || leg.courierUser}${leg.courierPhone ? ` · ${leg.courierPhone}` : ""}` : "Non affecté"}
        />
        <Row label="Affecté" value={leg.assignedAt ? formatDateTime(leg.assignedAt) : null} />
        <Row
          label={delivery ? "Pris en charge" : "Retiré chez le partenaire"}
          value={leg.pickedUpAt ? `${formatDateTime(leg.pickedUpAt)}${leg.pickupProof ? ` (${leg.pickupProof === "SAISIE" ? "code saisi" : "QR scanné"})` : ""}` : null}
        />
        <Row label="Déposé par le livreur" value={leg.depositedAt ? formatDateTime(leg.depositedAt) : null} />
        <Row
          label="Réceptionné"
          value={leg.receivedAt ? `${formatDateTime(leg.receivedAt)}${leg.receivedBy ? ` par ${leg.receivedBy}` : ""}` : null}
        />
        <Row
          label="Contrôle"
          value={leg.receiptCheck ? `${leg.receiptCheck === "ANOMALIE" ? "Anomalie" : "Conforme"}${leg.receiptNote ? ` — ${leg.receiptNote}` : ""}` : null}
        />
        {leg.receiptPhotoUrl ? (
          <>
            <dt className="text-muted-foreground">Photo</dt>
            <dd className="col-span-2">
              <a className="text-primary underline" href={leg.receiptPhotoUrl} target="_blank" rel="noreferrer">
                Voir la photo
              </a>
            </dd>
          </>
        ) : null}
        <Row label="Livré" value={leg.deliveredAt ? formatDateTime(leg.deliveredAt) : null} />
      </dl>
    </div>
  );
}

/** Trajets d'un colis et chronologie fusionnée ; `refreshKey` force le rechargement après une action. */
export default function ShipmentLegsPanel({ shipmentId, refreshKey, onLoaded }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!shipmentId) return;
    try {
      const result = await backofficeApi.shipmentLegs(shipmentId);
      setData(result || null);
      setError("");
      onLoaded?.(result || null);
    } catch (err) {
      setError(err?.message || "Trajets indisponibles.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Chargement des trajets…</p>;

  const twoLegs = Boolean(data.collection);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-border bg-muted/30 px-3 py-0.5 font-medium">
          {twoLegs ? "Option B · deux trajets" : "Option A · livraison directe"}
        </span>
        {data.stageLabel ? <span className="font-semibold text-foreground">{data.stageLabel}</span> : null}
      </div>
      {twoLegs ? (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Package className="h-3 w-3" /> {data.partner?.name || "Partenaire"} <ArrowRight className="h-3 w-3" />
          <Warehouse className="h-3 w-3" /> Entrepôt LID <ArrowRight className="h-3 w-3" /> <Truck className="h-3 w-3" /> Client
        </div>
      ) : null}
      {twoLegs ? <LegCard leg={data.collection} title="Collecte partenaire → entrepôt" icon={Warehouse} /> : null}
      <LegCard leg={data.delivery} title={twoLegs ? "Livraison entrepôt → client" : "Livraison directe au client"} icon={Truck} delivery />

      <div>
        <p className="mb-2 font-semibold">Chronologie des trajets</p>
        {(data.events || []).length === 0 ? (
          <p className="text-muted-foreground">Aucun évènement.</p>
        ) : (
          <ol className="relative space-y-3 border-l border-border pl-4">
            {[...data.events].reverse().map((e, index) => (
              <li key={`${e.leg}-${e.at}-${index}`} className="relative">
                <span className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${e.leg === "COLLECTE" ? "bg-amber-500" : "bg-primary"}`} />
                <p className="font-medium text-foreground">
                  <span className="mr-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {e.leg === "COLLECTE" ? "Collecte" : "Livraison"}
                  </span>
                  {e.label || e.type}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{formatDateTime(e.at)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {SOURCE_LABEL[e.source] || e.source}
                  {e.actorLabel || e.actorId ? ` · ${e.actorLabel || e.actorId}` : ""}
                </p>
                {e.comment ? <p className="mt-0.5 break-words text-foreground">{e.comment}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
