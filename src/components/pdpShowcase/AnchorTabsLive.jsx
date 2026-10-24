import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import SpecsTable from "./SpecsTable";
import ReviewsSummaryLive from "./ReviewsSummaryLive";

const TABS = [
  { id: "description", label: "Description du Produit" },
  { id: "specifications", label: "Spécifications" },
  { id: "reviews", label: "Avis" },
];

function Section({ registerRef, title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div ref={registerRef} className="border-t border-pdp-line py-8 scroll-mt-32">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between">
        <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink">{title}</h2>
        <ChevronUp size={24} className={`text-pdp-ink transition-transform duration-200 ${open ? "" : "rotate-180"}`} />
      </button>
      {open ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

export default function AnchorTabsLive({ product, specs }) {
  const [activeTab, setActiveTab] = useState("description");
  const sectionRefs = useRef({});

  const scrollTo = (id) => sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  const registerRef = (id) => (el) => {
    sectionRefs.current[id] = el;
  };

  useEffect(() => {
    const onScroll = () => {
      const offset = 140;
      let current = TABS[0].id;
      for (const tab of TABS) {
        const el = sectionRefs.current[tab.id];
        if (el && el.getBoundingClientRect().top - offset <= 0) current = tab.id;
      }
      setActiveTab(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="font-barlow mt-12">
      <div className="sticky top-20 z-20 bg-white border-b border-pdp-line-2 h-12 overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 h-full items-center min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollTo(tab.id)}
              className={`h-full text-[18px] whitespace-nowrap border-b-[3px] -mb-px transition-colors ${
                activeTab === tab.id ? "border-pdp-ink text-pdp-ink font-bold" : "border-transparent text-pdp-gray-700 font-normal"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Section registerRef={registerRef("description")} title="Description du Produit">
        {product.description?.trim() ? (
          <p className="text-sm leading-5 text-pdp-ink whitespace-pre-line">{product.description}</p>
        ) : (
          <p className="text-sm leading-5 text-pdp-gray-700">
            Ce produit fait partie de notre catalogue. Ajoutez-le au panier et profitez d'une expérience d'achat
            fluide, d'une livraison rapide et d'un paiement sécurisé.
          </p>
        )}
      </Section>

      <Section registerRef={registerRef("specifications")} title="Spécifications">
        <SpecsTable specs={specs} />
      </Section>

      <div ref={registerRef("reviews")} className="border-t border-pdp-line py-8 scroll-mt-32">
        <ReviewsSummaryLive productId={product.id} />
      </div>
    </div>
  );
}
