import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function StoreCarousel({ title, items }) {
  const trackRef = useRef(null);
  if (!items?.length) return null;

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  return (
    <div className="font-barlow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink">{title}</h2>
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Précédent"
            className="w-12 h-12 rounded-full bg-pdp-surface flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-pdp-ink" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Suivant"
            className="w-12 h-12 rounded-full bg-pdp-surface flex items-center justify-center"
          >
            <ChevronRight size={20} className="text-pdp-ink" />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {items.map((item) => (
          <div key={item.id} className="w-[182px] flex-shrink-0">
            <div className="w-[182px] h-[182px] bg-pdp-surface rounded-lg overflow-hidden mb-2">
              <img src={item.image} alt={item.name} className="w-full h-full object-contain p-4" />
            </div>
            <p className="text-[15px] font-medium text-pdp-ink line-clamp-2 mb-1">{item.name}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-[15px] font-bold ${item.originalPrice ? "text-pdp-red" : "text-pdp-ink"}`}>
                {item.price.toFixed(2).replace(".", ",")} €
              </span>
              {item.originalPrice ? (
                <>
                  <span className="text-[13px] text-pdp-gray-700">Prix conseillé : {item.originalPrice.toFixed(2).replace(".", ",")} €</span>
                  <span className="text-[13px] text-pdp-ink">{item.discountPercent}% de réduction</span>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
