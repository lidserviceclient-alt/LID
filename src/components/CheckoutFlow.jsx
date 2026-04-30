import { useState, useEffect } from 'react';
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
import InternationalPhoneField from '@/components/InternationalPhoneField';
import { isValidInternationalPhone, isValidMobileMoneyPhone } from '@/utils/phone';

const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

const formatExpires = (value) => {
  return value
    .replace(/[^0-9]/g, '')
    .replace(/^([2-9])$/g, '0$1')
    .replace(/^(1{1})([3-9]{1})$/g, '0$1/$2')
    .replace(/^0{1,}/g, '0')
    .replace(/^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g, '$1/$2');
};

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

const CardChip = () => (
  <svg width="52" height="42" viewBox="0 0 52 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="52" height="42" rx="6" fill="url(#chipGrad)" />
    <rect x="1" y="1" width="50" height="40" rx="5" stroke="rgba(255,220,80,0.3)" strokeWidth="0.5" />
    <line x1="0" y1="14" x2="52" y2="14" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
    <line x1="0" y1="28" x2="52" y2="28" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
    <line x1="17" y1="0" x2="17" y2="42" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
    <line x1="35" y1="0" x2="35" y2="42" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
    <rect x="17" y="14" width="18" height="14" fill="rgba(0,0,0,0.18)" stroke="rgba(255,200,50,0.2)" strokeWidth="0.5" />
    <defs>
      <linearGradient id="chipGrad" x1="0" y1="0" x2="52" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#d4a843" />
        <stop offset="30%" stopColor="#f5d060" />
        <stop offset="60%" stopColor="#b07828" />
        <stop offset="100%" stopColor="#e8c048" />
      </linearGradient>
    </defs>
  </svg>
);

const NfcIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 13 Q5 5 13 5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M8.5 13 Q8.5 8.5 13 8.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M12 13 Q12 11.5 13 11.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <circle cx="13" cy="13" r="2" fill="rgba(255,255,255,0.85)" />
  </svg>
);

const MastercardLogo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(218,35,35,0.92)', marginRight: -13, zIndex: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }} />
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(232,155,22,0.92)', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }} />
    </div>
    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 'bold', color: '#fff', letterSpacing: '0.04em', textShadow: '0 1px 5px rgba(0,0,0,0.9)' }}>MasterCard</span>
  </div>
);

const SpiralBg = () => (
  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 500 315" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sg" cx="68%" cy="43%" r="58%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
        <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="blob" cx="68%" cy="43%" r="42%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
      </radialGradient>
      <pattern id="dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.9" fill="#7dd3fc" opacity="0.18" />
      </pattern>
    </defs>
    <rect width="500" height="315" fill="url(#dots)" />
    <ellipse cx="355" cy="145" rx="190" ry="140" fill="url(#blob)" />
    {[
      [36, 21, 0], [60, 35, 9], [84, 51, 17], [110, 66, 24], [138, 84, 30],
      [168, 104, 34], [199, 125, 37], [232, 148, 39], [267, 172, 41], [304, 198, 42],
    ].map(([rx, ry, rot], i) => (
      <ellipse key={i} cx="355" cy="145" rx={rx} ry={ry} fill="none" stroke="url(#sg)" strokeWidth="1" opacity={0.95 - i * 0.09} transform={`rotate(${rot} 355 145)`} />
    ))}
  </svg>
);

function CardPreview({ number, name, expiry, cvc, focus, supportPhone }) {
  const [flipped, setFlipped] = useState(false);
  const cardNumberRaw = `${number || ''}`.replace(/\D/g, '');
  const displayNumber = cardNumberRaw ? formatCardNumber(cardNumberRaw) : '5213 2821 1583 5635';
  const displayExpiry = formatExpiryLong(expiry);
  const displayName = `${name || ''}`.trim().toUpperCase() || 'NOM DU TITULAIRE';
  const displayCvc = `${cvc || ''}`.replace(/\D/g, '').padEnd(3, '•').slice(0, 3);
  const phone = `${supportPhone || ''}`.trim() || '+33 1 70 36 38 00';
  const effectiveFlipped = flipped || focus === 'cvc';

  return (
    <div className="w-full max-w-[420px] mx-auto select-none">
      <div style={{ perspective: 1400, cursor: 'pointer' }} onClick={() => setFlipped((f) => !f)}>
        <div
          style={{
            width: '100%',
            aspectRatio: '500 / 315',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.75s cubic-bezier(0.4,0.2,0.2,1)',
            transform: effectiveFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: 20,
              overflow: 'hidden',
              background: 'linear-gradient(148deg,#202020 0%,#2e2e2e 45%,#131313 100%)',
            }}
          >
            <SpiralBg />
            <div style={{ position: 'absolute', top: 30, left: 30, right: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <CardChip />
              <NfcIcon />
            </div>
            <div style={{ position: 'absolute', top: '50%', left: 30, transform: 'translateY(-50%)', color: '#fff', fontSize: 22, fontWeight: 700, fontFamily: "'Courier New',monospace", textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
              {displayNumber.replace(/ /g, '\u00A0\u00A0')}
            </div>
            <div style={{ position: 'absolute', bottom: 26, left: 30, right: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div className="space-y-1">
                <div style={{ color: '#666', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Valid THRU</div>
                <div style={{ color: '#e0e0e0', fontSize: 15, fontWeight: 700, fontFamily: "'Courier New',monospace" }}>{displayExpiry}</div>
                <div style={{ color: '#f0f0f0', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', fontFamily: "'Courier New',monospace" }}>{displayName}</div>
              </div>
              <MastercardLogo />
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: 20,
              overflow: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(148deg,#1b1b1b 0%,#262626 55%,#0f0f0f 100%)',
            }}
          >
            <div style={{ position: 'absolute', top: 46, left: 0, right: 0, height: 52, background: 'linear-gradient(180deg,#111 0%,#000 50%,#111 100%)' }} />
            <div style={{ position: 'absolute', top: 120, left: 30, right: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 46, borderRadius: 4, background: 'repeating-linear-gradient(90deg,#f5f0e8 0px,#f5f0e8 8px,#e2d9cb 8px,#e2d9cb 16px)', display: 'flex', alignItems: 'center', paddingLeft: 14 }}>
                <span style={{ fontFamily: 'cursive', fontSize: 17, color: '#444', opacity: 0.55 }}>{displayName}</span>
              </div>
              <div style={{ width: 60, height: 46, borderRadius: 4, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Courier New',monospace", fontSize: 17, fontWeight: 700, color: '#111' }}>{displayCvc}</span>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 26, left: 30, right: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ color: '#444', fontSize: 9, textTransform: 'uppercase' }}>Service Client 24h/24</div>
                <div style={{ color: '#666', fontSize: 13, fontFamily: "'Courier New',monospace" }}>{phone}</div>
              </div>
              <MastercardLogo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    paymentMethod: 'card', // 'card' | 'mobile'
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    mobilePhone: ''
  });

  const [cardFocus, setCardFocus] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isResolvingCurrentAddress, setIsResolvingCurrentAddress] = useState(false);
  const [shippingCoordinates, setShippingCoordinates] = useState(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [mobilePhoneTouched, setMobilePhoneTouched] = useState(false);
  const { data: appConfig } = useAppConfig();
  const supportPhone = `${appConfig?.contactPhone || ''}`.trim();
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
      quantity: quantityValue
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
        const def = addresses.find(a => a?.isDefault);
        if (def) {
          setSelectedAddressId(def.id);
          setFormData(prev => ({ ...prev, address: def.addressLine, city: def.city, zip: def.postalCode, phone: def.phone }));
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
    let v = value;
    if (name === 'cardNumber') v = formatCardNumber(value);
    if (name === 'cardExpiry') v = formatExpires(value);
    if (name === 'cardCvc') v = value.replace(/\D/g, '').slice(0, 3);
    setFormData(prev => ({ ...prev, [name]: v }));
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
      if (method === 'mobile') {
        return {
          ...prev,
          paymentMethod: 'mobile',
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
    const checkoutPhone = formData.paymentMethod === 'mobile' ? formData.mobilePhone : formData.phone;
    if (formData.paymentMethod === 'mobile') {
      setMobilePhoneTouched(true);
    } else {
      setPhoneTouched(true);
    }
    const paymentPhoneIsValid = formData.paymentMethod === 'mobile'
      ? isValidMobileMoneyPhone(checkoutPhone)
      : isValidInternationalPhone(checkoutPhone);
    if (!paymentPhoneIsValid) {
      toast.error("Saisis un numéro de téléphone valide pour le paiement.");
      return;
    }
    
    setStep(3);
    setLoadingStep(1);
    try {
      const res = await checkout(payload.sub, {
        amount: finalTotal,
        currency: 'XOF',
        email: formData.email,
        phone: checkoutPhone,
        shippingAddress: `${formData.address}, ${formData.city} ${formData.zip}`,
        shippingLatitude: shippingCoordinates?.latitude ?? null,
        shippingLongitude: shippingCoordinates?.longitude ?? null,
        shippingMethodCode,
        shippingMethodLabel,
        shippingCost: normalizedShippingCost,
        items: (isCartCheckout ? cartItems.map((i) => toCheckoutItem(i, i?.quantity)) : [toCheckoutItem({ ...product, quantity: normalizedQuantity }, normalizedQuantity)]).filter(Boolean),
        paymentProvider: import.meta.env.VITE_PAYMENT_PROVIDER || 'PAYDUNYA'
      });
      if (res?.orderNumber) {
        setOrderNumber(res.orderNumber);
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
      toast.error(err?.message || "Erreur de paiement");
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
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'card', icon: CreditCard, label: 'Carte bancaire' },
                          { key: 'mobile', icon: Smartphone, label: 'Mobile Money' },
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
                        <div className="space-y-5">
                          <CardPreview number={formData.cardNumber} name={formData.cardName} expiry={formData.cardExpiry} cvc={formData.cardCvc} focus={cardFocus} supportPhone={supportPhone} />
                          <div>
                            <label className={labelCls}>Nom du titulaire</label>
                            <input required name="cardName" value={formData.cardName} onChange={handleInputChange} placeholder="PRÉNOM NOM" className={cn(inputCls, "uppercase")} />
                          </div>
                          <div>
                            <label className={labelCls}>Numéro de carte</label>
                            <input required name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" className={cn(inputCls, "font-mono tracking-widest")} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>Expiration</label>
                              <input required name="cardExpiry" value={formData.cardExpiry} onChange={handleInputChange} placeholder="MM/AA" className={cn(inputCls, "font-mono")} />
                            </div>
                            <div>
                              <label className={labelCls}>CVC</label>
                              <input required name="cardCvc" value={formData.cardCvc} onChange={handleInputChange} onFocus={() => setCardFocus('cvc')} onBlur={() => setCardFocus('')} placeholder="•••" className={cn(inputCls, "font-mono")} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10 p-8 text-center space-y-3">
                            <Smartphone className="mx-auto text-orange-500" size={40} />
                            <p className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Orange Money · Wave · MTN</p>
                            <p className="text-xs text-neutral-400">Vous recevrez une demande de paiement sur votre téléphone</p>
                          </div>
                          <div>
                            <label className={labelCls}>Numéro Mobile Money</label>
                            <InternationalPhoneField
                              value={formData.mobilePhone}
                              onChange={(value) => { setMobilePhoneTouched(true); setFormData(prev => ({ ...prev, mobilePhone: value })); }}
                              onBlur={() => setMobilePhoneTouched(true)}
                              defaultCountry="CI"
                              placeholder="Numéro Mobile Money"
                              containerClassName="items-stretch"
                              selectClassName={cn(inputCls, mobilePhoneTouched && formData.mobilePhone && !mobilePhoneIsValid ? "border-red-400" : "")}
                              inputClassName={cn(inputCls, "font-mono text-center text-base", mobilePhoneTouched && formData.mobilePhone && !mobilePhoneIsValid ? "border-red-400" : "")}
                            />
                            {mobilePhoneTouched && formData.mobilePhone && !mobilePhoneIsValid && (
                              <p className="mt-1.5 text-xs text-red-500">Numéro Mobile Money invalide.</p>
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
