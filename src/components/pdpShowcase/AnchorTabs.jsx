import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import DescriptionSection from "./DescriptionSection";
import SpecsTable from "./SpecsTable";
import UgcCarousel from "./UgcCarousel";
import ReviewsSummary from "./ReviewsSummary";
import QnASection from "./QnASection";

const TABS = [
  { id: "description", label: "Description du Produit" },
  { id: "infos", label: "Informations importantes" },
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

export default function AnchorTabs({ product }) {
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
              {tab.id === "reviews" ? `${tab.label} (${product.reviewCount})` : tab.label}
            </button>
          ))}
        </div>
      </div>

      <Section registerRef={registerRef("description")} title="Description du Produit">
        <DescriptionSection product={product} />
      </Section>

      <Section registerRef={registerRef("infos")} title="Informations importantes">
        <p className="text-sm leading-5 text-pdp-ink">
          Avant utilisation, lisez attentivement la notice fournie. Conserver hors de portée des enfants. Ce
          produit est conforme aux normes de sécurité européennes en vigueur.
        </p>
      </Section>

      <Section registerRef={registerRef("specifications")} title="Spécifications">
        <SpecsTable specs={product.specs} />
      </Section>

      {product.ugcVideos?.length ? (
        <div ref={registerRef("ugc")} className="border-t border-pdp-line py-8">
          <UgcCarousel videos={product.ugcVideos} thumbnail={typeof product.images[0] === "string" ? product.images[0] : product.images[0].src} />
        </div>
      ) : null}

      <div ref={registerRef("reviews")} className="border-t border-pdp-line py-8 scroll-mt-32">
        <ReviewsSummary product={product} />
      </div>

      <div className="border-t border-pdp-line py-8">
        <QnASection qna={product.qna} />
      </div>
    </div>
  );
}
