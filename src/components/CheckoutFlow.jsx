import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Smartphone, User, MapPin, Phone, Mail, ArrowRight, ShieldCheck, Lock, ChevronLeft, Loader2, Globe } from 'lucide-react';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import { getCurrentUserPayload } from '@/services/authService.js';
import { checkout } from '@/services/orderService.js';

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

export default function CheckoutFlow({ isOpen, onClose, product, selectedColor, selectedSize, quantity, cartItems, onSuccess, shippingCost = 0, discountAmount = 0 }) {
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

  const [cardFocused, setCardFocused] = useState(false);
 
  const isCartCheckout = cartItems && cartItems.length > 0;

  const normalizedShippingCost = Number.isFinite(Number(shippingCost)) ? Number(shippingCost) : 0;
  const normalizedDiscountAmount = Number.isFinite(Number(discountAmount)) ? Number(discountAmount) : 0;
  const normalizedQuantity = Number.isFinite(Number(quantity)) ? Number(quantity) : 1;
  
  // Calculate items total
  const itemsTotal = isCartCheckout 
    ? cartItems.reduce((acc, item) => acc + (Number(item?.price) || 0) * (Number(item?.quantity) || 0), 0)
    : (Number(product?.price) || 0) * normalizedQuantity;

  // Calculate final total with shipping and discount
  const finalTotal = itemsTotal + normalizedShippingCost - normalizedDiscountAmount;

  const TAX_RATE = 0.18; // 18% TVA Côte d'Ivoire
  // Calculate tax based on final total
  const taxAmount = Math.round(finalTotal - (finalTotal / (1 + TAX_RATE)));
  const subTotalHT = finalTotal - taxAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') formattedValue = formatCardNumber(value);
    if (name === 'cardExpiry') formattedValue = formatExpires(value);
    if (name === 'cardCvc') formattedValue = value.replace(/\D/g, '').slice(0, 3); // Max 3 digits

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
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

    const items = isCartCheckout
      ? cartItems.map((item) => ({ articleId: item.id, quantity: item.quantity }))
      : [{ articleId: product?.id, quantity }];

    if (!items.every((i) => i.articleId && i.quantity > 0)) {
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
        email: formData.email,
        phone: formData.phone,
        shippingAddress,
        notes: '',
        items,
        returnUrl,
        cancelUrl
      });

      const url = res?.paymentUrl;
      if (!url) {
        throw new Error("URL de paiement introuvable.");
      }
      setLoadingStep(3);
      if (typeof window !== 'undefined') {
        window.location.href = url;
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
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[200] bg-neutral-50 dark:bg-neutral-950 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden"
        >
          {/* Close Button Mobile */}
          <button 
            onClick={onClose}
            className="md:hidden fixed top-4 right-4 z-[210] p-2 bg-black/10 dark:bg-white/10 backdrop-blur-md rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* LEFT PANEL: Order Summary (Dark/Brand side) */}
          <div className="w-full md:w-[45%] lg:w-[40%] bg-neutral-900 text-white p-6 md:p-12 flex flex-col justify-between relative overflow-hidden order-1 md:order-2 shrink-0 md:h-full min-h-[400px] md:min-h-0">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
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
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-neutral-900">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm leading-tight truncate">{item.name}</h4>
                            <p className="text-neutral-400 text-xs truncate">{item.size} • {item.color}</p>
                            <p className="text-orange-500 font-bold text-sm">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                          </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="flex gap-6 items-start">
                      <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-xl flex items-center justify-center relative group">
                        <img src={product?.image} alt={product?.name} className="w-full h-full object-contain mix-blend-multiply" />
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-neutral-900">
                          {quantity}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold leading-tight mb-2">{product?.name}</h3>
                        <p className="text-neutral-400 text-sm mb-1">Taille: {selectedSize} • Couleur: {selectedColor}</p>
                        <p className="text-2xl font-bold text-orange-500">{product?.price?.toLocaleString()} FCFA</p>
                      </div>
                   </div>
                 )}

                 <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-3">
                    <div className="flex justify-between text-neutral-300">
                      <span>Sous-total (HT)</span>
                      <span>{Number(subTotalHT).toLocaleString(undefined, { maximumFractionDigits: 0 })} FCFA</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Livraison</span>
                      {normalizedShippingCost === 0 ? (
                        <span className="text-green-400 font-bold">GRATUIT</span>
                      ) : (
                        <span>{Number(normalizedShippingCost).toLocaleString()} FCFA</span>
                      )}
                    </div>
                    {normalizedDiscountAmount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Réduction</span>
                        <span>-{Number(normalizedDiscountAmount).toLocaleString()} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-300">
                      <span>TVA (18%)</span>
                      <span>{Number(taxAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })} FCFA</span>
                    </div>
                    <div className="h-px bg-white/10 my-4" />
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total TTC</span>
                      <span>{Number(finalTotal).toLocaleString()} FCFA</span>
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
          <div className="w-full md:w-[55%] lg:w-[60%] bg-white dark:bg-neutral-950 p-6 md:p-12 overflow-y-auto order-2 md:order-1 relative">
             <button 
              onClick={onClose}
              className="hidden md:flex absolute top-8 left-8 items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={20} /> Retour à la boutique
            </button>

            <div className="max-w-xl mx-auto md:mt-16">
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
                  <div className="flex items-center gap-3 mb-8">
                     <span className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step === 1 ? "bg-black text-white dark:bg-white dark:text-black" : "bg-green-500 text-white")}>
                       {step > 1 ? <Check size={16} /> : "1"}
                     </span>
                     <span className={cn("text-sm font-bold uppercase tracking-wider", step === 1 ? "text-black dark:text-white" : "text-neutral-400")}>Information</span>
                     <div className="w-12 h-px bg-neutral-200 dark:bg-neutral-800" />
                     <span className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step === 2 ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400")}>
                       2
                     </span>
                     <span className={cn("text-sm font-bold uppercase tracking-wider", step === 2 ? "text-black dark:text-white" : "text-neutral-400")}>Paiement</span>
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
                        <h1 className="text-3xl font-black mb-2">Détails de livraison</h1>
                        <p className="text-neutral-500 mb-8">Où devons-nous envoyer votre commande ?</p>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="group">
                             <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block group-focus-within:text-orange-600 transition-colors">Prénom</label>
                             <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all font-medium" placeholder="Votre prénom" />
                           </div>
                           <div className="group">
                             <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block group-focus-within:text-orange-600 transition-colors">Nom</label>
                             <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all font-medium" placeholder="Votre nom" />
                           </div>
                        </div>

                        <div className="group">
                           <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block group-focus-within:text-orange-600 transition-colors">Email</label>
                           <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all font-medium" placeholder="exemple@email.com" />
                        </div>

                        <div className="group">
                           <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block group-focus-within:text-orange-600 transition-colors">Adresse</label>
                           <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all font-medium" placeholder="Numéro et nom de rue" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="group">
                             <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block group-focus-within:text-orange-600 transition-colors">Ville</label>
                             <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all font-medium" placeholder="Ville" />
                           </div>
                           <div className="group">
                             <label className="text-xs font-bold text-neutral-500 uppercase mb-1.5 block group-focus-within:text-orange-600 transition-colors">Code Postal</label>
                             <input required name="zip" value={formData.zip} onChange={handleInputChange} className="w-full p-3 bg-neutral-50 dark:bg-neutral-900 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all font-medium" placeholder="00000" />
                           </div>
                        </div>

                        <button type="submit" className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-8">
                          Continuer vers le paiement <ArrowRight size={20} />
                        </button>
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
                              {/* REALISTIC CARD VISUAL */}
                              <div className="relative w-full aspect-[1.586/1] max-w-[340px] mx-auto perspective-1000 mb-8">
                                <div className={cn("w-full h-full rounded-2xl shadow-2xl transition-all duration-500 transform-style-3d relative bg-gradient-to-br from-neutral-800 to-black text-white p-6 flex flex-col justify-between overflow-hidden", cardFocused ? "rotate-y-180" : "")}>
                                   {/* Chip & Contactless */}
                                   <div className="relative z-10 flex justify-between items-start">
                                      <div className="w-12 h-9 bg-yellow-500/80 rounded-md flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-[1px] bg-black/20 my-[2px]" />
                                        <div className="absolute inset-0 border border-yellow-600/50 rounded-md" />
                                      </div>
                                      <Globe className="opacity-50" />
                                   </div>

                                   {/* Card Number */}
                                   <div className="relative z-10 font-mono text-xl md:text-2xl tracking-widest text-shadow-sm">
                                      {formData.cardNumber || "•••• •••• •••• ••••"}
                                   </div>

                                   {/* Footer Info */}
                                   <div className="relative z-10 flex justify-between items-end">
                                      <div>
                                        <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Titulaire</div>
                                        <div className="font-medium uppercase tracking-wide truncate max-w-[180px]">
                                          {formData.cardName || "NOM DU TITULAIRE"}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Expire</div>
                                        <div className="font-mono">{formData.cardExpiry || "MM/YY"}</div>
                                      </div>
                                   </div>

                                   {/* Decorative BG */}
                                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                </div>
                              </div>

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
                                      onFocus={() => setCardFocused(false)}
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
                                        onFocus={() => setCardFocused(false)}
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
                                          // onFocus={() => setCardFocused(true)} // Optional: flip card visual
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
                                      onFocus={() => setCardFocused(false)}
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
      )}
    </AnimatePresence>
  );
}
