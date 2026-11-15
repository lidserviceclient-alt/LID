import SubPageLayout from "../../components/ui/SubPageLayout.jsx";
import { SETTINGS_SECTIONS } from "./sections.js";

/**
 * Coquille de /settings : titre, navigation entre sections (colonne repliable ≥ lg,
 * menu déroulant sur mobile) et contenu de la section active via <Outlet />.
 * Mise en page partagée : components/ui/SubPageLayout.jsx.
 */
export default function SettingsLayout() {
  return (
    <SubPageLayout
      title="Paramètres"
      subtitle="Configuration de la boutique, de la livraison, de l’équipe et de la sécurité."
      basePath="/settings"
      sections={SETTINGS_SECTIONS}
      storageKey="settings"
      navLabel="Sections des paramètres"
    />
  );
}
