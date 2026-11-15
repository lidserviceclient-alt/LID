import CollectionBoard from "../../components/logistics/CollectionBoard.jsx";
import { useLogistics } from "./LogisticsContext.jsx";

/** /logistics/collections : collectes option B (partenaire -> entrepôt), réception et anomalies. */
export default function LogisticsCollectionsPage() {
  const { couriers } = useLogistics();
  return <CollectionBoard couriers={couriers} />;
}
