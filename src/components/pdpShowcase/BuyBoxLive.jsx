import { useEffect, useRef, useState } from "react";
import { Check, Heart, Minus, Plus, RotateCcw, ShoppingCart, Star, Store, Truck, Zap } from "lucide-react";
import { FOCUS_RING, formatFcfa } from "./liveUtils";

// Bloc d'achat de la fiche produit réelle. Toutes les valeurs affichées viennent de l'API produit
// ou de la configuration publique du back-office (TVA, modes de livraison, fenêtre de retour) :
// aucune promesse commerciale codée en dur.

/** Collant « intelligent » : colle en haut si le bloc tient dans l'écran, sinon colle par le bas. */
function useSmartStickyTop(ref, desiredTop) {
  const [top, setTop] = useState(desiredTop);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return undefined;
    const compute = () => {
      const h = el.getBoundingClientRect().height;
      const next = Math.round(Math.min(desiredTop, window.innerHeight - h - 16));
      setTop((prev) => (prev === next ? prev : next));
    };
    compute();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(compute) : null;
    ro?.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [ref, desiredTop]);
  return top;
}

function RatingStars({ value, size = 16 }) {
  const rounded = Math.round((Number(value) || 0) * 2) / 2;
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-pdp-line dark:text-neutral-700" fill="currentColor" strokeWidth={0} />
            {fill > 0 ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-pdp-orange" fill="currentColor" strokeWidth={0} />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

function Availability({ availability }) {
  if (availability.status === "unknown") return null;
  const map = {
    in: { dot: "bg-pdp-green", text: "text-pdp-green", label: "En stock" },
    low: {
      dot: "bg-pdp-amber",
      text: "text-pdp-amber dark:text-amber-400",
      label: `Plus que ${availability.stock} en stock`,
    },
    out: { dot: "bg-pdp-red", text: "text-pdp-red", label: "Épuisé" },
  };
  const conf = map[availability.status];
  return (
    <p className={`inline-flex items-center gap-2 text-sm font-semibold ${conf.text}`}>
      <span className={`w-2 h-2 rounded-full ${conf.dot}`} aria-hidden="true" />
      {conf.label}
    </p>
  );
}

function ShippingSelector({ methods, selectedCode, onSelect, disabled }) {
  if (!methods?.length) return null;
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="text-sm font-semibold text-pdp-ink dark:text-white mb-2">Mode de livraison</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Mode de livraison">
        {methods.map((m) => {
          const isSelected = selectedCode === m.code;
          return (
            <button
              key={m.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(m.code)}
              className={`relative rounded-xl border p-3 text-left transition-colors disabled:opacity-60 ${FOCUS_RING} ${
                isSelected
                  ? "border-pdp-accent bg-pdp-accent-soft dark:bg-pdp-accent/10 ring-1 ring-pdp-accent"
                  : "border-pdp-line-2 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-pdp-gray-500"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-pdp-ink dark:text-white">
                  {`${m.code}`.toUpperCase() === "EXPRESS" ? <Zap size={15} aria-hidden="true" /> : <Truck size={15} aria-hidden="true" />}
                  {m.label}
                </span>
                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-pdp-accent-strong text-white flex items-center justify-center" aria-hidden="true">
                    <Check size={13} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-pdp-line dark:border-neutral-700" aria-hidden="true" />
                )}
              </span>
              {m.leadTime ? <span className="block text-xs text-pdp-gray-700 dark:text-neutral-400 mt-1">{m.leadTime}</span> : null}
              <span className="block text-sm font-bold mt-1 text-pdp-ink dark:text-white">
                {m.freeApplied ? <span className="text-pdp-green">Offerte</span> : formatFcfa(m.costAmount)}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function QuantityStepper({ value, max, onChange, disabled }) {
  const canDecrease = !disabled && value > 1;
  const canIncrease = !disabled && (max === null || value < max);
  const btn = `w-11 h-full flex items-center justify-center text-pdp-ink dark:text-white hover:bg-pdp-surface dark:hover:bg-neutral-900 disabled:opacity-35 disabled:hover:bg-transparent transition-colors ${FOCUS_RING} focus-visible:ring-inset`;
  return (
    <div className="inline-flex items-center h-12 rounded-xl border border-pdp-line dark:border-neutral-700 overflow-hidden flex-shrink-0">
      <button type="button" className={btn} disabled={!canDecrease} onClick={() => onChange(value - 1)} aria-label="Diminuer la quantité">
        <Minus size={16} aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max ?? undefined}
        value={value}
        disabled={disabled}
        aria-label="Quantité"
        onChange={(e) => {
          const n = Math.trunc(Number(e.target.value));
          if (!Number.isFinite(n) || n < 1) return onChange(1);
          onChange(max !== null ? Math.min(n, max) : n);
        }}
        className="w-11 h-full text-center text-base font-bold tabular-nums bg-transparent text-pdp-ink dark:text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" className={btn} disabled={!canIncrease} onClick={() => onChange(value + 1)} aria-label="Augmenter la quantité">
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function BuyBoxLive({
  product,
  price,
  discount,
  vatPercent,
  availability,
  ratingSummary,
  shippingMethods,
  shippingMethod,
  onSelectShipping,
  freeShippingHint,
  returnWindowLabel,
  quantity,
  maxQuantity,
  onChangeQuantity,
  itemsTotal,
  shippingCost,
  shippingLabel,
  totalTtc,
  taxAmount,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onGoToSection,
  ctaRef,
  stickyTop = 0,
}) {
  const boxRef = useRef(null);
  const top = useSmartStickyTop(boxRef, stickyTop + 16);
  const outOfStock = availability.status === "out";
  const sellerName = `${product.sellerName || ""}`.trim() || "LID";
  const isLidSeller = sellerName.toUpperCase() === "LID";
  const reviewCount = Number(ratingSummary?.reviewCount) || 0;
  const avgRating = Number(ratingSummary?.avgRating) || 0;
  const ratingLabel = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(avgRating);

  return (
    <section
      ref={boxRef}
      aria-labelledby="pdp-title"
      className="font-barlow lg:sticky self-start"
      style={{ top }}
    >
      <div className="lg:rounded-2xl lg:border lg:border-pdp-line-2 lg:dark:border-neutral-800 lg:p-6 lg:shadow-[0_1px_2px_rgba(16,24,40,0.04)] bg-white dark:bg-neutral-950">
        {product.isBestSeller || product.isFeatured ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.isBestSeller ? (
              <span className="rounded-md bg-pdp-ink dark:bg-white text-white dark:text-pdp-ink text-xs font-semibold px-2 py-1">Meilleure vente</span>
            ) : null}
            {product.isFeatured ? (
              <span className="rounded-md bg-pdp-surface dark:bg-neutral-900 text-pdp-ink dark:text-white text-xs font-semibold px-2 py-1">Produit phare</span>
            ) : null}
          </div>
        ) : null}

        {product.brand ? (
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-pdp-gray-700 dark:text-neutral-400">{product.brand}</p>
        ) : null}

        <h1 id="pdp-title" className="mt-1 text-[22px] sm:text-[26px] font-bold leading-tight text-pdp-ink dark:text-white text-balance">
          {product.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {reviewCount > 0 ? (
            <button
              type="button"
              onClick={() => onGoToSection("avis")}
              className={`inline-flex items-center gap-1.5 rounded text-pdp-ink dark:text-white hover:underline underline-offset-2 ${FOCUS_RING}`}
              aria-label={`Note moyenne ${ratingLabel} sur 5, ${reviewCount} avis. Voir les avis`}
            >
              <RatingStars value={avgRating} />
              <span className="font-semibold">{ratingLabel}</span>
              <span className="text-pdp-gray-700 dark:text-neutral-400">({reviewCount} avis)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onGoToSection("avis")}
              className={`inline-flex items-center gap-1.5 rounded text-pdp-gray-700 dark:text-neutral-400 hover:text-pdp-ink dark:hover:text-white hover:underline underline-offset-2 ${FOCUS_RING}`}
            >
              <RatingStars value={0} size={14} />
              Aucun avis · Donner votre avis
            </button>
          )}
          {product.referenceProduitPartenaire ? (
            <span className="text-pdp-gray-500 dark:text-neutral-500">Réf. {product.referenceProduitPartenaire}</span>
          ) : null}
        </div>

        <p className="mt-3 inline-flex items-center gap-2 text-sm text-pdp-gray-700 dark:text-neutral-400">
          <Store size={16} aria-hidden="true" className="flex-shrink-0" />
          <span>
            {isLidSeller ? "Vendu et expédié par " : "Vendu par "}
            <span className="font-semibold text-pdp-ink dark:text-white">{sellerName}</span>
          </span>
        </p>

        <div className="h-px bg-pdp-line-2 dark:bg-neutral-800 my-5" />

        {/* Prix */}
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[32px] sm:text-[36px] font-bold leading-none tracking-tight text-pdp-ink dark:text-white tabular-nums">
              {formatFcfa(price)}
            </span>
            {discount ? (
              <>
                <span className="text-base text-pdp-gray-500 dark:text-neutral-500 line-through tabular-nums">
                  <span className="sr-only">Prix initial : </span>
                  {formatFcfa(discount.initialPrice)}
                </span>
                <span className="rounded-md bg-pdp-red/10 text-pdp-red text-sm font-bold px-2 py-0.5">-{discount.percent} %</span>
              </>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-pdp-gray-700 dark:text-neutral-400">
            Prix TTC, TVA {vatPercent} % incluse
            {discount ? ` · vous économisez ${formatFcfa(discount.initialPrice - price)}` : ""}
          </p>
          <div className="mt-3">
            <Availability availability={availability} />
          </div>
        </div>

        <div className="h-px bg-pdp-line-2 dark:bg-neutral-800 my-5" />

        <ShippingSelector methods={shippingMethods} selectedCode={shippingMethod} onSelect={onSelectShipping} disabled={outOfStock} />
        {freeShippingHint && !outOfStock ? (
          <p className="mt-2 text-xs text-pdp-gray-700 dark:text-neutral-400">{freeShippingHint}</p>
        ) : null}

        {/* Quantité, récapitulatif et actions */}
        <div ref={ctaRef} className="mt-5">
          {outOfStock ? (
            <div className="rounded-xl bg-pdp-surface dark:bg-neutral-900 p-4">
              <p className="text-sm font-semibold text-pdp-ink dark:text-white">Ce produit est momentanément épuisé.</p>
              <p className="mt-1 text-sm text-pdp-gray-700 dark:text-neutral-400">
                Ajoutez-le à vos favoris pour le retrouver facilement, ou consultez les produits similaires ci-dessous.
              </p>
            </div>
          ) : (
            <dl className="rounded-xl bg-pdp-surface dark:bg-neutral-900 px-4 py-3 text-sm space-y-1.5">
              <div className="flex justify-between gap-4">
                <dt className="text-pdp-gray-700 dark:text-neutral-400">
                  {quantity} article{quantity > 1 ? "s" : ""}
                </dt>
                <dd className="font-medium tabular-nums text-pdp-ink dark:text-white">{formatFcfa(itemsTotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-pdp-gray-700 dark:text-neutral-400">Livraison {shippingLabel}</dt>
                <dd className="font-medium tabular-nums text-pdp-ink dark:text-white">
                  {shippingCost === 0 ? <span className="text-pdp-green">Offerte</span> : formatFcfa(shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 pt-1.5 border-t border-pdp-line dark:border-neutral-800">
                <dt className="font-semibold text-pdp-ink dark:text-white">Total TTC</dt>
                <dd className="font-bold tabular-nums text-pdp-ink dark:text-white">{formatFcfa(totalTtc)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-xs">
                <dt className="text-pdp-gray-700 dark:text-neutral-400">dont TVA ({vatPercent} %)</dt>
                <dd className="tabular-nums text-pdp-gray-700 dark:text-neutral-400">{formatFcfa(taxAmount)}</dd>
              </div>
            </dl>
          )}

          <div className="mt-4 flex items-stretch gap-2">
            {!outOfStock ? <QuantityStepper value={quantity} max={maxQuantity} onChange={onChangeQuantity} /> : null}
            <button
              type="button"
              onClick={onAddToCart}
              disabled={outOfStock}
              className={`flex-1 h-12 rounded-xl inline-flex items-center justify-center gap-2 text-base font-bold transition-all active:scale-[0.99] ${FOCUS_RING} ${
                outOfStock
                  ? "bg-pdp-surface dark:bg-neutral-900 text-pdp-gray-500 cursor-not-allowed"
                  : "bg-pdp-accent-strong hover:bg-pdp-accent-deep text-white shadow-sm"
              }`}
            >
              {outOfStock ? (
                "Produit épuisé"
              ) : (
                <>
                  <ShoppingCart size={18} aria-hidden="true" /> Ajouter au panier
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
              title={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
              className={`w-12 h-12 flex-shrink-0 rounded-xl border flex items-center justify-center transition-colors ${FOCUS_RING} ${
                isWishlisted
                  ? "border-pdp-red/30 bg-pdp-red/5 text-pdp-red"
                  : "border-pdp-line dark:border-neutral-700 text-pdp-ink dark:text-white hover:border-pdp-gray-500"
              }`}
            >
              <Heart size={20} className={isWishlisted ? "fill-current" : ""} aria-hidden="true" />
            </button>
          </div>

          {!outOfStock ? (
            <button
              type="button"
              onClick={onBuyNow}
              className={`mt-2 w-full h-12 rounded-xl border-2 border-pdp-ink dark:border-white text-pdp-ink dark:text-white text-base font-bold hover:bg-pdp-ink hover:text-white dark:hover:bg-white dark:hover:text-pdp-ink transition-colors active:scale-[0.99] ${FOCUS_RING}`}
            >
              Acheter maintenant
            </button>
          ) : null}
        </div>

        {/* Livraison et retours (résumé, détails dans la section dédiée) */}
        <ul className="mt-5 space-y-2.5 text-sm">
          <li className="flex items-start gap-2.5 text-pdp-gray-700 dark:text-neutral-400">
            <RotateCcw size={17} className="mt-0.5 flex-shrink-0 text-pdp-ink dark:text-white" aria-hidden="true" />
            <span>
              Retour possible sous <span className="font-semibold text-pdp-ink dark:text-white">{returnWindowLabel}</span> après réception.{" "}
              <button
                type="button"
                onClick={() => onGoToSection("livraison-retours")}
                className={`rounded font-semibold text-pdp-ink dark:text-white underline underline-offset-2 hover:no-underline ${FOCUS_RING}`}
              >
                Conditions de livraison et de retour
              </button>
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
