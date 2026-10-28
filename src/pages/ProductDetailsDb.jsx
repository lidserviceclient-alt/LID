import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PackageSearch, RefreshCw } from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { getCatalogProductPageCollection } from "@/services/productService";
import { resolveBackendAssetUrl } from "@/services/categoryService";
import PageSEO from "@/components/PageSEO";
import FavoriteNotification from "@/components/FavoriteNotification";
import CheckoutFlow from "@/components/CheckoutFlow";
import { useAppConfig } from "@/features/appConfig/useAppConfig";
import { getReturnWindow } from "@/utils/policy.js";
import ProductHeaderLive from "@/components/pdpShowcase/ProductHeaderLive";
import ProductGalleryLive from "@/components/pdpShowcase/ProductGalleryLive";
import BuyBoxLive from "@/components/pdpShowcase/BuyBoxLive";
import StickyBuyBarLive from "@/components/pdpShowcase/StickyBuyBarLive";
import AnchorTabsLive from "@/components/pdpShowcase/AnchorTabsLive";
import ReviewsSummaryLive from "@/components/pdpShowcase/ReviewsSummaryLive";
import RecommendationGridLive from "@/components/pdpShowcase/RecommendationGridLive";
import { DescriptionContent, ShippingReturnsContent, SpecsContent } from "@/components/pdpShowcase/ProductSectionsLive";
import {
  FOCUS_RING,
  computeDiscount,
  formatFcfa,
  formatShippingLeadTime,
  getAvailability,
  pickGalleryImages,
  pickMainImage,
  scrollToId,
  useSiteChromeOffsets,
} from "@/components/pdpShowcase/liveUtils";

const RELATED_LIMIT = 8;

// TVA pilotée par le back-office (vatPercent), 18 % par défaut.
const normalizeVatRate = (raw) => {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return 0.18;
  return value > 1 ? value / 100 : value;
};

const isNotFoundError = (err) => {
  const status = Number(err?.response?.status);
  return status === 404 || status === 400;
};

function PageShell({ children }) {
  return <div className="min-h-[70vh] bg-white dark:bg-neutral-950 font-barlow">{children}</div>;
}

function ProductPageSkeleton() {
  const block = "rounded bg-pdp-surface dark:bg-neutral-900";
  return (
    <PageShell>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-pulse" aria-busy="true" aria-label="Chargement du produit">
        <div className={`h-4 w-64 ${block}`} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-12">
          <div className="flex gap-4">
            <div className="hidden lg:flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-[68px] h-[68px] rounded-lg ${block}`} />
              ))}
            </div>
            <div className={`flex-1 aspect-square max-h-[600px] rounded-2xl ${block}`} />
          </div>
          <div className="space-y-4">
            <div className={`h-3 w-24 ${block}`} />
            <div className={`h-7 w-full ${block}`} />
            <div className={`h-7 w-2/3 ${block}`} />
            <div className={`h-4 w-40 ${block}`} />
            <div className={`h-10 w-48 mt-6 ${block}`} />
            <div className={`h-4 w-32 ${block}`} />
            <div className="grid grid-cols-2 gap-2 pt-4">
              <div className={`h-20 rounded-xl ${block}`} />
              <div className={`h-20 rounded-xl ${block}`} />
            </div>
            <div className={`h-12 rounded-xl ${block}`} />
            <div className={`h-12 rounded-xl ${block}`} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ProductPageMessage({ notFound, onRetry }) {
  return (
    <PageShell>
      <PageSEO title={notFound ? "Produit introuvable" : "Erreur"} noindex />
      <div className="max-w-xl mx-auto px-4 py-20 sm:py-28 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-pdp-surface dark:bg-neutral-900 flex items-center justify-center text-pdp-ink dark:text-white">
          <PackageSearch size={30} aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-pdp-ink dark:text-white">
          {notFound ? "Ce produit est introuvable" : "Impossible d'afficher ce produit"}
        </h1>
        <p className="mt-3 text-base text-pdp-gray-700 dark:text-neutral-400">
          {notFound
            ? "Il a peut-être été retiré du catalogue ou le lien est incorrect."
            : "Une erreur est survenue lors du chargement. Vérifiez votre connexion puis réessayez."}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {!notFound ? (
            <button
              type="button"
              onClick={onRetry}
              className={`h-12 px-6 rounded-xl bg-pdp-accent-strong hover:bg-pdp-accent-deep text-white font-bold inline-flex items-center justify-center gap-2 ${FOCUS_RING}`}
            >
              <RefreshCw size={17} aria-hidden="true" /> Réessayer
            </button>
          ) : null}
          <Link
            to="/shop"
            className={`h-12 px-6 rounded-xl font-bold inline-flex items-center justify-center ${FOCUS_RING} ${
              notFound
                ? "bg-pdp-accent-strong hover:bg-pdp-accent-deep text-white"
                : "border-2 border-pdp-ink dark:border-white text-pdp-ink dark:text-white"
            }`}
          >
            Parcourir le catalogue
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

export default function ProductDetailsDb() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { data: appConfig } = useAppConfig();
  const { top: chromeTop, bottom: chromeBottom } = useSiteChromeOffsets();

  // Un seul appel groupé : détail produit + produits similaires (limités côté API).
  const pageQuery = useQuery({
    queryKey: ["catalog-product-page", id],
    queryFn: () => getCatalogProductPageCollection(id, { page: 0, size: 12, relatedLimit: RELATED_LIMIT, sortKey: "newest" }),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    retry: (failureCount, err) => !isNotFoundError(err) && failureCount < 1,
  });
  const product = pageQuery.data?.product || null;
  const relatedProducts = useMemo(() => {
    const list = Array.isArray(pageQuery.data?.relatedProducts) ? pageQuery.data.relatedProducts : [];
    return list.filter((p) => p?.id && `${p.id}` !== `${product?.id}`).slice(0, RELATED_LIMIT);
  }, [pageQuery.data?.relatedProducts, product?.id]);

  // --- Configuration publique du back-office (livraison, TVA, retours) ---
  const freeShipping = appConfig?.freeShipping;
  const freeShippingThreshold = useMemo(() => {
    const n = Number(freeShipping?.thresholdAmount);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [freeShipping?.thresholdAmount]);
  const isFreeShippingEnabled = Boolean(freeShipping?.enabled) && Boolean(freeShippingThreshold);
  const shippingMethods = useMemo(() => {
    const configured = (Array.isArray(appConfig?.shippingMethods) ? appConfig.shippingMethods : []).filter((m) => m?.code && m?.label);
    // La base est la seule source de vérité : aucune modalité inventée côté front
    return configured
      .filter((m) => Boolean(m?.enabled))
      .slice()
      .sort((a, b) => (Number(a?.sortOrder) || 0) - (Number(b?.sortOrder) || 0))
      .map((m) => ({ ...m, costAmount: Number(m.costAmount) || 0, leadTime: formatShippingLeadTime(m) }));
  }, [appConfig?.shippingMethods]);
  const shippingPolicyNote = `${appConfig?.shippingPolicyNote || ""}`.trim();
  // Politique de retour / remboursement lue depuis la configuration publique (utils/policy.js).
  const returnWindowLabel = getReturnWindow(appConfig).label;
  const returnPolicyText =
    `${appConfig?.returnPolicyText || ""}`.trim() ||
    "Produit non utilisé, dans son emballage d'origine. Des conditions complémentaires peuvent s'appliquer.";
  const customerRefundMode = `${appConfig?.customerRefundMode || "FULL_WITH_SHIPPING"}`.trim().toUpperCase();
  const refundPolicyLabel =
    customerRefundMode === "ORDER_ONLY" ? "Remboursement de la commande uniquement" : "Remboursement total commande + livraison";
  const returnShippingCostAmount = Number(appConfig?.returnShippingCostAmount);
  const returnShippingCostLabel =
    Number.isFinite(returnShippingCostAmount) && returnShippingCostAmount > 0 ? formatFcfa(returnShippingCostAmount) : null;
  const vatRate = useMemo(() => normalizeVatRate(appConfig?.vatPercent), [appConfig?.vatPercent]);
  const vatPercent = Math.round(vatRate * 100);
  const defaultShippingCode = useMemo(() => {
    const found = shippingMethods.find((m) => Boolean(m?.isDefault)) || shippingMethods[0];
    return found?.code || "STANDARD";
  }, [shippingMethods]);

  // --- État de la page ---
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [ratingSummary, setRatingSummary] = useState(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  const [favNotification, setFavNotification] = useState({ show: false, product: null, isAdding: true });
  const ctaRef = useRef(null);

  useEffect(() => {
    if (!shippingMethods.some((m) => m?.code === shippingMethod)) {
      setShippingMethod(defaultShippingCode);
    }
  }, [defaultShippingCode, shippingMethod, shippingMethods]);

  useEffect(() => {
    setQuantity(1);
    setRatingSummary(null);
  }, [id]);

  // Barre d'achat mobile : visible quand les boutons du bloc d'achat sortent de l'écran.
  const hasProduct = Boolean(product?.id);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasProduct]);

  // --- Calculs ---
  const availability = getAvailability(product?.stock);
  const outOfStock = availability.status === "out";
  const maxQuantity = availability.stock && availability.stock > 0 ? availability.stock : null;
  const qty = Math.max(1, Math.trunc(Number(quantity) || 1));
  const price = Number(product?.price) || 0;
  const discount = computeDiscount(price, product?.initialPrice);
  const itemsTotal = price * qty;
  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((m) => m?.code === shippingMethod) || shippingMethods[0] || null,
    [shippingMethod, shippingMethods]
  );
  const selectedCostRaw = Number(selectedShippingMethod?.costAmount);
  const selectedBaseCost = Number.isFinite(selectedCostRaw) && selectedCostRaw >= 0 ? selectedCostRaw : 0;
  const isStandardSelected = `${selectedShippingMethod?.code || ""}`.toUpperCase() === "STANDARD";
  const freeApplies = isFreeShippingEnabled && itemsTotal >= freeShippingThreshold;
  const shippingCost = isStandardSelected && freeApplies ? 0 : selectedBaseCost;
  const totalTtc = itemsTotal + shippingCost;
  const taxAmount = Math.round(totalTtc - totalTtc / (1 + vatRate));

  const shippingMethodsForCard = useMemo(
    () => shippingMethods.map((m) => ({ ...m, freeApplied: `${m.code || ""}`.toUpperCase() === "STANDARD" && freeApplies })),
    [shippingMethods, freeApplies]
  );
  const freeShippingHint =
    isFreeShippingEnabled && !freeApplies && shippingMethods.some((m) => `${m.code}`.toUpperCase() === "STANDARD")
      ? `Livraison standard offerte dès ${formatFcfa(freeShippingThreshold)} d'achat (encore ${formatFcfa(freeShippingThreshold - itemsTotal)}).`
      : null;

  const galleryImages = useMemo(() => pickGalleryImages(product), [product]);
  const rawMainImage = pickMainImage(product);
  const isWishlisted = product?.id ? isInWishlist(product.id) : false;
  const stickyTop = chromeTop;

  const changeQuantity = (next) => {
    const n = Math.max(1, Math.trunc(Number(next) || 1));
    setQuantity(maxQuantity ? Math.min(n, maxQuantity) : n);
  };

  const handleAddToCart = () => {
    if (!product?.id || outOfStock) return;
    // `addToCart` affiche lui-même la confirmation (toast).
    addToCart({
      id: product.id,
      name: product.name,
      price,
      quantity: qty,
      size: "Unique",
      color: "Standard",
      imageUrl: rawMainImage,
      sellerName: product.sellerName || "LID",
      referenceProduitPartenaire: product.referenceProduitPartenaire,
    });
  };

  const handleBuyNow = () => {
    if (!product?.id || outOfStock) return;
    setShowCheckout(true);
  };

  const handleWishlist = () => {
    if (!product?.id) return;
    const adding = !isWishlisted;
    toggleWishlist({ ...product, image: rawMainImage });
    setFavNotification({ show: true, product: { ...product, image: rawMainImage }, isAdding: adding });
  };

  const handleShare = async () => {
    if (typeof window === "undefined" || !product?.id) return;
    const productUrl = `${window.location.origin}/product/${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name || "Produit", text: `Découvrez ${product.name || "ce produit"} sur LID`, url: productUrl });
      } else {
        await navigator.clipboard.writeText(productUrl);
        toast.success("Lien du produit copié");
      }
    } catch (err) {
      if (err?.name !== "AbortError") toast.error("Impossible de partager le lien.");
    }
  };

  const goToSection = (sectionId) => scrollToId(sectionId, stickyTop + 64);

  if (pageQuery.isPending && Boolean(id)) return <ProductPageSkeleton />;
  if (pageQuery.isError || !product) {
    return <ProductPageMessage notFound={!pageQuery.isError || isNotFoundError(pageQuery.error)} onRetry={() => pageQuery.refetch()} />;
  }

  const categoryLink = product.categorySlug ? `/shop?category=${encodeURIComponent(product.categorySlug)}` : "/shop";
  const createdAt = product.dateCreation ? new Date(product.dateCreation) : null;
  const specs = [
    { label: "Marque", value: product.brand },
    { label: "Référence", value: product.referenceProduitPartenaire },
    { label: "Catégorie", value: product.categoryName, to: product.categorySlug ? categoryLink : null },
    { label: "Vendeur", value: `${product.sellerName || ""}`.trim() || "LID" },
    {
      label: "Disponibilité",
      value:
        availability.status === "out"
          ? "Épuisé"
          : availability.status === "low"
            ? `Plus que ${availability.stock} en stock`
            : availability.status === "in"
              ? "En stock"
              : null,
    },
    { label: "En ligne depuis", value: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : null },
  ];
  const reviewCount = Number(ratingSummary?.reviewCount) || 0;

  const sections = [
    { id: "description", label: "Description", content: <DescriptionContent description={product.description} /> },
    { id: "caracteristiques", label: "Caractéristiques", content: <SpecsContent specs={specs} /> },
    {
      id: "livraison-retours",
      label: "Livraison et retours",
      content: (
        <ShippingReturnsContent
          shippingMethods={shippingMethods}
          freeShippingThreshold={isFreeShippingEnabled ? freeShippingThreshold : null}
          shippingPolicyNote={shippingPolicyNote}
          returnWindowLabel={returnWindowLabel}
          returnPolicyText={returnPolicyText}
          refundPolicyLabel={refundPolicyLabel}
          returnShippingCostLabel={returnShippingCostLabel}
        />
      ),
    },
    {
      id: "avis",
      label: reviewCount > 0 ? `Avis (${reviewCount})` : "Avis",
      title: "Avis clients",
      content: <ReviewsSummaryLive productId={product.id} onSummaryChange={setRatingSummary} />,
    },
  ];

  return (
    <PageShell>
      <PageSEO
        title={product.name}
        description={product.name ? `Achetez ${product.name} sur Lid. Livraison en Côte d'Ivoire.` : undefined}
        canonical={`/product/${product.id}`}
        image={rawMainImage ? resolveBackendAssetUrl(rawMainImage) : undefined}
        type="product"
      />
      <FavoriteNotification
        isVisible={favNotification.show}
        onClose={() => setFavNotification((prev) => ({ ...prev, show: false }))}
        product={favNotification.product}
        isAdding={favNotification.isAdding}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-28 lg:pb-16">
        <ProductHeaderLive product={product} categoryLink={categoryLink} onShare={handleShare} />

        <div className="mt-3 sm:mt-4 grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-12">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <ProductGalleryLive key={product.id} images={galleryImages} name={product.name} discountPercent={discount?.percent || null} />
          </div>

          <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <BuyBoxLive
              product={product}
              price={price}
              discount={discount}
              vatPercent={vatPercent}
              availability={availability}
              ratingSummary={ratingSummary}
              shippingMethods={shippingMethodsForCard}
              shippingMethod={selectedShippingMethod?.code || shippingMethod}
              onSelectShipping={setShippingMethod}
              freeShippingHint={freeShippingHint}
              returnWindowLabel={returnWindowLabel}
              quantity={qty}
              maxQuantity={maxQuantity}
              onChangeQuantity={changeQuantity}
              itemsTotal={itemsTotal}
              shippingCost={shippingCost}
              shippingLabel={selectedShippingMethod?.label || "Standard"}
              totalTtc={totalTtc}
              taxAmount={taxAmount}
              isWishlisted={isWishlisted}
              onToggleWishlist={handleWishlist}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onGoToSection={goToSection}
              ctaRef={ctaRef}
              stickyTop={stickyTop}
            />
          </div>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <AnchorTabsLive sections={sections} stickyTop={stickyTop} />
          </div>
        </div>

        {relatedProducts.length ? (
          <div className="mt-6 pt-10 border-t border-pdp-line-2 dark:border-neutral-800">
            <RecommendationGridLive title="Produits similaires" products={relatedProducts} seeAllLink={product.categorySlug ? categoryLink : "/shop"} />
          </div>
        ) : null}
      </div>

      <StickyBuyBarLive
        visible={!ctaVisible && !showCheckout}
        productName={product.name}
        price={price}
        initialPrice={discount?.initialPrice || null}
        outOfStock={outOfStock}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        bottomOffset={chromeBottom}
      />

      <CheckoutFlow
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        product={{ ...product, imageUrl: resolveBackendAssetUrl(rawMainImage) || "" }}
        quantity={qty}
        shippingCost={shippingCost}
        shippingMethodCode={selectedShippingMethod?.code || "STANDARD"}
        shippingMethodLabel={selectedShippingMethod?.label || "Standard"}
        discountAmount={0}
        promoCode=""
      />
    </PageShell>
  );
}
