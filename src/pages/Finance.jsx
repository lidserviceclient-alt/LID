import Placeholder from "./Placeholder.jsx";
import Button from "../components/ui/Button.jsx";

export default function Finance() {
  return (
    <Placeholder
      title="Paiements"
      subtitle="Reconciliation, marges et cashflow."
      actions={<Button variant="outline">Configurer comptes</Button>}
    />
  );
}
