import { useState, useMemo, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Heart, 
  Filter, 
  Check, 
  ChevronDown, 
  Star,
  Share2,
  X,
  LayoutGrid,
  List,
  ChevronRight
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "../provider/CartContext";
import { useWishlist } from "../provider/WishlistContext";
import { products, categories, brands, colors, priceRanges } from "../data/products";
import FavoriteNotification from "./FavoriteNotification";

// --- Components ---

const ProductSection = ({ title, products, onSeeAll }) => {
  if (!products || products.length === 0) return null;
  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{title}</h2>
        {onSeeAll && (
          <button 
            onClick={onSeeAll}
            className="text-sm font-bold text-orange-600 hover:underline flex items-center gap-1"
          >
            Voir tout <ChevronRight size={16} />
          </button>
        )}
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 -mx-1 px-1 no-scrollbar snap-x">
        {products.map(product => (
          <div key={product.id} className="min-w-[220px] sm:min-w-[240px] max-w-[240px] snap-start h-full">
             <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

const FilterCheckbox = ({ label, checked, onChange, count }) => (
  <label className="flex items-center gap-3 cursor-pointer group py-1.5">
    <div className={`w-4 h-4 rounded flex items-center justify-center transition-all border ${checked ? 'bg-orange-600 border-orange-600' : 'border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400'}`}>
      {checked && <Check className="w-3 h-3 text-white" />}
    </div>
    <input type="checkbox" className="hidden" onChange={onChange} checked={checked} />
    <span className={`text-sm flex-1 ${checked ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
      {label}
    </span>
    {count && <span className="text-xs text-neutral-400">({count})</span>}
  </label>
);

const RatingFilter = ({ stars, checked, onChange }) => (
  <button onClick={onChange} className="flex items-center gap-2 py-1 group w-full text-left">
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          fill={i < stars ? "currentColor" : "none"} 
          className={i < stars ? "text-yellow-400" : "text-neutral-300 dark:text-neutral-700"}
          strokeWidth={i < stars ? 0 : 1.5}
        />
      ))}
    </div>
    <span className={`text-sm group-hover:text-orange-600 ${checked ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'}`}>
      & plus
    </span>
  </button>
);

const FilterSection = ({ title, children, isOpen = true }) => {
  const [open, setOpen] = useState(isOpen);
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 py-5 last:border-0">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{title}</h4>
        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FiltersContent = ({ 
  selectedCategories, setSelectedCategories,
  selectedBrands, setSelectedBrands,
  selectedPriceRange, setSelectedPriceRange,
  selectedColors, setSelectedColors,
  minRating, setMinRating,
  clearFilters
}) => {
  const toggleFilter = (setList, item) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <div className="space-y-2">
       {/* Active Filters Summary */}
       {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedPriceRange || minRating) && (
         <div className="mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-bold text-sm">Filtres actifs</h3>
             <button onClick={clearFilters} className="text-xs text-orange-600 hover:underline">Effacer</button>
           </div>
         </div>
       )}

       <FilterSection title="Avis client">
         <div className="space-y-1">
           {[4, 3, 2, 1].map(stars => (
             <RatingFilter 
               key={stars} 
               stars={stars} 
               checked={minRating === stars} 
               onChange={() => setMinRating(minRating === stars ? null : stars)} 
             />
           ))}
         </div>
       </FilterSection>

       <FilterSection title="Marques">
         <div className="space-y-1">
           {brands.map(brand => (
             <FilterCheckbox 
               key={brand} 
               label={brand} 
               checked={selectedBrands.includes(brand)}
               onChange={() => toggleFilter(setSelectedBrands, brand)}
             />
           ))}
         </div>
       </FilterSection>

       <FilterSection title="Catégories">
         <div className="space-y-1">
           {categories.map(cat => (
             <FilterCheckbox 
               key={cat} 
               label={cat} 
               checked={selectedCategories.includes(cat)}
               onChange={() => toggleFilter(setSelectedCategories, cat)}
             />
           ))}
         </div>
       </FilterSection>

       <FilterSection title="Prix">
         <div className="space-y-1">
           {priceRanges.map((range, idx) => (
             <label key={idx} className="flex items-center gap-3 cursor-pointer group py-1.5 hover:text-orange-600">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPriceRange === range ? 'border-orange-600' : 'border-neutral-300 dark:border-neutral-700'}`}>
                   {selectedPriceRange === range && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                </div>
                <input 
                  type="radio" 
                  name="price" 
                  className="hidden" 
                  onChange={() => setSelectedPriceRange(selectedPriceRange === range ? null : range)} 
                  checked={selectedPriceRange === range} 
                />
                <span className={`text-sm ${selectedPriceRange === range ? 'font-bold' : ''}`}>{range.label}</span>
             </label>
           ))}
         </div>
       </FilterSection>

       <FilterSection title="Couleurs">
          <div className="flex flex-wrap gap-2">
            {colors.map(col => (
              <button
                key={col.name}
                onClick={() => toggleFilter(setSelectedColors, col.name)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(col.name) ? 'border-orange-600 scale-110' : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'}`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                <span className="sr-only">{col.name}</span>
              </button>
            ))}
          </div>
       </FilterSection>
    </div>
  );
};

export const ProductCard = ({ product, onWishlistToggle, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const navigate = useNavigate();

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isAdding = !isWishlisted;
    toggleWishlist(product);
    if (onWishlistToggle) {
      onWishlistToggle(product, isAdding);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Découvre ${product.name} sur LID !`,
          url: `${window.location.origin}/product/${product.id}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
        toast.success("Lien copié !");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        className="group flex flex-col sm:flex-row w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative"
      >
        {/* Image Area - Smaller for List View */}
        <motion.div 
          layoutId={`product-bg-${product.id}`}
          className="relative w-full sm:w-48 aspect-[4/5] sm:aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0"
        >
          {/* Badges */}
          <div className="absolute top-0 left-0 p-2 z-10 flex flex-col gap-1 items-start">
             {product.tag && (
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm ${product.tag.includes('Best') || product.tag.includes('Meilleure') ? 'bg-[#FFD814] text-black' : product.tag.includes('LID') ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'}`}>
                {product.tag}
              </span>
            )}
          </div>
          
          <Link to={`/product/${product.id}`} className="block w-full h-full">
            <motion.img 
              src={product.image} 
              alt={product.name}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
            />
          </Link>
        </motion.div>

        {/* Product Details - List Layout */}
        <div className="flex-1 flex flex-col p-4 gap-2">
          <div className="flex justify-between items-start">
            <Link to={`/product/${product.id}`}>
              <h3 className="font-medium text-lg text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            
            <div className="flex gap-2">
              <button 
                onClick={handleWishlist}
                className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-orange-500 text-orange-500" : ""}`} />
              </button>
              <button 
                onClick={handleShare}
                className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex text-[#FFA41C]">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                  className={i < Math.floor(product.rating) ? "text-[#FFA41C]" : "text-neutral-300 dark:text-neutral-600"}
                />
              ))}
            </div>
            <span className="text-xs text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer font-medium">{product.reviews.toLocaleString()}</span>
          </div>

          {/* Description or extra info could go here */}
          <p className="text-sm text-neutral-500 line-clamp-2 mt-1 hidden sm:block">
            {product.description || "Découvrez ce produit exceptionnel de la collection LID."}
          </p>

          <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Price Block */}
            <div className="flex flex-col">
               <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                   {product.price.toLocaleString()} <span className="text-sm">FCFA</span>
                 </span>
                 {product.originalPrice && (
                   <span className="text-xs text-neutral-500 line-through">
                     {product.originalPrice.toLocaleString()} FCFA
                   </span>
                 )}
               </div>
               
               {/* Delivery Info */}
               <div className="space-y-1">
                  {product.isPrime && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-900 dark:text-white">
                      <span className="font-bold italic text-cyan-600 flex items-center">
                        <Check size={14} strokeWidth={4} className="mr-0.5 text-[#FFD814]" />
                        LID <span className="text-[#FF9900] not-italic ml-0.5">Premium</span>
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    Livraison <span className="font-bold text-neutral-900 dark:text-white">GRATUITE</span> {product.deliveryDate}
                  </div>
               </div>
            </div>

            {/* Add to Cart Button */}
            <button 
               onClick={() => { 
                 addToCart({ ...product, size: product.sizes[0] || 'Unique' });
                 toast.success("Ajouté au panier");
               }}
               className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
             >
               <ShoppingBag size={16} />
               Ajouter au panier
             </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="group flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative"
    >
      {/* Image Area */}
      <div 
        className="relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 overflow-hidden"
      >
        {/* Badges */}
        <div className="absolute top-0 left-0 p-2 z-10 flex flex-col gap-1 items-start">
           {product.tag && (
            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm ${product.tag.includes('Best') || product.tag.includes('Meilleure') ? 'bg-[#FFD814] text-black' : product.tag.includes('LID') ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'}`}>
              {product.tag}
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
          <button 
            onClick={handleWishlist}
            className="p-1.5 sm:p-2 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-neutral-700 backdrop-blur-sm rounded-full text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? "fill-orange-500 text-orange-500" : ""}`} />
          </button>
          
          <button 
            onClick={handleShare}
            className="hidden sm:block p-2 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-neutral-700 backdrop-blur-sm rounded-full text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm translate-x-10 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 duration-300"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <motion.img 
            src={product.image} 
            alt={product.name}
            loading="lazy"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>

      {/* Product Details - Amazon Modern Style */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 gap-1.5 sm:gap-2">
        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug text-sm sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex text-[#FFA41C]">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                className={i < Math.floor(product.rating) ? "text-[#FFA41C]" : "text-neutral-300 dark:text-neutral-600"}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer font-medium">({product.reviews})</span>
        </div>

        {/* Price Block */}
        <div className="flex items-baseline gap-1.5 mt-0.5">
           <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
             {product.price.toLocaleString()} <span className="text-xs sm:text-sm">FCFA</span>
           </span>
           {product.originalPrice && (
             <span className="text-[10px] sm:text-xs text-neutral-500 line-through">
               {product.originalPrice.toLocaleString()}
             </span>
           )}
        </div>

        {/* Delivery Info - Hidden on very small screens if needed, or simplified */}
        <div className="space-y-0.5 mb-2 hidden sm:block">
           {product.isPrime && (
             <div className="flex items-center gap-1.5 text-xs text-neutral-900 dark:text-white">
               <span className="font-bold italic text-cyan-600 flex items-center">
                 <Check size={14} strokeWidth={4} className="mr-0.5 text-[#FFD814]" />
                 LID <span className="text-[#FF9900] not-italic ml-0.5">Premium</span>
               </span>
             </div>
           )}
           <div className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
             Livraison <span className="font-bold text-neutral-900 dark:text-white">GRATUITE</span> {product.deliveryDate}
           </div>
        </div>

        {/* Add to Cart Button - Always Visible */}
        <div className="mt-auto">
          <button 
             onClick={(e) => {
               e.preventDefault();
               addToCart({ ...product, size: product.sizes[0] || 'Unique' });
               toast.success("Ajouté au panier");
             }}
             className="w-full py-2 sm:py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95"
           >
             <ShoppingBag size={14} className="sm:w-4 sm:h-4" />
             <span className="hidden sm:inline">Ajouter au panier</span>
             <span className="inline sm:hidden">Ajouter</span>
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Catalog({ showFilters = true, showHeader = true, limit = null }) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Sync category from URL params
  useEffect(() => {
    if (categoryParam) {
      // Use requestAnimationFrame to avoid synchronous setState warning
      const frame = requestAnimationFrame(() => setSelectedCategories([categoryParam]));
      return () => cancelAnimationFrame(frame);
    }
  }, [categoryParam]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [minRating, setMinRating] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [favNotification, setFavNotification] = useState({ show: false, product: null, isAdding: true });

  const handleWishlistToggle = (product, isAdding) => {
    setFavNotification({
      show: true,
      product,
      isAdding
    });
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchColor = selectedColors.length === 0 || selectedColors.includes(product.color);
      const matchPrice = !selectedPriceRange || (product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max);
      const matchRating = !minRating || product.rating >= minRating;
      
      const matchSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchBrand && matchColor && matchPrice && matchRating && matchSearch;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') result.sort((a, b) => b.id - a.id);
    else if (sortBy === 'reviews') result.sort((a, b) => b.reviews - a.reviews);
    
    return result;
  }, [selectedCategories, selectedBrands, selectedColors, selectedPriceRange, minRating, sortBy, searchQuery]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedPriceRange(null);
    setMinRating(null);
  };

  const isDefaultView = !searchQuery && 
    selectedCategories.length === 0 && 
    selectedBrands.length === 0 && 
    selectedColors.length === 0 && 
    !selectedPriceRange && 
    !minRating && 
    sortBy === 'featured';

  return (
    <div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans">
      
      {/* Header Bar - Responsive & Glassmorphism */}
      {showHeader && (
        <div className="sticky top-0 mt-5 lg:mt-0 z-40 w-full transition-all duration-300">
          <div className="absolute inset-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 shadow-sm supports-[backdrop-filter]:bg-white/60" />
          
          <div className="relative max-w-[1600px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pb-1">
              
              {/* Left: Results Count & Mobile Filter Trigger */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-baseline gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                  <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    {filteredProducts.length}
                  </span>
                  <span className="font-medium hidden sm:inline">résultats</span>
                  <span className="font-medium sm:hidden">res.</span>
                </div>

                {/* Mobile Filter Button (Visible only on lg and below) */}
                <button 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-xs font-bold shadow-lg shadow-neutral-200 dark:shadow-neutral-900/50 active:scale-95 transition-all whitespace-nowrap"
                >
                  <Filter size={12} strokeWidth={2.5} />
                  Filtres
                </button>
              </div>

              {/* Right: Sort & View Options */}
              <div className="flex items-center gap-2 flex-shrink-0">
                
                {/* Sort Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-xs sm:text-sm px-3 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all whitespace-nowrap">
                    <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline">Trier par:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {sortBy === 'featured' ? 'Pertinence' : sortBy === 'price-asc' ? 'Prix croissant' : sortBy === 'price-desc' ? 'Prix décroissant' : sortBy === 'newest' ? 'Nouveautés' : 'Avis'}
                    </span>
                    <ChevronDown size={14} className="text-neutral-400" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl shadow-neutral-200/50 dark:shadow-black/50 border border-neutral-100 dark:border-neutral-800 hidden group-hover:block p-1.5 z-50 transform origin-top-right transition-all">
                    {[
                       { label: 'Pertinence', value: 'featured' },
                       { label: 'Nouveautés', value: 'newest' },
                       { label: 'Prix croissant', value: 'price-asc' },
                       { label: 'Prix décroissant', value: 'price-desc' },
                       { label: 'Avis clients', value: 'reviews' },
                    ].map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors flex items-center justify-between group/item ${
                          sortBy === opt.value 
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold' 
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        {opt.label}
                        {sortBy === opt.value && <Check size={14} className="text-neutral-900 dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block"></div>

                {/* View Toggle */}
                <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }`}
                    title="Vue Grille"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }`}
                    title="Vue Liste"
                  >
                    <List size={16} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-[1400px] mx-auto px-1 py-6 flex gap-8 pb-24 ${!showHeader ? 'pt-0' : ''}`}>
        
        {/* Left Sidebar */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0 hidden lg:block space-y-2 sticky top-28 h-[calc(100vh-7rem)] overflow-y-auto pr-2 custom-scrollbar">
             <FiltersContent 
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={setSelectedPriceRange}
                selectedColors={selectedColors}
                setSelectedColors={setSelectedColors}
                minRating={minRating}
                setMinRating={setMinRating}
                clearFilters={clearFilters}
             />
          </aside>
        )}

        {/* Main Grid */}
        <main className="flex-1">
           {isDefaultView ? (
             <div className="space-y-2 pb-12">
               {categories.map(cat => (
                 <ProductSection 
                   key={cat}
                   title={cat}
                   products={products.filter(p => p.category === cat)}
                   onSeeAll={() => setSelectedCategories([cat])}
                 />
               ))}
             </div>
           ) : (
             <>
               {filteredProducts.length > 0 ? (
                 <div className={viewMode === 'grid' 
                   ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6"
                   : "flex flex-col gap-4"
                 }>
                  {filteredProducts.slice(0, limit || filteredProducts.length).map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onWishlistToggle={handleWishlistToggle}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                   <Filter className="w-12 h-12 text-neutral-300 mb-4" />
                   <h3 className="text-lg font-bold">Aucun résultat</h3>
                   <p className="text-neutral-500 mb-4">Essayez de modifier vos filtres.</p>
                   <button onClick={clearFilters} className="text-orange-600 font-bold hover:underline">
                     Tout effacer
                   </button>
                 </div>
               )}
               
               {/* Pagination (Mock) */}
               {filteredProducts.length > 0 && !limit && (
                 <div className="mt-12 flex justify-center py-8 border-t border-neutral-200 dark:border-neutral-800">
                   <div className="flex gap-2">
                     <button className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-400 cursor-not-allowed">Précédent</button>
                     <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold">1</button>
                     <button className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900">2</button>
                     <button className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900">3</button>
                     <span className="px-4 py-2">...</span>
                     <button className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900">Suivant</button>
                   </div>
                 </div>
               )}
             </>
           )}
        </main>

      </div>
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-neutral-950 z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-950 sticky top-0 z-10">
                <h2 className="font-bold text-lg">Filtres</h2>
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <FiltersContent 
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedBrands={selectedBrands}
                  setSelectedBrands={setSelectedBrands}
                  selectedPriceRange={selectedPriceRange}
                  setSelectedPriceRange={setSelectedPriceRange}
                  selectedColors={selectedColors}
                  setSelectedColors={setSelectedColors}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  clearFilters={clearFilters}
                />
              </div>
              
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky bottom-0 z-10">
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full shadow-lg transition-all active:scale-95"
                >
                  Afficher {filteredProducts.length} résultats
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FavoriteNotification 
        isVisible={favNotification.show} 
        onClose={() => setFavNotification(prev => ({ ...prev, show: false }))}
        product={favNotification.product}
        isAdding={favNotification.isAdding}
      />
    </div>
  );
}
