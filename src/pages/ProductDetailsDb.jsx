import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { getCatalogProduct, getCatalogProductsPage } from "@/services/productService";
import { listProductReviews } from "@/services/reviewService";
import { resolveBackendAssetUrl } from "@/services/categoryService";
import PageSEO from "@/components/PageSEO";
import FavoriteNotification from "@/components/FavoriteNotification";
import CheckoutFlow from "@/components/CheckoutFlow";
import { useAppConfig } from "@/features/appConfig/useAppConfig";
import ProductHeaderLive from "@/components/pdpShowcase/ProductHeaderLive";
import ProductGallery from "@/components/pdpShowcase/ProductGallery";
import BuyBoxLive from "@/components/pdpShowcase/BuyBoxLive";
import StickyBuyBarLive from "@/components/pdpShowcase/StickyBuyBarLive";
import FloatingRailLive from "@/components/pdpShowcase/FloatingRailLive";
import AnchorTabsLive from "@/components/pdpShowcase/AnchorTabsLive";
import StoreCarouselLive from "@/components/pdpShowcase/StoreCarouselLive";
import RecommendationGridLive from "@/components/pdpShowcase/RecommendationGridLive";

const FALLBACK_IMAGE = "/imgs/logo.png";
const TAX_RATE = 0.18;

const resolveImageSrc = (url) => {
  const raw = `${url || ""}`.trim();
  if (!raw) return "";
  if (raw.startsWith("/imgs/")) return raw;
  return resolveBackendAssetUrl(raw);
};

const pickGalleryImages = (product) => {
  const urls = [];
  const add = (url) => {
    const resolved = resolveImageSrc(url);
    if (!resolved) return;
    if (!urls.includes(resolved)) urls.push(resolved);
  };
  add(product?.imageUrl);
  (Array.isArray(product?.images) ? product.images : []).forEach(add);
  return urls.length > 0 ? urls : [FALLBACK_IMAGE];
};

const buildSpecs = (product) => {
  const createdAt = product?.dateCreation ? new Date(product.dateCreation) : null;
  return [
    { label: "Référence", value: product?.referenceProduitPartenaire || "-" },
    { label: "Marque", value: product?.brand || "-" },
    { label: "Catégorie", value: product?.categoryName || "-" },
    { label: "Stock", value: Number.isFinite(Number(product?.stock)) ? `${product.stock}` : "-" },
    { label: "TVA", value: product?.vat !== null && product?.vat !== undefined ? `${(Number(product.vat) * 100).toFixed(0)}%` : "18%" },
    { label: "Ajouté le", value: createdAt ? createdAt.toLocaleDateString("fr-FR") : "-" },
  ];
};

export default function ProductDetailsDb() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { data: appConfig } = useAppConfig();

  const freeShipping = appConfig?.freeShipping;
  const configuredShippingMethods = useMemo(() => {
    const list = Array.isArray(appConfig?.shippingMethods) ? appConfig.shippingMethods : [];
    return list.filter((m) => m?.code && m?.label);
  }, [appConfig?.shippingMethods]);
  const freeShippingThreshold = useMemo(() => {
    const raw = freeShipping?.thresholdAmount;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [freeShipping?.thresholdAmount]);
  const isFreeShippingEnabled = Boolean(freeShipping?.enabled) && Boolean(freeShippingThreshold);
  const fallbackShippingMethods = useMemo(
    () => [
      { code: "STANDARD", label: "Standard", description: "3-5 jours ouvrables", costAmount: 3250, enabled: true, isDefault: true, sortOrder: 0 },
      { code: "EXPRESS", label: "Express", description: "24-48h", costAmount: 5000, enabled: true, isDefault: false, sortOrder: 1 },
    ],
    []
  );
  const shippingMethods = useMemo(() => {
    const list = configuredShippingMethods.length ? configuredShippingMethods : fallbackShippingMethods;
    return list.filter((m) => Boolean(m?.enabled));
  }, [configuredShippingMethods, fallbackShippingMethods]);
  const defaultShippingCode = useMemo(() => {
    const found = shippingMethods.find((m) => Boolean(m?.isDefault)) || shippingMethods[0];
    return found?.code || "STANDARD";
  }, [shippingMethods]);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [ratingSummary, setRatingSummary] = useState(null);

  useEffect(() => {
    if (!shippingMethods.some((m) => m?.code === shippingMethod)) {
      setShippingMethod(defaultShippingCode);
    }
  }, [defaultShippingCode, shippingMethod, shippingMethods]);

  const [favNotification, setFavNotification] = useState({ show: false, product: null, isAdding: true });

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    setIsLoading(true);
    setError("");
    getCatalogProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data || null);
        setQuantity(1);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Impossible de charger le produit");
        setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!product?.id) return;
    listProductReviews(product.id, 0, 1)
      .then((res) => {
        if (cancelled) return;
        setRatingSummary({ avgRating: Number(res?.avgRating) || 0, reviewCount: Number(res?.reviewCount) || 0 });
      })
      .catch(() => {
        if (!cancelled) setRatingSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  useEffect(() => {
    let cancelled = false;
    if (!product?.id) return;
    (async () => {
      try {
        setRelatedProducts([]);
        const category = `${product.categorySlug || ""}`.trim();
        const categoryPage = category
          ? await getCatalogProductsPage(0, 24, { category, sortKey: "newest" })
          : null;
        if (cancelled) return;
        const inCategory = Array.isArray(categoryPage?.content) ? categoryPage.content : [];
        let candidates = inCategory.filter((p) => p?.id && p.id !== product.id);
        if (candidates.length < 8) {
          const fallbackPage = await getCatalogProductsPage(0, 80, { sortKey: "newest" });
          if (cancelled) return;
          const all = Array.isArray(fallbackPage?.content) ? fallbackPage.content : [];
          candidates = candidates.concat(all.filter((p) => p?.id && p.id !== product.id));
        }
        const unique = [];
        const seen = new Set();
        for (const p of candidates) {
          const pid = p?.id;
          if (!pid || pid === product.id || seen.has(pid)) continue;
          seen.add(pid);
          unique.push(p);
          if (unique.length >= 8) break;
        }
        setRelatedProducts(unique);
      } catch {
        if (!cancelled) setRelatedProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.categorySlug]);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyBar(window.scrollY > 650);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const galleryImages = useMemo(() => pickGalleryImages(product), [product]);

  const price = Number(product?.price) || 0;
  const itemsTotal = price * (Number.isFinite(Number(quantity)) ? Number(quantity) : 1);
  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((m) => m?.code === shippingMethod) || shippingMethods[0] || null,
    [shippingMethod, shippingMethods]
  );
  const selectedBaseCost = useMemo(() => {
    const n = Number(selectedShippingMethod?.costAmount);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [selectedShippingMethod?.costAmount]);
  const isStandardSelected = `${selectedShippingMethod?.code || ""}`.toUpperCase() === "STANDARD";
  const shippingCost =
    isStandardSelected && isFreeShippingEnabled && itemsTotal >= freeShippingThreshold ? 0 : selectedBaseCost;

  const totalTtc = itemsTotal + shippingCost;
  const taxAmount = Math.round(totalTtc - totalTtc / (1 + TAX_RATE));

  const shippingMethodsForCard = useMemo(
    () =>
      shippingMethods.map((m) => ({
        ...m,
        freeApplied:
          `${m.code || ""}`.toUpperCase() === "STANDARD" && isFreeShippingEnabled && itemsTotal >= freeShippingThreshold,
      })),
    [shippingMethods, isFreeShippingEnabled, itemsTotal, freeShippingThreshold]
  );

  const isWishlisted = product?.id ? isInWishlist(product.id) : false;
  const outOfStock = Number(product?.stock) <= 0;

  const handleAddToCart = () => {
    if (!product?.id) return;
    const qty = Math.max(1, Math.trunc(Number(quantity) || 1));
    addToCart({
      id: product.id,
      name: product.name,
      price,
      quantity: qty,
      size: "Unique",
      color: "Standard",
      imageUrl: product.imageUrl || (Array.isArray(product.images) ? product.images[0] : "") || "",
      referenceProduitPartenaire: product.referenceProduitPartenaire,
    });
    toast.success("Ajouté au panier");
  };

  const handleWishlist = () => {
    if (!product?.id) return;
    const adding = !isWishlisted;
    toggleWishlist({ ...product, image: product?.imageUrl || (Array.isArray(product?.images) ? product.images[0] : "") || "" });
    setFavNotification({ show: true, product, isAdding: adding });
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    try {
      const productUrl = `${window.location.origin}/product/${product?.id}`;
      const rawImage = product?.imageUrl || (Array.isArray(product?.images) ? product.images[0] : "");
      const previewUrl = resolveImageSrc(rawImage) || productUrl;
      if (navigator.share) {
        await navigator.share({ title: product?.name || "Produit", text: `Découvre ${product?.name || "ce produit"} sur LID ! ${productUrl}`, url: previewUrl });
      } else {
        await navigator.clipboard.writeText(`${product?.name || "Produit"} - ${productUrl} ${previewUrl}`);
        toast.success("Lien copié");
      }
    } catch {
      toast.error("Impossible de partager le lien.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-pdp-line-2 border-t-pdp-red rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 font-barlow">
        <div className="max-w-lg w-full border border-pdp-line-2 rounded-xl p-6 text-center">
          <div className="text-lg font-bold text-pdp-ink">Erreur</div>
          <div className="text-sm text-pdp-gray-700 mt-2">{error}</div>
          <button onClick={() => navigate("/shop")} className="mt-6 px-4 py-2 rounded bg-pdp-red hover:bg-[#c41f16] text-white font-bold text-sm">
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 font-barlow">
        <div className="max-w-lg w-full border border-pdp-line-2 rounded-xl p-6 text-center">
          <div className="text-lg font-bold text-pdp-ink">Produit introuvable</div>
          <button onClick={() => navigate("/shop")} className="mt-6 px-4 py-2 rounded bg-pdp-red hover:bg-[#c41f16] text-white font-bold text-sm">
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  const specs = buildSpecs(product);
  const brandMatches = relatedProducts.filter((p) => p.brand && p.brand === product.brand);
  const categoryLink = product?.categorySlug ? `/shop?category=${encodeURIComponent(product.categorySlug)}` : "/shop";

  return (
    <div className="min-h-screen bg-white font-barlow">
      <PageSEO
        title={product?.name}
        description={product?.name ? `Achetez ${product.name} sur Lid. Livraison rapide en Côte d'Ivoire.` : undefined}
        canonical={product?.id ? `/product/${product.id}` : undefined}
        image={product?.imageUrl ? resolveBackendAssetUrl(product.imageUrl) : undefined}
        type="product"
      />
      <FavoriteNotification
        isVisible={favNotification.show}
        onClose={() => setFavNotification((prev) => ({ ...prev, show: false }))}
        product={favNotification.product}
        isAdding={favNotification.isAdding}
      />

      <StickyBuyBarLive
        visible={showStickyBar}
        product={product}
        imageSrc={galleryImages[0]}
        price={price}
        outOfStock={outOfStock}
        onAddToCart={handleAddToCart}
        onBuyNow={() => setShowCheckout(true)}
      />
      <FloatingRailLive
        showBackToTop={showBackToTop}
        onScrollToReviews={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
      />

      <div className="max-w-[1228px] mx-auto px-4 md:px-12 py-4">
        <ProductHeaderLive product={product} categoryLink={categoryLink} ratingSummary={ratingSummary} onShare={handleShare} />

        {/* Zone achat */}
        <div className="flex flex-col lg:flex-row gap-[60px] mt-6">
          <ProductGallery
            images={galleryImages}
            name={product.name}
            isWishlisted={isWishlisted}
            onToggleWishlist={handleWishlist}
          />
          <BuyBoxLive
            price={price}
            taxAmount={taxAmount}
            outOfStock={outOfStock}
            city={null}
            zip={null}
            shippingMethods={shippingMethodsForCard}
            shippingMethod={shippingMethod}
            onSelectShipping={setShippingMethod}
            quantity={Math.max(1, Math.trunc(Number(quantity) || 1))}
            onChangeQuantity={setQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={() => setShowCheckout(true)}
          />
        </div>

        <AnchorTabsLive product={product} specs={specs} />

        {/* Cross-sell */}
        <div className="space-y-12 py-12 border-t border-pdp-line mt-4">
          <StoreCarouselLive title="Choix du magasin" products={brandMatches} />
          <RecommendationGridLive title="Produits similaires" products={relatedProducts} />
        </div>
      </div>

      <CheckoutFlow
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        product={{
          ...product,
          imageUrl: resolveBackendAssetUrl(product?.imageUrl || (Array.isArray(product?.images) ? product.images[0] : "")) || "",
        }}
        selectedColor="Standard"
        selectedSize="Unique"
        quantity={Math.max(1, Math.trunc(Number(quantity) || 1))}
        shippingCost={shippingCost}
        shippingMethodLabel={selectedShippingMethod?.label || "Standard"}
        discountAmount={0}
        promoCode=""
      />
    </div>
  );
}
