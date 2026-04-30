import React from 'react';
import PageSEO from '@/components/PageSEO';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Heart, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlist } from '@/features/wishlist/WishlistContext';
import { useCart } from '@/features/cart/CartContext';
import { resolveBackendAssetUrl } from '@/services/categoryService';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6"
        >
          <Heart size={40} className="text-neutral-400 dark:text-neutral-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Votre liste de souhaits est vide
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
          Explorez notre catalogue et sauvegardez vos articles préférés pour plus tard.
        </p>
        <Link 
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
        >
          Découvrir nos produits
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-12">
      <PageSEO title="Favoris" description="Votre liste de souhaits Lid." noindex />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Ma Liste de Souhaits
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {wishlistItems.length} article{wishlistItems.length > 1 ? 's' : ''} sauvegardé{wishlistItems.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link 
          to="/shop"
          className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline decoration-2 underline-offset-4"
        >
          Continuer mes achats
        </Link>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence mode='popLayout'>
          {wishlistItems.map((product) => (
            <motion.div
              layout
              key={product.id}
              variants={itemAnim}
              exit={{ scale: 0.9, opacity: 0 }}
              className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={resolveBackendAssetUrl(product.image) || "/imgs/logo.png"} 
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/imgs/logo.png";
                    }}
                  />
                </Link>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm rounded-full text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10"
                  title="Retirer des favoris"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 truncate hover:text-orange-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-bold text-lg text-neutral-900 dark:text-white">
                    {product.price.toLocaleString()} FCFA
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-neutral-500 line-through">
                      {product.oldPrice.toLocaleString()} FCFA
                    </span>
                  )}
                </div>

                <button
                  onClick={() => { 
                    addToCart({ ...product, size: product.sizes?.[0] || "Unique", color: product.color || "Standard" });
                    toast.success("Ajouté au panier");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white transition-all active:scale-95"
                >
                  <ShoppingCart size={18} />
                  Ajouter au panier
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
