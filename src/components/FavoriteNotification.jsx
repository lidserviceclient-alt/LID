// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useEffect } from "react";
import { resolveBackendAssetUrl } from "@/services/categoryService";

const FALLBACK_PRODUCT_IMAGE = "/imgs/logo.png";

const FavoriteNotification = ({ isVisible, onClose, product, isAdding = true }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed top-8 right-8 -translate-x-1/2 z-50 flex items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl p-4 pr-12 min-w-[320px]"
        >
          {/* Product Image */}
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 flex-shrink-0">
            <img 
              src={resolveBackendAssetUrl(product?.imageUrl || product?.image || product?.img) || FALLBACK_PRODUCT_IMAGE} 
              alt={product?.name} 
              onError={(e) => {
                e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
              }}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col">
            <span className={`text-sm font-bold ${isAdding ? 'text-green-600' : 'text-neutral-500'}`}>
              {isAdding ? "Ajouté aux favoris !" : "Retiré des favoris"}
            </span>
            <span className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-1">
              {product?.name}
            </span>
          </div>

          {/* Animated Heart */}
          <div className="absolute -top-2 -left-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.1 }}
              className={`p-2 rounded-full shadow-lg ${isAdding ? 'bg-red-500' : 'bg-neutral-400'}`}
            >
              <Heart className="w-5 h-5 text-white fill-white" />
            </motion.div>
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FavoriteNotification;
