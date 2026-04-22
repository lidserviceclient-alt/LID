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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          className="fixed inset-0 z-[200] bg-white dark:bg-neutral-950 flex flex-col md:flex-row overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-4 right-4 z-[210] p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:scale-110 transition-all">
            <X size={20} />
          </button>

          {/* SUMMARY */}
          <div className="w-full md:w-[35%] bg-neutral-900 text-white p-6 md:p-12 flex flex-col relative overflow-hidden shrink-0 h-[30vh] md:h-full">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <ShieldCheck className="text-orange-500" size={24} />
                <h2 className="font-bold uppercase tracking-widest text-sm">LID Checkout</h2>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {(isCartCheckout ? cartItems : [product]).map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white rounded-xl p-1 relative flex-shrink-0">
                      <img src={resolveBackendAssetUrl(item.image || item.imageUrl) || "/imgs/logo.png"} className="w-full h-full object-contain" alt="" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-neutral-900">{isCartCheckout ? item.quantity : quantity}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.name}</h4>
                      <p className="text-orange-500 font-bold text-xs">{formatMoney(item.price)} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-white/10 space-y-2 text-sm text-neutral-400">
                <div className="flex justify-between"><span>Sous-total</span><span className="text-white">{formatMoney(itemsTotal)} FCFA</span></div>
                {normalizedDiscountAmount > 0 ? <div className="flex justify-between"><span>Réduction</span><span className="text-white">-{formatMoney(normalizedDiscountAmount)} FCFA</span></div> : null}
                {normalizedLoyaltyDiscountAmount > 0 ? <div className="flex justify-between"><span>Remise fidélité</span><span className="text-white">-{formatMoney(normalizedLoyaltyDiscountAmount)} FCFA</span></div> : null}
                <div className="flex justify-between"><span>Livraison</span><span className="text-white">{normalizedShippingCost === 0 ? "Gratuit" : `${formatMoney(normalizedShippingCost)} FCFA`}</span></div>
                <div className="flex justify-between pt-4 border-t border-white/10 text-xl font-black text-white"><span>Total</span><span>{formatMoney(finalTotal)} FCFA</span></div>
                <div className="text-[11px] text-neutral-500 text-right">Dont TVA ({vatPercentLabel}%) : {formatMoney(taxAmount)} FCFA</div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="flex-1 bg-white dark:bg-neutral-950 flex flex-col h-[70vh] md:h-full overflow-hidden">
            <div className="px-6 md:px-12 pt-8 md:pt-12 shrink-0">
              <div className="max-w-2xl mx-auto flex justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 dark:bg-neutral-800 -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 h-0.5 bg-orange-500 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
                {steps.map(s => (
                  <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", step >= s.id ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 text-neutral-400")}>
                      {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
                    </div>
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", step >= s.id ? "text-orange-500" : "text-neutral-400")}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-12">
              <div className="max-w-2xl mx-auto py-12">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.form key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmitInfo} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">Prénom</label>
                          <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">Nom</label>
                          <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">Email</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">Téléphone</label>
                        <InternationalPhoneField
                          value={formData.phone}
                          onChange={(value) => {
                            setPhoneTouched(true);
                            setFormData((prev) => ({ ...prev, phone: value }));
                          }}
                          onBlur={() => setPhoneTouched(true)}
                          defaultCountry="CI"
                          placeholder="Numéro de téléphone"
                          containerClassName="items-stretch"
                          selectClassName={cn(
                            "w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 px-4 py-4 outline-none focus:ring-2 ring-orange-500 transition-all",
                            phoneTouched && formData.phone && !phoneIsValid ? "ring-2 ring-red-500" : ""
                          )}
                          inputClassName={cn(
                            "w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 px-4 py-4 outline-none focus:ring-2 ring-orange-500 transition-all",
                            phoneTouched && formData.phone && !phoneIsValid ? "ring-2 ring-red-500" : ""
                          )}
                        />
                        {phoneTouched && formData.phone && !phoneIsValid ? (
                          <p className="px-1 text-xs font-medium text-red-500">Saisis un numéro de téléphone valide avant de continuer.</p>
                        ) : null}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-3 px-1">
                          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                            Adresse
                          </label>
                          <button
                            type="button"
                            onClick={setAddressFromPosition}
                            disabled={isResolvingCurrentAddress}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                              isResolvingCurrentAddress
                                ? "border-orange-200 bg-orange-50 text-orange-600 cursor-wait"
                                : "border-neutral-200 bg-white text-neutral-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
                            )}
                          >
                            {isResolvingCurrentAddress ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <LocateFixed size={14} />
                            )}
                            {isResolvingCurrentAddress ? "Localisation..." : "Utiliser ma position"}
                          </button>
                        </div>
                        <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all" />
                        <div className="px-1">
                          {shippingCoordinates ? (
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                              <MapPin size={13} />
                              Position GPS capturée pour la livraison
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Ajoute l'adresse manuellement ou utilise votre position actuelle pour fiabiliser la livraison.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input required name="city" value={formData.city} onChange={handleInputChange} placeholder="Ville" className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all" />
                        <input required name="zip" value={formData.zip} onChange={handleInputChange} placeholder="Code Postal" className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all" />
                      </div>
                      <button type="submit" className="w-full py-5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">Continuer</button>
                    </motion.form>
                  )}

                  {step === 2 && (
                    <motion.form key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handlePayment} className="space-y-8">
                      <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl">
                        <button type="button" onClick={() => setPaymentMethod('card')} className={cn("flex-1 py-3 rounded-xl font-bold transition-all", formData.paymentMethod === 'card' ? "bg-white dark:bg-neutral-800 shadow-sm" : "text-neutral-400")}>Carte</button>
                        <button type="button" onClick={() => setPaymentMethod('mobile')} className={cn("flex-1 py-3 rounded-xl font-bold transition-all", formData.paymentMethod === 'mobile' ? "bg-white dark:bg-neutral-800 shadow-sm" : "text-neutral-400")}>Mobile</button>
                      </div>
                      {formData.paymentMethod === 'card' ? (
                        <div className="space-y-6">
                          <CardPreview number={formData.cardNumber} name={formData.cardName} expiry={formData.cardExpiry} cvc={formData.cardCvc} focus={cardFocus} supportPhone={supportPhone} />
                          <div className="space-y-4">
                            <input required name="cardName" value={formData.cardName} onChange={handleInputChange} placeholder="NOM DU TITULAIRE" className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all uppercase" />
                            <input required name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} placeholder="0000 0000 0000 0000" className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-mono" />
                            <div className="grid grid-cols-2 gap-4">
                              <input required name="cardExpiry" value={formData.cardExpiry} onChange={handleInputChange} placeholder="MM/YY" className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-mono" />
                              <input required name="cardCvc" value={formData.cardCvc} onChange={handleInputChange} onFocus={() => setCardFocus('cvc')} onBlur={() => setCardFocus('')} placeholder="CVC" className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl outline-none border-2 border-transparent focus:border-orange-500 transition-all font-mono" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-12 bg-neutral-50 dark:bg-neutral-900 rounded-[3rem] text-center space-y-4 border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                            <Smartphone className="mx-auto text-orange-500" size={48} />
                            <p className="text-sm text-neutral-500 font-medium">Payez avec Orange Money, Wave ou MTN</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">Numéro Mobile Money</label>
                            <InternationalPhoneField
                              value={formData.mobilePhone}
                              onChange={(value) => {
                                setMobilePhoneTouched(true);
                                setFormData((prev) => ({ ...prev, mobilePhone: value }));
                              }}
                              onBlur={() => setMobilePhoneTouched(true)}
                              defaultCountry="CI"
                              placeholder="Numéro Mobile Money"
                              containerClassName="items-stretch"
                              selectClassName={cn(
                                "w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 px-4 py-5 outline-none border-2 border-transparent focus:border-orange-500 transition-all",
                                mobilePhoneTouched && formData.mobilePhone && !mobilePhoneIsValid ? "border-red-500 focus:border-red-500" : ""
                              )}
                              inputClassName={cn(
                                "w-full rounded-2xl bg-neutral-50 dark:bg-neutral-900 px-4 py-5 outline-none border-2 border-transparent focus:border-orange-500 transition-all text-center text-xl font-black",
                                mobilePhoneTouched && formData.mobilePhone && !mobilePhoneIsValid ? "border-red-500 focus:border-red-500" : ""
                              )}
                            />
                            {mobilePhoneTouched && formData.mobilePhone && !mobilePhoneIsValid ? (
                              <p className="px-1 text-xs font-medium text-red-500">Saisis un numéro Mobile Money valide avant de payer.</p>
                            ) : null}
                          </div>
                        </div>
                      )}
                      <button type="submit" className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all">Payer {formatMoney(finalTotal)} FCFA</button>
                    </motion.form>
                  )}

                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20">
                      <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Sécurisation...</h2>
                        <p className="text-neutral-500">{loadingStep === 1 ? "Connexion sécurisée" : loadingStep === 2 ? "Vérification" : "Redirection"}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
