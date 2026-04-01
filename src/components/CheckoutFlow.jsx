import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Smartphone, User, MapPin, Phone, Mail, ArrowRight, ShieldCheck, Lock, ChevronLeft, Loader2, LocateFixed } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import { getCurrentUserPayload } from '@/services/authService.js';
import { checkout } from '@/services/orderService.js';
import { getMyCustomerCheckoutCollection } from '@/services/customerService.js';
import { resolveBackendAssetUrl } from '@/services/categoryService';
import { useAppConfig } from '@/features/appConfig/useAppConfig';

const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  for (let i=0, len=match.length; i<len; i+=4) {
    parts.push(match.substring(i, i+4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

const formatExpires = (value) => {
  return value
    .replace(
      /[^0-9]/g, '' // To allow only numbers
    ).replace(
      /^([2-9])$/g, '0$1' // To handle 3 > 03
    ).replace(
      /^(1{1})([3-9]{1})$/g, '0$1/$2' // 13 > 01/3
    ).replace(
      /^0{1,}/g, '0' // To handle 00 > 0
    ).replace(
      /^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g, '$1/$2' // To handle 113 > 11/3
    );
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

const normalizeExpiry = (value) => {
  const v = `${value || ''}`.trim();
  if (!v) return 'MM/YY';
  if (v.includes('/')) return v;
  if (v.length >= 4) return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
  return v;
};

const formatExpiryLong = (value) => {
  const short = normalizeExpiry(value);
  const match = short.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return short;
  return `${match[1]}/20${match[2]}`;
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
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(218,35,35,0.92)',
          marginRight: -13,
          zIndex: 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      />
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(232,155,22,0.92)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      />
    </div>
    <span
      style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: '0.04em',
        textShadow: '0 1px 5px rgba(0,0,0,0.9)',
      }}
    >
      MasterCard
    </span>
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
      [36, 21, 0],
      [60, 35, 9],
      [84, 51, 17],
      [110, 66, 24],
      [138, 84, 30],
      [168, 104, 34],
      [199, 125, 37],
      [232, 148, 39],
      [267, 172, 41],
      [304, 198, 42],
    ].map(([rx, ry, rot], i) => (
      <ellipse key={i} cx="355" cy="145" rx={rx} ry={ry} fill="none" stroke="url(#sg)" strokeWidth="1" opacity={0.95 - i * 0.09} transform={`rotate(${rot} 355 145)`} />
    ))}
  </svg>
);

function CardPreview({ number, name, expiry, cvc, focus, supportPhone }) {
  const [flipped, setFlipped] = useState(false);
  const cardNumberRaw = `${number || ''}`.replace(/\D/g, '');
  const displayNumber = cardNumberRaw ? formatCardNumber(cardNumberRaw) : '5213 2821 1583 5635';
  const displayExpiry = formatExpiryLong(expiry) || '11/2026';
  const displayName = `${name || ''}`.trim().toUpperCase() || 'BALLOUD-ROUSSELLE';
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

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent)' }} />

            <div style={{ position: 'absolute', top: 30, left: 30, right: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <CardChip />
              <NfcIcon />
            </div>

            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 30,
                transform: 'translateY(-50%)',
                color: '#fff',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0em',
                fontFamily: "'Courier New',monospace",
                textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.18))',
              }}
            >
              {displayNumber.replace(/ /g, '\u00A0\u00A0')}
            </div>

            <div style={{ position: 'absolute', bottom: 26, left: 30, right: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ color: '#666', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1.5, fontFamily: 'Arial' }}>
                    GOOD
                    <br />
                    THRU
                  </div>
                  <div style={{ color: '#e0e0e0', fontSize: 15, fontWeight: 700, fontFamily: "'Courier New',monospace", letterSpacing: '0.14em' }}>{displayExpiry}</div>
                </div>
                <div
                  style={{
                    color: '#f0f0f0',
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.13em',
                    fontFamily: "'Courier New',monospace",
                    textTransform: 'uppercase',
                    textShadow: '0 1px 5px rgba(0,0,0,0.6)',
                  }}
                >
                  {displayName}
                </div>
              </div>
              <MastercardLogo />
            </div>

            <div style={{ position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none', background: 'linear-gradient(135deg,rgba(255,255,255,0.05) 0%,transparent 55%)' }} />
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
              <div
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'repeating-linear-gradient(90deg,#f5f0e8 0px,#f5f0e8 8px,#e2d9cb 8px,#e2d9cb 16px)',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 14,
                }}
              >
                <span style={{ fontFamily: 'cursive', fontSize: 17, color: '#444', opacity: 0.55 }}>{displayName}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="absolute" style={{ color: '#666', fontSize: 8, fontFamily: 'Arial', letterSpacing: '0.1em', marginBottom: 3 }}>CVV</span>
                <div style={{ width: 60, height: 46, borderRadius: 4, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: "'Courier New',monospace", fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: 3 }}>{displayCvc}</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'absolute', top: 188, left: 30, right: 30, color: '#3a3a3a', fontSize: 8, fontFamily: 'Arial', lineHeight: 1.7 }}>
              Cette carte est la propriété exclusive de la banque émettrice. Son utilisation est soumise aux conditions générales du contrat porteur. En cas de perte ou de vol, contactez immédiatement le service client.
            </div>

            <div style={{ position: 'absolute', bottom: 26, left: 30, right: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ color: '#444', fontSize: 9, fontFamily: 'Arial', letterSpacing: '0.12em', marginBottom: 5, textTransform: 'uppercase' }}>Service Client 24h/24</div>
                <div style={{ color: '#666', fontSize: 13, fontFamily: "'Courier New',monospace", letterSpacing: '0.12em' }}>{phone}</div>
              </div>
              <MastercardLogo />
            </div>

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFlow({ isOpen, onClose, product, selectedColor, selectedSize, quantity, cartItems, onSuccess, shippingCost = 0, discountAmount = 0, loyaltyDiscountAmount = 0, loyaltyTier = "", promoCode = "", shippingMethodLabel = "Standard" }) {
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
  const { data: appConfig } = useAppConfig();
  const supportPhone = `${appConfig?.contactPhone || ''}`.trim();
 
  const isCartCheckout = cartItems && cartItems.length > 0;

  const normalizedShippingCost = Number.isFinite(Number(shippingCost)) ? Number(shippingCost) : 0;
  const normalizedDiscountAmount = Number.isFinite(Number(discountAmount)) ? Number(discountAmount) : 0;
  const normalizedLoyaltyDiscountAmount = Number.isFinite(Number(loyaltyDiscountAmount)) ? Number(loyaltyDiscountAmount) : 0;
  const normalizedQuantity = Number.isFinite(Number(quantity)) ? Number(quantity) : 1;
  
  // Calculate items total
  const itemsTotal = isCartCheckout 
    ? cartItems.reduce((acc, item) => acc + (Number(item?.price) || 0) * (Number(item?.quantity) || 0), 0)
    : (Number(product?.price) || 0) * normalizedQuantity;

  // Calculate final total with shipping and discount
  const finalTotal = Math.max(0, itemsTotal + normalizedShippingCost - normalizedDiscountAmount - normalizedLoyaltyDiscountAmount);

  const TAX_RATE = 0.18; // 18% TVA Côte d'Ivoire
  // Calculate tax based on final total
  const taxAmount = Math.round(finalTotal - (finalTotal / (1 + TAX_RATE)));

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    if (!body) return;
    const prevOverflow = body.style.overflow;

    if (isOpen) {
      body.classList.add('checkout-open');
      body.style.overflow = 'hidden';
    } else {
      body.classList.remove('checkout-open');
      body.style.overflow = prevOverflow;
    }

    return () => {
      body.classList.remove('checkout-open');
      body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const payload = getCurrentUserPayload();
    if (!payload?.sub) return;
    let active = true;
    setLoadingAddresses(true);
    getMyCustomerCheckoutCollection()
      .then((collection) => {
        if (!active) return;
        const customer = collection?.customer || null;
        const addresses = Array.isArray(collection?.addresses) ? collection.addresses : [];
        const firstName = `${customer?.firstName || payload?.firstName || ''}`.trim();
        const lastName = `${customer?.lastName || payload?.lastName || ''}`.trim();
        const email = `${customer?.email || payload?.email || ''}`.trim();
        setFormData((prev) => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: lastName || prev.lastName,
          email: email || prev.email
        }));
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find((addr) => addr?.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setFormData((prev) => ({
            ...prev,
            address: defaultAddress.addressLine || '',
            city: defaultAddress.city || '',
            zip: defaultAddress.postalCode || '',
            phone: defaultAddress.phone || prev.phone
          }));
        }
      })
      .catch(() => {
        if (!active) return;
        const firstName = `${payload?.firstName || ''}`.trim();
        const lastName = `${payload?.lastName || ''}`.trim();
        const email = `${payload?.email || ''}`.trim();
        setFormData((prev) => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: lastName || prev.lastName,
          email: email || prev.email
        }));
        setSavedAddresses([]);
      })
      .finally(() => {
        if (active) setLoadingAddresses(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  const setAddressFromPosition = async () => {
    if (isResolvingCurrentAddress) return;
    if (typeof window === 'undefined' || !navigator?.geolocation?.getCurrentPosition) {
      toast.error("Géolocalisation indisponible sur cet appareil.");
      return;
    }
    setIsResolvingCurrentAddress(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        });
      });
      const lat = position?.coords?.latitude;
      const lon = position?.coords?.longitude;
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        throw new Error("Position invalide.");
      }

      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) {
        throw new Error("Impossible de récupérer votre adresse.");
      }
      const data = await res.json();
      const addr = data?.address || {};
      const line1 = [addr.house_number, addr.road].filter(Boolean).join(' ').trim();
      const city = `${addr.city || addr.town || addr.village || addr.suburb || addr.county || ''}`.trim();
      const zip = `${addr.postcode || ''}`.trim();
      const addressLine = line1 || `${data?.display_name || ''}`.trim() || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

      setFormData((prev) => ({
        ...prev,
        address: addressLine,
        city: city || prev.city,
        zip: zip || prev.zip
      }));
      toast.success("Adresse mise à jour depuis votre position.");
    } catch (err) {
      const code = err?.code;
      if (code === 1) toast.error("Autorisation GPS refusée.");
      else if (code === 2) toast.error("Position indisponible.");
      else if (code === 3) toast.error("Délai GPS dépassé.");
      else toast.error(err?.message || "Impossible de déterminer votre adresse.");
    } finally {
      setIsResolvingCurrentAddress(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('paymentMethods');
      if (!raw) return;
      const methods = JSON.parse(raw);
      if (!Array.isArray(methods) || methods.length === 0) return;
      const method = methods[0];
      if (method.type === 'mobile') {
        setFormData((prev) => ({
          ...prev,
          paymentMethod: 'mobile',
          mobilePhone: method.phone || prev.mobilePhone
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          paymentMethod: 'card',
          cardNumber: method.cardNumber || prev.cardNumber,
          cardExpiry: method.expiry || prev.cardExpiry,
          cardName: method.cardName || prev.cardName
        }));
      }
    } catch {
      return;
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') formattedValue = formatCardNumber(value);
    if (name === 'cardExpiry') formattedValue = formatExpires(value);
    if (name === 'cardCvc') formattedValue = value.replace(/\D/g, '').slice(0, 3); // Max 3 digits

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);
    const address = savedAddresses.find((addr) => `${addr?.id}` === `${addressId}`);
    if (!address) return;
    setFormData((prev) => ({
      ...prev,
      address: address.addressLine || '',
      city: address.city || '',
      zip: address.postalCode || '',
      phone: address.phone || prev.phone
    }));
  };

  const handleSubmitInfo = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const payload = getCurrentUserPayload();
    if (!payload?.sub) {
      toast.error("Veuillez vous connecter pour payer.");
      return;
    }
    const currentEmail = `${payload?.email || ''}`.trim() || `${formData.email || ''}`.trim();
    if (!currentEmail) {
      toast.error("Email requis.");
      return;
    }

    const paymentProvider = `${import.meta.env.VITE_PAYMENT_PROVIDER || (import.meta.env.DEV ? 'LOCAL' : 'PAYDUNYA')}`.trim();

    const contactPhone =
      (formData.paymentMethod === 'mobile' ? formData.mobilePhone : formData.phone) ||
      formData.phone ||
      formData.mobilePhone ||
      '';

    if (!`${contactPhone}`.trim()) {
      toast.error("Numéro de téléphone requis.");
      return;
    }

    const toArticleId = (value) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric <= 0) return null;
      return Math.trunc(numeric);
    };

    const buildItem = (item, qtyOverride) => {
      const quantityValue = Number.isFinite(Number(qtyOverride)) ? Number(qtyOverride) : Number(item?.quantity);
      if (!quantityValue || quantityValue <= 0) return null;
      const referenceProduitPartenaire = item?.referenceProduitPartenaire || item?.referencePartenaire || item?.sku;
      const articleId = item?.articleId ?? toArticleId(item?.id);
      if (!articleId && !referenceProduitPartenaire) return null;
      return { articleId: articleId ?? undefined, referenceProduitPartenaire: referenceProduitPartenaire ?? undefined, quantity: quantityValue };
    };

    const rawItems = isCartCheckout
      ? cartItems.map((item) => buildItem(item))
      : [buildItem(product, normalizedQuantity)];
    const invalidCount = rawItems.filter((item) => !item).length;
    const items = rawItems.filter(Boolean);

    if (invalidCount > 0 || items.length === 0) {
      toast.error("Panier invalide.");
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const returnUrl = `${origin}/payment/success`;
    const cancelUrl = `${origin}/payment/cancel`;

    const shippingAddress = [formData.address, formData.city, formData.zip].filter(Boolean).join(', ');

    setStep(3);
    setLoadingStep(1);

    try {
      const res = await checkout(payload.sub, {
        amount: finalTotal,
        currency: 'XOF',
        email: currentEmail,
        phone: contactPhone,
        shippingAddress,
        notes: '',
        shippingCost: normalizedShippingCost,
        promoCode: (promoCode || "").trim() || null,
        items,
        returnUrl,
        cancelUrl,
        paymentProvider
      });

      const rawOrderNumber = `${res?.orderNumber || res?.orderId || res?.orderReference || res?.reference || ""}`.trim();
      if (rawOrderNumber) {
        setOrderNumber(rawOrderNumber.replace(/^LID-/, ""));
      }
      onSuccess?.(res);

      const url = res?.paymentUrl;
      setLoadingStep(3);
      if (typeof window !== 'undefined') {
        const token = `${res?.invoiceToken || ''}`.trim();
        if (token) {
          const checkoutItemsKey = `lid_payment_checkout_items_${token}`;
          window.sessionStorage.setItem(checkoutItemsKey, JSON.stringify(items));
        }
        if (url && paymentProvider.toUpperCase() !== 'LOCAL') {
          window.location.href = url;
          return;
        }
        if (!token) {
          throw new Error("Token de paiement introuvable.");
        }
        window.location.href = `${origin}/payment/success?token=${encodeURIComponent(token)}`;
      }
    } catch (err) {
      setStep(2);
      setLoadingStep(0);
      toast.error(err?.response?.data?.message || err?.message || "Paiement impossible.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-stretch sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative w-full min-h-screen sm:min-h-0 sm:h-[calc(100vh-3rem)] max-w-6xl bg-neutral-50 dark:bg-neutral-950 sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col lg:flex-row"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-[210] p-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur text-neutral-700 dark:text-neutral-200 hover:bg-white dark:hover:bg-white/20 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

          {/* LEFT PANEL: Order Summary (Dark/Brand side) */}
          <div className="w-full lg:w-[42%] bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden order-1 lg:order-2 shrink-0 min-h-[420px] lg:min-h-0">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,121,0,0.22),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(106,162,0,0.18),transparent_55%)] pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[110px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8 md:mb-12 opacity-80">
                <ShieldCheck className="text-green-400" />
                <span className="text-sm font-medium tracking-wide">PAIEMENT SÉCURISÉ 256-BIT SSL</span>
              </div>

              <div className="space-y-6">
                 {isCartCheckout ? (
                   <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                     {cartItems.map((item, index) => (
                       <div key={`${item.id}-${index}`} className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-white rounded-lg p-1 shadow-md flex items-center justify-center relative flex-shrink-0">
                           <img
                             src={resolveBackendAssetUrl(item?.image || item?.imageUrl) || "/imgs/logo.png"}
                             alt={item.name}
                             className="w-full h-full object-contain mix-blend-multiply"
                             onError={(e) => {
                               e.currentTarget.onerror = null;
                               e.currentTarget.src = "/imgs/logo.png";
                             }}
                           />
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-neutral-900">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm leading-tight truncate">{item.name}</h4>
                            <p className="text-neutral-400 text-xs truncate">{item.size} • {item.color}</p>
                             <p className="text-orange-500 font-bold text-sm">{formatMoney((Number(item?.price) || 0) * (Number(item?.quantity) || 0))} FCFA</p>
                          </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="flex gap-6 items-start">
                      <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-xl flex items-center justify-center relative group">
                        <img
                          src={resolveBackendAssetUrl(product?.image || product?.imageUrl) || "/imgs/logo.png"}
                          alt={product?.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/imgs/logo.png";
                          }}
                        />
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-neutral-900">
                          {quantity}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold leading-tight mb-2">{product?.name}</h3>
                        <p className="text-neutral-400 text-sm mb-1">Taille: {selectedSize} • Couleur: {selectedColor}</p>
                         <p className="text-2xl font-bold text-orange-500">{formatMoney(product?.price)} FCFA</p>
                      </div>
                   </div>
                 )}

                  <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-3">
                     <div className="flex justify-between text-neutral-300">
                       <span>Sous-total</span>
                       <span>{formatMoney(itemsTotal)} FCFA</span>
                     </div>
                     <div className="flex justify-between text-neutral-300">
                       <span>Livraison ({shippingMethodLabel})</span>
                       {normalizedShippingCost === 0 ? (
                         <span className="text-green-400 font-bold">GRATUIT</span>
                       ) : (
                        <span>{formatMoney(normalizedShippingCost)} FCFA</span>
                       )}
                     </div>
                     {normalizedDiscountAmount > 0 && (
                       <div className="flex justify-between text-green-400">
                         <span>Réduction</span>
                         <span>-{formatMoney(normalizedDiscountAmount)} FCFA</span>
                       </div>
                     )}
                     {normalizedLoyaltyDiscountAmount > 0 && (
                       <div className="flex justify-between text-green-400">
                         <span>{loyaltyTier ? `Réduction VIP (${loyaltyTier})` : "Réduction VIP"}</span>
                         <span>-{formatMoney(normalizedLoyaltyDiscountAmount)} FCFA</span>
                       </div>
                     )}
                     <div className="flex justify-between text-neutral-300">
                       <span>Dont TVA (18%)</span>
                       <span>{formatMoney(taxAmount)} FCFA</span>
                     </div>
                     <div className="h-px bg-white/10 my-4" />
                     <div className="flex justify-between text-2xl font-bold">
                       <span>Total TTC</span>
                       <span>{formatMoney(finalTotal)} FCFA</span>
                     </div>
                  </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 md:mt-0 text-xs text-neutral-500 flex gap-4">
              <span>Conditions Générales</span>
              <span>Politique de Confidentialité</span>
            </div>
          </div>

          {/* RIGHT PANEL: Form (Light/Input side) */}
          <div className="w-full lg:w-[58%] bg-white dark:bg-neutral-950 p-6 sm:p-8 lg:p-10 overflow-y-auto order-2 lg:order-1 relative">
             <button 
              onClick={onClose}
              className="hidden lg:flex absolute top-6 left-6 items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={20} /> Retour à la boutique
            </button>

            <div className="max-w-xl mx-auto lg:mt-12">
              {/* Step 3: PROCESSING STATE OVERLAY */}
              {step === 3 && (
                 <div className="absolute inset-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 relative mb-8">
                       <motion.div 
                         className="absolute inset-0 border-4 border-neutral-200 dark:border-neutral-800 rounded-full"
                       />
                       <motion.div 
                         className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent"
                         animate={{ rotate: 360 }}
                         transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                       />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="text-orange-500" size={32} />
                       </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">
                      {loadingStep === 1 && "Connexion à la banque..."}
                      {loadingStep === 2 && "Vérification 3D Secure..."}
                      {loadingStep === 3 && "Paiement approuvé !"}
                    </h3>
                    <p className="text-neutral-500 max-w-sm mx-auto">
                      Veuillez ne pas fermer cette fenêtre. Nous sécurisons votre transaction.
                    </p>
                 </div>
              )}

              {/* Step 4: SUCCESS STATE */}
              {step === 4 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-12 h-12 text-green-600 dark:text-green-400" strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black mb-4">Commande Confirmée !</h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                    Merci {formData.firstName}. Votre commande a été acceptée et est en cours de préparation. Un email de confirmation a été envoyé à {formData.email}.
                  </p>
                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-8 text-left">
                     <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-500">N° de commande</span>
                        <span className="font-mono font-bold">LID-{orderNumber}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Date estimée</span>
                        <span className="font-bold">Demain, 5 Janvier</span>
                     </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-transform"
                  >
                    Continuer mes achats
                  </button>
                </motion.div>
              ) : (
                /* FORM STEPS */
                <>
                  <div className="flex flex-col gap-3 mb-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-600 to-[#6aa200] text-white flex items-center justify-center shadow-sm font-black">
                          {step > 1 ? <Check size={18} /> : "1"}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[11px] font-bold tracking-[0.18em] text-neutral-500 dark:text-neutral-400 uppercase">
                            Checkout
                          </div>
                          <div className="text-lg font-black text-neutral-900 dark:text-white leading-tight">
                            Livraison & paiement
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold border transition-colors",
                            step === 1
                              ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/10 dark:text-orange-200 dark:border-orange-900/50"
                              : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-200 dark:border-green-900/50"
                          )}
                        >
                          {step > 1 ? <Check size={14} /> : null}
                          Livraison
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold border transition-colors",
                            step === 2
                              ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/10 dark:text-orange-200 dark:border-orange-900/50"
                              : "bg-neutral-50 text-neutral-500 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800"
                          )}
                        >
                          Paiement
                        </span>
                      </div>
                    </div>
                    <div className="sm:hidden flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold border transition-colors",
                          step === 1
                            ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/10 dark:text-orange-200 dark:border-orange-900/50"
                            : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/10 dark:text-green-200 dark:border-green-900/50"
                        )}
                      >
                        {step > 1 ? <Check size={14} /> : null}
                        Livraison
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold border transition-colors",
                          step === 2
                            ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/10 dark:text-orange-200 dark:border-orange-900/50"
                            : "bg-neutral-50 text-neutral-500 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800"
                        )}
                      >
                        Paiement
                      </span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.form
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleSubmitInfo}
                        className="space-y-6"
                      >
                        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 sm:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                                Détails de livraison
                              </h1>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Où devons-nous envoyer votre commande ?
                              </p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2 text-xs font-bold text-neutral-600 dark:text-neutral-300">
                              <ShieldCheck className="h-4 w-4 text-[#6aa200]" />
                              Données sécurisées
                            </div>
                          </div>

                          <div className="mt-6 grid gap-4">
                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
                              <div className="flex items-center gap-2 text-sm font-black text-neutral-900 dark:text-white">
                                <User className="h-4 w-4 text-orange-600" />
                                Informations du compte
                              </div>
                              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                                    Prénom
                                  </label>
                                  <input
                                    required
                                    name="firstName"
                                    value={formData.firstName}
                                    readOnly
                                    className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/60 px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white outline-none opacity-80 cursor-not-allowed"
                                    placeholder="Votre prénom"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                                    Nom
                                  </label>
                                  <input
                                    required
                                    name="lastName"
                                    value={formData.lastName}
                                    readOnly
                                    className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/60 px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white outline-none opacity-80 cursor-not-allowed"
                                    placeholder="Votre nom"
                                  />
                                </div>
                              </div>

                              <div className="mt-4 space-y-1.5">
                                <label className="text-[11px] font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                                  Email
                                </label>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                  <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    readOnly
                                    className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/60 pl-11 pr-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white outline-none opacity-80 cursor-not-allowed"
                                    placeholder="exemple@email.com"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4">
                              <div className="flex items-center gap-2 text-sm font-black text-neutral-900 dark:text-white">
                                <MapPin className="h-4 w-4 text-orange-600" />
                                Adresse de livraison
                              </div>

                              <div className="mt-4 space-y-4">
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                                    Téléphone
                                  </label>
                                  <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <input
                                      required
                                      type="tel"
                                      name="phone"
                                      value={formData.phone}
                                      onChange={handleInputChange}
                                      className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 pl-11 pr-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition"
                                      placeholder="+2250102030405"
                                    />
                                  </div>
                                </div>

                                {loadingAddresses ? (
                                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Chargement des adresses...
                                  </div>
                                ) : savedAddresses.length > 0 ? (
                                  <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                                      Adresse sauvegardée
                                    </label>
                                    <select
                                      value={selectedAddressId}
                                      onChange={handleAddressSelect}
                                      className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition"
                                    >
                                      <option value="">Nouvelle adresse</option>
                                      {savedAddresses.map((addr) => (
                                        <option key={addr.id} value={addr.id}>
                                          {[addr.type, addr.addressLine, addr.city].filter(Boolean).join(' · ')}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ) : null}

                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                                    Adresse
                                  </label>
                                  <div className="relative">
                                    <input
                                      required
                                      name="address"
                                      value={formData.address}
                                      onChange={handleInputChange}
                                      className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 pr-12 text-sm font-semibold text-neutral-900 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition"
                                      placeholder="Numéro et nom de rue"
                                    />
                                    <button
                                      type="button"
                                      onClick={setAddressFromPosition}
                                      disabled={isResolvingCurrentAddress}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:border-orange-300 hover:text-orange-600 transition disabled:opacity-60"
                                      aria-label="Utiliser ma position"
                                    >
                                      {isResolvingCurrentAddress ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
                                    </button>
                                  </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                                      Ville
                                    </label>
                                    <input
                                      required
                                      name="city"
                                      value={formData.city}
                                      onChange={handleInputChange}
                                      className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition"
                                      placeholder="Ville"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                                      Code postal
                                    </label>
                                    <input
                                      required
                                      name="zip"
                                      value={formData.zip}
                                      onChange={handleInputChange}
                                      className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm font-semibold text-neutral-900 dark:text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition"
                                      placeholder="00000"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full mt-6 rounded-2xl bg-gradient-to-r from-orange-600 to-[#6aa200] text-white py-4 font-black text-base shadow-lg shadow-orange-600/15 hover:shadow-orange-600/25 transition flex items-center justify-center gap-2 active:scale-[0.99]"
                          >
                            Continuer vers le paiement <ArrowRight size={20} />
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {step === 2 && (
                      <motion.form
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handlePayment}
                        className="space-y-6"
                      >
                         <h1 className="text-3xl font-black mb-2">Paiement</h1>
                         <p className="text-neutral-500 mb-8">Toutes les transactions sont sécurisées et cryptées.</p>

                         {/* Payment Method Selector */}
                         <div className="flex gap-4 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl mb-8">
                            <button
                              type="button"
                              onClick={() => setFormData(p => ({...p, paymentMethod: 'card'}))}
                              className={cn("flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", formData.paymentMethod === 'card' ? "bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white" : "text-neutral-500")}
                            >
                              <CreditCard size={18} /> Carte Bancaire
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(p => ({...p, paymentMethod: 'mobile'}))}
                              className={cn("flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", formData.paymentMethod === 'mobile' ? "bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white" : "text-neutral-500")}
                            >
                              <Smartphone size={18} /> Mobile Money
                            </button>
                         </div>

                         {formData.paymentMethod === 'card' ? (
                           <div className="space-y-6">
                              <CardPreview
                                number={formData.cardNumber}
                                expiry={formData.cardExpiry}
                                cvc={formData.cardCvc}
                                name={formData.cardName}
                                focus={cardFocus}
                                supportPhone={supportPhone}
                              />

                              <div className="space-y-4">
                                <div className="group">
                                  <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block">Numéro de carte</label>
                                  <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                                    <input 
                                      required 
                                      name="cardNumber"
                                      value={formData.cardNumber}
                                      onChange={handleInputChange}
                                      maxLength={19}
                                      onFocus={() => setCardFocus('number')}
                                      className="w-full pl-10 p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none font-mono text-lg" 
                                      placeholder="0000 0000 0000 0000" 
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                   <div className="group">
                                      <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block">Expiration</label>
                                      <input 
                                        required 
                                        name="cardExpiry"
                                        value={formData.cardExpiry}
                                        onChange={handleInputChange}
                                        maxLength={5}
                                        onFocus={() => setCardFocus('expiry')}
                                        className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none font-mono text-center text-lg" 
                                        placeholder="MM/YY" 
                                      />
                                   </div>
                                   <div className="group">
                                      <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block">CVC</label>
                                      <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                        <input 
                                          required 
                                          name="cardCvc"
                                          value={formData.cardCvc}
                                          onChange={handleInputChange}
                                          maxLength={3}
                                          onFocus={() => setCardFocus('cvc')}
                                          className="w-full pl-10 p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none font-mono text-center text-lg" 
                                          placeholder="123" 
                                        />
                                      </div>
                                   </div>
                                </div>

                                <div className="group">
                                   <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block">Nom sur la carte</label>
                                   <input 
                                      required 
                                      name="cardName"
                                      value={formData.cardName}
                                      onChange={handleInputChange}
                                      onFocus={() => setCardFocus('name')}
                                      className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none uppercase font-medium" 
                                      placeholder="NOM PRENOM" 
                                   />
                                </div>
                              </div>
                           </div>
                         ) : (
                           <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center py-12">
                              <Smartphone className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                              <h3 className="font-bold mb-2">Paiement Mobile</h3>
                              <p className="text-sm text-neutral-500 mb-6">Un message de validation sera envoyé sur votre téléphone après confirmation.</p>
                              <div className="max-w-xs mx-auto">
                                 <input 
                                   required
                                   type="tel"
                                   name="mobilePhone"
                                   value={formData.mobilePhone}
                                   onChange={handleInputChange}
                                   placeholder="07 00 00 00 00"
                                   className="w-full p-4 text-center text-xl font-bold tracking-wider bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:border-orange-500"
                                 />
                              </div>
                           </div>
                         )}

                         <button type="submit" className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 mt-8 shadow-lg shadow-orange-500/20">
                           <Lock size={20} /> Payer {Number(finalTotal).toLocaleString()} FCFA
                         </button>
                         
                         <button 
                           type="button" 
                           onClick={() => setStep(1)}
                           className="w-full py-3 text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                         >
                           Retour aux informations
                         </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
