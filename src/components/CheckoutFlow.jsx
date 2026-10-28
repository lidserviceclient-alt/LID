import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Smartphone, User, MapPin, Phone, Mail, ArrowRight, ShieldCheck, Lock, ChevronLeft, Loader2, LocateFixed } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import { getCurrentUserPayload, getUserProfile, updateUserProfile, primeUserProfileCache } from '@/services/authService.js';
import { checkout } from '@/services/orderService.js';
import { createCustomerAddress, updateCustomerAddress, getCustomerAddresses, getMyCustomerCheckoutCollection } from '@/services/customerService.js';
import { useCustomerSession } from '@/features/customerSession/CustomerSessionContext';
import { resolveBackendAssetUrl } from '@/services/categoryService';
import { useAppConfig } from '@/features/appConfig/useAppConfig';
import { useCart } from '@/features/cart/CartContext';
import InternationalPhoneField from '@/components/InternationalPhoneField';
import { isValidInternationalPhone, isValidMobileMoneyPhone } from '@/utils/phone';
import { findMatchingAddress, formatAddressSummary, normalizeCustomerAddress, normalizeCustomerAddresses, pickPreferredAddress, toCustomerAddressPayload } from '@/utils/customerAddress';
import { locateCurrentAddress } from '@/utils/geolocation';

const formatMoney = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  const hasDecimals = Math.abs(num - Math.trunc(num)) > 0.000001;
  return num.toLocaleString("fr-FR", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0
  });
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

export default function CheckoutFlow({ isOpen, onClose, product, quantity, cartItems, onSuccess: _onSuccess, shippingCost = 0, discountAmount = 0, loyaltyDiscountAmount = 0, promoCode = "", shippingMethodCode = "STANDARD", shippingMethodLabel = "Standard" }) {
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Processing, 4: Success
  const [loadingStep, setLoadingStep] = useState(0); // 0: Init, 1: Connecting, 2: Verifying, 3: Approved
  const [, setOrderNumber] = useState('');
  
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
  const [line2, setLine2] = useState(''); // complement d'adresse (facultatif)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(''); // '' = nouvelle adresse saisie a la main
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [accountPhone, setAccountPhone] = useState('');
  // Vrai des que l'utilisateur tape un telephone : une adresse choisie ensuite ne l'ecrase plus
  const phoneEditedRef = useRef(false);
  const line2EditedRef = useRef(false); // saisie manuelle du complement : jamais ecrasee par le rechargement des adresses
  const [accountCustomer, setAccountCustomer] = useState(null);
  // null = pas de choix explicite : la case est cochee seulement pour une adresse inconnue
  const [saveInfoChoice, setSaveInfoChoice] = useState(null);
  const [saveMode, setSaveMode] = useState('update'); // adresse existante modifiee : 'update' | 'new'
  const [addressLabel, setAddressLabel] = useState('');
  const customerSession = useCustomerSession();
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
    const itemType = "ARTICLE";
    const quantityValue = Number(item?.quantity) || fallbackQuantity;
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

  // Enregistrement des informations (utilisateur connecte uniquement)
  const isLoggedIn = Boolean(getCurrentUserPayload()?.sub);
  const selectedAddress = savedAddresses.find((addr) => addr.id === selectedAddressId) || null;
  const matchedAddress = findMatchingAddress(savedAddresses, { line1: formData.address, line2, city: formData.city, postalCode: formData.zip });
  const addressSituation = !formData.address.trim() ? 'none' : matchedAddress ? 'unchanged' : selectedAddress ? 'modified' : 'new';
  const shouldSaveInfo = isLoggedIn && (saveInfoChoice ?? addressSituation === 'new');
  const needsAccountPhone = isLoggedIn && !accountPhone && phoneIsValid && Boolean(accountCustomer);

  const digitsOf = (value) => `${value ?? ''}`.replace(/\D/g, '');

  // Reflete l'adresse creee/modifiee dans le contexte de session (Profil > Adresses) et dans le selecteur local
  const reflectSavedAddress = (saved) => {
    const normalized = normalizeCustomerAddress(saved);
    if (!normalized.id) return;
    customerSession?.updateCustomerCollection?.((prev) => {
      const current = Array.isArray(prev?.addresses) ? prev.addresses : [];
      const exists = current.some((addr) => addr.id === saved.id);
      const merged = exists ? current.map((addr) => (addr.id === saved.id ? saved : addr)) : [saved, ...current];
      return {
        ...(prev || {}),
        addresses: normalized.isDefault ? merged.map((addr) => (addr.id === saved.id ? addr : { ...addr, isDefault: false })) : merged
      };
    });
    setSavedAddresses((prev) => {
      const exists = prev.some((addr) => addr.id === normalized.id);
      const merged = exists ? prev.map((addr) => (addr.id === normalized.id ? normalized : addr)) : [normalized, ...prev];
      return normalized.isDefault ? merged.map((addr) => (addr.id === normalized.id ? addr : { ...addr, isDefault: false })) : merged;
    });
    setSelectedAddressId(normalized.id);
  };

  // Ne bloque jamais le paiement : chaque etape a son propre try/catch. Le numero Mobile Money n'est pas enregistre.
  const persistCheckoutInfo = async (userId) => {
    if (!shouldSaveInfo || addressSituation === 'none') return;
    const street = formData.address.trim();
    const complement = line2.trim();
    const city = formData.city.trim();
    const postalCode = formData.zip.trim();
    const phone = phoneIsValid ? formData.phone.trim() : '';
    const coordinates = shippingCoordinates || {};
    try {
      if (addressSituation === 'unchanged') {
        if (phone && digitsOf(matchedAddress.phoneNumber) !== digitsOf(phone)) {
          const updated = await updateCustomerAddress(userId, matchedAddress.id, toCustomerAddressPayload({ ...matchedAddress, phoneNumber: phone }));
          if (updated) reflectSavedAddress(updated);
        }
      } else if (addressSituation === 'modified' && saveMode === 'update') {
        const updated = await updateCustomerAddress(userId, selectedAddress.id, toCustomerAddressPayload({
          ...selectedAddress,
          line1: street,
          line2: complement,
          city,
          postalCode,
          phoneNumber: phone || selectedAddress.phoneNumber,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }));
        if (updated) reflectSavedAddress(updated);
      } else {
        const created = await createCustomerAddress(userId, toCustomerAddressPayload({
          label: addressLabel.trim() || 'Domicile',
          line1: street,
          line2: complement,
          city,
          postalCode,
          country: selectedAddress?.country || accountCustomer?.country || '',
          phoneNumber: phone,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          isDefault: savedAddresses.length === 0
        }));
        if (created) reflectSavedAddress(created);
      }
    } catch {
      toast.info('Adresse non enregistrée');
    }
    if (needsAccountPhone) {
      try {
        const updated = await updateUserProfile(userId, {
          firstName: accountCustomer.firstName,
          lastName: accountCustomer.lastName,
          email: accountCustomer.email,
          phoneNumber: formData.phone.trim(),
          city: accountCustomer.city,
          country: accountCustomer.country
        });
        const nextCustomer = updated || { ...accountCustomer, phoneNumber: formData.phone.trim() };
        primeUserProfileCache(userId, nextCustomer);
        setAccountPhone(formData.phone.trim());
        customerSession?.updateCustomerCollection?.((prev) => ({ ...(prev || {}), customer: nextCustomer }));
      } catch {
        /* telephone du compte non enregistre : sans incidence sur le paiement */
      }
    }
  };

  const steps = [
    { id: 1, label: 'Informations', icon: User },
    { id: 2, label: 'Paiement', icon: CreditCard },
    { id: 3, label: 'Confirmation', icon: Check },
  ];

  // Remplit le formulaire avec une adresse enregistree ; les champs restent modifiables.
  const applySavedAddress = (address, fallbackPhone, { onLoad = false } = {}) => {
    setFormData((prev) => ({
      ...prev,
      address: address?.line1 || '',
      city: address?.city || '',
      zip: address?.postalCode || '',
      phone: phoneEditedRef.current ? prev.phone : (address?.phoneNumber || fallbackPhone || prev.phone)
    }));
    if (!(onLoad && line2EditedRef.current)) {
      line2EditedRef.current = false;
      setLine2(address?.line2 || '');
    }
    const latitude = address?.latitude;
    const longitude = address?.longitude;
    setShippingCoordinates(
      Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null
    );
  };

  const selectSavedAddress = (addressId) => {
    setSelectedAddressId(addressId);
    if (!addressId) {
      // Nouvelle adresse : on vide l'adresse, le telephone saisi ou repris du compte est conserve
      setFormData((prev) => ({ ...prev, address: '', city: '', zip: '' }));
      line2EditedRef.current = false;
      setLine2('');
      setShippingCoordinates(null);
      return;
    }
    const address = savedAddresses.find((addr) => addr.id === addressId);
    if (address) applySavedAddress(address, accountPhone);
  };

  useEffect(() => {
    if (!isOpen) return;
    setSaveInfoChoice(null);
    const payload = getCurrentUserPayload();
    if (!payload?.sub) return;
    let active = true;
    setLoadingAddresses(true);
    (async () => {
      try {
        const [checkoutCollection, profile] = await Promise.all([
          getMyCustomerCheckoutCollection().catch(() => null),
          getUserProfile(payload.sub).catch(() => null)
        ]);
        if (!active) return;
        const customer = checkoutCollection?.customer || profile || null;
        const customerPhone = `${customer?.phoneNumber || profile?.phoneNumber || ''}`.trim();
        setAccountPhone(customerPhone);
        setAccountCustomer(customer && customer.email ? customer : null);
        setFormData((prev) => ({
          ...prev,
          firstName: `${customer?.firstName || payload?.firstName || ''}`.trim() || prev.firstName,
          lastName: `${customer?.lastName || payload?.lastName || ''}`.trim() || prev.lastName,
          email: `${customer?.email || payload?.email || ''}`.trim() || prev.email,
          // Telephone du compte en repli, jamais par-dessus une saisie
          phone: phoneEditedRef.current || prev.phone ? prev.phone : customerPhone
        }));
        const rawAddresses = Array.isArray(checkoutCollection?.addresses)
          ? checkoutCollection.addresses
          : await getCustomerAddresses(payload.sub).catch(() => []);
        if (!active) return;
        const addresses = normalizeCustomerAddresses(rawAddresses).filter((addr) => addr.id && addr.line1);
        setSavedAddresses(addresses);
        const preferred = pickPreferredAddress(addresses);
        if (preferred) {
          setSelectedAddressId(preferred.id);
          applySavedAddress(preferred, customerPhone, { onLoad: true });
        } else {
          setSelectedAddressId('');
        }
      } catch {
        if (active) setSavedAddresses([]);
      } finally {
        if (active) setLoadingAddresses(false);
      }
    })();
    return () => { active = false; };
  }, [isOpen]);

  const setAddressFromPosition = async () => {
    if (isResolvingCurrentAddress) return;
    setIsResolvingCurrentAddress(true);
    try {
      const located = await locateCurrentAddress();
      setFormData(prev => ({
        ...prev,
        address: located.street,
        city: located.city,
        zip: located.postalCode
      }));
      // La position GPS du moment prime sur celle de l'adresse enregistree
      setShippingCoordinates({
        latitude: located.latitude,
        longitude: located.longitude,
      });
      toast.success("Adresse détectée");
    } catch (error) {
      toast.error(error?.message || "Impossible de récupérer votre position actuellement.");
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
    // Enregistrement en parallele du paiement (jamais attendu avant la creation de la commande)
    const saveInfoPromise = persistCheckoutInfo(payload.sub).catch(() => {});
    try {
      const checkoutItems = (isCartCheckout ? cartItems.map((i) => toCheckoutItem(i, i?.quantity)) : [toCheckoutItem({ ...product, quantity: normalizedQuantity }, normalizedQuantity)]).filter(Boolean);
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      }
      const res = await checkout(payload.sub, {
        currency: 'XOF',
        email: formData.email,
        phone: checkoutPhone,
        shippingAddress: `${formData.address}, ${line2.trim() ? `${line2.trim()}, ` : ''}${formData.city} ${formData.zip}`,
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
      // Laisse au plus 2,5 s a l'enregistrement pour finir avant de quitter la page
      await Promise.race([saveInfoPromise, new Promise((resolve) => setTimeout(resolve, 2500))]);
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
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {item.sellerName && item.sellerName !== "LID" ? `Vendu par ${item.sellerName}` : "Vendu et expédié par LID"}
                      </p>
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
                    <p className="text-[10px] text-neutral-400">TTC, dont TVA incluse ({vatPercentLabel}%) : {formatMoney(taxAmount)} FCFA</p>
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
                          onChange={(value) => { setPhoneTouched(true); phoneEditedRef.current = true; setFormData(prev => ({ ...prev, phone: value })); }}
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

                      {(loadingAddresses || savedAddresses.length > 0) && (
                        <div>
                          <label className={labelCls}>Mes adresses</label>
                          {loadingAddresses ? (
                            <p className="text-xs text-neutral-400 flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Chargement de vos adresses…</p>
                          ) : (
                            <div className="grid gap-2">
                              {savedAddresses.map((addr) => (
                                <button key={addr.id} type="button" onClick={() => selectSavedAddress(addr.id)}
                                  className={cn("flex items-start gap-3 text-left py-3 px-4 rounded-xl border-2 text-sm transition-all",
                                    selectedAddressId === addr.id
                                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                                  )}>
                                  <MapPin size={16} className={cn("mt-0.5 shrink-0", selectedAddressId === addr.id ? "text-orange-500" : "text-neutral-400")} />
                                  <span className="min-w-0">
                                    <span className={cn("font-semibold", selectedAddressId === addr.id ? "text-orange-700 dark:text-orange-400" : "text-neutral-700 dark:text-neutral-300")}>
                                      {addr.label || 'Adresse'}
                                      {addr.isDefault && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-orange-500">Par défaut</span>}
                                    </span>
                                    <span className="block text-xs text-neutral-500 dark:text-neutral-400 truncate">{formatAddressSummary(addr)}</span>
                                  </span>
                                </button>
                              ))}
                              <button type="button" onClick={() => selectSavedAddress('')}
                                className={cn("flex items-center gap-3 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all",
                                  selectedAddressId === ''
                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                                    : "border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300"
                                )}>
                                <MapPin size={16} /> Nouvelle adresse (saisie manuelle)
                              </button>
                            </div>
                          )}
                        </div>
                      )}

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
                        <div className="mt-3">
                          <label htmlFor="checkout-address-line2" className={labelCls}>Complément d'adresse (bâtiment, étage, repère…)</label>
                          <input id="checkout-address-line2" name="line2" value={line2} onChange={(e) => { line2EditedRef.current = true; setLine2(e.target.value); }}
                            autoComplete="address-line2" maxLength={255} className={inputCls} />
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

                      {isLoggedIn && (
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <input id="checkout-save-info" type="checkbox" checked={shouldSaveInfo}
                              onChange={(e) => setSaveInfoChoice(e.target.checked)}
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-orange-500 focus:ring-2 focus:ring-orange-500/30" />
                            <label htmlFor="checkout-save-info" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                              Enregistrer ces informations pour mes prochaines commandes
                              <span className="block text-xs font-normal text-neutral-400 mt-0.5">
                                Adresse et téléphone seront préremplis la prochaine fois. Le numéro de paiement n'est jamais enregistré.
                              </span>
                            </label>
                          </div>
                          {shouldSaveInfo && addressSituation === 'modified' && (
                            <fieldset className="pl-7 space-y-1.5">
                              <legend className="sr-only">Que faire de l'adresse modifiée ?</legend>
                              {[
                                { value: 'update', label: `Mettre à jour cette adresse (${selectedAddress?.label || 'Adresse'})` },
                                { value: 'new', label: "L'enregistrer comme nouvelle adresse" }
                              ].map((opt) => (
                                <label key={opt.value} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 cursor-pointer">
                                  <input type="radio" name="checkout-save-mode" value={opt.value} checked={saveMode === opt.value}
                                    onChange={() => setSaveMode(opt.value)} className="accent-orange-500" />
                                  {opt.label}
                                </label>
                              ))}
                            </fieldset>
                          )}
                          {shouldSaveInfo && (addressSituation === 'new' || (addressSituation === 'modified' && saveMode === 'new')) && (
                            <div className="pl-7">
                              <label htmlFor="checkout-address-label" className={labelCls}>Nom de l'adresse (facultatif)</label>
                              <input id="checkout-address-label" value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)}
                                maxLength={100} placeholder="Domicile, Bureau…" className={inputCls} />
                            </div>
                          )}
                        </div>
                      )}

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
