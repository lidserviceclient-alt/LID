import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, 
  Truck, ShieldCheck, Tag, CreditCard, Star, Package, CheckCircle2 
} from "lucide-react";
import { useCart } from "@/features/cart/CartContext";
import { toast } from "sonner";
import CheckoutFlow from "../components/CheckoutFlow";

// Mock Recommendations Data
const recommendedProducts = [
  {
    id: 101,
    name: "Chaussettes LID Pro",
    brand: "LID Accessories",
    price: 14.99,
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b1bcbca4-e853-4df7-b329-5be3c61ee057/everyday-cushioned-training-crew-socks-3-pairs-vlLbSG.png",
    category: "Accessoires",
    color: "Blanc",
    size: "M"
  },
  {
    id: 102,
    name: "Casquette Urban",
    brand: "LID Originals",
    price: 29.99,
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/e777c881-5b62-4250-92a6-362967f54cca/sportswear-heritage-86-adjustable-hat-q0r7xl.png",
    category: "Accessoires",
    color: "Noir",
    size: "TU"
  },
  {
    id: 103,
    name: "Sac à dos Explorer",
    brand: "Nike",
    price: 45.00,
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/924d2757-788b-4c57-9c98-1329bb632975/elemental-backpack-21l-lZ51g5.png",
    category: "Accessoires",
    color: "Gris",
    size: "TU"
  }
];

export default function Cart() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [showCheckout, setShowCheckout] = useState(false);
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 130000;
  const shippingCost = shippingMethod === "express" ? 6500 : (cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 3250);
  
  const handleCheckout = () => {
    setShowCheckout(true);
  };
  
  const handlePaymentSuccess = () => {
    clearCart();
    setShowCheckout(false);
    toast.success("Commande effectuée avec succès !");
    navigate('/profile?tab=orders');
  };
  
  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "LID10") {
      setAppliedPromo({ code: "LID10", discount: 0.10 });
    } else if (promoCode.toUpperCase() === "WELCOME") {
      setAppliedPromo({ code: "WELCOME", discount: 0.05 });
    } else {
      // Shake animation or error toast could go here
      alert("Code promo invalide");
    }
  };

  const discountAmount = appliedPromo ? cartTotal * appliedPromo.discount : 0;
  const finalTotal = cartTotal - discountAmount + shippingCost;
  const progressToFreeShipping = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white dark:bg-neutral-950 px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6 relative"
        >
          <ShoppingBag className="w-10 h-10 text-neutral-400" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center"
          >
            <span className="text-orange-600 font-bold text-lg">0</span>
          </motion.div>
        </motion.div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Votre panier est vide</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-center max-w-md">
          Il semblerait que vous n'ayez pas encore ajouté d'articles. Explorez notre catalogue pour trouver votre bonheur.
        </p>
        <Link 
          to="/shop" 
          className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Retourner à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                <ShoppingBag className="text-orange-600" />
                Mon Panier <span className="text-neutral-500 text-lg font-normal">({cartItems.length} articles)</span>
              </h1>
              <button 
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600 font-medium underline-offset-4 hover:underline"
              >
                Vider le panier
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {cartTotal >= FREE_SHIPPING_THRESHOLD 
                    ? "Livraison gratuite débloquée ! 🎉" 
                    : `Plus que ${(FREE_SHIPPING_THRESHOLD - cartTotal).toLocaleString()} FCFA pour la livraison gratuite`}
                </span>
                <span className="text-xs text-neutral-500">{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToFreeShipping}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${cartTotal >= FREE_SHIPPING_THRESHOLD ? "bg-green-500" : "bg-orange-600"}`}
                />
              </div>
            </div>

            {/* Cart List */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-neutral-100 dark:border-neutral-800 text-sm font-medium text-neutral-500">
                <div className="col-span-6">Produit</div>
                <div className="col-span-2 text-center">Prix</div>
                <div className="col-span-2 text-center">Quantité</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div 
                      key={`${item.id}-${item.color}-${item.size}`}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6 items-center group"
                    >
                      {/* Product Info */}
                      <div className="col-span-2 md:col-span-6 flex gap-4">
                        <Link to={`/product/${item.id}`} className="w-20 h-20 md:w-24 md:h-24 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0 p-2 cursor-pointer">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" 
                          />
                        </Link>
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white text-base md:text-lg mb-1 hover:text-orange-600 transition-colors cursor-pointer line-clamp-1 md:line-clamp-none">
                              <Link to={`/product/${item.id}`}>{item.name}</Link>
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.brand}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-neutral-500">
                            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-xs uppercase font-medium">
                              {item.size || "TU"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full border border-neutral-200 shadow-sm" style={{ backgroundColor: item.hex || item.color }}></span>
                              <span className="hidden md:inline">{item.color}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 md:col-span-2 md:text-center flex flex-col md:block">
                        <span className="md:hidden text-xs text-neutral-500 mb-1">Prix unitaire</span>
                        <span className="font-medium text-neutral-900 dark:text-white">{item.price.toLocaleString()} FCFA</span>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-end md:items-center md:justify-center gap-1 md:gap-3">
                        <span className="md:hidden text-xs text-neutral-500 mb-1">Quantité</span>
                        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-full px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.color, item.size, -1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium text-neutral-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.color, item.size, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Total & Remove */}
                      <div className="col-span-2 md:col-span-2 flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800">
                        <span className="md:hidden text-sm font-medium text-neutral-500">Total</span>
                        <div className="flex items-center gap-4">
                          <div className="font-bold text-lg text-neutral-900 dark:text-white">
                            {(item.price * item.quantity).toLocaleString()} FCFA
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.color, item.size)}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Retirer du panier"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="pt-8">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Vous aimerez aussi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendedProducts.map(product => (
                  <motion.div 
                    key={product.id}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col gap-3"
                  >
                    <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden p-4">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white line-clamp-1">{product.name}</h4>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{product.brand}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-neutral-900 dark:text-white">{product.price.toLocaleString()} FCFA</span>
                      <button 
                        onClick={() => addToCart({ ...product, quantity: 1 })}
                        className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-full hover:bg-orange-600 hover:text-white transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mt-8">
              <Link to="/shop" className="flex items-center gap-2 text-neutral-600 hover:text-orange-600 transition-colors font-medium">
                <ArrowLeft size={18} />
                Continuer mes achats
              </Link>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Résumé de la commande</h2>
              
              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Code promo
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Code de réduction"
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                    />
                  </div>
                  <button 
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    Appliquer
                  </button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Code "{appliedPromo.code}" appliqué (-{appliedPromo.discount * 100}%)
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Sous-total</span>
                  <span>{cartTotal.toLocaleString()} FCFA</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{discountAmount.toLocaleString()} FCFA</span>
                  </div>
                )}

                {/* Shipping Selection */}
                <div className="py-4 border-y border-neutral-100 dark:border-neutral-800 space-y-3">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white block mb-2">Mode de livraison</span>
                  
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/10' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="shipping" 
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-orange-600 focus:ring-orange-600"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">Standard</span>
                        <span className="text-xs text-neutral-500">3-5 jours ouvrables</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {cartTotal >= FREE_SHIPPING_THRESHOLD ? "Gratuit" : "3 250 FCFA"}
                    </span>
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${shippingMethod === 'express' ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/10' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="shipping" 
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-orange-600 focus:ring-orange-600"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">Express</span>
                        <span className="text-xs text-neutral-500">24-48h</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">6500 FCFA</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-neutral-900 dark:text-white">Total</span>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-neutral-900 dark:text-white">{finalTotal.toLocaleString()} FCFA</span>
                  <span className="text-xs text-neutral-500">TVA incluse</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                Payer maintenant
                <ArrowRight size={20} />
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                  <CreditCard className="w-8 h-8" />
                  <div className="w-8 h-8 bg-neutral-200 rounded flex items-center justify-center font-bold text-[10px]">VISA</div>
                  <div className="w-8 h-8 bg-neutral-200 rounded flex items-center justify-center font-bold text-[10px]">MC</div>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <ShieldCheck size={16} className="text-green-600 flex-shrink-0" />
                  <span>Paiement 100% sécurisé et crypté</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                  <Package size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Retours gratuits sous 30 jours</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <CheckoutFlow 
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cartItems}
        onSuccess={handlePaymentSuccess}
        shippingCost={shippingCost}
        discountAmount={discountAmount}
      />
    </div>
  );
}
