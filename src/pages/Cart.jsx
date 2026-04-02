import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Tag
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
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { data: appConfig } = useAppConfig();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loyaltyPricing, setLoyaltyPricing] = useState({ applied: false, tier: "", percent: 0, discountAmount: 0, points: 0 });
  const [shippingMethod, setShippingMethod] = useState("STANDARD");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const navigate = useNavigate();
  const [savedForLater, setSavedForLater] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("lid_saved_for_later");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const getLineKey = (item) => `${item?.id || ""}::${item?.color || ""}::${item?.size || ""}`;
  const allLineKeys = useMemo(() => (Array.isArray(cartItems) ? cartItems : []).map(getLineKey), [cartItems]);
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());

  useEffect(() => {
    setSelectedKeys((prev) => {
      const prevSet = prev instanceof Set ? prev : new Set();
      const next = new Set();
      const selectAll = prevSet.size === 0;
      for (const key of allLineKeys) {
        if (selectAll || prevSet.has(key)) {
          next.add(key);
        }
      }
      if (next.size === 0 && allLineKeys.length > 0) {
        for (const key of allLineKeys) next.add(key);
      }
      return next;
    });
  }, [allLineKeys]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("lid_saved_for_later", JSON.stringify(savedForLater || []));
    } catch {
      return;
    }
  }, [savedForLater]);

  const selectedCartItems = useMemo(() => {
    const set = selectedKeys;
    return (Array.isArray(cartItems) ? cartItems : []).filter((item) => set.has(getLineKey(item)));
  }, [cartItems, selectedKeys]);

  const selectedSubtotal = useMemo(() => {
    return selectedCartItems.reduce((acc, item) => acc + (Number(item?.price) || 0) * (Number(item?.quantity) || 0), 0);
  }, [selectedCartItems]);

  const selectedQuantity = useMemo(() => {
    return selectedCartItems.reduce((acc, item) => acc + (Number(item?.quantity) || 0), 0);
  }, [selectedCartItems]);

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
    isStandardSelected && isFreeShippingEnabled && selectedSubtotal >= freeShippingThreshold
      ? 0
      : selectedBaseCost;
  
  const handleCheckout = () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    if (!selectedCartItems.length) {
      toast.error("Sélectionnez au moins un article.");
      return;
    }
    setCheckoutItems(selectedCartItems);
    setShowCheckout(true);
  };
  
  const handlePaymentSuccess = () => {
    const itemsToRemove = Array.isArray(checkoutItems) && checkoutItems.length > 0 ? checkoutItems : cartItems;
    if (Array.isArray(itemsToRemove) && itemsToRemove.length > 0) {
      itemsToRemove.forEach((item) => {
        removeFromCart(item.id, item.color, item.size);
      });
    } else {
      clearCart();
    }
    setCheckoutItems([]);
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
    if (!selectedCartItems.length) {
      toast.error("Sélectionnez au moins un article.");
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
      const items = selectedCartItems
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
  const finalTotal = selectedSubtotal - discountAmount - loyaltyDiscountAmount + shippingCost;
  const safeFinalTotal = Math.max(Number(finalTotal) || 0, 0);
  const remainingToFreeShipping = isFreeShippingEnabled ? Math.max(freeShippingThreshold - selectedSubtotal, 0) : 0;
  const freeShippingMessage = useMemo(() => {
    if (!isFreeShippingEnabled) return "";
    const remaining = remainingToFreeShipping.toLocaleString();
    const threshold = freeShippingThreshold.toLocaleString();
    if (selectedSubtotal >= freeShippingThreshold) {
      return `${freeShipping?.unlockedMessage || "Livraison gratuite débloquée ! 🎉"}`.trim();
    }
    const tpl = `${freeShipping?.progressMessageTemplate || "Plus que {remaining} FCFA pour la livraison gratuite"}`.trim();
    return tpl.replaceAll("{remaining}", remaining).replaceAll("{threshold}", threshold);
  }, [freeShipping?.progressMessageTemplate, freeShipping?.unlockedMessage, freeShippingThreshold, isFreeShippingEnabled, remainingToFreeShipping, selectedSubtotal]);

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
        const items = selectedCartItems
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
  }, [selectedCartItems, appliedPromo]);

  const recommendedProducts = useMemo(() => {
    const cartIdSet = new Set((cartItems || []).map((item) => `${item?.id || ""}`));
    return (recommendations || [])
      .filter((p) => p?.id && !cartIdSet.has(`${p.id}`))
      .slice(0, 3);
  }, [cartItems, recommendations]);

  const formatMoney = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "0";
    return num.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
  };

  const isAllSelected = allLineKeys.length > 0 && selectedKeys.size === allLineKeys.length;

  const toggleAll = () => {
    setSelectedKeys(() => {
      if (isAllSelected) return new Set();
      return new Set(allLineKeys);
    });
  };

  const toggleOne = (key) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const saveForLaterItem = (item) => {
    if (!item) return;
    const key = getLineKey(item);
    setSavedForLater((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.some((x) => getLineKey(x) === key)) return list;
      return [item, ...list];
    });
    removeFromCart(item.id, item.color, item.size);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const removeSavedItem = (item) => {
    if (!item) return;
    const key = getLineKey(item);
    setSavedForLater((prev) => (Array.isArray(prev) ? prev.filter((x) => getLineKey(x) !== key) : []));
  };

  const moveToCart = (item) => {
    if (!item) return;
    addToCart({ ...item, quantity: Number(item?.quantity) || 1 });
    removeSavedItem(item);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#eaeded] dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                Votre panier est vide
              </h1>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 max-w-xl">
                Parcourez la boutique et ajoutez des articles à votre panier.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center rounded-xl bg-[#ffd814] hover:bg-[#f7ca00] text-neutral-900 px-5 py-3 font-black transition"
                >
                  Aller à la boutique
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-5 py-3 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                >
                  Retour à l’accueil
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6">
              <div className="text-sm font-black text-neutral-900 dark:text-white">Sous-total</div>
              <div className="mt-2 text-xl font-black text-neutral-900 dark:text-white">0 FCFA</div>
              <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                Les frais de livraison et réductions apparaîtront au checkout.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px] items-start">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-neutral-200/70 dark:border-neutral-800/70">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                    Shopping Cart
                  </h1>
                  <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                    Sous-total ({selectedQuantity} article(s) sélectionné(s)) :{" "}
                    <span className="font-black text-neutral-900 dark:text-white">{formatMoney(selectedSubtotal)} FCFA</span>
                  </div>
                </div>
                <button
                  onClick={clearCart}
                  className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline"
                >
                  Vider le panier
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 font-semibold">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    className="h-4 w-4"
                  />
                  Sélectionner tout
                </label>
                <div className="text-neutral-500 dark:text-neutral-400">Prix</div>
              </div>
            </div>

            <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
              {cartItems.map((item) => {
                const lineKey = getLineKey(item);
                const checked = selectedKeys.has(lineKey);
                const imgSrc = resolveBackendAssetUrl(item?.image || item?.imageUrl) || "/imgs/logo.png";
                const unitPrice = Number(item?.price) || 0;
                const qty = Number(item?.quantity) || 0;
                const lineTotal = Math.max(unitPrice * qty, 0);
                const sizeLabel = `${item?.size || "TU"}`.trim();
                const colorLabel = `${item?.color || ""}`.trim();

                return (
                  <div key={lineKey} className="p-4 sm:p-6">
                    <div className="flex gap-3">
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(lineKey)}
                          className="h-4 w-4"
                        />
                      </div>
                      <Link to={`/product/${item.id}`} className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
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
                            <Link to={`/product/${item.id}`} className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white hover:underline line-clamp-2">
                              {item?.name || "Produit"}
                            </Link>
                            <div className="mt-1 text-xs text-green-700 dark:text-green-400 font-bold">En stock</div>
                            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                              {item?.brand ? `${item.brand} · ` : ""}
                              {sizeLabel ? `Taille ${sizeLabel} · ` : ""}
                              {colorLabel ? `Couleur ${colorLabel}` : ""}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                              <div className="inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-2 py-1">
                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 mr-2">Qté</span>
                                <select
                                  value={qty || 1}
                                  onChange={(e) => {
                                    const nextQty = Math.max(1, Number(e.target.value) || 1);
                                    const delta = nextQty - (qty || 1);
                                    if (delta) updateQuantity(item.id, item.color, item.size, delta);
                                  }}
                                  className="bg-transparent text-sm font-bold text-neutral-900 dark:text-white outline-none"
                                >
                                  {Array.from({ length: 10 }).map((_, idx) => (
                                    <option key={idx + 1} value={idx + 1}>
                                      {idx + 1}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <span className="text-neutral-300 dark:text-neutral-700">|</span>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id, item.color, item.size)}
                                className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline"
                              >
                                Supprimer
                              </button>
                              <span className="text-neutral-300 dark:text-neutral-700">|</span>
                              <button
                                type="button"
                                onClick={() => saveForLaterItem(item)}
                                className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline"
                              >
                                Sauvegarder
                              </button>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">
                              {formatMoney(unitPrice)} FCFA
                            </div>
                            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                              Total: {formatMoney(lineTotal)} FCFA
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 sm:p-6 border-t border-neutral-200/70 dark:border-neutral-800/70 flex flex-wrap items-center justify-between gap-3">
              <Link to="/shop" className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Continuer vos achats
              </Link>
              <div className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                Sous-total ({selectedQuantity}) : {formatMoney(selectedSubtotal)} FCFA
              </div>
            </div>
          </div>

          <div className="space-y-3 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
              {isFreeShippingEnabled ? (
                <div className="text-xs text-neutral-600 dark:text-neutral-300">
                  {selectedSubtotal >= freeShippingThreshold ? (
                    <span className="font-bold text-green-700 dark:text-green-400">Livraison gratuite débloquée.</span>
                  ) : (
                    <span>{freeShippingMessage}</span>
                  )}
                </div>
              ) : null}

              <div className="mt-3 text-lg font-black text-neutral-900 dark:text-white">
                Sous-total ({selectedQuantity}) : {formatMoney(selectedSubtotal)} FCFA
              </div>

              <div className="mt-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 text-sm space-y-2">
                <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-200">
                  <span>Livraison</span>
                  <span className="font-bold">{shippingCost <= 0 ? "Gratuit" : `${formatMoney(shippingCost)} FCFA`}</span>
                </div>
                {discountAmount > 0 ? (
                  <div className="flex items-center justify-between text-green-700 dark:text-green-400">
                    <span>Réduction</span>
                    <span className="font-bold">-{formatMoney(discountAmount)} FCFA</span>
                  </div>
                ) : null}
                {loyaltyDiscountAmount > 0 ? (
                  <div className="flex items-center justify-between text-green-700 dark:text-green-400">
                    <span>Fidélité</span>
                    <span className="font-bold">-{formatMoney(loyaltyDiscountAmount)} FCFA</span>
                  </div>
                ) : null}
                <div className="pt-3 mt-3 border-t border-neutral-200/70 dark:border-neutral-800/70 flex items-end justify-between">
                  <span className="font-black text-neutral-900 dark:text-white">Total</span>
                  <span className="text-xl font-black text-neutral-900 dark:text-white">{formatMoney(safeFinalTotal)} FCFA</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!selectedCartItems.length}
                className="mt-4 w-full rounded-xl bg-[#ffd814] hover:bg-[#f7ca00] disabled:opacity-60 text-neutral-900 py-3.5 font-black transition flex items-center justify-center gap-2"
              >
                Procéder au paiement
                <ArrowRight size={18} />
              </button>

              <div className="mt-3">
                <label className="text-xs font-black tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                  Livraison
                </label>
                <select
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-3 text-sm font-bold text-neutral-900 dark:text-white outline-none"
                >
                  {shippingMethods.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <details className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
                <summary className="cursor-pointer text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <Tag className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                  Ajouter un code promo
                </summary>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Ex: LID10"
                    className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-3 py-3 text-sm font-bold text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="rounded-xl bg-neutral-900 dark:bg-white px-4 py-3 text-sm font-black text-white dark:text-neutral-900 hover:opacity-95 transition"
                  >
                    Appliquer
                  </button>
                </div>
                {appliedPromo ? (
                  <div className="mt-3 text-sm font-bold text-green-700 dark:text-green-400">
                    {appliedPromo.code} (-{formatMoney(discountAmount)} FCFA)
                  </div>
                ) : null}
                {!appliedPromo && loyaltyPricing?.applied ? (
                  <div className="mt-3 text-sm font-bold text-green-700 dark:text-green-400">
                    {`VIP ${loyaltyPricing.tier || ""} (-${formatMoney(loyaltyPricing.percent || 0)}%)`}
                  </div>
                ) : null}
              </details>

              <div className="mt-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 text-sm">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#6aa200] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-black text-neutral-900 dark:text-white">Paiement sécurisé</div>
                    <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Paiement crypté, confirmation instantanée.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {savedForLater.length > 0 ? (
          <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-neutral-200/70 dark:border-neutral-800/70">
              <div className="text-xl font-black text-neutral-900 dark:text-white">Saved for later</div>
            </div>
            <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
              {savedForLater.map((item) => {
                const key = getLineKey(item);
                const imgSrc = resolveBackendAssetUrl(item?.image || item?.imageUrl) || "/imgs/logo.png";
                const unitPrice = Number(item?.price) || 0;
                return (
                  <div key={key} className="p-4 sm:p-6 flex gap-4">
                    <div className="h-20 w-20 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={imgSrc}
                        alt={item?.name || ""}
                        className="h-full w-full object-contain p-3 mix-blend-multiply dark:mix-blend-normal"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/imgs/logo.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-neutral-900 dark:text-white line-clamp-2">{item?.name || "Produit"}</div>
                          <div className="mt-1 text-sm font-black text-neutral-900 dark:text-white">{formatMoney(unitPrice)} FCFA</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveToCart(item)}
                            className="rounded-xl bg-[#ffd814] hover:bg-[#f7ca00] text-neutral-900 px-4 py-2 text-sm font-black transition"
                          >
                            Ajouter au panier
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSavedItem(item)}
                            className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white px-4 py-2 text-sm font-black hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-200/70 dark:border-neutral-800/70 flex items-center justify-between gap-3">
            <div className="text-xl font-black text-neutral-900 dark:text-white">Recommandés</div>
            <Link to="/shop" className="text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline">
              Voir plus
            </Link>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(isLoadingRecommendations ? [1, 2, 3] : recommendedProducts).map((product) => {
                if (isLoadingRecommendations) {
                  return (
                    <div key={`skeleton-${product}`} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
                      <div className="aspect-square rounded-xl bg-neutral-200/60 dark:bg-neutral-800/70" />
                      <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200/60 dark:bg-neutral-800/70" />
                      <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200/60 dark:bg-neutral-800/70" />
                      <div className="mt-4 h-10 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/70" />
                    </div>
                  );
                }

                const imgUrl = resolveBackendAssetUrl(product?.mainImageUrl || product?.imageUrl) || "/imgs/logo.png";
                return (
                  <div key={product.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 flex flex-col">
                    <div className="aspect-square rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800/70 flex items-center justify-center overflow-hidden">
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
                        type="button"
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
                        className="rounded-xl bg-[#ffd814] hover:bg-[#f7ca00] text-neutral-900 px-4 py-2 text-sm font-black transition"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden sticky bottom-3 px-3 sm:px-6">
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/85 backdrop-blur p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black tracking-widest uppercase text-neutral-500 dark:text-neutral-400">Total</div>
            <div className="text-lg font-black text-neutral-900 dark:text-white">{formatMoney(safeFinalTotal)} FCFA</div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={!selectedCartItems.length}
            className="rounded-xl bg-[#ffd814] hover:bg-[#f7ca00] disabled:opacity-60 text-neutral-900 px-4 py-3 font-black transition inline-flex items-center gap-2"
          >
            Paiement
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      
      <CheckoutFlow 
        isOpen={showCheckout}
        onClose={() => {
          setShowCheckout(false);
          setCheckoutItems([]);
        }}
        cartItems={checkoutItems}
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
