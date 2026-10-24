import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Info, Share2, Star } from "lucide-react";

export default function ProductHeader({ product, onShare }) {
  const navigate = useNavigate();
  const crumbs = [...product.breadcrumb, product.name];

  return (
    <div className="font-barlow">
      {/* Fil d'Ariane (desktop) / Retour (mobile) */}
      <div className="flex items-center justify-between gap-4 h-6 mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="md:hidden flex items-center gap-1 text-base font-medium text-pdp-ink flex-shrink-0"
        >
          <ChevronLeft size={18} /> Retour
        </button>

        <nav className="hidden md:flex items-center min-w-0 overflow-hidden flex-nowrap">
          {crumbs.map((label, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={i} className="flex items-center flex-shrink-0 whitespace-nowrap">
                {i > 0 ? <span className="text-black/60 text-base px-2">/</span> : null}
                {isLast ? (
                  <span className="text-base font-semibold text-pdp-ink truncate max-w-[550px] inline-block">{label}</span>
                ) : (
                  <Link to="#" className="text-base font-medium text-black hover:underline">
                    {label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button type="button" onClick={onShare} className="hidden sm:inline text-base text-pdp-gray-700">Partager</button>
          <button type="button" onClick={onShare} aria-label="Partager" className="text-pdp-ink">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* Marque */}
      <div className="flex items-center gap-2 mt-6">
        <span className="text-[20px] font-bold leading-[26px] text-black">{product.brand}</span>
        <Link to={product.brandShopLink} className="text-base font-normal underline text-pdp-ink">
          Afficher la boutique
        </Link>
      </div>

      {/* H1 */}
      <h1 className="text-[24px] font-bold leading-[32px] text-pdp-ink mt-2 py-2">
        {product.promoTag ? <span className="text-pdp-red">[{product.promoTag}] </span> : null}
        {product.name}
      </h1>

      {/* Classement */}
      {product.isBestSeller ? (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="bg-pdp-surface rounded text-base font-semibold px-1.5 py-1">Meilleures ventes</span>
          <span className="text-base font-medium text-pdp-ink">
            N°{product.bestSellerRank} des ventes en{" "}
            <Link to="#" className="underline">{product.bestSellerCategoryLink}</Link>
          </span>
        </div>
      ) : null}

      {/* Ligne sociale */}
      <div className="flex items-center h-6 mt-4 gap-3">
        <Star size={20} className="fill-pdp-ink text-pdp-ink" />
        <span className="text-base">{product.rating.toFixed(1)}</span>
        <Link to="#reviews" className="text-base underline">({product.reviewCount}+ avis)</Link>
        <Info size={20} className="text-pdp-gray-700" />
        <span className="w-px h-3.5 bg-pdp-line" />
        <span className="text-base">{product.soldCount} vendu(s)</span>
        <Info size={20} className="text-pdp-gray-700" />
      </div>
    </div>
  );
}
