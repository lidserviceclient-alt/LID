import Placeholder from "./Placeholder.jsx";
import Button from "../components/ui/Button.jsx";

export default function Loyalty() {
  return (
    <Placeholder
      title="Fidelite"
      subtitle="Points, statuts VIP et recompenses."
      actions={<Button variant="outline">Creer un niveau</Button>}
    />
  );
}
