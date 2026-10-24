import { Minus, Plus } from "lucide-react";
import { PriceBlockLive, DeliveryCardLive, ReassuranceAccordion, PaymentLogos } from "./BuyBoxParts";

const REASSURANCE = [
  { id: "returns", title: "Retours gratuits sous 30 jours", body: "Renvoyez votre article non utilisé, dans son emballage d'origine, sous 30 jours pour un remboursement complet." },
  { id: "support", title: "Assistance clientèle 24h/24 et 7j/7", body: "Notre équipe support est disponible par chat et téléphone à tout moment pour répondre à vos questions avant et après achat." },
  { id: "warranty", title: "Garantie du fabricant 2 ans", body: "Ce produit est couvert par une garantie fabricant de 2 ans contre les défauts matériels et de fabrication." },
];

export default function BuyBoxLive({
  price,
  taxAmount,
  outOfStock,
  city,
  zip,
  shippingMethods,
  shippingMethod,
  onSelectShipping,
  quantity,
  onChangeQuantity,
  onAddToCart,
  onBuyNow,
}) {
  return (
    <div className="font-barlow w-full lg:w-[584px]">
      <PriceBlockLive price={price} />
      <p className="text-sm text-pdp-gray-700 -mt-2">
        Dont TVA (18 %) : <span className="font-semibold text-pdp-ink">{taxAmount.toLocaleString()} FCFA</span>
      </p>

      <div className="h-px bg-pdp-line my-6" />

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded border border-pdp-line-2 overflow-hidden">
          <button type="button" onClick={() => onChangeQuantity(Math.max(1, quantity - 1))} className="px-3 py-3 hover:bg-pdp-surface text-pdp-ink">
            <Minus size={15} />
          </button>
          <div className="px-4 py-3 text-sm font-bold text-pdp-ink min-w-[48px] text-center">{quantity}</div>
          <button type="button" onClick={() => onChangeQuantity(quantity + 1)} className="px-3 py-3 hover:bg-pdp-surface text-pdp-ink">
            <Plus size={15} />
          </button>
        </div>
      </div>

      {outOfStock ? (
        <div className="py-3">
          <button type="button" className="w-full h-12 rounded border border-pdp-ink text-pdp-ink text-[18px] font-bold">
            M'alerter du retour en stock
          </button>
        </div>
      ) : (
        <div className="py-3 flex gap-2">
          <button type="button" onClick={onBuyNow} className="flex-1 h-12 rounded bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white text-[18px] font-bold transition-all">
            Acheter maintenant
          </button>
          <button type="button" onClick={onAddToCart} className="flex-1 h-12 rounded bg-pdp-ink hover:bg-[#333] active:scale-[0.98] text-white text-[18px] font-bold transition-all">
            Ajouter au panier
          </button>
        </div>
      )}

      <div className="h-px bg-pdp-line my-6" />
      <DeliveryCardLive city={city} zip={zip} methods={shippingMethods} selectedCode={shippingMethod} onSelect={onSelectShipping} />

      <div className="mt-2">
        <ReassuranceAccordion items={REASSURANCE} />
      </div>

      <div className="h-px bg-pdp-line my-6" />
      <PaymentLogos />
    </div>
  );
}
