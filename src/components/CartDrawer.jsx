import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/features/cart/CartContext";

export default function CartDrawer() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    cartTotal 
  } = useCart();
  
  const navigate = useNavigate();

  // Close drawer on route change
  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl z-[160] flex flex-col border-l border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="text-neutral-900 dark:text-white" size={24} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6aa200] text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {cartItems.length}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Mon Panier</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                  <ShoppingBag size={48} className="text-neutral-300 dark:text-neutral-700" />
                  <p className="text-neutral-500 font-medium">Votre panier est vide</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-[#6aa200] font-bold hover:underline"
                  >
                    Continuer mes achats
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <motion.div 
                      layout
                      key={`${item.id}-${item.color}-${item.size}`}
                      className="flex gap-4 group"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0 p-2 border border-neutral-100 dark:border-neutral-700">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-neutral-900 dark:text-white text-sm line-clamp-1">
                              <Link to={`/product/${item.id}`} onClick={() => setIsCartOpen(false)}>
                                {item.name}
                              </Link>
                            </h3>
                            <button 
                              onClick={() => removeFromCart(item.id, item.color, item.size)}
                              className="text-neutral-400 hover:text-red-500 transition-colors p-0.5"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-neutral-500 mb-1">{item.brand} • {item.size}</p>
                          <div className="flex items-center gap-2">
                             {item.color && (
                               <span className="w-3 h-3 rounded-full border border-neutral-200" style={{ backgroundColor: item.hex || item.color }} />
                             )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.color, item.size, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-md shadow-sm text-neutral-600 dark:text-neutral-300 hover:text-[#6aa200] disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.color, item.size, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-md shadow-sm text-neutral-600 dark:text-neutral-300 hover:text-[#6aa200]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="font-bold text-neutral-900 dark:text-white text-sm">
                            {(item.price * item.quantity).toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Sous-total</span>
                    <span>{cartTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-neutral-900 dark:text-white">
                    <span>Total</span>
                    <span>{cartTotal.toLocaleString()} FCFA</span>
                  </div>
                  <p className="text-xs text-neutral-400 text-center">Taxes et frais calculés au paiement</p>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full py-4 bg-[#6aa200] hover:bg-[#5a8a00] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-[#6aa200]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Commander <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
