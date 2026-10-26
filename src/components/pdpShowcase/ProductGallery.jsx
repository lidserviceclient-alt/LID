import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Recycle, PlayCircle, X, ChevronDown } from "lucide-react";

const srcOf = (item) => (typeof item === "string" ? item : item.src);
const isVideo = (item) => typeof item === "object" && item?.type === "video";

export default function ProductGallery({ images, name, recyclingBadge, isWishlisted, onToggleWishlist }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [mobileIdx, setMobileIdx] = useState(0);
  const activeItem = images[active];

  const onMobileScroll = (e) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== mobileIdx) setMobileIdx(idx);
  };

  return (
    <div className="lg:sticky lg:top-[136px] font-barlow">
      {/* Mobile: carrousel swipe 1:1 */}
      <div className="lg:hidden -mx-4">
        <div className="relative">
          <div onScroll={onMobileScroll} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {images.map((item, i) => (
              <div key={i} className="snap-center shrink-0 w-full px-4">
                <div className="aspect-square bg-pdp-surface rounded-lg overflow-hidden">
                  <img src={srcOf(item)} alt={`${name} ${i + 1}`} className="w-full h-full object-contain" />
                </div>
              </div>
            ))}
          </div>
          <span className="absolute bottom-2 right-6 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded">
            {mobileIdx + 1}/{images.length}
          </span>
        </div>
      </div>

      {/* Desktop: rail + média principal */}
      <div className="hidden lg:flex gap-4">
        <div className="w-16 flex flex-col items-center gap-2">
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[470px] scrollbar-hide">
            {images.map((item, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  active === i ? "border-2 border-pdp-ink" : "border-2 border-transparent hover:bg-black/[0.03]"
                }`}
              >
                <img src={srcOf(item)} alt="" className="w-14 h-14 object-contain rounded" />
                {isVideo(item) ? (
                  <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-medium px-1 rounded flex items-center gap-0.5">
                    <PlayCircle size={10} /> Vidéo
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          {images.length > 7 ? <ChevronDown size={16} className="text-pdp-gray-500" /> : null}
        </div>

        <div className="relative w-[504px] h-[504px] bg-pdp-surface rounded-xl overflow-hidden flex-shrink-0">
          {recyclingBadge ? (
            <span className="absolute top-4 left-4 z-10 bg-white rounded-[20px] px-3 py-2 text-base font-medium flex items-center gap-1.5">
              <Recycle size={20} className="text-pdp-green" />
              {recyclingBadge}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-label="Ajouter aux favoris"
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-md bg-white border border-black/[0.04] flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Heart size={28} className={isWishlisted ? "fill-pdp-red text-pdp-red" : "text-pdp-ink"} />
          </button>

          <button type="button" onClick={() => setLightbox(true)} className="w-full h-full cursor-zoom-in">
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={srcOf(activeItem)}
                alt={name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-contain p-[15%]"
              />
            </AnimatePresence>
          </button>

          {isVideo(activeItem) ? (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-center gap-3 text-white text-xs">
              <PlayCircle size={20} />
              <span>0:00 / {activeItem.duration}</span>
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-8"
          >
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Fermer"
              className="absolute top-6 right-6 text-white"
            >
              <X size={28} />
            </button>
            <img src={srcOf(activeItem)} alt={name} className="max-w-full max-h-full object-contain" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
