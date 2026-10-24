import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { resolveBackendAssetUrl } from "@/services/categoryService";

const FALLBACK_IMAGE = "/imgs/logo.png";

export default function ProductCardLive({ product }) {
  const price = Number(product.price) || 0;
  const rating = Number(product.rating) || 0;
  const reviews = Number(product.reviews) || 0;
  const imageSrc = resolveBackendAssetUrl(product.imageUrl) || FALLBACK_IMAGE;

  return (
    <Link to={`/product/${product.id}`} className="w-[228px] group block font-barlow">
      <div className="relative w-[228px] h-[228px] bg-pdp-surface rounded-lg overflow-hidden">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
        />
      </div>

      {product.isBestSeller ? (
        <span className="inline-block mt-3 bg-pdp-surface rounded text-sm font-semibold px-1.5 py-1">Meilleures ventes</span>
      ) : null}

      {product.brand ? <p className="text-base font-bold text-pdp-ink mt-3">{product.brand}</p> : null}
      <p className="text-base font-medium leading-[22px] text-pdp-ink line-clamp-2 mt-0.5">{product.name}</p>

      {reviews > 0 ? (
        <div className="flex items-center gap-1 mt-1 text-sm">
          <Star size={12} className="fill-pdp-ink text-pdp-ink" />
          <span>{rating.toFixed(1)}</span>
          <span className="text-pdp-line">|</span>
          <span>{reviews.toLocaleString()} avis</span>
        </div>
      ) : null}

      <span className="text-[18px] font-bold text-pdp-ink block mt-1">{price.toLocaleString()} FCFA</span>
    </Link>
  );
}
