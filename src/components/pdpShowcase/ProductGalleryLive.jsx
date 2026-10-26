import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, X } from "lucide-react";
import { FOCUS_RING } from "./liveUtils";

// Galerie de la fiche produit réelle : miniatures, flèches, clavier, zoom au survol (desktop),
// carrousel à glisser (mobile) et plein écran. Monter avec `key={product.id}` pour réinitialiser l'état.

function Placeholder({ label = "Image indisponible" }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-pdp-gray-500 dark:text-neutral-500">
      <ImageOff size={40} strokeWidth={1.5} aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function ArrowButton({ direction, onClick, className = "", label }) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-10 h-10 rounded-full bg-white/95 dark:bg-neutral-900/95 text-pdp-ink dark:text-white shadow-md border border-black/5 dark:border-white/10 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-800 transition ${FOCUS_RING} ${className}`}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}

function Lightbox({ images, index, name, onClose, onChange }) {
  const closeRef = useRef(null);
  const touchStartX = useRef(null);
  const count = images.length;
  const go = useCallback((delta) => onChange((index + delta + count) % count), [count, index, onChange]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && count > 1) go(-1);
      else if (e.key === "ArrowRight" && count > 1) go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, go, onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Images de ${name}`}
      data-lenis-prevent=""
      className="fixed inset-0 z-[300] bg-neutral-950/95 flex flex-col font-barlow"
      onTouchStart={(e) => { touchStartX.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start === null || end === undefined || count < 2) return;
        if (Math.abs(end - start) > 50) go(end < start ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 text-white flex-shrink-0">
        <span className="text-sm font-medium tabular-nums" aria-live="polite">
          {index + 1} / {count}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className={`w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/10 ${FOCUS_RING}`}
        >
          <X size={26} aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-20" onClick={onClose}>
        <img
          src={images[index]}
          alt={`${name} – image ${index + 1} sur ${count}`}
          className="max-w-full max-h-full object-contain select-none"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
        {count > 1 ? (
          <>
            <ArrowButton direction="prev" label="Image précédente" onClick={(e) => { e.stopPropagation(); go(-1); }} className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2" />
            <ArrowButton direction="next" label="Image suivante" onClick={(e) => { e.stopPropagation(); go(1); }} className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2" />
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="flex-shrink-0 flex justify-center gap-2 px-4 py-4 overflow-x-auto scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onChange(i)}
              aria-label={`Afficher l'image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-white transition ${FOCUS_RING} ${
                i === index ? "ring-2 ring-white opacity-100" : "opacity-50 hover:opacity-90"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    document.body
  );
}

export default function ProductGalleryLive({ images = [], name = "Produit", discountPercent = null }) {
  const [failed, setFailed] = useState(() => new Set());
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const trackRef = useRef(null);

  const shown = images.filter((src) => !failed.has(src));
  const count = shown.length;
  const safeActive = count ? Math.min(active, count - 1) : 0;
  const current = shown[safeActive];

  const markFailed = (src) =>
    setFailed((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });

  const select = useCallback(
    (i) => {
      if (!count) return;
      const next = ((i % count) + count) % count;
      setActive(next);
      const track = trackRef.current;
      if (track && track.clientWidth) {
        track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
      }
    },
    [count]
  );

  const onKeyDown = (e) => {
    // Le plein écran gère ses propres touches (les événements du portail remontent l'arbre React).
    if (count < 2 || lightboxOpen) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      select(safeActive - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      select(safeActive + 1);
    }
  };

  const onTrackScroll = (e) => {
    const el = e.currentTarget;
    if (!el.clientWidth) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== safeActive && idx >= 0 && idx < count) setActive(idx);
  };

  const onZoomMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ on: true, x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  const discountBadge = discountPercent ? (
    <span className="absolute top-3 left-3 z-10 rounded-md bg-pdp-red text-white text-sm font-bold px-2 py-1 shadow-sm">
      -{discountPercent} %
    </span>
  ) : null;

  return (
    <div
      className="font-barlow"
      role="group"
      aria-roledescription="galerie"
      aria-label={`Images de ${name}`}
      onKeyDown={onKeyDown}
    >
      {/* Mobile / tablette : carrousel à glisser */}
      <div className="lg:hidden">
        <div className="relative -mx-4 sm:mx-0">
          {discountBadge}
          {count ? (
            <div
              ref={trackRef}
              onScroll={onTrackScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:rounded-2xl bg-pdp-surface dark:bg-neutral-900"
            >
              {shown.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => { setActive(i); setLightboxOpen(true); }}
                  aria-label={`Agrandir l'image ${i + 1} sur ${count}`}
                  className="snap-center shrink-0 w-full aspect-square flex items-center justify-center"
                >
                  <img
                    src={src}
                    alt={i === 0 ? name : `${name} – image ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                    decoding="async"
                    onError={() => markFailed(src)}
                    className="w-full h-full object-contain p-6 mix-blend-multiply dark:mix-blend-normal"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="aspect-square sm:rounded-2xl bg-pdp-surface dark:bg-neutral-900">
              <Placeholder />
            </div>
          )}
        </div>
        {count > 1 ? (
          <div className="flex justify-center items-center gap-1.5 mt-3" aria-hidden="true">
            {shown.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 rounded-full transition-all ${i === safeActive ? "w-5 bg-pdp-ink dark:bg-white" : "w-1.5 bg-pdp-line dark:bg-neutral-700"}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop : miniatures verticales + image principale */}
      <div className="hidden lg:flex gap-4">
        {count > 1 ? (
          <div className="w-[72px] flex-shrink-0 flex flex-col gap-2 max-h-[560px] overflow-y-auto scrollbar-hide p-0.5" role="tablist" aria-label="Miniatures">
            {shown.map((src, i) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={i === safeActive}
                aria-label={`Afficher l'image ${i + 1} sur ${count}`}
                onClick={() => select(i)}
                onMouseEnter={() => select(i)}
                className={`w-[68px] h-[68px] flex-shrink-0 rounded-lg bg-pdp-surface dark:bg-neutral-900 overflow-hidden transition ${FOCUS_RING} ${
                  i === safeActive
                    ? "ring-2 ring-pdp-ink dark:ring-white"
                    : "ring-1 ring-pdp-line-2 dark:ring-neutral-800 hover:ring-pdp-gray-500"
                }`}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  onError={() => markFailed(src)}
                  className="w-full h-full object-contain p-1.5 mix-blend-multiply dark:mix-blend-normal"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="group relative flex-1 min-w-0 aspect-square max-h-[600px] rounded-2xl bg-pdp-surface dark:bg-neutral-900 overflow-hidden">
          {discountBadge}
          {current ? (
            <>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                onMouseMove={onZoomMove}
                onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
                aria-label="Afficher l'image en plein écran"
                className={`w-full h-full cursor-zoom-in ${FOCUS_RING} focus-visible:ring-inset`}
              >
                <img
                  src={current}
                  alt={safeActive === 0 ? name : `${name} – image ${safeActive + 1}`}
                  fetchPriority="high"
                  decoding="async"
                  onError={() => markFailed(current)}
                  draggable={false}
                  style={{
                    transform: zoom.on ? "scale(2)" : "scale(1)",
                    transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  }}
                  className="w-full h-full object-contain p-[8%] mix-blend-multiply dark:mix-blend-normal transition-transform duration-150 ease-out select-none"
                />
              </button>
              <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-pdp-ink dark:text-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={13} aria-hidden="true" /> Survoler pour zoomer · cliquer pour agrandir
              </span>
              {count > 1 ? (
                <>
                  <ArrowButton
                    direction="prev"
                    label="Image précédente"
                    onClick={() => select(safeActive - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  />
                  <ArrowButton
                    direction="next"
                    label="Image suivante"
                    onClick={() => select(safeActive + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  />
                  <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 dark:bg-neutral-900/90 px-2.5 py-1 text-xs font-semibold tabular-nums text-pdp-ink dark:text-white shadow-sm">
                    {safeActive + 1} / {count}
                  </span>
                </>
              ) : null}
            </>
          ) : (
            <Placeholder />
          )}
        </div>
      </div>

      {lightboxOpen && count ? (
        <Lightbox
          images={shown}
          index={safeActive}
          name={name}
          onClose={() => setLightboxOpen(false)}
          onChange={select}
        />
      ) : null}
    </div>
  );
}
