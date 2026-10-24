import { PlayCircle } from "lucide-react";

export default function UgcCarousel({ videos, thumbnail }) {
  if (!videos?.length) return null;
  return (
    <div>
      <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink mb-4">La communauté en parle</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {videos.map((v) => (
          <div key={v.id} className="relative w-[200px] h-[356px] flex-shrink-0 rounded-lg overflow-hidden bg-pdp-surface">
            <img src={thumbnail} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <PlayCircle size={32} className="text-white drop-shadow" />
            </div>
            <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              {v.duration}
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 mx-auto flex items-center justify-center w-[140px] h-10 rounded border border-pdp-ink text-base font-medium text-pdp-ink"
      >
        Tout afficher
      </button>
    </div>
  );
}
