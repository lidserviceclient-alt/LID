import { AnimatePresence, motion } from "framer-motion";

export default function StickyBuyBar({ visible, product, imageSrc, variantLabel, onAddToCart, onBuyNow }) {
  const hasDiscount = Boolean(product.pricing.originalPrice);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white font-barlow"
          style={{ height: 88, boxShadow: "0 -2px 12px rgba(0,0,0,.08)" }}
        >
          <div className="max-w-[1228px] h-full mx-auto px-4 md:px-12 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img src={imageSrc} alt={product.name} className="w-16 h-16 object-contain bg-pdp-surface rounded-lg flex-shrink-0" />
              <div className="min-w-0 hidden sm:block">
                <h3 className="text-[18px] font-bold text-pdp-ink truncate max-w-[400px]">{product.name}</h3>
                {variantLabel ? <p className="text-base text-pdp-gray-700 truncate">{variantLabel}</p> : null}
              </div>
            </div>

            <div className="hidden md:block text-right flex-shrink-0">
              <div className={`text-[32px] font-bold leading-none ${hasDiscount ? "text-pdp-red" : "text-pdp-ink"}`}>
                {product.pricing.price.toFixed(2).replace(".", ",")}€
              </div>
              {hasDiscount ? (
                <div className="text-sm text-pdp-ink mt-1">
                  Prix conseillé : {product.pricing.originalPrice.toFixed(2).replace(".", ",")} € | {product.pricing.discountPercent} % de réduction
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button type="button" onClick={onBuyNow} className="h-12 px-6 rounded bg-pdp-red text-white text-[18px] font-bold whitespace-nowrap">
                Acheter maintenant
              </button>
              <button type="button" onClick={onAddToCart} className="h-12 px-6 rounded bg-pdp-ink text-white text-[18px] font-bold whitespace-nowrap">
                Ajouter au panier
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
