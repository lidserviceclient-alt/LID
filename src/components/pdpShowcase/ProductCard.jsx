import { Heart, Star, Plus } from "lucide-react";

export default function ProductCard({ item, brandName }) {
  const hasDiscount = Boolean(item.originalPrice);
  const promoPrice = item.promoPrice;

  return (
    <div className="w-[228px] group">
      <div className="relative w-[228px] h-[228px] bg-pdp-surface rounded-lg overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          aria-label="Ajouter aux favoris"
          className="absolute top-3 right-3 text-pdp-gray-500 hover:text-pdp-red"
        >
          <Heart size={24} />
        </button>
        <button
          type="button"
          aria-label="Ajouter au panier"
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-pdp-surface flex items-center justify-center shadow-sm hover:bg-white"
        >
          <Plus size={18} className="text-pdp-ink" />
        </button>
      </div>

      {item.badge ? (
        <span className="inline-block mt-3 bg-pdp-surface rounded text-sm font-semibold px-1.5 py-1">{item.badge}</span>
      ) : null}

      <p className="text-base font-bold text-pdp-ink mt-3">{item.brand}</p>
      <p className="text-base font-medium leading-[22px] text-pdp-ink line-clamp-2 mt-0.5">{item.name}</p>

      <div className="flex items-center gap-1 mt-1 text-sm">
        <Star size={12} className="fill-pdp-ink text-pdp-ink" />
        <span>{item.rating}</span>
        <span className="text-pdp-line">|</span>
        <span>{item.soldCount} vendus</span>
      </div>

      <div className="flex items-baseline gap-2 flex-wrap mt-1">
        <span className={`text-[18px] font-bold ${hasDiscount ? "text-pdp-red" : "text-pdp-ink"}`}>
          {(promoPrice ?? item.price).toFixed(2).replace(".", ",")} €
        </span>
      </div>
      {hasDiscount ? (
        <div className="text-sm text-pdp-ink">
          Prix conseillé : {item.originalPrice.toFixed(2).replace(".", ",")} € · {item.discountPercent}% de réduction
        </div>
      ) : null}
      {promoPrice ? (
        <div className="text-sm font-medium text-pdp-red">Prix après promotion : {promoPrice.toFixed(2).replace(".", ",")} €</div>
      ) : null}

      <p className="text-sm text-pdp-gray-500 truncate mt-1">🚚 {item.deliveryLabel}</p>
      <p className="text-sm font-medium text-pdp-ink flex items-center gap-1">
        <span className="w-4 h-4 rounded-sm bg-pdp-red flex-shrink-0" /> Vendu par {brandName}
      </p>
      {item.recyclingFree ? <p className="text-sm text-pdp-gray-500">Recyclage gratuit</p> : null}
    </div>
  );
}
