import ProductCardLive from "./ProductCardLive";

export default function RecommendationGridLive({ title, products }) {
  if (!products?.length) return null;
  return (
    <div className="font-barlow">
      <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
        {products.map((p) => (
          <ProductCardLive key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
