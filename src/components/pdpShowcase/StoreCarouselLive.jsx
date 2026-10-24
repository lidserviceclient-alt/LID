import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveBackendAssetUrl } from "@/services/categoryService";

const FALLBACK_IMAGE = "/imgs/logo.png";

export default function StoreCarouselLive({ title, products }) {
  const trackRef = useRef(null);
  if (!products?.length) return null;

  const scroll = (dir) => trackRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

  return (
    <div className="font-barlow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink">{title}</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button type="button" onClick={() => scroll(-1)} aria-label="Précédent" className="w-12 h-12 rounded-full bg-pdp-surface flex items-center justify-center">
            <ChevronLeft size={20} className="text-pdp-ink" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Suivant" className="w-12 h-12 rounded-full bg-pdp-surface flex items-center justify-center">
            <ChevronRight size={20} className="text-pdp-ink" />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {products.map((p) => {
          const imageSrc = resolveBackendAssetUrl(p.imageUrl) || FALLBACK_IMAGE;
          return (
            <Link key={p.id} to={`/product/${p.id}`} className="w-[182px] flex-shrink-0">
              <div className="w-[182px] h-[182px] bg-pdp-surface rounded-lg overflow-hidden mb-2">
                <img
                  src={imageSrc}
                  alt={p.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                />
              </div>
              <p className="text-[15px] font-medium text-pdp-ink line-clamp-2 mb-1">{p.name}</p>
              <span className="text-[15px] font-bold text-pdp-ink">{(Number(p.price) || 0).toLocaleString()} FCFA</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
