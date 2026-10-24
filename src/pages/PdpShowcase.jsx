import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import flashProduct from "@/assets/data/mock-product-flash.json";
import variantsProduct from "@/assets/data/mock-product-variants.json";
import TopBar from "@/components/pdpShowcase/TopBar";
import Header from "@/components/pdpShowcase/Header";
import ProductHeader from "@/components/pdpShowcase/ProductHeader";
import ProductGallery from "@/components/pdpShowcase/ProductGallery";
import BuyBox from "@/components/pdpShowcase/BuyBox";
import StickyBuyBar from "@/components/pdpShowcase/StickyBuyBar";
import FloatingRail from "@/components/pdpShowcase/FloatingRail";
import AnchorTabs from "@/components/pdpShowcase/AnchorTabs";
import StoreCarousel from "@/components/pdpShowcase/StoreCarousel";
import RecommendationGrid from "@/components/pdpShowcase/RecommendationGrid";
import Footer from "@/components/pdpShowcase/Footer";

const srcOf = (item) => (typeof item === "string" ? item : item.src);

export default function PdpShowcase() {
  const [searchParams, setSearchParams] = useSearchParams();
  const demo = searchParams.get("demo") === "variants" ? "variants" : "flash";
  const product = demo === "variants" ? variantsProduct : flashProduct;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 650);
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const variantLabel = useMemo(() => {
    const groups = product.variantGroups;
    if (!groups) return "";
    return [groups.series?.selectedLabel, groups.color?.selectedLabel].filter(Boolean).join(" / ");
  }, [product]);

  const handleAddToCart = () => {
    setCartCount((c) => c + 1);
    toast.success("Ajouté au panier ✓", { description: product.name });
  };

  const handleBuyNow = () => {
    toast.info("Démo : redirection vers le paiement (non implémentée dans ce gabarit).");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié");
      }
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="min-h-screen bg-white font-barlow">
      <TopBar />
      <Header cartCount={cartCount} />

      {/* Switch de démo (hors spec, utilitaire pour comparer les 2 variantes) */}
      <div className="bg-pdp-surface-2 border-b border-pdp-line-2 py-2">
        <div className="max-w-[1228px] mx-auto px-4 md:px-12 flex items-center gap-3 text-sm">
          <span className="text-pdp-gray-700">Démo :</span>
          <button
            type="button"
            onClick={() => setSearchParams({ demo: "flash" })}
            className={`px-3 py-1 rounded-full ${demo === "flash" ? "bg-pdp-ink text-white" : "text-pdp-ink underline"}`}
          >
            Variante A — Vente Flash
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ demo: "variants" })}
            className={`px-3 py-1 rounded-full ${demo === "variants" ? "bg-pdp-ink text-white" : "text-pdp-ink underline"}`}
          >
            Variante B — Déclinaisons
          </button>
        </div>
      </div>

      <StickyBuyBar
        visible={showStickyBar}
        product={product}
        imageSrc={srcOf(product.images[0])}
        variantLabel={variantLabel}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
      <FloatingRail showBackToTop={showBackToTop} onScrollToReviews={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })} />

      <main className="max-w-[1228px] mx-auto px-4 md:px-12">
        <ProductHeader product={product} onShare={handleShare} />

        <div className="flex flex-col lg:flex-row gap-[60px] mt-6">
          <ProductGallery
            images={product.images}
            name={product.name}
            recyclingBadge={product.recyclingBadge}
            isWishlisted={isWishlisted}
            onToggleWishlist={() => setIsWishlisted((v) => !v)}
          />
          <BuyBox product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
        </div>

        <AnchorTabs product={product} />

        <div className="space-y-12 py-12 border-t border-pdp-line mt-4">
          <StoreCarousel title="Choix du magasin" items={product.storeItems} />
          <RecommendationGrid title="Recommandé pour vous" items={product.recommended} brandName={product.brand} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
