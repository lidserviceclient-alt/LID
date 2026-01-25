import Placeholder from "./Placeholder.jsx";
import Button from "../components/ui/Button.jsx";

export default function Logistics() {
  return (
    <Placeholder
      title="Livraison"
      subtitle="Suivi des transporteurs, SLA et incidents."
      actions={<Button variant="outline">Configurer transporteurs</Button>}
    />
  );
}
