import { AlertTriangle } from "lucide-react";
import { LANE_BADGE, formatIdle, statusLabel } from "../../pages/logistics/logisticsUtils.js";

export function LaneBadge({ lane, status }) {
  const badge = LANE_BADGE[lane] || { label: statusLabel(status), cls: "bg-muted text-foreground" };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}
      title={`Statut : ${badge.label}`}
    >
      {badge.label}
    </span>
  );
}

export function LateBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
      <AlertTriangle className="h-3 w-3" /> Retard
    </span>
  );
}

// Carte compacte de la vue colonnes (limitée aux premiers colis de chaque colonne)
export function ShipmentCard({ item, onOpen }) {
  const s = item.shipment || {};
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-lg border border-border bg-background p-2.5 text-left shadow-sm transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground">{s.orderId || `#${s.id}`}</p>
        {item.late ? <LateBadge /> : null}
      </div>
      <p className="mt-0.5 truncate text-xs text-foreground">{s.customerName || "Client"}</p>
      <p className="truncate text-[11px] text-muted-foreground">
        {s.courierName || s.courierUser || "Non affecté"} · {formatIdle(item.idleMinutes)}
      </p>
    </button>
  );
}

export function Tile({ label, value, active, alert, onClick, icon: Icon, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border bg-card px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
      }`}
    >
      <p className="flex items-center gap-1 truncate text-[11px] uppercase tracking-wider text-muted-foreground">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </p>
      <p className={`text-xl font-bold ${alert ? "text-rose-600" : "text-foreground"}`}>{value}</p>
      {hint ? <p className="truncate text-[11px] text-muted-foreground">{hint}</p> : null}
    </button>
  );
}
