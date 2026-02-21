import { useState, useEffect, Fragment } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import { 
  Star, 
  Check, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Share2,
  Sparkles,
  ChevronDown,
  MapPin,
  Lock,
  Gift,
  Info,
  Package,
  ShoppingCart,
  X,
  Ruler
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { products, colors } from "@/assets/data/products";
import ReviewSection from "../components/ReviewSection";
import FavoriteNotification from "../components/FavoriteNotification";
import CheckoutFlow from "../components/CheckoutFlow";

// --- Components ---

const SizeGuideModal = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-2xl z-50 w-full max-w-lg border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Ruler className="text-orange-600" /> Guide des Tailles
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                <tr>
                  <th className="px-4 py-2 rounded-tl-lg">Taille (EU)</th>
                  <th className="px-4 py-2">US</th>
                  <th className="px-4 py-2">UK</th>
                  <th className="px-4 py-2 rounded-tr-lg">CM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {[
                  { eu: "38", us: "5.5", uk: "5", cm: "24" },
                  { eu: "39", us: "6.5", uk: "6", cm: "24.5" },
                  { eu: "40", us: "7", uk: "6", cm: "25" },
                  { eu: "41", us: "8", uk: "7", cm: "26" },
                  { eu: "42", us: "8.5", uk: "7.5", cm: "26.5" },
                  { eu: "43", us: "9.5", uk: "8.5", cm: "27.5" },
                  { eu: "44", us: "10", uk: "9", cm: "28" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-2 font-medium">{row.eu}</td>
                    <td className="px-4 py-2 text-neutral-500">{row.us}</td>
                    <td className="px-4 py-2 text-neutral-500">{row.uk}</td>
                    <td className="px-4 py-2 text-neutral-500">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-xs text-neutral-500">
            * Ces mesures sont indicatives. Si vous êtes entre deux tailles, nous vous conseillons de prendre la taille au-dessus.
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // Derive product directly from data
  const product = products.find(p => p.id === parseInt(id));

  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.color || "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const wishlistId = product?.id ?? product?.articleId ?? product?.productId;
  const isWishlisted = isInWishlist(wishlistId);
  const [showFavNotification, setShowFavNotification] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [expandedSpec, setExpandedSpec] = useState(false);
  const [prevId, setPrevId] = useState(id);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (id !== prevId && product) {
    setPrevId(id);
    setSelectedSize(product.sizes?.[0] || "");
    setSelectedColor(product.color || "");
    setSelectedImage(0);
  }

  useEffect(() => {
    if (!product) {
      navigate("/shop");
    }
  }, [product, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-neutral-200 border-t-orange-600 rounded-full"
        />
      </div>
    );
  }

  // Functional Handlers
  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 600)); // Fake network delay
    
    addToCart({ 
      ...product, 
      size: selectedSize || "Unique",
      color: selectedColor,
      quantity: quantity 
    });
    
    toast.success("Ajouté au panier", {
      description: `${product.name} - ${selectedColor} - ${selectedSize || "Unique"}`,
    });

    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    setShowFavNotification(true);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Découvre ${product.name} sur LID !`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Lien copié !");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mock data for display
  const mockSpecs = [
    { label: "Marque", value: product.brand || "Brand" },
    { label: "Modèle", value: product.name || "Model" },
    { label: "Couleur", value: selectedColor || product.color || "Blanc" },
    { label: "Matériau", value: "Cuir, Textile" },
    { label: "Poids", value: "350g" },
    { label: "Dimensions", value: "30 x 20 x 10 cm" },
    { label: "Référence", value: `REF-${product.id}` },
    { label: "Date de première disponibilité", value: "15 janvier 2025" }
  ];

  const frequentlyBoughtTogether = products.slice(0, 3);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  // Scroll detection for sticky bar
  const [showStickyBar, setShowStickyBar] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setShowStickyBar(latest > 600);
    });
  }, [scrollY]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 relative overflow-hidden">
      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] px-4 py-3 md:py-4"
          >
            <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
              {/* Product Info (Hidden on small mobile) */}
              <div className="hidden md:flex items-center gap-4">
                <img src={product.image} alt={product.name} className="w-12 h-12 object-contain bg-neutral-100 rounded-md" />
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-1">{product.name}</h3>
                  <div className="text-sm text-neutral-500">
                    <span className="font-medium text-orange-600">{product.price.toLocaleString()} FCFA</span>
                    {product.originalPrice && (
                      <span className="ml-2 text-xs line-through">{product.originalPrice.toLocaleString()} FCFA</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                 <div className="hidden sm:block">
                    <select 
                      value={selectedSize} 
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-sm"
                    >
                      {product.sizes?.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 
                 <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex-1 md:flex-none h-10 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                 >
                   {isAdding ? (
                     <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <>
                       <ShoppingBag size={16} />
                       <span className="hidden sm:inline">Ajouter</span>
                     </>
                   )}
                 </button>

                 <button
                   onClick={() => setShowCheckout(true)}
                   className="flex-1 md:flex-none h-10 px-6 bg-orange-600 text-white font-bold text-sm rounded-full hover:bg-orange-700 transition-colors whitespace-nowrap shadow-lg shadow-orange-600/20"
                 >
                   Acheter
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-40 dark:opacity-30">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3], 
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-orange-500/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-normal" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3], 
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-normal" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-purple-500/20 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-normal" 
        />
      </div>

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
      
      <CheckoutFlow 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)}
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        quantity={quantity}
      />

      {/* Top Bar - Style Amazon */}
      <div className="dark:bg-[#131921] bg-amber-500 text-white py-2 sticky top-0 z-40">
        <div className="max-w-[1500px] mx-auto px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:underline font-bold text-lg tracking-tight">Détail du produit</Link>
          </div>
          <div className="flex items-center gap-4">
           
            <Link to="/shop" className="hover:underline hidden sm:block">Retours & Commandes</Link>
            
          </div>
        </div>
      </div>

      {/* Breadcrumb Amazon Style */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 py-3 sticky top-[36px] z-30">
        <div className="max-w-[1500px] mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <Link to="/" className="hover:text-orange-600 hover:underline">Accueil</Link>
            <span>›</span>
            <Link to="/shop" className="hover:text-orange-600 hover:underline">Catalogue</Link>
            <span>›</span>
            <span className="text-orange-600 font-medium">{product.category || "Produits"}</span>
          </div>
        </div>
      </div>

      <motion.div 
        className="max-w-[1500px] mx-auto px-4 py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - Images */}
          <motion.div className="lg:col-span-5" variants={itemVariants}>
            <div className="sticky top-24">
              {/* Main Image */}
              <motion.div 
                className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 mb-4 shadow-2xl overflow-hidden relative group perspective-1000"
                layoutId={`product-bg-${product.id}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d"
                }}
              >
                <div className="aspect-square relative cursor-zoom-in transform-style-3d">
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={`${selectedImage}-${selectedColor}`}
                      src={product.image} 
                      alt={product.name} 
                      initial={{ opacity: 0, scale: 0.8, z: -100, rotate: -5 }}
                      animate={{ opacity: 1, scale: 1, z: 50, rotate: 0 }}
                      exit={{ opacity: 0, scale: 1.1, z: 100, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal z-20 relative drop-shadow-2xl"
                      style={{ transform: "translateZ(50px)" }}
                    />
                  </AnimatePresence>
                  
                  {/* Decorative circle behind image */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-full -z-0 opacity-50"
                    style={{ transform: "translateZ(20px)" }}
                  />
                  
                  {product.tag && (
                    <motion.span 
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute top-0 left-0 bg-gradient-to-r from-[#CC0C39] to-red-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg shadow-md z-30"
                      style={{ transform: "translateZ(80px)" }}
                    >
                      {product.tag}
                    </motion.span>
                  )}
                </div>
              </motion.div>

              {/* Thumbnails */}
              <motion.div 
                className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
                variants={containerVariants}
              >
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <motion.button
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-xl overflow-hidden transition-all bg-white dark:bg-neutral-800 ${
                      selectedImage === idx ? 'border-orange-500 shadow-md ring-2 ring-orange-200 dark:ring-orange-900' : 'border-neutral-200 dark:border-neutral-700 hover:border-orange-300'
                    }`}
                  >
                    <img src={product.image} alt="" className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal" />
                  </motion.button>
                ))}
              </motion.div>

              {/* Share & Actions */}
              <div className="flex gap-4 mt-2 text-sm justify-center">
                <motion.button 
                  whileHover={{ scale: 1.05, color: "#EA580C" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full"
                >
                  <Share2 size={16} />
                  Partager
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* MIDDLE COLUMN - Product Details */}
          <motion.div className="lg:col-span-4" variants={itemVariants}>
            {/* Title & Rating */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 leading-tight"
            >
              {product.name}
            </motion.h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div 
                onClick={scrollToReviews}
                className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md border border-yellow-100 dark:border-yellow-900/30 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
              >
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(product.rating) ? "#FFA41C" : "none"} 
                    className={i < Math.floor(product.rating) ? "text-[#FFA41C]" : "text-neutral-300"}
                  />
                ))}
                <span className="ml-2 text-sm font-bold text-[#B12704] dark:text-[#FFA41C]">
                  {product.rating}
                </span>
              </div>
              <button 
                onClick={scrollToReviews}
                className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer underline decoration-dotted bg-transparent border-none p-0"
              >
                {product.reviews?.toLocaleString()} évaluations
              </button>
            </div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="border-t border-b border-neutral-200 dark:border-neutral-800 py-6 mb-6 bg-neutral-50/50 dark:bg-neutral-900/50 -mx-4 px-4 rounded-xl"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-[#B12704] dark:text-orange-500">
                  {product.price.toLocaleString()} FCFA
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-neutral-500 line-through decoration-red-500 decoration-2">
                    {product.originalPrice.toLocaleString()} FCFA
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-2 text-sm text-[#CC0C39] font-bold bg-red-50 dark:bg-red-900/20 w-fit px-2 py-1 rounded"
                >
                  Économisez {(product.originalPrice - product.price).toLocaleString()} FCFA ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)
                </motion.div>
              )}
              <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                Prix TTC. Retours gratuits.
              </div>
            </motion.div>

            {/* Colors */}
            <div className="mb-8">
               <span className="text-sm font-bold text-neutral-900 dark:text-white mb-3 block">
                  Couleur: <span className="font-normal text-orange-600">{selectedColor}</span>
               </span>
               <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <motion.button
                      key={color.name}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center relative ${
                        selectedColor === color.name 
                          ? 'border-orange-600 shadow-lg shadow-orange-500/30' 
                          : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                      }`}
                      title={color.name}
                    >
                      <div 
                        className="w-10 h-10 rounded-full border border-black/10 shadow-inner" 
                        style={{ backgroundColor: color.hex }}
                      />
                      {selectedColor === color.name && (
                        <motion.div 
                          layoutId="activeColor"
                          className="absolute inset-0 rounded-full border-2 border-orange-600"
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        />
                      )}
                    </motion.button>
                  ))}
               </div>
            </div>

            {/* À propos section */}
            <div className="mb-8 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-orange-500" /> À propos de cet article
              </h2>
              <ul className="space-y-3 text-sm">
                {[
                  "Qualité premium avec finitions soignées",
                  "Confort optimal pour un usage quotidien",
                  "Design moderne et élégant",
                  "Matériaux durables et écologiques",
                  "Garantie fabricant 2 ans"
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex gap-3 items-start"
                  >
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Specifications détaillées */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
              <h2 className="font-bold text-lg mb-4 text-neutral-900 dark:text-white">Détails sur le produit</h2>
              <div className="space-y-2 text-sm">
                {mockSpecs.slice(0, expandedSpec ? mockSpecs.length : 5).map((spec, idx) => (
                  <motion.div 
                    key={idx} 
                    className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 p-2 rounded transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">{spec.label}</span>
                    <span className="sm:col-span-2 text-neutral-900 dark:text-white font-medium">{spec.value}</span>
                  </motion.div>
                ))}
              </div>
              {mockSpecs.length > 5 && (
                <button 
                  onClick={() => setExpandedSpec(!expandedSpec)}
                  className="mt-4 text-sm text-[#007185] hover:text-[#C7511F] flex items-center gap-1 group font-medium"
                >
                  {expandedSpec ? 'Voir moins' : 'Voir plus'}
                  <ChevronDown size={14} className={`transition-transform duration-300 ${expandedSpec ? 'rotate-180' : 'group-hover:translate-y-1'}`} />
                </button>
              )}
            </div>
          </motion.div>

          {/* RIGHT COLUMN - Buy Box */}
          <motion.div className="lg:col-span-3" variants={itemVariants}>
            <div className="sticky top-24">
              <motion.div 
                className="border border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 bg-white dark:bg-neutral-900 shadow-xl"
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Prix */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#B12704] dark:text-white">{product.price.toLocaleString()} FCFA</span>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 flex items-center gap-2">
                    <Truck size={16} className="text-[#007600]" />
                    <span><span className="text-[#007600] font-bold">Livraison GRATUITE</span> lundi 6 janvier</span>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 pl-6">
                    Ou livraison plus rapide <span className="font-bold text-neutral-900 dark:text-white">demain 4 janvier</span>
                  </div>
                </div>

                {/* Disponibilité */}
                <div className="mb-6">
                  <div className="text-lg text-[#007600] font-bold mb-2 flex items-center gap-2">
                    <Check size={20} strokeWidth={3} /> En stock
                  </div>
                  <div className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                    Vendu par <span className="font-bold text-orange-600">LID </span> et expédié par <span className="font-bold text-[#007185]">Structure</span>
                  </div>
                </div>

                {/* Options */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-neutral-900 dark:text-white">
                        Taille: <span className="font-normal">{selectedSize}</span>
                      </label>
                      <button 
                        onClick={() => setShowSizeGuide(true)}
                        className="text-xs text-[#007185] hover:text-[#C7511F] flex items-center gap-1 group"
                      >
                        <Ruler size={12} className="group-hover:rotate-12 transition-transform" /> Guide des tailles
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {product.sizes.map(size => (
                        <motion.button
                          key={size}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSize(size)}
                          className={`py-2 rounded-md text-sm font-medium border transition-colors ${
                            selectedSize === size 
                              ? "bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-400"
                              : "border-neutral-200 dark:border-neutral-700 hover:border-orange-300"
                          }`}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantité */}
                <div className="mb-6">
                  <label className="text-sm font-bold mb-2 block text-neutral-900 dark:text-white">Quantité:</label>
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm bg-white dark:bg-neutral-800 cursor-pointer hover:border-orange-500 outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    whileHover={!isAdding ? { scale: 1.02 } : {}}
                    whileTap={!isAdding ? { scale: 0.98 } : {}}
                    className={`w-full py-3 rounded-full text-sm font-bold shadow-md transition-all relative overflow-hidden ${
                      isAdding 
                        ? "bg-green-500 text-white" 
                        : "bg-[#FFD814] hover:bg-[#F7CA00] text-black"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {isAdding ? (
                        <motion.div
                          key="success"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          Ajouté !
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-5 h-5" />
                          Ajouter au panier
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-3 bg-[#FFA41C] hover:bg-[#FA8900] text-black rounded-full text-sm font-bold shadow-md"
                  >
                    Commander maintenant
                  </motion.button>
                </div>

                {/* Sécurité */}
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-500">Transaction sécurisée</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={14} className="text-neutral-400 mt-0.5" />
                    <span>Expédié par Amazon - Emballage d'origine</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <RotateCcw size={14} className="text-neutral-400 mt-0.5" />
                    <span>Retours gratuits jusqu'au 31 janv. 2026</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Gift size={14} className="text-neutral-400 mt-0.5" />
                    <span>Option d'emballage cadeau disponible</span>
                  </div>
                </div>

                {/* Ajouter à la liste */}
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWishlist}
                  className="w-full mt-4 text-sm text-[#007185] hover:text-[#C7511F] flex items-center justify-center gap-2 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg transition-colors"
                >
                  <Heart size={16} fill={isWishlisted ? "#C7511F" : "none"} className={isWishlisted ? "text-[#C7511F]" : ""} />
                  {isWishlisted ? "Retirer de la liste" : "Ajouter à une liste"}
                </motion.button>
              </motion.div>

              {/* Promotions */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="mt-4 border border-neutral-300 dark:border-neutral-700 rounded-xl p-4 bg-white dark:bg-neutral-900 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <Info size={16} className="text-[#007185] dark:text-blue-400" />
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-neutral-900 dark:text-white mb-1">
                      Promotions disponibles
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400 text-xs space-y-1">
                      <div>• Économisez 5% avec un abonnement</div>
                      <div>• Carte de crédit Amazon: -13100 FCFA sur votre première commande</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Fréquemment achetés ensemble */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 border-t border-neutral-200 dark:border-neutral-800 pt-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white flex items-center gap-2">
            <Package className="text-orange-500" /> Fréquemment achetés ensemble
          </h2>
          <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 relative z-10">
              <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-8">
                {frequentlyBoughtTogether.slice(0, 3).map((item, idx) => (
                  <Fragment key={item.id}>
                    <motion.div 
                      whileHover={{ scale: 1.1, y: -10, rotate: idx % 2 === 0 ? 2 : -2 }}
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      <div className="w-24 h-24 lg:w-32 lg:h-32 border border-white/50 dark:border-white/10 rounded-2xl p-4 bg-white/40 dark:bg-black/20 shadow-lg backdrop-blur-sm group-hover:shadow-orange-500/20 group-hover:border-orange-500/30 transition-all duration-300">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-md" />
                      </div>
                      <Link to={`/product/${item.id}`} className="mt-4 text-sm text-neutral-700 dark:text-neutral-300 hover:text-orange-600 font-bold text-center w-28 lg:w-36 leading-tight">
                        {item.name}
                      </Link>
                      <span className="text-orange-600 font-extrabold mt-1">{item.price.toLocaleString()} FCFA</span>
                    </motion.div>
                    {idx < 2 && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 shadow-inner">
                        <span className="text-xl font-light mb-1">+</span>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
              <div className="w-full lg:w-auto lg:ml-auto flex flex-col items-center lg:items-end min-w-[240px] border-t lg:border-t-0 lg:border-l border-neutral-200/50 dark:border-neutral-700/50 pt-8 lg:pt-0 lg:pl-12">
                 <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Prix total pour les 3:</span>
                 <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-6">
                   {frequentlyBoughtTogether.slice(0, 3).reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} FCFA
                 </span>
                 <motion.button 
                   whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.4)" }}
                   whileTap={{ scale: 0.95 }}
                   className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                 >
                   <ShoppingBag size={18} />
                   Ajouter le pack au panier
                 </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Avis Clients */}
        <ReviewSection productId={product.id} />

      </motion.div>

      <FavoriteNotification 
        isVisible={showFavNotification} 
        onClose={() => setShowFavNotification(false)}
        product={product}
        isAdding={isWishlisted}
      />
    </div>
  );
}
