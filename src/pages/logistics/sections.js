import { Bike, History, LayoutDashboard, ListChecks, Tags, Warehouse } from "lucide-react";

/**
 * Sous-pages de /logistics, dans l'ordre de la navigation (routes dans App.jsx).
 * `path` relatif à /logistics, ou absolu pour un lien vers une autre page (Livreurs).
 */
export const LOGISTICS_SECTIONS = [
  { key: "overview", path: "overview", label: "Vue d'ensemble", description: "Compteurs, alertes, indicateurs et charge des livreurs.", icon: LayoutDashboard },
  { key: "shipments", path: "shipments", label: "Livraisons clients", description: "Colis en cours, filtres, affectation et export.", icon: ListChecks },
  { key: "collections", path: "collections", label: "Collectes & entrepôt", description: "Option B : collecte, réception et anomalies.", icon: Warehouse },
  { key: "history", path: "history", label: "Historique", description: "Toutes les expéditions, export CSV.", icon: History },
  { key: "pricing", path: "pricing", label: "Tarification", description: "Grille de prix de la livraison.", icon: Tags },
  { key: "couriers", path: "/couriers", label: "Livreurs", description: "Comptes et codes (page Livreurs).", icon: Bike }
];

export const DEFAULT_LOGISTICS_SECTION = "overview";

export const findLogisticsSection = (pathname) => {
  const segment = `${pathname || ""}`.split("/")[2] || "";
  return LOGISTICS_SECTIONS.find((s) => s.path === segment) || null;
};

/**
 * Ancienne URL /logistics?… (ou /delivery-board, /logistics/suivi) -> sous-page équivalente,
 * query string conservée. Sans paramètre : vue d'ensemble.
 */
export function legacyLogisticsTarget(search) {
  const params = new URLSearchParams(search || "");
  const leg = `${params.get("leg") || ""}`.toUpperCase();
  if (leg === "COLLECTE" || params.get("tab") === "collections") {
    params.delete("leg");
    params.delete("tab");
    const rest = params.toString();
    return `/logistics/collections${rest ? `?${rest}` : ""}`;
  }
  params.delete("leg");
  if (["1", "true"].includes(params.get("history") || "")) {
    params.delete("history");
    const rest = params.toString();
    return `/logistics/history${rest ? `?${rest}` : ""}`;
  }
  const rest = params.toString();
  return rest ? `/logistics/shipments?${rest}` : `/logistics/${DEFAULT_LOGISTICS_SECTION}`;
}
