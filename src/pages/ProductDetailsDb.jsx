import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { getCatalogProduct, getCatalogProductsPage } from "@/services/productService";
import { resolveBackendAssetUrl } from "@/services/categoryService";
import FavoriteNotification from "@/components/FavoriteNotification";
import ReviewSection from "@/components/ReviewSection";
import CheckoutFlow from "@/components/CheckoutFlow";

const FALLBACK_IMAGE = "/imgs/logo.png";
const FREE_SHIPPING_THRESHOLD = 10000;
const STANDARD_SHIPPING_COST = 3250;
const TAX_RATE = 0.18;

const formatMoney = (value, { maximumFractionDigits = 0 } = {}) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("fr-FR", { maximumFractionDigits });
};

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
    { label: "RÃ©fÃ©rence", value: product?.referenceProduitPartenaire || "-" },
    { label: "Marque", value: product?.brand || "-" },
    { label: "CatÃ©gorie", value: product?.categoryName || "-" },
    { label: "Stock", value: Number.isFinite(Number(product?.stock)) ? `${product.stock}` : "-" },
    { label: "TVA", value: product?.vat !== null && product?.vat !== undefined ? `${formatMoney(Number(product.vat) * 100, { maximumFractionDigits: 0 })}%` : "18%" },
    { label: "AjoutÃ© le", value: createdAt ? createdAt.toLocaleDateString("fr-FR") : "-" }
  ];
};

export default function ProductDetailsDb() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // description | specs | shipping | reviews
  const [showCheckout, setShowCheckout] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [favNotification, setFavNotification] = useState({
    show: false,
    product: null,
    isAdding: true
  });

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    setIsLoading(true);
    setError("");
    getCatalogProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data || null);
        setSelectedImage(0);
        setQuantity(1);
        setActiveTab("description");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Impossible de charger le produit");
        setProduct(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

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
          if (!pid || pid === product.id) continue;
          if (seen.has(pid)) continue;
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

  const galleryImages = useMemo(() => pickGalleryImages(product), [product]);
  const mainImage =
    galleryImages[Math.min(Math.max(selectedImage, 0), galleryImages.length - 1)] ||
    FALLBACK_IMAGE;

  const price = Number(product?.price) || 0;
  const itemsTotal = price * (Number.isFinite(Number(quantity)) ? Number(quantity) : 1);
  const shippingCost = itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const totalTtc = itemsTotal + shippingCost;
  const taxAmount = Math.round(totalTtc - totalTtc / (1 + TAX_RATE));

  const isWishlisted = product?.id ? isInWishlist(product.id) : false;

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
      referenceProduitPartenaire: product.referenceProduitPartenaire
    });
  };

  const handleWishlist = () => {
    if (!product?.id) return;
    const adding = !isWishlisted;
    toggleWishlist({
      ...product,
      image: product?.imageUrl || (Array.isArray(product?.images) ? product.images[0] : "") || ""
    });
    setFavNotification({ show: true, product, isAdding: adding });
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: product?.name || "Produit", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copiÃ©");
      }
    } catch {
      toast.error("Impossible de partager le lien.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
        <div className="max-w-lg w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center bg-white dark:bg-neutral-900">
          <div className="text-lg font-bold text-neutral-900 dark:text-white">Erreur</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{error}</div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm"
            >
              Retour au catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
        <div className="max-w-lg w-full border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center bg-white dark:bg-neutral-900">
          <div className="text-lg font-bold text-neutral-900 dark:text-white">Produit introuvable</div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm"
            >
              Retour au catalogue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryLink = product?.categorySlug
    ? `/shop?category=${encodeURIComponent(product.categorySlug)}`
    : "/shop";
  const specs = buildSpecs(product);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <FavoriteNotification
        isVisible={favNotification.show}
        onClose={() => setFavNotification((prev) => ({ ...prev, show: false }))}
        product={favNotification.product}
        isAdding={favNotification.isAdding}
      />

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-500"
          >
            <ChevronLeft size={18} /> Retour
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
              aria-label="Partager"
              title="Partager"
            >
              <Share2 size={18} />
            </button>
            <button
              type="button"
              onClick={handleWishlist}
              className={`p-2 rounded-full border transition-colors ${
                isWishlisted
                  ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-900/40"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
              }`}
              aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
              title={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
            </button>
          </div>
        </div>

        <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:underline">
            Accueil
          </Link>
          <ChevronRight size={14} className="opacity-60" />
          <Link to="/shop" className="hover:underline">
            Catalogue
          </Link>
          {product?.categoryName ? (
            <>
              <ChevronRight size={14} className="opacity-60" />
              <Link to={categoryLink} className="hover:underline">
                {product.categoryName}
              </Link>
            </>
          ) : null}
          <ChevronRight size={14} className="opacity-60" />
          <span className="text-orange-600 font-medium">{product?.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
              <div className="aspect-square flex items-center justify-center p-4">
                <img
                  src={mainImage}
                  alt={product?.name || ""}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              {galleryImages.length > 1 ? (
                <div className="p-4 pt-0 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {galleryImages.slice(0, 8).map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`rounded-xl overflow-hidden border bg-white dark:bg-neutral-950 aspect-square p-1 transition-colors ${
                        idx === selectedImage
                          ? "border-orange-600"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                      aria-label={`Image ${idx + 1}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 flex-wrap">
              {product?.isBestSeller ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-900/40">
                  Best seller
                </span>
              ) : null}
              {product?.isFeatured ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-900/40">
                  Produit en phare
                </span>
              ) : null}
              {Number(product?.stock) <= 0 ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-900/40">
                  Rupture
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-900/40">
                  En stock
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-black text-neutral-900 dark:text-white leading-tight">
              {product?.name}
            </h1>

            <div className="mt-3 flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 flex-wrap">
              {product?.brand ? (
                <span>
                  Marque:{" "}
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {product.brand}
                  </span>
                </span>
              ) : null}
              {product?.referenceProduitPartenaire ? (
                <span className={product?.brand ? "pl-3 border-l border-neutral-200 dark:border-neutral-800" : ""}>
                  RÃ©f: <span className="font-mono">{product.referenceProduitPartenaire}</span>
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex items-end gap-3">
              <div className="text-4xl font-black text-neutral-900 dark:text-white">
                {formatMoney(price)} <span className="text-base font-bold">FCFA</span>
              </div>
              <div className="text-xs text-neutral-500 pb-2">
                Dont TVA (18%) :{" "}
                <span className="font-semibold">{formatMoney(taxAmount)} FCFA</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 flex items-start gap-3">
                <Truck className="text-orange-600 mt-0.5" size={18} />
                <div className="text-sm">
                  <div className="font-bold text-neutral-900 dark:text-white">Livraison</div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {shippingCost === 0 ? "Gratuite" : `${formatMoney(shippingCost)} FCFA`}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 flex items-start gap-3">
                <ShieldCheck className="text-emerald-600 mt-0.5" size={18} />
                <div className="text-sm">
                  <div className="font-bold text-neutral-900 dark:text-white">Paiement</div>
                  <div className="text-neutral-600 dark:text-neutral-400">SÃ©curisÃ©</div>
                </div>
              </div>
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 flex items-start gap-3">
                <RotateCcw className="text-blue-600 mt-0.5" size={18} />
                <div className="text-sm">
                  <div className="font-bold text-neutral-900 dark:text-white">Retours</div>
                  <div className="text-neutral-600 dark:text-neutral-400">30 jours</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, (Number(q) || 1) - 1))}
                  className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  aria-label="Diminuer la quantitÃ©"
                >
                  <Minus size={16} />
                </button>
                <div className="px-5 py-3 text-sm font-bold text-neutral-900 dark:text-white min-w-[56px] text-center">
                  {Math.max(1, Math.trunc(Number(quantity) || 1))}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, (Number(q) || 1) + 1))}
                  className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  aria-label="Augmenter la quantitÃ©"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex gap-3 flex-1">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={Number(product?.stock) <= 0}
                  className="flex-1 px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Ajouter au panier
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckout(true)}
                  disabled={Number(product?.stock) <= 0}
                  className="flex-1 px-6 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-60 disabled:cursor-not-allowed text-neutral-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Acheter maintenant
                </button>
              </div>
            </div>

            <div className="mt-10 border-t border-neutral-200 dark:border-neutral-800 pt-6">
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "description", label: "Description" },
                  { key: "specs", label: "DÃ©tails" },
                  { key: "shipping", label: "Livraison & retours" },
                  { key: "reviews", label: "Avis" }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                      activeTab === tab.key
                        ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "description" ? (
                <div className="mt-5 text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {product?.description?.trim() ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p>
                      Ce produit fait partie de notre catalogue LID. Ajoutez-le au panier et profitez d'une
                      expÃ©rience d'achat fluide, d'une livraison rapide et d'un paiement sÃ©curisÃ©.
                    </p>
                  )}
                </div>
              ) : null}

              {activeTab === "specs" ? (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {specs.map((row) => (
                    <div
                      key={row.label}
                      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4"
                    >
                      <div className="text-xs text-neutral-500">{row.label}</div>
                      <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1">
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === "shipping" ? (
                <div className="mt-5 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                  <p>
                    Livraison standard : <span className="font-bold">3â€“5 jours ouvrables</span>. Livraison
                    express : <span className="font-bold">24â€“48h</span>.
                  </p>
                  <p>
                    La livraison est <span className="font-bold">gratuite</span> dÃ¨s{" "}
                    {formatMoney(FREE_SHIPPING_THRESHOLD)} FCFA d'achat.
                  </p>
                  <p>Retours sous 30 jours : produit non utilisÃ©, dans son emballage d'origine.</p>
                </div>
              ) : null}

              {activeTab === "reviews" ? (
                <div className="mt-5">
                  <ReviewSection productId={product.id} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="mt-16">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Produits similaires</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Une sÃ©lection basÃ©e sur la mÃªme catÃ©gorie.
                </p>
              </div>
              <Link to={categoryLink} className="text-sm font-bold text-orange-600 hover:underline">
                Voir tout
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => {
                const pPrice = Number(p?.price) || 0;
                const img = resolveImageSrc(p?.imageUrl) || FALLBACK_IMAGE;
                return (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[4/5] bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-3">
                      <img
                        src={img}
                        alt={p?.name || ""}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-[#FFA41C]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="fill-current" />
                        ))}
                      </div>
                      <div className="mt-2 font-bold text-neutral-900 dark:text-white line-clamp-2">{p?.name}</div>
                      <div className="mt-2 text-sm font-black text-neutral-900 dark:text-white">
                        {formatMoney(pPrice)} <span className="font-bold text-xs">FCFA</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <CheckoutFlow
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        product={{
          ...product,
          imageUrl:
            resolveBackendAssetUrl(
              product?.imageUrl || (Array.isArray(product?.images) ? product.images[0] : "")
            ) || ""
        }}
        selectedColor="Standard"
        selectedSize="Unique"
        quantity={Math.max(1, Math.trunc(Number(quantity) || 1))}
        shippingCost={shippingCost}
        discountAmount={0}
        promoCode=""
      />
    </div>
  );
}

