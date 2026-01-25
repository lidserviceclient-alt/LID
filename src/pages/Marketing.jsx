import Placeholder from "./Placeholder.jsx";
import Button from "../components/ui/Button.jsx";

export default function Marketing() {
  return (
    <Placeholder
      title="Marketing"
      subtitle="Campagnes, coupons et automation CRM."
      actions={<Button variant="outline">Nouvelle campagne</Button>}
    />
  );
}
