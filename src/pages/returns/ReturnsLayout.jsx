import SubPageLayout from "../../components/ui/SubPageLayout.jsx";
import { RETURNS_SECTIONS } from "./sections.js";

export default function ReturnsLayout() {
  return (
    <SubPageLayout
      title="Retours"
      subtitle="Demandes de retour, remboursements et politique de retour"
      basePath="/returns"
      storageKey="returns"
      navLabel="Sections des retours"
      sections={RETURNS_SECTIONS}
    />
  );
}
