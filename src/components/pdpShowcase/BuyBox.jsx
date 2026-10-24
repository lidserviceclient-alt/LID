import { useState } from "react";
import {
  PriceBlock,
  CouponRow,
  LoyaltyCard,
  VariantChips,
  VariantSwatches,
  BuyButtons,
  DeliveryCard,
  ReassuranceAccordion,
  ServiceCheckboxList,
  ProtectionBlock,
  TradeInBlock,
  PaymentLogos,
} from "./BuyBoxParts";

export default function BuyBox({ product, onAddToCart, onBuyNow }) {
  const groups = product.variantGroups;
  const [selectedSeries, setSelectedSeries] = useState(groups?.series?.options.find((o) => o.label === groups.series.selectedLabel)?.id);
  const [selectedColor, setSelectedColor] = useState(groups?.color?.options.find((o) => o.label === groups.color.selectedLabel)?.id);
  const [selectedServices, setSelectedServices] = useState({});
  const [selectedProtection, setSelectedProtection] = useState({});

  const outOfStock = Boolean(product.outOfStock);

  return (
    <div className="font-barlow w-full lg:w-[584px]">
      <PriceBlock pricing={product.pricing} />

      {product.coupon || product.loyalty ? (
        <>
          <div className="h-px bg-pdp-line my-5" />
          <CouponRow coupon={product.coupon} />
          {product.loyalty ? <div className="mt-4"><LoyaltyCard loyalty={product.loyalty} /></div> : null}
        </>
      ) : null}

      {groups ? (
        <>
          <div className="h-px bg-pdp-line my-6" />
          <VariantChips group={groups.series} selected={selectedSeries} onSelect={setSelectedSeries} />
          <VariantSwatches group={groups.color} selected={selectedColor} onSelect={setSelectedColor} />
        </>
      ) : (
        <div className="h-px bg-pdp-line my-6" />
      )}

      <BuyButtons outOfStock={outOfStock} onBuyNow={onBuyNow} onAddToCart={onAddToCart} />

      <div className="h-px bg-pdp-line my-6" />
      <DeliveryCard delivery={product.delivery} />

      <div className="mt-2">
        <ReassuranceAccordion items={product.reassurance} />
      </div>

      {product.services?.length ? (
        <>
          <div className="h-px bg-pdp-line my-6" />
          <ServiceCheckboxList
            services={product.services}
            selected={selectedServices}
            onToggle={(id) => setSelectedServices((p) => ({ ...p, [id]: !p[id] }))}
          />
        </>
      ) : null}

      {product.protection ? (
        <>
          <div className="h-px bg-pdp-line my-6" />
          <ProtectionBlock
            protection={product.protection}
            selected={selectedProtection}
            onToggle={(id) => setSelectedProtection((p) => ({ ...p, [id]: !p[id] }))}
          />
        </>
      ) : null}

      {product.tradeIn ? (
        <>
          <div className="h-px bg-pdp-line my-6" />
          <TradeInBlock tradeIn={product.tradeIn} />
        </>
      ) : null}

      <div className="h-px bg-pdp-line my-6" />
      <PaymentLogos />
    </div>
  );
}
