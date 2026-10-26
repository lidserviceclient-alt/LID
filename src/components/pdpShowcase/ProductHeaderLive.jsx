import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { FOCUS_RING } from "./liveUtils";

// Fil d'Ariane + partage. Le titre, la marque et le vendeur sont dans le bloc d'achat (BuyBoxLive).
export default function ProductHeaderLive({ product, categoryLink, onShare }) {
  const navigate = useNavigate();
  const crumbs = [
    { label: "Accueil", to: "/" },
    { label: "Catalogue", to: "/shop" },
    product.categoryName ? { label: product.categoryName, to: categoryLink } : null,
  ].filter(Boolean);

  return (
    <div className="font-barlow flex items-center justify-between gap-4 min-h-[44px]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className={`md:hidden -ml-2 inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm font-semibold text-pdp-ink dark:text-white ${FOCUS_RING}`}
      >
        <ChevronLeft size={18} aria-hidden="true" /> Retour
      </button>

      <nav aria-label="Fil d'Ariane" className="hidden md:block min-w-0">
        <ol className="flex items-center min-w-0 text-sm">
          {crumbs.map((crumb) => (
            <li key={crumb.to + crumb.label} className="flex items-center flex-shrink-0">
              <Link
                to={crumb.to}
                className={`rounded text-pdp-gray-700 dark:text-neutral-400 hover:text-pdp-ink dark:hover:text-white hover:underline underline-offset-2 ${FOCUS_RING}`}
              >
                {crumb.label}
              </Link>
              <ChevronRight size={14} className="mx-1.5 text-pdp-gray-500 dark:text-neutral-600" aria-hidden="true" />
            </li>
          ))}
          <li className="min-w-0">
            <span aria-current="page" className="block truncate max-w-[420px] font-medium text-pdp-ink dark:text-white">
              {product.name}
            </span>
          </li>
        </ol>
      </nav>

      <button
        type="button"
        onClick={onShare}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-pdp-gray-700 dark:text-neutral-300 hover:bg-pdp-surface dark:hover:bg-neutral-900 hover:text-pdp-ink dark:hover:text-white transition-colors ${FOCUS_RING}`}
      >
        <Share2 size={16} aria-hidden="true" />
        <span>Partager</span>
      </button>
    </div>
  );
}
