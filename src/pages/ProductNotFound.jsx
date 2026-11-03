import NotFoundState from "../components/ui/NotFoundState.jsx";

export default function ProductNotFound() {
  return (
    <NotFoundState
      title="Produit introuvable"
      message="Ce produit n'existe pas ou a été supprimé. Retrouvez-le depuis la liste des produits."
      backTo="/products"
      backLabel="Retour aux produits"
    />
  );
}
