import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCardLive, { ProductCardSkeleton } from "./ProductCardLive";
import { FOCUS_RING } from "./liveUtils";

export default function RecommendationGridLive({ title, products, loading = false, seeAllLink = null }) {
  if (!loading && !products?.length) return null;
  return (
    <section aria-labelledby="pdp-related-title" className="font-barlow">
      <div className="flex items-end justify-between gap-4 mb-5">
        <h2 id="pdp-related-title" className="text-xl sm:text-2xl font-bold text-pdp-ink dark:text-white">
          {title}
        </h2>
        {seeAllLink ? (
          <Link
            to={seeAllLink}
            className={`inline-flex items-center gap-1 rounded text-sm font-semibold text-pdp-ink dark:text-white hover:underline underline-offset-2 ${FOCUS_RING}`}
          >
            Voir tout <ArrowRight size={15} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => <ProductCardLive key={p.id} product={p} />)}
      </div>
    </section>
  );
}
