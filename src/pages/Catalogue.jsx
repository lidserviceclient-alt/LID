import PageSEO from "@/components/PageSEO";
import Catalog from "../components/Catalog.jsx";

export default function Catalogue() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950"><PageSEO title="Boutique" description="Découvrez des milliers de produits mode, tech et maison en Côte d'Ivoire. Livraison express disponible." canonical="/shop" />
      <Catalog />
    </div>
  );
}
