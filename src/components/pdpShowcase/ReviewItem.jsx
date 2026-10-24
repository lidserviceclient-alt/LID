import { useState } from "react";
import { MessageCircle, RefreshCw, Star, ThumbsUp, User } from "lucide-react";

export default function ReviewItem({ review }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(review.date));

  return (
    <div className="py-5 border-b border-pdp-line-2 last:border-b-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-pdp-surface flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-pdp-gray-500" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-pdp-ink">{review.author}</span>
            <span className="text-xs font-medium bg-[#F0F1F4] text-pdp-gray-700 px-1.5 py-0.5 rounded-sm">{review.tag}</span>
          </div>
          <span className="text-xs text-pdp-gray-700">{date}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < review.rating ? "fill-pdp-orange text-pdp-orange" : "text-pdp-line-2"} />
          ))}
        </div>
        {review.verified ? <span className="text-[13px] font-medium text-pdp-orange">Achat vérifié</span> : null}
      </div>

      <p className={`text-[15px] leading-[22px] text-pdp-ink ${expanded ? "" : "line-clamp-4"}`}>{review.content}</p>
      {!expanded ? (
        <button type="button" onClick={() => setExpanded(true)} className="text-[13px] font-medium underline text-pdp-ink">
          Lire plus
        </button>
      ) : null}

      <div className="flex items-center gap-4 mt-3 text-[13px] text-pdp-gray-700">
        <button type="button" className="flex items-center gap-1 hover:text-pdp-ink"><RefreshCw size={13} /> Afficher l'original</button>
        <button type="button" className="flex items-center gap-1 hover:text-pdp-ink"><ThumbsUp size={13} /> Utile (2)</button>
        <button type="button" className="flex items-center gap-1 hover:text-pdp-ink"><MessageCircle size={13} /> Commentaire</button>
      </div>
    </div>
  );
}
