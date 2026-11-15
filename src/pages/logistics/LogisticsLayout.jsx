import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Plus, RefreshCw, Settings2 } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import SubPageLayout from "../../components/ui/SubPageLayout.jsx";
import ShipmentDrawer from "../../components/logistics/ShipmentDrawer.jsx";
import { CarriersModal, NewShipmentModal, QrCodeModal } from "../../components/logistics/LogisticsModals.jsx";
import { LogisticsProvider, useLogistics } from "./LogisticsContext.jsx";
import { LOGISTICS_SECTIONS, legacyLogisticsTarget } from "./sections.js";
import { nf, openCollectionsTotal } from "./logisticsUtils.js";

/**
 * Coquille de /logistics/* : en-tête (actualiser, transporteurs, nouvelle expédition), colonne de
 * sous-pages repliable (SubPageLayout), contenu via <Outlet />, et éléments communs à toutes les
 * sous-pages (panneau du colis, QR, modales) montés une seule fois.
 */
export default function LogisticsLayout() {
  return (
    <LogisticsProvider>
      <LogisticsShell />
    </LogisticsProvider>
  );
}

function LogisticsShell() {
  const { updatedAt, refresh, busy, summary, pageData, summaryError, listError, counts, collectionCounts } = useLogistics();
  const [carriersOpen, setCarriersOpen] = useState(false);
  const [shipmentOpen, setShipmentOpen] = useState(false);
  const error = summaryError || listError;

  const sections = LOGISTICS_SECTIONS.map((s) => {
    if (s.key === "shipments") return { ...s, badge: Number(counts.failed) > 0 ? nf.format(Number(counts.failed)) : undefined };
    if (s.key === "collections") {
      const open = openCollectionsTotal(collectionCounts);
      return { ...s, badge: open > 0 ? nf.format(open) : undefined };
    }
    return s;
  });

  return (
    <>
      <SubPageLayout
        title="Logistique & Livraison"
        subtitle={
          updatedAt
            ? `Suivi des expéditions et performance transporteurs · mis à jour à ${new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" }).format(updatedAt)}, actualisation automatique`
            : "Suivi des expéditions et performance transporteurs."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={refresh} disabled={busy}>
              <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setCarriersOpen(true)}>
              <Settings2 className="h-4 w-4" />
              Configurer transporteurs
            </Button>
            <Button className="gap-2" onClick={() => setShipmentOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle expédition
            </Button>
          </div>
        }
        basePath="/logistics"
        sections={sections}
        storageKey="logistics"
        navLabel="Sections de la livraison"
      >
        {error ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{summary || pageData ? `Dernière actualisation impossible : ${error}` : error}</span>
            <Button variant="outline" size="sm" onClick={refresh}>
              Réessayer
            </Button>
          </div>
        ) : null}
        <Outlet />
      </SubPageLayout>

      <ShipmentDrawer />
      <QrCodeModal />
      <CarriersModal isOpen={carriersOpen} onClose={() => setCarriersOpen(false)} />
      <NewShipmentModal isOpen={shipmentOpen} onClose={() => setShipmentOpen(false)} />
    </>
  );
}

/** Index /logistics et anciennes URL : redirection vers la sous-page équivalente, paramètres conservés. */
export function LogisticsLegacyRedirect() {
  const location = useLocation();
  return <Navigate to={legacyLogisticsTarget(location.search)} replace />;
}
