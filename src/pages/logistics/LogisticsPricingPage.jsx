import { Navigate, Route, Routes } from "react-router-dom";
import SubPageLayout from "../../components/ui/SubPageLayout.jsx";
import { PricingProvider } from "./pricing/PricingContext.jsx";
import { DEFAULT_PRICING_SECTION, PRICING_SECTIONS } from "./pricing/pricingSections.js";
import StrategySection from "./pricing/StrategySection.jsx";
import ZonesSection from "./pricing/ZonesSection.jsx";
import RatesSection from "./pricing/RatesSection.jsx";
import WeightSection from "./pricing/WeightSection.jsx";
import OutsideSection from "./pricing/OutsideSection.jsx";
import CollectionSection from "./pricing/CollectionSection.jsx";
import DepotSection from "./pricing/DepotSection.jsx";
import ModesSection from "./pricing/ModesSection.jsx";
import SimulatorSection from "./pricing/SimulatorSection.jsx";
import ImportExportSection from "./pricing/ImportExportSection.jsx";
import HistorySection from "./pricing/HistorySection.jsx";

/**
 * /logistics/pricing/* : tout le calcul du prix de livraison (ex-Paramètres > Livraison), en sous-sections :
 * stratégie, zones et communes, grille tarifaire, poids, hors Abidjan, collecte option B, dépôt, modes et gratuité,
 * simulateur, import / export de la grille, historique et rapport. Les données sont chargées une fois (PricingProvider).
 */
const ELEMENTS = {
  strategie: <StrategySection />,
  zones: <ZonesSection />,
  grille: <RatesSection />,
  poids: <WeightSection />,
  "hors-abidjan": <OutsideSection />,
  collecte: <CollectionSection />,
  depot: <DepotSection />,
  modes: <ModesSection />,
  simulateur: <SimulatorSection />,
  "import-export": <ImportExportSection />,
  historique: <HistorySection />
};

export default function LogisticsPricingPage() {
  return (
    <PricingProvider>
      <SubPageLayout
        header={null}
        basePath="/logistics/pricing"
        sections={PRICING_SECTIONS}
        storageKey="logistics-pricing"
        navLabel="Sections de la tarification"
        expandedWidth={208}
      >
        <Routes>
          <Route index element={<Navigate to={DEFAULT_PRICING_SECTION} replace />} />
          {PRICING_SECTIONS.map((s) => (
            <Route key={s.key} path={s.path} element={ELEMENTS[s.key]} />
          ))}
          <Route path="*" element={<Navigate to={DEFAULT_PRICING_SECTION} replace />} />
        </Routes>
      </SubPageLayout>
    </PricingProvider>
  );
}
