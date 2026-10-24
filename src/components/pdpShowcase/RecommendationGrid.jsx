import ProductCard from "./ProductCard";

export default function RecommendationGrid({ title, items, brandName }) {
  if (!items?.length) return null;
  return (
    <div className="font-barlow">
      <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} brandName={brandName} />
        ))}
      </div>
    </div>
  );
}
