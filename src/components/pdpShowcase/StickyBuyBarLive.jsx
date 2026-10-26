import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { FOCUS_RING, formatFcfa } from "./liveUtils";

// Barre d'achat collante mobile / tablette (< lg), affichée quand les boutons du bloc d'achat sont hors écran.
// Elle flotte au-dessus de la navigation mobile du site (bottomOffset) sans masquer son bouton central.
export default function StickyBuyBarLive({ visible, productName, price, initialPrice, outOfStock, onAddToCart, onBuyNow, bottomOffset = 0 }) {
  const bottom = bottomOffset > 0 ? bottomOffset + 40 : 12;
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="lg:hidden fixed inset-x-3 z-[80] font-barlow"
          style={{ bottom }}
          role="region"
          aria-label="Achat rapide"
        >
          <div className="mx-auto max-w-xl flex items-center gap-3 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur border border-pdp-line-2 dark:border-neutral-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-2 pl-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-pdp-gray-700 dark:text-neutral-400 truncate">{productName}</p>
              <p className="flex items-baseline gap-2">
                <span className="text-lg font-bold leading-tight text-pdp-ink dark:text-white tabular-nums">{formatFcfa(price)}</span>
                {initialPrice ? (
                  <span className="text-xs text-pdp-gray-500 line-through tabular-nums">{formatFcfa(initialPrice)}</span>
                ) : null}
              </p>
            </div>
            {outOfStock ? (
              <span className="h-11 px-4 rounded-xl bg-pdp-surface dark:bg-neutral-800 text-pdp-gray-500 text-sm font-bold inline-flex items-center">
                Épuisé
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onBuyNow}
                  className={`hidden sm:inline-flex h-11 px-4 rounded-xl border-2 border-pdp-ink dark:border-white text-pdp-ink dark:text-white text-sm font-bold items-center ${FOCUS_RING}`}
                >
                  Acheter maintenant
                </button>
                <button
                  type="button"
                  onClick={onAddToCart}
                  aria-label="Ajouter au panier"
                  className={`h-11 px-4 rounded-xl bg-pdp-accent-strong hover:bg-pdp-accent-deep text-white text-sm font-bold inline-flex items-center gap-2 ${FOCUS_RING}`}
                >
                  <ShoppingCart size={17} aria-hidden="true" />
                  Ajouter
                </button>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
