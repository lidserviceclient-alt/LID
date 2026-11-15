import { StatusTiles } from "../../components/logistics/LogisticsOverviewWidgets.jsx";
import { ShipmentsColumns, ShipmentsFilters, ShipmentsTable } from "../../components/logistics/ShipmentsList.jsx";
import { useLogistics } from "./LogisticsContext.jsx";
import { COLUMNS, nf } from "./logisticsUtils.js";

/**
 * /logistics/shipments (livraisons clients) et /logistics/history (historique complet) :
 * même liste paginée côté serveur, mêmes filtres ; la sous-page fixe le mode `history`.
 */
export default function LogisticsShipmentsPage() {
  const { history, tab, view, collectionCounts } = useLogistics();
  const title = history
    ? "Historique complet des expéditions"
    : tab
      ? COLUMNS.find((c) => c.key === tab)?.label
      : "Colis du suivi (en cours et livrés du jour)";

  return (
    <div className="space-y-4">
      <StatusTiles />
      {!history && collectionCounts && Number(collectionCounts.atWarehouseUnassigned) > 0 ? (
        <p className="text-xs font-medium text-amber-700">
          {nf.format(Number(collectionCounts.atWarehouseUnassigned))} colis reçu(s) à l'entrepôt sans livreur (voir « À affecter »)
        </p>
      ) : null}
      <ShipmentsFilters allowColumns={!history} />
      {view === "list" ? <ShipmentsTable title={title} /> : <ShipmentsColumns />}
    </div>
  );
}
