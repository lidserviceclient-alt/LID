import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronRight, Coins, Info, MapPin, Sparkles, Store, Truck } from "lucide-react";

export function PriceBlock({ pricing }) {
  const hasDiscount = Boolean(pricing.originalPrice);
  return (
    <div>
      {hasDiscount ? (
        <div className="h-6 text-[18px] font-medium text-pdp-red">Vente Flash</div>
      ) : null}
      <div className="flex items-baseline flex-wrap gap-4 mt-2">
        <span className={`text-[32px] font-bold leading-[32px] ${hasDiscount ? "text-pdp-red" : "text-pdp-ink"}`}>
          {pricing.price.toFixed(2).replace(".", ",")}
          <span className="text-2xl font-bold">€</span>
        </span>
        {hasDiscount ? (
          <>
            <span className="text-sm font-medium text-pdp-ink flex items-center gap-1">
              Prix conseillé : {pricing.originalPrice.toFixed(2).replace(".", ",")} € <Info size={16} />
            </span>
            <span className="text-sm font-medium text-pdp-ink">{pricing.discountPercent} % de réduction</span>
          </>
        ) : null}
      </div>
      {hasDiscount && pricing.monthlyPayment ? (
        <p className="text-sm text-pdp-ink mt-3">
          À partir de {pricing.monthlyPayment} €/mois, ou {pricing.installments} paiements sans frais avec{" "}
          {pricing.financingProvider} <button type="button" className="underline">En savoir plus</button>
        </p>
      ) : null}
    </div>
  );
}

export function CouponRow({ coupon }) {
  if (!coupon) return null;
  return (
    <div className="h-[22px] flex items-center gap-2">
      <span className="text-base font-medium text-pdp-red">
        {coupon.amount} € offerts dès {coupon.threshold} € d'achats
      </span>
      <button type="button" className="text-base font-normal text-pdp-gray-700 flex items-center gap-1">
        Voir les coupons <ChevronRight size={20} />
      </button>
    </div>
  );
}

export function LoyaltyCard({ loyalty }) {
  if (!loyalty) return null;
  return (
    <div className="bg-pdp-surface-2 rounded-lg p-3 space-y-3">
      <div className="flex items-start gap-2">
        <Sparkles size={20} className="text-pdp-violet flex-shrink-0 mt-0.5" />
        <p className="text-base">
          <span className="font-bold">{loyalty.programName}</span>{" "}
          <span className="font-medium">{loyalty.pitch}</span>{" "}
          <button type="button" className="underline">{loyalty.ctaLabel}</button>
        </p>
      </div>
      <div className="h-px bg-pdp-line" />
      <div className="flex items-start gap-2">
        <Coins size={20} className="text-pdp-orange flex-shrink-0 mt-0.5" />
        <p className="text-base">
          <span className="font-bold">Points</span>{" "}
          <span className="font-medium text-pdp-red">Économisez {loyalty.pointsSavings.toFixed(2).replace(".", ",")} €</span>{" "}
          <span className="font-medium">en utilisant vos points ;</span>{" "}
          <button type="button" className="underline">{loyalty.pointsCtaLabel}</button>
        </p>
      </div>
    </div>
  );
}

export function VariantChips({ group, selected, onSelect }) {
  if (!group) return null;
  return (
    <div>
      <span className="text-base font-medium text-pdp-ink">
        {group.label} : <span className="font-semibold">{group.selectedLabel}</span>
      </span>
      <div className="flex flex-wrap gap-2 mt-3" role="radiogroup" aria-label={group.label}>
        {group.options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!opt.available}
              onClick={() => onSelect(opt.id)}
              className={`h-[38px] px-3 rounded text-sm bg-pdp-surface relative ${
                isSelected ? "border-[1.5px] border-pdp-ink font-semibold" : "border border-transparent font-medium"
              } ${!opt.available ? "text-pdp-gray-500 line-through" : "text-pdp-ink"}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function VariantSwatches({ group, selected, onSelect }) {
  if (!group) return null;
  return (
    <div className="mt-6">
      <span className="text-base font-medium text-pdp-ink">
        {group.label} : <span className="font-semibold">{group.selectedLabel}</span>
      </span>
      <div className="flex flex-wrap gap-2 mt-3" role="radiogroup" aria-label={group.label}>
        {group.options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(opt.id)}
              className={`w-20 rounded bg-pdp-surface p-[3px] text-left ${isSelected ? "border-[1.5px] border-pdp-ink" : "border border-transparent"}`}
            >
              <div className="w-full aspect-square bg-white rounded-[3px] overflow-hidden">
                <img src={opt.image} alt={opt.label} className="w-full h-full object-cover" />
              </div>
              <p className={`text-xs px-2 py-1 truncate ${isSelected ? "font-semibold" : "font-medium"}`}>{opt.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BuyButtons({ outOfStock, onBuyNow, onAddToCart }) {
  if (outOfStock) {
    return (
      <div className="py-3">
        <button
          type="button"
          className="w-full h-12 rounded border border-pdp-ink text-pdp-ink text-[18px] font-bold"
        >
          M'alerter du retour en stock
        </button>
      </div>
    );
  }
  return (
    <div className="py-3 flex gap-2">
      <button
        type="button"
        onClick={onBuyNow}
        className="flex-1 h-12 rounded bg-pdp-red hover:bg-[#C81F16] active:scale-[0.98] text-white text-[18px] font-bold transition-all"
      >
        Acheter maintenant
      </button>
      <button
        type="button"
        onClick={onAddToCart}
        className="flex-1 h-12 rounded bg-pdp-ink hover:bg-[#333] active:scale-[0.98] text-white text-[18px] font-bold transition-all"
      >
        Ajouter au panier
      </button>
    </div>
  );
}

function DeliveryColumn({ icon: Icon, data }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={20} className="text-pdp-ink" />
        <span className="text-base font-medium text-pdp-ink">{data.label}</span>
      </div>
      <p className="text-sm text-pdp-gray-700">{data.etaLabel}{data.cutoff ? ` / ${data.cutoff}` : ""}</p>
      <p className="text-sm mt-0.5">
        <span className="font-semibold text-pdp-green">GRATUIT</span>{" "}
        <span className="text-pdp-gray-700 line-through">{data.originalPrice.toFixed(2).replace(".", ",")} €</span>
      </p>
    </div>
  );
}

export function DeliveryCard({ delivery }) {
  if (!delivery) return null;
  const hasPickup = Boolean(delivery.pickup);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink">Livraison et promesses</h2>
        <button type="button" className="text-sm font-medium text-pdp-ink">En savoir plus</button>
      </div>
      <div className="bg-pdp-surface rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-pdp-ink">
            Livrer à : <span className="uppercase">{delivery.city}</span> {delivery.zip}
          </span>
          <button type="button" className="text-base font-medium underline flex items-center gap-1">
            <MapPin size={14} /> Modifier
          </button>
        </div>

        {hasPickup ? (
          <div className="flex items-stretch mt-6">
            <DeliveryColumn icon={Truck} data={delivery.shipping} />
            <div className="flex flex-col items-center justify-center px-4">
              <span className="w-px h-3 bg-pdp-line" />
              <span className="text-sm font-medium text-pdp-gray-500 py-1">ou</span>
              <span className="w-px h-3 bg-pdp-line" />
            </div>
            <DeliveryColumn icon={Store} data={delivery.pickup} />
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-4 text-sm text-pdp-ink">
            <Truck size={16} />
            <span>
              {delivery.single.etaLabel} · {delivery.single.cutoff}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ReassuranceAccordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className="border-t border-pdp-line">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between h-[54px] text-left"
            >
              <span className="text-base font-semibold text-pdp-ink">{item.title}</span>
              <ChevronDown size={24} className={`text-pdp-ink transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm leading-5 text-pdp-ink pb-5">{item.body}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function ServiceCheckboxList({ services, selected, onToggle }) {
  if (!services?.length) return null;
  return (
    <div>
      <h3 className="text-[22px] font-semibold text-pdp-ink mb-1">Services populaires</h3>
      <p className="text-sm text-pdp-gray-700 mb-2">Installation disponible : à la livraison ou sur rendez-vous</p>
      {services.map((s) => (
        <label key={s.id} className="flex items-center justify-between h-14 cursor-pointer">
          <span className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(selected?.[s.id])}
              onChange={() => onToggle(s.id)}
              className="w-5 h-5 rounded border-[1.5px] border-[#BFC2CA] text-pdp-ink"
            />
            <span className="text-base font-medium text-pdp-ink">{s.label}</span>
          </span>
          <span className="flex items-center gap-1 text-base font-medium text-pdp-ink">
            {s.displayAsFree ? "Gratuit" : `${s.price.toFixed(2).replace(".", ",")} €`}
            <Info size={16} className="text-pdp-gray-700" />
          </span>
        </label>
      ))}
    </div>
  );
}

export function ProtectionBlock({ protection, selected, onToggle }) {
  if (!protection) return null;
  return (
    <div>
      <h3 className="text-[22px] font-semibold text-pdp-ink mb-1">{protection.title}</h3>
      <p className="text-sm text-pdp-gray-700 mb-2">{protection.pitch}</p>
      {protection.options.map((o) => (
        <label key={o.id} className="flex items-center justify-between h-14 cursor-pointer">
          <span className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(selected?.[o.id])}
              onChange={() => onToggle(o.id)}
              className="w-5 h-5 rounded border-[1.5px] border-[#BFC2CA] text-pdp-ink"
            />
            <span className="text-base font-medium text-pdp-ink">{o.label}</span>
          </span>
          <span className="text-base font-medium text-pdp-ink">{o.price.toFixed(2).replace(".", ",")} €</span>
        </label>
      ))}
    </div>
  );
}

export function TradeInBlock({ tradeIn }) {
  if (!tradeIn) return null;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-[22px] font-semibold text-pdp-ink flex items-center gap-2">
          <Check size={24} /> Reprise
        </h3>
        <button type="button" className="text-sm font-medium underline">{tradeIn.howItWorksLabel}</button>
      </div>
      <p className="text-sm text-pdp-gray-700 mt-1">{tradeIn.pitch}</p>
      <button type="button" className="w-full h-12 rounded border border-pdp-ink text-base font-semibold text-pdp-ink mt-3">
        Vérifiez la valeur de votre reprise
      </button>
    </div>
  );
}

const PAYMENT_LOGOS = ["AmEx", "CB", "Visa", "Mastercard", "Maestro", "PayPal", "Google Pay", "Apple Pay", "Klarna"];

export function PaymentLogos() {
  return (
    <div>
      <h3 className="text-[22px] font-semibold text-pdp-ink mb-2">Nous acceptons</h3>
      <div className="flex flex-wrap gap-2">
        {PAYMENT_LOGOS.map((label) => (
          <span
            key={label}
            className="h-[22px] px-2 flex items-center justify-center rounded-[3px] border border-pdp-line-2 text-[10px] font-semibold text-pdp-gray-700"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
