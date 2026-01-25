import Placeholder from "./Placeholder.jsx";
import Button from "../components/ui/Button.jsx";

export default function Inventory() {
  return (
    <Placeholder
      title="Stocks"
      subtitle="Vision sur le stock, reapprovisionnement et entrepots."
      actions={<Button variant="outline">Nouvel inventaire</Button>}
    />
  );
}
