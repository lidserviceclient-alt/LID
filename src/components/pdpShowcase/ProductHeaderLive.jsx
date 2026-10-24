import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, Star } from "lucide-react";

export default function ProductHeaderLive({ product, categoryLink, ratingSummary, onShare }) {
  const navigate = useNavigate();
  const crumbs = [
    { label: "Accueil", to: "/" },
    { label: "Catalogue", to: "/shop" },
    product.categoryName ? { label: product.categoryName, to: categoryLink } : null,
  ].filter(Boolean);

  return (
    <div className="font-barlow">
      <div className="flex items-center justify-between gap-4 h-6 mt-6">
        <button type="button" onClick={() => navigate(-1)} className="md:hidden flex items-center gap-1 text-base font-medium text-pdp-ink flex-shrink-0">
          <ChevronLeft size={18} /> Retour
        </button>

        <nav className="hidden md:flex items-center min-w-0 overflow-hidden flex-nowrap">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center flex-shrink-0 whitespace-nowrap">
              {i > 0 ? <span className="text-black/60 text-base px-2">/</span> : null}
              <Link to={crumb.to} className="text-base font-medium text-black hover:underline">{crumb.label}</Link>
            </span>
          ))}
          <span className="text-black/60 text-base px-2">/</span>
          <span className="text-base font-semibold text-pdp-ink truncate max-w-[400px] inline-block">{product.name}</span>
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button type="button" onClick={onShare} className="hidden sm:inline text-base text-pdp-gray-700">Partager</button>
          <button type="button" onClick={onShare} aria-label="Partager" className="text-pdp-ink">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {product.brand ? (
        <div className="flex items-center gap-2 mt-6">
          <span className="text-[20px] font-bold leading-[26px] text-black">{product.brand}</span>
        </div>
      ) : null}

      <h1 className="text-[24px] font-bold leading-[32px] text-pdp-ink mt-2 py-2">{product.name}</h1>

      {product.isBestSeller || product.isFeatured ? (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {product.isBestSeller ? (
            <span className="bg-pdp-surface rounded text-base font-semibold px-1.5 py-1">Meilleures ventes</span>
          ) : null}
          {product.isFeatured ? (
            <span className="bg-pdp-orange/10 text-pdp-orange rounded text-base font-semibold px-1.5 py-1">Produit phare</span>
          ) : null}
        </div>
      ) : null}

      {ratingSummary && ratingSummary.reviewCount > 0 ? (
        <div className="flex items-center h-6 mt-4 gap-3">
          <Star size={20} className="fill-pdp-ink text-pdp-ink" />
          <span className="text-base">{ratingSummary.avgRating.toFixed(1)}</span>
          <a href="#reviews" className="text-base underline">({ratingSummary.reviewCount} avis)</a>
        </div>
      ) : null}
    </div>
  );
}
