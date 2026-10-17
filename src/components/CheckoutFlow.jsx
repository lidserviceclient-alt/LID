import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Smartphone, User, MapPin, Phone, Mail, ArrowRight, ShieldCheck, Lock, ChevronLeft, Loader2, LocateFixed } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import { getCurrentUserPayload, getUserProfile } from '@/services/authService.js';
import { checkout } from '@/services/orderService.js';
import { getCustomerAddresses, getMyCustomerCheckoutCollection } from '@/services/customerService.js';
import { resolveBackendAssetUrl } from '@/services/categoryService';
import { useAppConfig } from '@/features/appConfig/useAppConfig';
import { useCart } from '@/features/cart/CartContext';
import InternationalPhoneField from '@/components/InternationalPhoneField';
import { isValidInternationalPhone, isValidMobileMoneyPhone } from '@/utils/phone';

const formatMoney = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  const hasDecimals = Math.abs(num - Math.trunc(num)) > 0.000001;
  return num.toLocaleString("fr-FR", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0
  });
};

const formatExpiryLong = (value) => {
  const v = `${value || ''}`.trim();
  if (!v) return '11/2026';
  const match = v.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return v;
  return `${match[1]}/20${match[2]}`;
};

const normalizeVatRate = (raw) => {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return 0.18;
  return value > 1 ? value / 100 : value;
};

const roundAmount = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
};

// Montant minimum accepte par l'API (verification cote client avant le paiement)
const MINIMUM_ORDER_AMOUNT = 100;

export default function CheckoutFlow({ isOpen, onClose, product, selectedColor, selectedSize, quantity, cartItems, onSuccess, shippingCost = 0, discountAmount = 0, loyaltyDiscountAmount = 0, loyaltyTier = "", promoCode = "", shippingMethodCode = "STANDARD", shippingMethodLabel = "Standard" }) {
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Processing, 4: Success
  const [loadingStep, setLoadingStep] = useState(0); // 0: Init, 1: Connecting, 2: Verifying, 3: Approved
  const [orderNumber, setOrderNumber] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    paymentMethod: 'card', // 'card' (page securisee du prestataire) | 'mobile' | 'wave'
    mobilePhone: ''
  });

  // Une cle par tentative : un rejeu (double clic, timeout) ne cree jamais une seconde commande
  const idempotencyKeyRef = useRef(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isResolvingCurrentAddress, setIsResolvingCurrentAddress] = useState(false);
  const [shippingCoordinates, setShippingCoordinates] = useState(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [mobilePhoneTouched, setMobilePhoneTouched] = useState(false);
  const { data: appConfig } = useAppConfig();
  const { clearCart } = useCart();
  const vatRate = normalizeVatRate(appConfig?.vatPercent);
 
  const isCartCheckout = cartItems && cartItems.length > 0;

  const normalizedShippingCost = Number.isFinite(Number(shippingCost)) ? Number(shippingCost) : 0;
  const normalizedDiscountAmount = Number.isFinite(Number(discountAmount)) ? Number(discountAmount) : 0;
  const normalizedLoyaltyDiscountAmount = Number.isFinite(Number(loyaltyDiscountAmount)) ? Number(loyaltyDiscountAmount) : 0;
  const normalizedQuantity = Number.isFinite(Number(quantity)) ? Number(quantity) : 1;
  
  const itemsTotal = isCartCheckout 
    ? cartItems.reduce((acc, item) => acc + (Number(item?.price) || 0) * (Number(item?.quantity) || 0), 0)
    : (Number(product?.price) || 0) * normalizedQuantity;

  const finalTotal = Math.max(0, roundAmount(itemsTotal + normalizedShippingCost - normalizedDiscountAmount - normalizedLoyaltyDiscountAmount));
  const taxAmount = vatRate > 0 ? roundAmount(finalTotal - (finalTotal / (1 + vatRate))) : 0;
  const vatPercentLabel = Math.round(vatRate * 100);
  const phoneIsValid = isValidInternationalPhone(formData.phone);
  const mobilePhoneIsValid = !formData.mobilePhone || isValidMobileMoneyPhone(formData.mobilePhone);

  const toCheckoutItem = (item, fallbackQuantity = 1) => {
    const itemType = `${item?.itemType || (item?.ticketEventId ? "TICKET" : item?.type === "ticket" ? "TICKET" : "ARTICLE")}`.trim().toUpperCase();
    const quantityValue = Number(item?.quantity) || fallbackQuantity;
    if (itemType === "TICKET") {
      const ticketEventId = Number(item?.ticketEventId ?? item?.id);
      if (!Number.isFinite(ticketEventId) || ticketEventId <= 0) return null;
      return { itemType, ticketEventId: Math.trunc(ticketEventId), quantity: quantityValue };
    }
    const articleId = Number(item?.articleId ?? item?.id);
    const referenceProduitPartenaire = `${item?.referenceProduitPartenaire || item?.referencePartenaire || item?.sku || ""}`.trim();
    if ((!Number.isFinite(articleId) || articleId <= 0) && !referenceProduitPartenaire) return null;
    return {
      itemType,
      articleId: Number.isFinite(articleId) && articleId > 0 ? Math.trunc(articleId) : undefined,
      referenceProduitPartenaire: referenceProduitPartenaire || undefined,
      quantity: quantityValue,
      color: item?.color || null,
      size: item?.size || null
    };
  };

  const steps = [
    { id: 1, label: 'Informations', icon: User },
    { id: 2, label: 'Paiement', icon: CreditCard },
    { id: 3, label: 'Confirmation', icon: Check },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const payload = getCurrentUserPayload();
    if (!payload?.sub) return;
    let active = true;
    setLoadingAddresses(true);
    (async () => {
      try {
        const [checkoutCollection, profile] = await Promise.all([
          getMyCustomerCheckoutCollection(),
          getUserProfile(payload.sub).catch(() => null)
        ]);
        if (!active) return;
        const customer = checkoutCollection?.customer || profile || null;
        setFormData((prev) => ({
          ...prev,
          firstName: `${customer?.firstName || payload?.firstName || ''}`.trim() || prev.firstName,
          lastName: `${customer?.lastName || payload?.lastName || ''}`.trim() || prev.lastName,
          email: `${customer?.email || payload?.email || ''}`.trim() || prev.email
        }));
        const addresses = Array.isArray(checkoutCollection?.addresses) ? checkoutCollection.addresses : await getCustomerAddresses(payload.sub).catch(() => []);
        if (!active) return;
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find((addr) => addr?.isDefault ?? addr?.default)
          || (addresses.length === 1 ? addresses[0] : null);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setFormData((prev) => ({
            ...prev,
            address: defaultAddress.addressLine || defaultAddress.address || prev.address,
            city: defaultAddress.city || prev.city,
            zip: defaultAddress.postalCode || prev.zip,
            phone: defaultAddress.phone || prev.phone
          }));
          setShippingCoordinates(null);
        }
      } catch {
        if (active) setSavedAddresses([]);
      } finally {
        if (active) setLoadingAddresses(false);
      }
    })();
    return () => { active = false; };
  }, [isOpen]);

  const getGeolocationBlockReason = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return "";
    if (!window.isSecureContext) {
      return "La géolocalisation exige un contexte sécurisé HTTPS.";
    }

    const policy = document.permissionsPolicy || document.featurePolicy;
    if (policy?.allowsFeature) {
      try {
        if (!policy.allowsFeature('geolocation')) {
          return "La géolocalisation est bloquée par la politique de permissions du navigateur ou de l'iframe.";
        }
      } catch {
        // no-op
      }
    }

    return "";
  };

  const formatGeolocationError = (error) => {
    const blockedReason = getGeolocationBlockReason();
    if (blockedReason) return blockedReason;
    const code = error?.code;
    if (code === 1) return "L'accès à votre position a été refusé.";
    if (code === 2) return "Votre position n'a pas pu être déterminée.";
    if (code === 3) return "La récupération de votre position a expiré.";
    return "Impossible de récupérer votre position actuellement.";
  };

  const setAddressFromPosition = async () => {
    if (isResolvingCurrentAddress) return;
    if (!navigator?.geolocation) {
      toast.error("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }

    const blockedReason = getGeolocationBlockReason();
    if (blockedReason) {
      toast.error(blockedReason);
      return;
    }

    setIsResolvingCurrentAddress(true);
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }));
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
      const res = await fetch(url);
      const data = await res.json();
      const addr = data.address;
      setFormData(prev => ({
        ...prev,
        address: [addr.house_number, addr.road].filter(Boolean).join(' ') || data.display_name,
        city: addr.city || addr.town || addr.village || '',
        zip: addr.postcode || ''
      }));
      setShippingCoordinates({
        latitude: Number(pos.coords.latitude),
        longitude: Number(pos.coords.longitude),
      });
      toast.success("Adresse détectée");
    } catch (error) {
      toast.error(formatGeolocationError(error));
    } finally {
      setIsResolvingCurrentAddress(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'address' || name === 'city' || name === 'zip') {
      setShippingCoordinates(null);
    }
  };

  const handleAddressSelect = (e) => {
    const id = e.target.value;
    setSelectedAddressId(id);
    const addr = savedAddresses.find(a => `${a.id}` === `${id}`);
    if (addr) {
      setFormData(prev => ({ ...prev, address: addr.addressLine, city: addr.city, zip: addr.postalCode, phone: addr.phone }));
      setShippingCoordinates(null);
    }
  };

  const setPaymentMethod = (method) => {
    setFormData((prev) => {
      if (method === 'mobile' || method === 'wave') {
        return {
          ...prev,
          paymentMethod: method,
          mobilePhone: prev.phone || prev.mobilePhone
        };
      }
      return {
        ...prev,
        paymentMethod: method
      };
    });
  };

  const handleSubmitInfo = (e) => {
    e.preventDefault();
    setPhoneTouched(true);
    if (!phoneIsValid) {
      toast.error("Saisis un numéro de téléphone valide.");
      return;
    }
    setStep(2);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const payload = getCurrentUserPayload();
    if (!payload?.sub) return toast.error("Veuillez vous connecter");
    const checkoutPhone = formData.paymentMethod !== 'card' ? formData.mobilePhone : formData.phone;
    if (formData.paymentMethod !== 'card') {
      setMobilePhoneTouched(true);
    } else {
      setPhoneTouched(true);
    }
    const paymentPhoneIsValid = formData.paymentMethod !== 'card'
      ? isValidMobileMoneyPhone(checkoutPhone)
      : isValidInternationalPhone(checkoutPhone);
    if (!paymentPhoneIsValid) {
      toast.error("Saisis un numéro de téléphone valide pour le paiement.");
      return;
    }
    if (finalTotal < MINIMUM_ORDER_AMOUNT) {
      toast.error(`Le montant minimum de commande est de ${MINIMUM_ORDER_AMOUNT} FCFA.`);
      return;
    }

    setStep(3);
    setLoadingStep(1);
    try {
      const checkoutItems = (isCartCheckout ? cartItems.map((i) => toCheckoutItem(i, i?.quantity)) : [toCheckoutItem({ ...product, quantity: normalizedQuantity }, normalizedQuantity)]).filter(Boolean);
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      }
      const res = await checkout(payload.sub, {
        currency: 'XOF',
        email: formData.email,
        phone: checkoutPhone,
        shippingAddress: `${formData.address}, ${formData.city} ${formData.zip}`,
        shippingLatitude: shippingCoordinates?.latitude ?? null,
        shippingLongitude: shippingCoordinates?.longitude ?? null,
        shippingMethodCode,
        shippingMethodLabel,
        promoCode: `${promoCode || ''}`.trim() || undefined,
        items: checkoutItems,
        paymentOperator: formData.paymentMethod === 'wave' ? 'WAVE_CI' : formData.paymentMethod === 'mobile' ? 'MOBILE_MONEY_CI' : 'CARD_CI'
      }, idempotencyKeyRef.current);
      idempotencyKeyRef.current = null;
      if (res?.paymentUrl && typeof window !== 'undefined') {
        // Permet de reprendre le paiement depuis la page d'annulation (la commande attend 30 min)
        try {
          window.localStorage.setItem('lid_pending_payment', JSON.stringify({
            paymentUrl: res.paymentUrl,
            orderNumber: res.orderNumber || '',
            createdAt: Date.now()
          }));
        } catch { /* stockage indisponible : sans incidence */ }
      }
      if (res?.orderNumber) {
        setOrderNumber(res.orderNumber);
      }
      if (isCartCheckout && res?.invoiceToken && typeof window !== 'undefined') {
        window.localStorage.setItem(`lid_payment_checkout_items_${res.invoiceToken}`, JSON.stringify(checkoutItems));
        window.localStorage.removeItem('cart');
        clearCart();
      }
      setLoadingStep(3);
      if (res?.paymentUrl) window.location.href = res.paymentUrl;
      else if (res?.invoiceToken) {
        const successUrl = new URL(`${window.location.origin}/payment/success`);
        successUrl.searchParams.set('token', res.invoiceToken);
        if (res?.orderNumber) successUrl.searchParams.set('orderNumber', res.orderNumber);
        window.location.href = successUrl.toString();
      }
    } catch (err) {
      setStep(2);
      // Refus definitif du serveur : la prochaine tentative est une nouvelle commande. Timeout/reseau : meme cle.
      const status = err?.response?.status;
      if (status && status >= 400 && status < 500 && status !== 409) {
        idempotencyKeyRef.current = null;
      }
      toast.error(err?.response?.data?.errorMessage || err?.response?.data?.message || err?.message || "Erreur de paiement");
    }
  };

  if (!isOpen) return null;

  const inputCls = "w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm";
  const labelCls = "block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full md:max-w-5xl bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
            style={{ maxHeight: '92dvh' }}
          >

            {/* ── BARRE DE PROGRESSION (mobile uniquement) ── */}
            <div className="md:hidden h-1 w-full bg-neutral-100 dark:bg-neutral-800 shrink-0">
              <div
                className="h-full bg-orange-500 transition-all duration-500 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            {/* ── PANNEAU GAUCHE : RÉSUMÉ ── */}
            <div className="hidden md:flex md:w-[340px] shrink-0 flex-col bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800">

              {/* En-tête résumé */}
              <div className="px-7 pt-8 pb-5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <img src="/imgs/lid-green.png" alt="Lid" className="h-6 object-contain" onError={e => { e.target.style.display='none'; }} />
                  <span className="font-black text-base tracking-tight">Lid</span>
                </div>
                <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-2">
                  <Lock size={11} className="text-orange-500" />
                  Paiement 100 % sécurisé
                </p>
              </div>

              {/* Articles */}
              <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
                {(isCartCheckout ? cartItems : [product]).map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="relative shrink-0 w-14 h-14 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 p-1.5">
                      <img src={resolveBackendAssetUrl(item.image || item.imageUrl) || "/imgs/logo.png"} className="w-full h-full object-contain" alt="" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-[9px] font-black flex items-center justify-center rounded-full">
                        {isCartCheckout ? item.quantity : quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate dark:text-white">{item.name}</p>
                      <p className="text-xs text-orange-600 font-bold mt-0.5">{formatMoney(item.price)} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="px-7 py-5 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Sous-total</span><span className="font-medium text-neutral-800 dark:text-neutral-200">{formatMoney(itemsTotal)} FCFA</span>
                </div>
                {normalizedDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Réduction</span><span className="font-medium text-orange-600">−{formatMoney(normalizedDiscountAmount)} FCFA</span>
                  </div>
                )}
                {normalizedLoyaltyDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Fidélité</span><span className="font-medium text-orange-600">−{formatMoney(normalizedLoyaltyDiscountAmount)} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Livraison</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {normalizedShippingCost === 0 ? 'Gratuit' : `${formatMoney(normalizedShippingCost)} FCFA`}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="font-black text-sm">Total</span>
                  <div className="text-right">
                    <p className="font-black text-xl text-orange-600">{formatMoney(finalTotal)} <span className="text-sm">FCFA</span></p>
                    <p className="text-[10px] text-neutral-400">TVA ({vatPercentLabel}%) : {formatMoney(taxAmount)} FCFA</p>
                  </div>
                </div>
              </div>

              {/* Étapes (desktop) */}
              <div className="px-7 py-5 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                {steps.map(s => (
                  <div key={s.id} className={cn("flex items-center gap-3 text-sm transition-all", step >= s.id ? "text-neutral-800 dark:text-neutral-100" : "text-neutral-300 dark:text-neutral-600")}>
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all", step > s.id ? "bg-orange-500 text-white" : step === s.id ? "bg-orange-500 text-white ring-4 ring-orange-500/20" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400")}>
                      {step > s.id ? <Check size={12} /> : s.id}
                    </div>
                    <span className={cn("font-medium text-xs", step === s.id ? "font-bold" : "")}>{s.label}</span>
                    {step === s.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* ── PANNEAU DROIT : FORMULAIRE ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Header formulaire */}
              <div className="flex items-center justify-between px-5 md:px-8 py-4 md:py-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Étape {step} sur 3
                  </p>
                  <h2 className="font-black text-base mt-0.5 dark:text-white">
                    {step === 1 ? 'Vos informations' : step === 2 ? 'Paiement' : 'Traitement'}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-1 text-xs text-neutral-400">
                    <ShieldCheck size={13} className="text-orange-500" />
                    Sécurisé
                  </div>
                  <button onClick={onClose} className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Corps scrollable */}
              <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6">
                <AnimatePresence mode="wait">

                  {/* ── ÉTAPE 1 : INFOS ── */}
                  {step === 1 && (
                    <motion.form key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} onSubmit={handleSubmitInfo} className="space-y-5 max-w-lg">

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Prénom</label>
                          <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Nom</label>
                          <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputCls} />
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>Email</label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                          <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className={cn(inputCls, "pl-9")} />
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>Téléphone</label>
                        <InternationalPhoneField
                          value={formData.phone}
                          onChange={(value) => { setPhoneTouched(true); setFormData(prev => ({ ...prev, phone: value })); }}
                          onBlur={() => setPhoneTouched(true)}
                          defaultCountry="CI"
                          placeholder="Numéro de téléphone"
                          containerClassName="items-stretch"
                          selectClassName={cn(inputCls, phoneTouched && formData.phone && !phoneIsValid ? "border-red-400 focus:border-red-400" : "")}
                          inputClassName={cn(inputCls, phoneTouched && formData.phone && !phoneIsValid ? "border-red-400 focus:border-red-400" : "")}
                        />
                        {phoneTouched && formData.phone && !phoneIsValid && (
                          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><Phone size={11} /> Numéro invalide</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={cn(labelCls, "mb-0")}>Adresse de livraison</label>
                          <button type="button" onClick={setAddressFromPosition} disabled={isResolvingCurrentAddress}
                            className={cn("inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 border transition-colors",
                              isResolvingCurrentAddress
                                ? "border-orange-200 bg-orange-50 text-orange-500 cursor-wait"
                                : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50"
                            )}>
                            {isResolvingCurrentAddress ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                            {isResolvingCurrentAddress ? "Localisation…" : "Ma position"}
                          </button>
                        </div>
                        <div className="relative">
                          <MapPin size={15} className="absolute left-3.5 top-3.5 text-neutral-400 pointer-events-none" />
                          <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="Rue, numéro…" className={cn(inputCls, "pl-9")} />
                        </div>
                        {shippingCoordinates ? (
                          <p className="mt-1.5 text-xs text-orange-600 flex items-center gap-1"><MapPin size={11} /> Position GPS capturée</p>
                        ) : (
                          <p className="mt-1.5 text-xs text-neutral-400">Saisissez l'adresse ou utilisez votre position GPS.</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Ville</label>
                          <input required name="city" value={formData.city} onChange={handleInputChange} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Code postal</label>
                          <input required name="zip" value={formData.zip} onChange={handleInputChange} className={inputCls} />
                        </div>
                      </div>

                      <button type="submit" className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/25">
                        Continuer <ArrowRight size={16} />
                      </button>
                    </motion.form>
                  )}

                  {/* ── ÉTAPE 2 : PAIEMENT ── */}
                  {step === 2 && (
                    <motion.form key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} onSubmit={handlePayment} className="space-y-6 max-w-lg">

                      {/* Onglets */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'card', icon: CreditCard, label: 'Carte bancaire' },
                          { key: 'mobile', icon: Smartphone, label: 'Mobile Money' },
                          { key: 'wave', icon: Smartphone, label: 'Wave' },
                        ].map(({ key, icon: Icon, label }) => (
                          <button key={key} type="button" onClick={() => setPaymentMethod(key)}
                            className={cn("flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all",
                              formData.paymentMethod === key
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                                : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300"
                            )}>
                            <Icon size={16} /> {label}
                          </button>
                        ))}
                      </div>

                      {formData.paymentMethod === 'card' ? (
                        <div className="rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10 p-8 text-center space-y-3">
                          <CreditCard className="mx-auto text-orange-500" size={40} />
                          <p className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Paiement sécurisé par carte bancaire</p>
                          <p className="text-xs text-neutral-400">Vous serez redirigé vers la page sécurisée de notre prestataire de paiement pour saisir votre carte. Aucune donnée bancaire n'est saisie ni conservée ici.</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10 p-8 text-center space-y-3">
                            <Smartphone className="mx-auto text-orange-500" size={40} />
                            <p className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">{formData.paymentMethod === 'wave' ? 'Wave' : 'Orange Money · MTN · Moov'}</p>
                            <p className="text-xs text-neutral-400">Vous recevrez une demande de paiement sur votre téléphone</p>
                          </div>
                          <div>
                            <label className={labelCls}>{formData.paymentMethod === 'wave' ? 'Numéro Wave' : 'Numéro Mobile Money'}</label>
                            <InternationalPhoneField
                              value={formData.mobilePhone}
                              onChange={(value) => { setMobilePhoneTouched(true); setFormData(prev => ({ ...prev, mobilePhone: value })); }}
                              onBlur={() => setMobilePhoneTouched(true)}
                              defaultCountry="CI"
                              placeholder={formData.paymentMethod === 'wave' ? 'Numéro Wave' : 'Numéro Mobile Money'}
                              containerClassName="items-stretch"
                              selectClassName={cn(inputCls, mobilePhoneTouched && formData.mobilePhone && !mobilePhoneIsValid ? "border-red-400" : "")}
                              inputClassName={cn(inputCls, "font-mono text-center text-base", mobilePhoneTouched && formData.mobilePhone && !mobilePhoneIsValid ? "border-red-400" : "")}
                            />
                            {mobilePhoneTouched && formData.mobilePhone && !mobilePhoneIsValid && (
                              <p className="mt-1.5 text-xs text-red-500">{formData.paymentMethod === 'wave' ? 'Numéro Wave invalide.' : 'Numéro Mobile Money invalide.'}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <button type="submit" className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/25">
                          <Lock size={15} /> Payer {formatMoney(finalTotal)} FCFA
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full py-2.5 text-sm text-neutral-400 hover:text-neutral-600 flex items-center justify-center gap-1 transition-colors">
                          <ChevronLeft size={14} /> Retour
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* ── ÉTAPE 3 : TRAITEMENT ── */}
                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20 space-y-6">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-4 border-orange-100 dark:border-orange-900" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
                        <div className="absolute inset-3 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                          <Lock size={18} className="text-orange-500" />
                        </div>
                      </div>
                      <div>
                        <h2 className="font-black text-xl dark:text-white">Traitement en cours…</h2>
                        <p className="text-sm text-neutral-400 mt-1">
                          {loadingStep === 1 ? 'Connexion sécurisée' : loadingStep === 2 ? 'Vérification' : 'Redirection vers le paiement'}
                        </p>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {[0, 1, 2].map(i => (
                          <div key={i} className={cn("w-2 h-2 rounded-full", loadingStep > i ? "bg-orange-500" : "bg-neutral-200 dark:bg-neutral-700")} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
