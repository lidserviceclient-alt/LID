import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { FALLBACK_IMAGE, FOCUS_RING, computeDiscount, formatFcfa, pickMainImage, resolveImageSrc } from "./liveUtils";

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-square rounded-xl bg-pdp-surface dark:bg-neutral-900" />
      <div className="mt-3 h-3 w-1/3 rounded bg-pdp-surface dark:bg-neutral-900" />
      <div className="mt-2 h-3 w-5/6 rounded bg-pdp-surface dark:bg-neutral-900" />
      <div className="mt-2 h-4 w-1/2 rounded bg-pdp-surface dark:bg-neutral-900" />
    </div>
  );
}

export default function ProductCardLive({ product }) {
  const price = Number(product.price) || 0;
  const rating = Number(product.rating) || 0;
  const reviews = Number(product.reviews) || 0;
  const imageSrc = resolveImageSrc(pickMainImage(product)) || FALLBACK_IMAGE;
  const discount = computeDiscount(price, product.initialPrice);
  const outOfStock = product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0;

  return (
    <Link to={`/product/${product.id}`} className={`group block rounded-xl font-barlow ${FOCUS_RING}`}>
      <div className="relative aspect-square rounded-xl bg-pdp-surface dark:bg-neutral-900 overflow-hidden">
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-[1.04] ${outOfStock ? "opacity-50" : ""}`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {discount ? (
          <span className="absolute top-2 left-2 rounded-md bg-pdp-red text-white text-xs font-bold px-1.5 py-0.5">-{discount.percent} %</span>
        ) : null}
        {outOfStock ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-white/95 dark:bg-neutral-950/95 text-pdp-ink dark:text-white text-xs font-semibold px-1.5 py-0.5">
            Épuisé
          </span>
        ) : null}
      </div>

      {product.brand ? (
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.06em] text-pdp-gray-700 dark:text-neutral-400 truncate">{product.brand}</p>
      ) : (
        <div className="mt-3" />
      )}
      <p className="mt-0.5 text-sm sm:text-[15px] font-medium leading-snug text-pdp-ink dark:text-white line-clamp-2 group-hover:underline underline-offset-2">
        {product.name}
      </p>

      {reviews > 0 ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-pdp-gray-700 dark:text-neutral-400">
          <Star size={12} className="text-pdp-orange" fill="currentColor" strokeWidth={0} aria-hidden="true" />
          <span>{rating.toFixed(1).replace(".", ",")}</span>
          <span>({reviews})</span>
        </p>
      ) : null}

      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
        <span className="text-base font-bold text-pdp-ink dark:text-white tabular-nums">{formatFcfa(price)}</span>
        {discount ? (
          <span className="text-xs text-pdp-gray-500 line-through tabular-nums">{formatFcfa(discount.initialPrice)}</span>
        ) : null}
      </p>
    </Link>
  );
}
