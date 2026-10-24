import { Star } from "lucide-react";
import ReviewItem from "./ReviewItem";

export default function ReviewsSummary({ product }) {
  const starsFilled = Math.round(product.rating);
  const maxCount = Math.max(1, ...product.reviewHistogram.map((r) => r.count));

  return (
    <div id="reviews">
      <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink mb-4">Avis</h2>

      <div className="w-full md:w-[590px] border border-[#ECEDF0] rounded-lg p-5 flex gap-6">
        <div className="w-[100px] flex-shrink-0">
          <div className="text-[32px] font-bold text-pdp-ink leading-none">{product.rating.toFixed(1)}</div>
          <div className="flex my-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className={i < starsFilled ? "fill-pdp-orange text-pdp-orange" : "text-pdp-line-2"} />
            ))}
          </div>
          <span className="text-[13px] text-pdp-gray-700">{product.reviewCount} avis</span>
        </div>

        <div className="flex-1 space-y-0">
          {product.reviewHistogram.map((row) => (
            <div key={row.star} className="h-[30px] flex items-center gap-2 text-sm">
              <span className="w-2.5 font-medium text-pdp-ink">{row.star}</span>
              <div className="flex-1 h-1.5 rounded-full bg-[#EEEFF2] overflow-hidden">
                <div className="h-full bg-pdp-orange rounded-full" style={{ width: `${(row.count / maxCount) * 100}%` }} />
              </div>
              <span className="w-6 text-right text-pdp-ink">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="mt-4 text-sm underline text-pdp-gray-700">Origine de nos avis</button>

      <div className="mt-2">
        {product.reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button type="button" className="w-[160px] h-10 rounded border border-pdp-ink text-base font-medium text-pdp-ink">
          Voir tous les avis
        </button>
      </div>
    </div>
  );
}
