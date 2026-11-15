import { CollectionsSummaryCard, CourierLoadCard, DeliveredCard, KpiCards, LogisticsAlerts, StatusTiles } from "../../components/logistics/LogisticsOverviewWidgets.jsx";

/** /logistics/overview : compteurs (raccourcis vers la liste), indicateurs, alertes, charge des livreurs, dernières livraisons. */
export default function LogisticsOverviewPage() {
  return (
    <div className="space-y-4">
      <StatusTiles highlightActive={false} />
      <LogisticsAlerts />
      <KpiCards />
      <CollectionsSummaryCard />
      <CourierLoadCard defaultOpen />
      <DeliveredCard />
    </div>
  );
}
