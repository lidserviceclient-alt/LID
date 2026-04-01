import { useEffect, useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Tag,
  CreditCard,
  Sparkles,
  Package,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { toast } from "sonner";
import CheckoutFlow from "../components/CheckoutFlow";
import { getCurrentUserPayload, isAuthenticated } from "@/services/authService.js";
import { quoteCheckout } from "@/services/orderService.js";
import { getCatalogProductsPage, getFeaturedCatalogProducts } from "@/services/productService";
import { resolveBackendAssetUrl } from "@/services/categoryService";
import { useAppConfig } from "@/features/appConfig/useAppConfig";

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { data: appConfig } = useAppConfig();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loyaltyPricing, setLoyaltyPricing] = useState({ applied: false, tier: "", percent: 0, discountAmount: 0, points: 0 });
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [showCheckout, setShowCheckout] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const navigate = useNavigate();

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
      { code: "EXPRESS", label: "Express", description: "24-48h", costAmount: 6500, enabled: true, isDefault: false, sortOrder: 1 }
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
  useEffect(() => {
    if (!shippingMethods.some((m) => m?.code === shippingMethod)) {
      setShippingMethod(defaultShippingCode);
    }
  }, [defaultShippingCode, shippingMethod, shippingMethods]);
  const selectedShippingMethod = useMemo(() => {
    return shippingMethods.find((m) => m?.code === shippingMethod) || shippingMethods[0] || null;
  }, [shippingMethod, shippingMethods]);
  const selectedBaseCost = useMemo(() => {
    const n = Number(selectedShippingMethod?.costAmount);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [selectedShippingMethod?.costAmount]);
  const isStandardSelected = `${selectedShippingMethod?.code || ""}`.toUpperCase() === "STANDARD";
  const shippingCost =
    isStandardSelected && isFreeShippingEnabled && cartTotal >= freeShippingThreshold
      ? 0
      : selectedBaseCost;
  
  const handleCheckout = () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    setShowCheckout(true);
  };
  
  const handlePaymentSuccess = () => {
    clearCart();
    setShowCheckout(false);
    toast.success("Commande effectuée avec succès !");
    navigate('/profile?tab=orders');
  };
  
  const handleApplyPromo = async () => {
    const code = (promoCode || "").trim().toUpperCase();
    if (!code) {
      setAppliedPromo(null);
      return;
    }
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    const payload = getCurrentUserPayload();
    if (!payload?.sub) {
      toast.error("Veuillez vous connecter.");
      return;
    }
    try {
      const toArticleId = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric <= 0) return null;
        return Math.trunc(numeric);
      };
      const items = cartItems
        .map((item) => {
          const quantity = Number(item?.quantity) || 0;
          if (quantity <= 0) return null;
          const referenceProduitPartenaire = item?.referenceProduitPartenaire || item?.referencePartenaire || item?.sku;
          const articleId = item?.articleId ?? toArticleId(item?.id);
          if (!articleId && !referenceProduitPartenaire) return null;
          return { articleId: articleId ?? undefined, referenceProduitPartenaire: referenceProduitPartenaire ?? undefined, quantity };
        })
        .filter(Boolean);
      if (items.length === 0) {
        toast.error("Panier invalide.");
        return;
      }
      const res = await quoteCheckout(payload.sub, {
        currency: "XOF",
        email: payload?.email || "",
        phone: "",
        promoCode: code,
        items
      });

      if (!res?.promoApplied) {
        setAppliedPromo(null);
        toast.error(res?.promoMessage || "Code promo invalide.");
        return;
      }

      const discount = Number(res?.discountAmount) || 0;
      setAppliedPromo({ code: res?.promoCode || code, discountAmount: discount });
      toast.success(res?.promoMessage || "Code promo appliqué.");
    } catch (err) {
      setAppliedPromo(null);
      toast.error(err?.response?.data?.message || err?.message || "Impossible d'appliquer le code promo.");
    }
  };

  const discountAmount = appliedPromo ? (Number(appliedPromo.discountAmount) || 0) : 0;
  const loyaltyDiscountAmount = appliedPromo ? 0 : (Number(loyaltyPricing?.discountAmount) || 0);
  const finalTotal = cartTotal - discountAmount - loyaltyDiscountAmount + shippingCost;
  const safeFinalTotal = Math.max(Number(finalTotal) || 0, 0);
  const remainingToFreeShipping = isFreeShippingEnabled ? Math.max(freeShippingThreshold - cartTotal, 0) : 0;
  const progressToFreeShipping = isFreeShippingEnabled ? Math.min((cartTotal / freeShippingThreshold) * 100, 100) : 0;
  const freeShippingMessage = useMemo(() => {
    if (!isFreeShippingEnabled) return "";
    const remaining = remainingToFreeShipping.toLocaleString();
    const threshold = freeShippingThreshold.toLocaleString();
    if (cartTotal >= freeShippingThreshold) {
      return `${freeShipping?.unlockedMessage || "Livraison gratuite débloquée ! 🎉"}`.trim();
    }
    const tpl = `${freeShipping?.progressMessageTemplate || "Plus que {remaining} FCFA pour la livraison gratuite"}`.trim();
    return tpl.replaceAll("{remaining}", remaining).replaceAll("{threshold}", threshold);
  }, [cartTotal, freeShipping?.progressMessageTemplate, freeShipping?.unlockedMessage, freeShippingThreshold, isFreeShippingEnabled, remainingToFreeShipping]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoadingRecommendations(true);
      try {
        let data = await getFeaturedCatalogProducts(12);
        if (!Array.isArray(data) || data.length === 0) {
          const page = await getCatalogProductsPage(0, 12);
          data = Array.isArray(page?.content) ? page.content : [];
        }

        const normalized = (Array.isArray(data) ? data : [])
          .filter((p) => p?.id)
          .map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: Number(p.price) || 0,
            imageUrl: p.mainImageUrl || "",
            referenceProduitPartenaire: p.referenceProduitPartenaire,
          }))
          .filter((p) => p?.id);

        if (!cancelled) setRecommendations(normalized);
      } catch {
        if (!cancelled) setRecommendations([]);
      } finally {
        if (!cancelled) setIsLoadingRecommendations(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!isAuthenticated()) {
          if (!cancelled) setLoyaltyPricing({ applied: false, tier: "", percent: 0, discountAmount: 0, points: 0 });
          return;
        }
        if (appliedPromo) {
          if (!cancelled) setLoyaltyPricing({ applied: false, tier: "", percent: 0, discountAmount: 0, points: 0 });
          return;
        }
        const payload = getCurrentUserPayload();
        if (!payload?.sub) {
          if (!cancelled) setLoyaltyPricing({ applied: false, tier: "", percent: 0, discountAmount: 0, points: 0 });
          return;
        }
        const toArticleId = (value) => {
          const numeric = Number(value);
          if (!Number.isFinite(numeric) || numeric <= 0) return null;
          return Math.trunc(numeric);
        };
        const items = cartItems
          .map((item) => {
            const quantity = Number(item?.quantity) || 0;
            if (quantity <= 0) return null;
            const referenceProduitPartenaire = item?.referenceProduitPartenaire || item?.referencePartenaire || item?.sku;
            const articleId = item?.articleId ?? toArticleId(item?.id);
            if (!articleId && !referenceProduitPartenaire) return null;
            return { articleId: articleId ?? undefined, referenceProduitPartenaire: referenceProduitPartenaire ?? undefined, quantity };
          })
          .filter(Boolean);
        if (items.length === 0) {
          if (!cancelled) setLoyaltyPricing({ applied: false, tier: "", percent: 0, discountAmount: 0, points: 0 });
          return;
        }
        const res = await quoteCheckout(payload.sub, {
          currency: "XOF",
          email: payload?.email || "",
          phone: "",
          promoCode: null,
          items
        });
        if (cancelled) return;
        setLoyaltyPricing({
          applied: Boolean(res?.loyaltyApplied),
          tier: res?.loyaltyTier || "",
          percent: Number(res?.loyaltyDiscountPercent) || 0,
          discountAmount: Number(res?.loyaltyDiscountAmount) || 0,
          points: Number(res?.loyaltyPoints) || 0
        });
      } catch {
        if (!cancelled) setLoyaltyPricing({ applied: false, tier: "", percent: 0, discountAmount: 0, points: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cartItems, appliedPromo]);

  const recommendedProducts = useMemo(() => {
    const cartIdSet = new Set((cartItems || []).map((item) => `${item?.id || ""}`));
    return (recommendations || [])
      .filter((p) => p?.id && !cartIdSet.has(`${p.id}`))
      .slice(0, 3);
  }, [cartItems, recommendations]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const totalItems = useMemo(() => {
    return (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => acc + (Number(item?.quantity) || 0), 0);
  }, [cartItems]);

  const formatMoney = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-neutral-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,121,0,0.25),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(106,162,0,0.18),transparent_55%)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-6">
             
              <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                Ton panier est vide.
                <span className="block text-white/70 font-extrabold">On te trouve quelque chose ?</span>
              </h1>
              <p className="text-white/70 max-w-xl">
                Explore le catalogue, ajoute tes coups de cœur, puis reviens ici pour finaliser la commande.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-neutral-900 px-5 py-3 font-bold hover:opacity-95 transition"
                >
                  <ArrowLeft size={18} />
                  Explorer la boutique
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white hover:bg-white/10 transition"
                >
                  Revenir à l’accueil
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white/80">Contenu du panier</div>
                <div className="rounded-full bg-orange-500/20 px-3 py-1 text-sm font-bold text-orange-200">0</div>
              </div>
              <div className="mt-6 grid gap-3">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="h-3 w-1/2 bg-white/10 rounded" />
                    <div className="mt-2 h-3 w-2/3 bg-white/10 rounded" />
                    <div className="mt-4 h-10 bg-white/5 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200/70 dark:border-neutral-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-[#6aa200] text-white flex items-center justify-center shadow-sm">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white leading-tight">
                    Panier
                  </h1>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {totalItems} article(s) · Sous-total {formatMoney(cartTotal)} FCFA
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-900 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  1. Panier
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-900 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  2. Livraison
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-900 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  3. Paiement
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
              >
                <ArrowLeft size={18} />
                Continuer
              </Link>
              <button
                onClick={clearCart}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200/70 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-2.5 text-sm font-semibold text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-950/50 transition"
              >
                <Trash2 className="h-4 w-4" />
                Vider
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            {isFreeShippingEnabled ? (
              <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                      <Truck className="h-5 w-5 text-orange-600" />
                      Livraison
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-300">{freeShippingMessage}</div>
                  </div>
                  <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{Math.round(progressToFreeShipping)}%</div>
                </div>
                <div className="mt-4 h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToFreeShipping}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className={cartTotal >= freeShippingThreshold ? "h-full bg-[#6aa200]" : "h-full bg-orange-600"}
                  />
                </div>
                {cartTotal < freeShippingThreshold ? (
                  <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                    Encore <span className="font-bold text-neutral-700 dark:text-neutral-200">{formatMoney(remainingToFreeShipping)} FCFA</span> pour débloquer la livraison gratuite.
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-neutral-200/70 dark:border-neutral-800/70 flex items-center justify-between">
                <div className="font-bold text-neutral-900 dark:text-white">Articles</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{cartItems.length} ligne(s)</div>
              </div>

              <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                <AnimatePresence>
                  {cartItems.map((item) => {
                    const lineKey = `${item.id}-${item.color}-${item.size}`;
                    const imgSrc = resolveBackendAssetUrl(item?.image || item?.imageUrl) || "/imgs/logo.png";
                    const unitPrice = Number(item?.price) || 0;
                    const qty = Number(item?.quantity) || 0;
                    const lineTotal = Math.max(unitPrice * qty, 0);
                    const sizeLabel = `${item?.size || "TU"}`.trim();
                    const colorLabel = `${item?.color || ""}`.trim();
                    const colorValue = item?.hex || item?.color;

                    return (
                      <Motion.div key={lineKey} variants={itemVariants} layout exit={{ opacity: 0, height: 0 }} className="px-5 sm:px-6 py-5">
                        <div className="flex gap-4 sm:gap-5">
                          <Link to={`/product/${item.id}`} className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={imgSrc}
                              alt={item?.name || ""}
                              className="h-full w-full object-contain p-3 mix-blend-multiply dark:mix-blend-normal"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/imgs/logo.png";
                              }}
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link to={`/product/${item.id}`} className="block font-extrabold text-neutral-900 dark:text-white leading-snug hover:text-orange-600 transition line-clamp-2">
                                  {item?.name || "Produit"}
                                </Link>
                                <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">{item?.brand || ""}</div>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id, item.color, item.size)}
                                className="shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 py-2 text-neutral-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 transition"
                                title="Retirer du panier"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                                Taille: {sizeLabel}
                              </span>
                              {colorLabel ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                                  <span className="h-3 w-3 rounded-full border border-neutral-200/80 dark:border-neutral-700" style={{ backgroundColor: colorValue }} />
                                  {colorLabel}
                                </span>
                              ) : null}
                              <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                                {formatMoney(unitPrice)} FCFA
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="inline-flex items-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.color, item.size, -1)}
                                  disabled={qty <= 1}
                                  className="h-10 w-10 rounded-xl flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-50 transition"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <div className="w-12 text-center font-black text-neutral-900 dark:text-white">{qty}</div>
                                <button
                                  onClick={() => updateQuantity(item.id, item.color, item.size, 1)}
                                  className="h-10 w-10 rounded-xl flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="text-right">
                                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total</div>
                                <div className="text-lg font-black text-neutral-900 dark:text-white">{formatMoney(lineTotal)} FCFA</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold text-neutral-900 dark:text-white">Suggestions</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Ajoute en 1 clic</div>
              </div>

              <div className="mt-4">
                <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
                  {(isLoadingRecommendations ? [1, 2, 3] : recommendedProducts).map((product) => {
                    if (isLoadingRecommendations) {
                      return (
                        <div key={`skeleton-${product}`} className="min-w-[220px] sm:min-w-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4">
                          <div className="aspect-square rounded-xl bg-neutral-200/60 dark:bg-neutral-800/70" />
                          <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200/60 dark:bg-neutral-800/70" />
                          <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200/60 dark:bg-neutral-800/70" />
                          <div className="mt-4 h-10 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/70" />
                        </div>
                      );
                    }

                    const imgUrl = resolveBackendAssetUrl(product?.mainImageUrl || product?.imageUrl) || "/imgs/logo.png";
                    return (
                      <Motion.div key={product.id} whileHover={{ y: -4 }} className="min-w-[220px] sm:min-w-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 flex flex-col">
                        <div className="aspect-square rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800/70 flex items-center justify-center overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={product?.name || ""}
                            className="h-full w-full object-contain p-5 mix-blend-multiply dark:mix-blend-normal"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/imgs/logo.png";
                            }}
                          />
                        </div>
                        <div className="mt-3 min-w-0">
                          <div className="font-bold text-neutral-900 dark:text-white line-clamp-1">{product?.name || "Produit"}</div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">{product?.brand || ""}</div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="font-black text-neutral-900 dark:text-white">{formatMoney(product?.price)} FCFA</div>
                          <button
                            onClick={() =>
                              addToCart({
                                id: product.id,
                                name: product.name,
                                brand: product.brand,
                                price: Number(product.price) || 0,
                                quantity: 1,
                                size: "Unique",
                                color: "Standard",
                                imageUrl: product.mainImageUrl,
                                referenceProduitPartenaire: product.referenceProduitPartenaire
                              })
                            }
                            className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition"
                            title="Ajouter"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </Motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="font-black text-neutral-900 dark:text-white text-lg">Résumé</div>
                <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {formatMoney(cartTotal)} FCFA
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid gap-2">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Tag className="h-4 w-4 text-orange-600" />
                    Code promo
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Ex: LID10"
                      className="flex-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-3 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="rounded-2xl bg-neutral-900 dark:bg-white px-4 py-3 text-sm font-bold text-white dark:text-neutral-900 hover:opacity-95 transition"
                    >
                      Appliquer
                    </button>
                  </div>
                  {appliedPromo ? (
                    <div className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {appliedPromo.code} (-{formatMoney(discountAmount)} FCFA)
                    </div>
                  ) : null}
                  {!appliedPromo && loyaltyPricing?.applied ? (
                    <div className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {`VIP ${loyaltyPricing.tier || ""} (-${formatMoney(loyaltyPricing.percent || 0)}%)`}
                    </div>
                  ) : null}
                </div>

                <details className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4">
                  <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                      <Truck className="h-4 w-4 text-orange-600" />
                      Livraison
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400">
                      <ChevronDown className="h-4 w-4 group-open:hidden" />
                      <ChevronUp className="h-4 w-4 hidden group-open:block" />
                    </div>
                  </summary>
                  <div className="mt-3 grid gap-2">
                    {shippingMethods.map((m) => {
                      const code = `${m?.code || ""}`.toUpperCase();
                      const checked = code === `${shippingMethod || ""}`.toUpperCase();
                      const baseCost = Number(m?.costAmount);
                      const cost = Number.isFinite(baseCost) && baseCost >= 0 ? baseCost : 0;
                      const isStandard = code === "STANDARD";
                      const displayCost = isStandard && isFreeShippingEnabled && cartTotal >= freeShippingThreshold ? 0 : cost;

                      return (
                        <label
                          key={code}
                          className={
                            checked
                              ? "flex items-start justify-between gap-3 rounded-2xl border border-orange-600 bg-orange-50 dark:bg-orange-900/10 p-3 cursor-pointer"
                              : "flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition"
                          }
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={code}
                              checked={checked}
                              onChange={(e) => setShippingMethod(e.target.value)}
                              className="mt-1"
                            />
                            <div>
                              <div className="text-sm font-bold text-neutral-900 dark:text-white">{m?.label || code}</div>
                              {m?.description ? (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">{m.description}</div>
                              ) : null}
                            </div>
                          </div>
                          <div className="text-sm font-black text-neutral-900 dark:text-white">
                            {displayCost <= 0 ? "Gratuit" : `${formatMoney(displayCost)} FCFA`}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </details>

                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4">
                  <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
                    <span>Sous-total</span>
                    <span className="font-semibold">{formatMoney(cartTotal)} FCFA</span>
                  </div>
                  {discountAmount > 0 ? (
                    <div className="mt-2 flex items-center justify-between text-sm text-green-700 dark:text-green-400">
                      <span>Réduction</span>
                      <span className="font-semibold">-{formatMoney(discountAmount)} FCFA</span>
                    </div>
                  ) : null}
                  {loyaltyDiscountAmount > 0 ? (
                    <div className="mt-2 flex items-center justify-between text-sm text-green-700 dark:text-green-400">
                      <span>Fidélité</span>
                      <span className="font-semibold">-{formatMoney(loyaltyDiscountAmount)} FCFA</span>
                    </div>
                  ) : null}
                  <div className="mt-2 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
                    <span>Livraison</span>
                    <span className="font-semibold">{shippingCost <= 0 ? "Gratuit" : `${formatMoney(shippingCost)} FCFA`}</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">Total</div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-neutral-900 dark:text-white">{formatMoney(safeFinalTotal)} FCFA</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">TVA incluse</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-[#6aa200] text-white py-4 font-black text-base shadow-lg shadow-orange-600/15 hover:shadow-orange-600/25 transition flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  Payer maintenant
                  <ArrowRight size={20} />
                </button>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#6aa200] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-neutral-900 dark:text-white">Paiement sécurisé</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Paiement crypté, confirmation instantanée.</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 flex items-start gap-3">
                    <Package className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-neutral-900 dark:text-white">Retours simplifiés</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Retours possibles selon la politique du vendeur.</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-neutral-400 pt-2">
                  <CreditCard className="h-6 w-6" />
                  <div className="h-8 w-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-black text-neutral-700 dark:text-neutral-200">VISA</div>
                  <div className="h-8 w-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-black text-neutral-700 dark:text-neutral-200">MC</div>
                </div>
              </div>
            </div>

            <div className="lg:hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur p-4 sticky bottom-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total</div>
                  <div className="text-lg font-black text-neutral-900 dark:text-white">{formatMoney(safeFinalTotal)} FCFA</div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-3 font-black flex items-center gap-2"
                >
                  Payer
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </Motion.div>
      </div>
      
      <CheckoutFlow 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cartItems}
        onSuccess={handlePaymentSuccess}
        shippingCost={shippingCost}
        shippingMethodLabel={selectedShippingMethod?.label || "Standard"}
        discountAmount={discountAmount}
        loyaltyDiscountAmount={loyaltyDiscountAmount}
        loyaltyTier={loyaltyPricing?.applied ? loyaltyPricing?.tier : ""}
        promoCode={appliedPromo?.code || ""}
      />
    </div>
  );
}
