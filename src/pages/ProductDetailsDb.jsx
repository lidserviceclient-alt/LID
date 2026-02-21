import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { getCatalogProduct } from "@/services/productService";
import { resolveBackendAssetUrl } from "@/services/categoryService";

export default function ProductDetailsDb() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    setIsLoading(true);
    setError("");
    getCatalogProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Impossible de charger le produit");
        setProduct(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const imageSrc = useMemo(() => {
    return resolveBackendAssetUrl(product?.imageUrl);
  }, [product?.imageUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
        <div className="max-w-lg w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center bg-white dark:bg-neutral-900">
          <div className="text-lg font-bold text-neutral-900 dark:text-white">Erreur</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{error}</div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm"
            >
              Retour au catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
        <div className="max-w-lg w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center bg-white dark:bg-neutral-900">
          <div className="text-lg font-bold text-neutral-900 dark:text-white">Produit introuvable</div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm"
            >
              Retour au catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const price = Number(product?.price) || 0;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
          <Link to="/" className="hover:underline">Accueil</Link> <span>›</span>{" "}
          <Link to="/shop" className="hover:underline">Catalogue</Link> <span>›</span>{" "}
          <span className="text-orange-600 font-medium">{product?.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="aspect-square rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
              {imageSrc ? (
                <img src={imageSrc} alt={product?.name || ""} className="w-full h-full object-contain" />
              ) : (
                <div className="text-sm text-neutral-400">Aucune image</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{product?.name}</h1>
            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {product?.brand ? <span>Marque: <span className="font-medium">{product.brand}</span></span> : null}
              {product?.categoryName ? (
                <span className={product?.brand ? "ml-4" : ""}>
                  Catégorie: <span className="font-medium">{product.categoryName}</span>
                </span>
              ) : null}
            </div>

            <div className="mt-6 text-3xl font-black text-neutral-900 dark:text-white">
              {price.toLocaleString()} <span className="text-base font-bold">FCFA</span>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => addToCart({ id: product.id, name: product.name, price, image: imageSrc, size: "Unique", referenceProduitPartenaire: product.referenceProduitPartenaire })}
                className="px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center gap-2"
              >
                <ShoppingBag size={18} />
                Ajouter au panier
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-bold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                Continuer vos achats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
