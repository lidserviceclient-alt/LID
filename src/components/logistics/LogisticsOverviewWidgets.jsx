import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronDown, History, Warehouse } from "lucide-react";
import Card from "../ui/Card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { Table, THead, TRow, TCell } from "../ui/Table.jsx";
import { Tile } from "./ShipmentBadges.jsx";
import { useLogistics } from "../../pages/logistics/LogisticsContext.jsx";
import {
  COLUMNS,
  courierLabel,
  formatAvgDelay,
  formatDateTime,
  formatMoney,
  nf,
  openCollectionsTotal,
  shipperLabel
} from "../../pages/logistics/logisticsUtils.js";

/** Compteurs cliquables = onglets de la liste (« Tous », colonnes du suivi, historique). */
export function StatusTiles({ highlightActive = true }) {
  const { counts, totalOpen, history, tab, showTab, showHistory, pageData } = useLogistics();
  const active = (key) => highlightActive && !history && tab === key;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      <Tile label="Tous" value={nf.format(totalOpen)} active={active("")} onClick={() => showTab("")} />
      {COLUMNS.map((col) => {
        const value = Number(counts[col.countKey]) || 0;
        return (
          <Tile
            key={col.key}
            label={col.label}
            value={nf.format(value)}
            active={active(col.key)}
            alert={col.key === "FAILED" && value > 0}
            onClick={() => showTab(col.key)}
          />
        );
      })}
      <Tile
        label="Historique"
        icon={History}
        value={highlightActive && history && pageData ? nf.format(pageData.totalElements || 0) : "Tout"}
        active={highlightActive && history}
        onClick={showHistory}
      />
    </div>
  );
}

/** Délai moyen et coût moyen sur 30 jours. */
export function KpiCards() {
  const { kpis, overviewLoading, overviewError } = useLogistics();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Card className="flex items-baseline justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Délai moyen</p>
          <p className="text-xs text-muted-foreground">Livraisons clôturées sur 30 jours</p>
        </div>
        <p className="text-xl font-bold text-foreground">{overviewLoading ? "…" : formatAvgDelay(kpis.avgDelayDays)}</p>
      </Card>
      <Card className="flex items-baseline justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Coût moyen</p>
          <p className="text-xs text-muted-foreground">{overviewError || "Expéditions avec coût renseigné, 30 jours"}</p>
        </div>
        <p className="text-xl font-bold text-foreground">{overviewLoading ? "…" : formatMoney(kpis.avgCost)}</p>
      </Card>
    </div>
  );
}

/** Points d'attention : échecs, retards, collectes en anomalie, colis reçus sans livreur. */
export function LogisticsAlerts() {
  const { counts, collectionCounts, showTab, toggleLate, lateOnly, goTo } = useLogistics();
  const failed = Number(counts.failed) || 0;
  const late = Number(counts.late) || 0;
  const unassigned = Number(counts.unassigned) || 0;
  const anomalies = Number(collectionCounts?.anomalies) || 0;
  const atWarehouse = Number(collectionCounts?.atWarehouseUnassigned) || 0;
  const alerts = [
    failed > 0 && { key: "failed", tone: "rose", text: `${nf.format(failed)} échec(s) de livraison à traiter`, action: () => showTab("FAILED"), cta: "Gérer les échecs" },
    late > 0 && {
      key: "late",
      tone: "rose",
      text: `${nf.format(late)} colis en retard (sans mouvement au-delà du seuil)`,
      action: () => {
        if (!lateOnly) toggleLate();
        showTab("");
      },
      cta: "Voir les retards"
    },
    unassigned > 0 && { key: "unassigned", tone: "amber", text: `${nf.format(unassigned)} colis à affecter à un livreur`, action: () => showTab("TO_ASSIGN"), cta: "Affecter" },
    atWarehouse > 0 && {
      key: "warehouse",
      tone: "amber",
      text: `${nf.format(atWarehouse)} colis reçu(s) à l'entrepôt sans livreur`,
      action: () => showTab("TO_ASSIGN"),
      cta: "Voir « À affecter »"
    },
    anomalies > 0 && { key: "anomalies", tone: "amber", text: `${nf.format(anomalies)} collecte(s) en anomalie`, action: () => goTo("collections"), cta: "Ouvrir les collectes" }
  ].filter(Boolean);

  if (alerts.length === 0) {
    return (
      <Card className="px-4 py-3 text-sm text-muted-foreground">
        Aucun point d'attention : pas d'échec, de retard ni de colis en attente d'affectation.
      </Card>
    );
  }
  return (
    <Card className="divide-y divide-border p-0" role="region" aria-label="Points d'attention">
      {alerts.map((a) => (
        <div key={a.key} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
          <span className={`flex items-center gap-2 font-medium ${a.tone === "rose" ? "text-rose-700" : "text-amber-700"}`}>
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {a.text}
          </span>
          <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={a.action}>
            {a.cta} →
          </button>
        </div>
      ))}
    </Card>
  );
}

/** Résumé des collectes option B (lien vers la sous-page dédiée). */
export function CollectionsSummaryCard() {
  const { collectionCounts, goTo } = useLogistics();
  if (!collectionCounts) return null;
  const items = [
    { label: "À collecter", value: collectionCounts.toCollect },
    { label: "En route", value: collectionCounts.inTransit },
    { label: "À réceptionner", value: collectionCounts.deposited },
    { label: "Anomalies", value: collectionCounts.anomalies, alert: true }
  ];
  return (
    <Card className="p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Warehouse className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Collectes → entrepôt (option B)
          <span className="font-normal text-muted-foreground">({nf.format(openCollectionsTotal(collectionCounts))} en cours)</span>
        </p>
        <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => goTo("collections")}>
          Ouvrir les collectes →
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-lg border border-border px-3 py-2">
            <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{it.label}</p>
            <p className={`text-lg font-bold ${it.alert && Number(it.value) > 0 ? "text-rose-600" : "text-foreground"}`}>{nf.format(Number(it.value) || 0)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Charge des livreurs (repliable) ; un clic filtre la liste sur ce livreur. */
export function CourierLoadCard({ defaultOpen = false }) {
  const { couriers, changeCourier } = useLogistics();
  const [showLoad, setShowLoad] = useState(defaultOpen);
  return (
    <Card className="p-3">
      <button type="button" className="flex w-full items-center justify-between text-left" onClick={() => setShowLoad((v) => !v)} aria-expanded={showLoad}>
        <span className="text-sm font-semibold">
          Charge des livreurs <span className="font-normal text-muted-foreground">({couriers.length})</span>
        </span>
        <ChevronDown className={`h-4 w-4 transition ${showLoad ? "rotate-180" : ""}`} />
      </button>
      {showLoad ? (
        couriers.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Aucun livreur enregistré.{" "}
            <Link className="text-primary underline" to="/couriers">
              Créer un livreur
            </Link>
          </p>
        ) : (
          <div className="mt-3 max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-4">Livreur</th>
                  <th className="py-1.5 pr-4">À récupérer</th>
                  <th className="py-1.5 pr-4">En livraison</th>
                  <th className="py-1.5 pr-4">Échecs</th>
                  <th className="py-1.5 pr-4">En retard</th>
                  <th className="py-1.5 pr-4">Livrés</th>
                  <th className="py-1.5 pr-4">Tél.</th>
                </tr>
              </thead>
              <tbody>
                {couriers.map((c) => (
                  <tr
                    key={c.id}
                    className={`cursor-pointer border-t border-border hover:bg-muted/30 ${c.active ? "" : "opacity-50"}`}
                    onClick={() => c.email && changeCourier(c.email.toLowerCase(), { open: true })}
                    title="Filtrer la liste sur ce livreur"
                  >
                    <td className="py-1.5 pr-4 font-medium text-foreground">
                      {courierLabel(c)}
                      {c.active ? "" : " (désactivé)"}
                    </td>
                    <td className="py-1.5 pr-4">{c.toPickup}</td>
                    <td className="py-1.5 pr-4">{c.inTransit}</td>
                    <td className={`py-1.5 pr-4 ${c.failed ? "font-semibold text-rose-600" : ""}`}>{c.failed}</td>
                    <td className={`py-1.5 pr-4 ${c.late ? "font-semibold text-rose-600" : ""}`}>{c.late}</td>
                    <td className="py-1.5 pr-4">{c.deliveredToday}</td>
                    <td className="py-1.5 pr-4" onClick={(e) => e.stopPropagation()}>
                      {c.phoneNumber ? (
                        <a className="text-primary hover:underline" href={`tel:${c.phoneNumber}`}>
                          {c.phoneNumber}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </Card>
  );
}

/** Dernières livraisons clôturées (statut LIVREE). */
export function DeliveredCard() {
  const { delivered, overviewLoading, overviewError, changeStatus, showHistory } = useLogistics();
  return (
    <Card className="space-y-4 p-4">
      <SectionHeader title="Livraisons effectuées" subtitle="Dernières livraisons clôturées (statut LIVREE)" titleClassName="text-lg" />
      <Table>
        <THead>
          <TRow>
            <TCell>Tracking ID</TCell>
            <TCell>Commande</TCell>
            <TCell>Expéditeur</TCell>
            <TCell>Transporteur</TCell>
            <TCell>ETA</TCell>
            <TCell>Coût</TCell>
          </TRow>
        </THead>
        <tbody>
          {overviewLoading ? (
            <TRow>
              <TCell colSpan={6} className="text-sm text-muted-foreground">
                Chargement…
              </TCell>
            </TRow>
          ) : overviewError && delivered.length === 0 ? (
            <TRow>
              <TCell colSpan={6} className="text-sm text-red-600">
                {overviewError}
              </TCell>
            </TRow>
          ) : delivered.length === 0 ? (
            <TRow>
              <TCell colSpan={6} className="text-sm text-muted-foreground">
                Aucune livraison effectuée.
              </TCell>
            </TRow>
          ) : (
            delivered.map((d) => (
              <TRow key={d.id}>
                <TCell className="font-mono text-xs font-semibold">{d.trackingId || "-"}</TCell>
                <TCell className="font-semibold text-foreground">{d.orderId || "-"}</TCell>
                <TCell>{shipperLabel(d)}</TCell>
                <TCell>{d.carrier || "-"}</TCell>
                <TCell>{formatDateTime(d.eta)}</TCell>
                <TCell>{formatMoney(d.cost)}</TCell>
              </TRow>
            ))
          )}
        </tbody>
      </Table>
      <button
        type="button"
        className="text-xs font-medium text-primary hover:underline"
        onClick={() => {
          changeStatus("LIVREE");
          showHistory();
        }}
      >
        Voir toutes les livraisons effectuées
      </button>
    </Card>
  );
}
