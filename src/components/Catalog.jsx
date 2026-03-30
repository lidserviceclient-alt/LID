import { useState, useMemo, useEffect, useRef } from "react";
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
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { getCatalogProductsPage } from "@/services/productService";
import { resolveBackendAssetUrl } from "@/services/categoryService";
import FavoriteNotification from "./FavoriteNotification";
import { useCatalogBootstrap } from "@/features/catalog/CatalogBootstrapContext";

// --- Components ---

const priceRanges = [
  { label: "Moins de 5 000", min: 0, max: 4999 },
  { label: "5 000 - 10 000", min: 5000, max: 10000 },
  { label: "10 000 - 25 000", min: 10000, max: 25000 },
  { label: "25 000 - 50 000", min: 25000, max: 50000 },
  { label: "Plus de 50 000", min: 50000, max: Number.POSITIVE_INFINITY },
];

const parseCsvParam = (value) => {
  const raw = `${value || ""}`.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => `${v || ""}`.trim())
    .filter(Boolean);
};

const normalizeSortParam = (value) => {
  const v = `${value || ""}`.trim().toLowerCase();
  if (!v) return "featured";
  if (v === "featured" || v === "pertinence") return "featured";
  if (v === "newest" || v === "nouveautes" || v === "nouveautés") return "newest";
  if (v === "price-asc" || v === "prix-asc" || v === "prixcroissant") return "price-asc";
  if (v === "price-desc" || v === "prix-desc" || v === "prixdecroissant") return "price-desc";
  if (v === "reviews" || v === "avis" || v === "avis-clients") return "featured";
  if (v === "bestsellers" || v === "best-sellers" || v === "trending") return "featured";
  return "featured";
};

const FALLBACK_PRODUCT_IMAGE = "/imgs/logo.png";

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
  categoryOptions = [],
  brandOptions = [],
  colorOptions = [],
  showRatingFilter = false,
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
       {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedPriceRange || (showRatingFilter && minRating)) && (
         <div className="mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-bold text-sm">Filtres actifs</h3>
             <button onClick={clearFilters} className="text-xs text-orange-600 hover:underline">Effacer</button>
           </div>
         </div>
       )}

       {showRatingFilter ? (
         <FilterSection title="Avis client">
           <div className="space-y-1">
             {[4, 3, 2, 1].map((stars) => (
               <RatingFilter 
                 key={stars} 
                 stars={stars} 
                 checked={minRating === stars} 
                 onChange={() => setMinRating(minRating === stars ? null : stars)} 
               />
             ))}
           </div>
         </FilterSection>
       ) : null}

       {brandOptions.length > 0 ? (
         <FilterSection title="Marques">
           <div className="space-y-1">
             {brandOptions.map((brand) => (
               <FilterCheckbox 
                 key={brand.value} 
                 label={brand.label} 
                 checked={selectedBrands.includes(brand.value)}
                 onChange={() => toggleFilter(setSelectedBrands, brand.value)}
                 count={brand.count}
               />
             ))}
           </div>
         </FilterSection>
       ) : null}

       {categoryOptions.length > 0 ? (
         <FilterSection title="Catégories">
           <div className="space-y-1">
             {categoryOptions.map((cat) => (
               <FilterCheckbox 
                 key={cat.value} 
                 label={cat.label} 
                 checked={selectedCategories.includes(cat.value)}
                 onChange={() => toggleFilter(setSelectedCategories, cat.value)}
                 count={cat.count}
               />
             ))}
           </div>
         </FilterSection>
       ) : null}

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

       {colorOptions.length > 0 ? (
         <FilterSection title="Couleurs">
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((col) => (
                <button
                  key={col.value}
                  onClick={() => toggleFilter(setSelectedColors, col.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(col.value) ? 'border-orange-600 scale-110' : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'}`}
                  style={{ backgroundColor: col.hex }}
                  title={col.label}
                >
                  <span className="sr-only">{col.label}</span>
                </button>
              ))}
            </div>
         </FilterSection>
       ) : null}
    </div>
  );
};

export const ProductCard = ({ product, onWishlistToggle, viewMode = 'grid', enableMotion = true }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlistId = product?.id ?? product?.articleId ?? product?.productId;
  const isWishlisted = isInWishlist(wishlistId);
  const price = Number(product?.price) || 0;
  const rating = Number(product?.rating) || 0;
  const reviews = Number(product?.reviews) || 0;

  const rawImage = product?.mainImageUrl;
  const resolvedImage = rawImage ? resolveBackendAssetUrl(rawImage) : "";
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedImage]);

  const hasRealImage = Boolean(resolvedImage) && !imageFailed;
  const imageSrc = hasRealImage ? resolvedImage : FALLBACK_PRODUCT_IMAGE;
  const imageIsPlaceholder = !hasRealImage;
  const CardWrapper = enableMotion ? motion.div : "div";
  const ImageWrapper = enableMotion ? motion.div : "div";
  const ImageTag = enableMotion ? motion.img : "img";
  const cardMotionProps = enableMotion ? { layout: true } : {};
  const imageWrapperMotionProps = enableMotion ? { layoutId: `product-bg-${product.id}` } : {};
  const imageMotionProps = enableMotion ? { whileHover: { scale: 1.1 }, transition: { duration: 0.4 } } : {};

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isAdding = toggleWishlist(product);
    if (onWishlistToggle) {
      onWishlistToggle(product, isAdding);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const productUrl = `${window.location.origin}/product/${wishlistId}`;
      const previewUrl = imageSrc || productUrl;
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Découvre ${product.name} sur LID ! ${productUrl}`,
          url: previewUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${product.name} - ${productUrl} ${previewUrl}`);
        toast.success("Lien copié !");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (viewMode === 'list') {
    return (
      <CardWrapper
        {...cardMotionProps}
        className="group flex flex-col sm:flex-row w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative"
      >
        {/* Image Area - Smaller for List View */}
        <ImageWrapper 
          {...imageWrapperMotionProps}
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
          
          <Link to={`/product/${wishlistId}`} className="block w-full h-full">
            <ImageTag 
              src={imageSrc} 
              alt={product.name}
              width="400"
              height="500"
              onError={() => setImageFailed(true)}
              {...imageMotionProps}
              className={`w-full h-full object-contain ${imageIsPlaceholder ? "opacity-30" : "mix-blend-multiply dark:mix-blend-normal"}`}
            />
          </Link>
        </ImageWrapper>

        {/* Product Details - List Layout */}
        <div className="flex-1 flex flex-col p-4 gap-2">
          <div className="flex justify-between items-start">
            <Link to={`/product/${wishlistId}`}>
              <h3 className="font-medium text-lg text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={handleWishlist}
                className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-orange-500 text-orange-500" : ""}`} />
              </button>
              <button 
                type="button"
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
                  fill={i < Math.floor(rating) ? "currentColor" : "none"} 
                  className={i < Math.floor(rating) ? "text-[#FFA41C]" : "text-neutral-300 dark:text-neutral-600"}
                />
              ))}
            </div>
            <span className="text-xs text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer font-medium">{reviews.toLocaleString()}</span>
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
                   {price.toLocaleString()} <span className="text-sm">FCFA</span>
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
                    Livraison <span className="font-bold text-neutral-900 dark:text-white">sous conditions.</span> {product.deliveryDate}
                  </div>
               </div>
            </div>

            {/* Add to Cart Button */}
            <button 
               onClick={() => { 
                 addToCart({ ...product, size: product.sizes?.[0] || 'Unique' });
                 toast.success("Ajouté au panier");
               }}
               className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
             >
               <ShoppingBag size={16} />
               Ajouter au panier
             </button>
          </div>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      {...cardMotionProps}
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
            type="button"
            onClick={handleWishlist}
            aria-label={isWishlisted ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
            className="p-1.5 sm:p-2 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-neutral-700 backdrop-blur-sm rounded-full text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? "fill-orange-500 text-orange-500" : ""}`} />
          </button>
          
          <button 
            type="button"
            onClick={handleShare}
            aria-label="Partager ce produit"
            className="hidden sm:block p-2 bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-neutral-700 backdrop-blur-sm rounded-full text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm translate-x-10 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 duration-300"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <Link to={`/product/${wishlistId}`} className="block w-full h-full">
          <ImageTag 
            src={imageSrc} 
            alt={product.name}
            width="400"
            height="500"
            loading="lazy"
            onError={() => setImageFailed(true)}
            {...imageMotionProps}
            className={`w-full h-full ${imageIsPlaceholder ? "object-contain opacity-30 p-8" : "object-cover"}`}
          />
        </Link>
      </div>

      {/* Product Details - Amazon Modern Style */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 gap-1.5 sm:gap-2">
        {/* Title */}
        <Link to={`/product/${wishlistId}`}>
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
                fill={i < Math.floor(rating) ? "currentColor" : "none"} 
                className={i < Math.floor(rating) ? "text-[#FFA41C]" : "text-neutral-300 dark:text-neutral-600"}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer font-medium">({reviews})</span>
        </div>

        {/* Price Block */}
        <div className="flex items-baseline gap-1.5 mt-0.5">
           <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
             {price.toLocaleString()} <span className="text-xs sm:text-sm">FCFA</span>
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
             Livraison <span className="font-bold text-neutral-900 dark:text-white">Sous conditions.</span> {product.deliveryDate}
           </div>
        </div>

        {/* Add to Cart Button - Always Visible */}
        <div className="mt-auto">
          <button 
             onClick={(e) => {
               e.preventDefault();
               if (Number(product?.stock) <= 0) {
                 toast.error("Produit en rupture de stock");
                 return;
               }
               addToCart({ ...product, size: product.sizes?.[0] || 'Unique' });
               toast.success("Ajouté au panier");
             }}
             className="w-full py-2 sm:py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95"
             disabled={Number(product?.stock) <= 0}
           >
             <ShoppingBag size={14} className="sm:w-4 sm:h-4" />
             <span className="hidden sm:inline">{Number(product?.stock) <= 0 ? "Rupture" : "Ajouter au panier"}</span>
             <span className="inline sm:hidden">{Number(product?.stock) <= 0 ? "Rupture" : "Ajouter"}</span>
           </button>
        </div>
      </div>
    </CardWrapper>
  );
};

export default function Catalog({ showFilters = true, showHeader = true, limit = null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsString = searchParams.toString();
  const searchQuery = (searchParams.get('q') || '').trim();
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort');

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedPages, setLoadedPages] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const bootstrap = useCatalogBootstrap();
  const hasCatalogBootstrap = !searchQuery && !categoryParam && normalizeSortParam(sortParam) === 'featured';
  const bootstrapProductsPage = hasCatalogBootstrap ? bootstrap?.globalCollection?.products : null;
  const hasBootstrapProducts = Array.isArray(bootstrapProductsPage?.content);
  const isBootstrapLoading = hasCatalogBootstrap && Boolean(bootstrap?.isGlobalCollectionLoading);
  const isBootstrapResolved = hasCatalogBootstrap && Boolean(bootstrap?.isGlobalCollectionResolved);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const prevCategoryParamRef = useRef(categoryParam);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (hasBootstrapProducts) {
      const content = Array.isArray(bootstrapProductsPage?.content) ? bootstrapProductsPage.content : [];
      const pages = Number.isFinite(Number(bootstrapProductsPage?.totalPages)) ? Number(bootstrapProductsPage.totalPages) : 1;
      const total = Number.isFinite(Number(bootstrapProductsPage?.totalElements)) ? Number(bootstrapProductsPage.totalElements) : content.length;
      setIsLoadingMore(false);
      setIsLoading(false);
      setLoadError("");
      setCatalogProducts(content);
      setLoadedPages(content.length > 0 ? 1 : 0);
      setTotalPages(Math.max(1, pages));
      setTotalElements(Math.max(0, Number(total) || 0));
      return () => {
        cancelled = true;
      };
    }
    if (isBootstrapLoading) {
      setIsLoadingMore(false);
      setIsLoading(true);
      setLoadError("");
      return () => {
        cancelled = true;
      };
    }
    if (hasCatalogBootstrap && !isBootstrapResolved) {
      setIsLoadingMore(false);
      setIsLoading(true);
      setLoadError("");
      return () => {
        cancelled = true;
      };
    }
    if (isBootstrapResolved) {
      setIsLoadingMore(false);
      setIsLoading(false);
      setLoadError("");
      setCatalogProducts([]);
      setLoadedPages(0);
      setTotalPages(1);
      setTotalElements(0);
      return () => {
        cancelled = true;
      };
    }
    setIsLoadingMore(false);
    setIsLoading(true);
    setLoadError("");
    setCatalogProducts([]);
    setLoadedPages(0);
    setTotalPages(1);
    fetchPage(0)
      .then(({ content, pages, total }) => {
        if (cancelled) return;
        setCatalogProducts(Array.isArray(content) ? content : []);
        setLoadedPages(1);
        setTotalPages(Math.max(1, pages));
        setTotalElements(Math.max(0, Number(total) || 0));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err?.message || "Erreur lors du chargement des produits");
        setCatalogProducts([]);
        setLoadedPages(0);
        setTotalPages(1);
        setTotalElements(0);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bootstrapProductsPage, categoryParam, hasBootstrapProducts, hasCatalogBootstrap, isBootstrapLoading, isBootstrapResolved, searchQuery, sortParam]);

  useEffect(() => {
    const prev = prevCategoryParamRef.current;
    if (prev === categoryParam) return;
    prevCategoryParamRef.current = categoryParam;
    if (!categoryParam) return;

    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedPriceRange(null);
    setMinRating(null);
    setSortBy("featured");
    setIsMobileFiltersOpen(false);
  }, [categoryParam, searchParamsString, setSearchParams]);

  useEffect(() => {
    if (limit) return;
    if (isLoading) return;
    if (loadError) return;
    if (loadedPages <= 0) return;

    let cancelled = false;
    const maxPrefetchPages = 3;

    (async () => {
      const target = Math.min(totalPages, maxPrefetchPages);
      for (let p = loadedPages; p < target; p++) {
        if (cancelled) return;
        try {
          const { content } = await fetchPage(p);
          if (cancelled) return;
          setCatalogProducts((prev) => mergeUniqueById(prev, content));
          setLoadedPages((prev) => Math.max(prev, p + 1));
        } catch {
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, loadError, loadedPages, limit, totalPages]);

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [minRating, setMinRating] = useState(null);
  const [sortBy, setSortBy] = useState(() => normalizeSortParam(sortParam));
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(40);
  const [favNotification, setFavNotification] = useState({ show: false, product: null, isAdding: true });

  useEffect(() => {
    const saved = `${localStorage.getItem("lid_shop_view") || ""}`.trim();
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("lid_shop_view", viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!isSortOpen) return;
    const onDown = (e) => {
      const el = sortMenuRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setIsSortOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setIsSortOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isSortOpen]);

  const pageSize = 80;
  const hasMorePages = loadedPages < totalPages;

  const mergeUniqueById = (prev, next) => {
    const map = new Map();
    for (const p of Array.isArray(prev) ? prev : []) {
      if (p?.id) map.set(p.id, p);
    }
    for (const p of Array.isArray(next) ? next : []) {
      if (p?.id && !map.has(p.id)) map.set(p.id, p);
    }
    return [...map.values()];
  };

  const fetchPage = async (page) => {
    const category = `${categoryParam || ""}`.trim() || (selectedCategories.length > 0 ? selectedCategories.join(",") : "");
    const normalizedSort = normalizeSortParam(sortParam);
    const sortKey = normalizedSort === "featured" ? "" : normalizedSort;
    const data = await getCatalogProductsPage(page, pageSize, { q: searchQuery, category, sortKey });
    const content = Array.isArray(data?.content) ? data.content : [];
    const pages = Number.isFinite(Number(data?.totalPages)) ? Number(data.totalPages) : 1;
    const total = Number.isFinite(Number(data?.totalElements)) ? Number(data.totalElements) : content.length;
    return { content, pages, total };
  };

  const handleWishlistToggle = (product, isAdding) => {
    setFavNotification({
      show: true,
      product,
      isAdding
    });
  };

  const categoryOptions = useMemo(() => {
    const counts = new Map();
    const labels = new Map();
    for (const p of Array.isArray(catalogProducts) ? catalogProducts : []) {
      const slug = `${p?.categorySlug || ""}`.trim();
      if (!slug) continue;
      const label = `${p?.categoryName || slug}`.trim();
      labels.set(slug, label);
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }
    return [...labels.entries()]
      .map(([value, label]) => ({ value, label, count: counts.get(value) || 0 }))
      .sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }, [catalogProducts]);

  useEffect(() => {
    if (!categoryParam) return;
    const rawTokens = parseCsvParam(categoryParam);
    if (rawTokens.length === 0) return;

    const mapped = rawTokens
      .map((raw) => {
        const token = `${raw || ""}`.trim();
        if (!token) return null;
        const match =
          categoryOptions.find((opt) => opt.value === token) ||
          categoryOptions.find((opt) => `${opt.label || ""}`.trim().toLowerCase() === token.toLowerCase());
        return match ? match.value : token;
      })
      .filter(Boolean);

    const same =
      mapped.length === selectedCategories.length &&
      mapped.every((value, idx) => value === selectedCategories[idx]);
    if (same) return;

    const frame = requestAnimationFrame(() => setSelectedCategories(mapped));
    return () => cancelAnimationFrame(frame);
  }, [categoryParam, categoryOptions, selectedCategories]);

  useEffect(() => {
    if (!categoryParam) return;
    setIsMobileFiltersOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [categoryParam]);

  useEffect(() => {
    const next = normalizeSortParam(sortParam);
    if (next !== sortBy) setSortBy(next);
  }, [sortParam, sortBy]);

  useEffect(() => {
    if (limit) return;
    const nextParams = new URLSearchParams(searchParamsString);

    const desiredSort = sortBy === "featured" ? "" : sortBy;
    const currentSort = `${nextParams.get("sort") || ""}`.trim();
    if (currentSort !== desiredSort) {
      if (desiredSort) nextParams.set("sort", desiredSort);
      else nextParams.delete("sort");
    }

    const desiredCategory = selectedCategories.length > 0 ? selectedCategories.join(",") : "";
    const currentCategory = `${nextParams.get("category") || ""}`.trim();
    if (currentCategory !== desiredCategory) {
      if (desiredCategory) nextParams.set("category", desiredCategory);
      else nextParams.delete("category");
    }

    if (nextParams.toString() !== searchParamsString) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [limit, searchParamsString, selectedCategories, setSearchParams, sortBy]);

  const brandOptions = useMemo(() => {
    const counts = new Map();
    for (const p of Array.isArray(catalogProducts) ? catalogProducts : []) {
      const brand = `${p?.brand || ""}`.trim();
      if (!brand) continue;
      counts.set(brand, (counts.get(brand) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }, [catalogProducts]);

  const colorOptions = useMemo(() => [], []);

  const showRatingFilter = useMemo(() => {
    return (Array.isArray(catalogProducts) ? catalogProducts : []).some((p) => Number(p?.rating) > 0);
  }, [catalogProducts]);

  const filteredProducts = useMemo(() => {
    const q = `${searchQuery || ""}`.trim().toLowerCase();
    let result = (Array.isArray(catalogProducts) ? catalogProducts : []).filter((product) => {
      const productCategory = `${product?.categorySlug || ""}`.trim();
      const productCategoryName = `${product?.categoryName || ""}`.trim();
      const productCategoryId = `${product?.categoryId || ""}`.trim();
      const productBrand = `${product?.brand || ""}`.trim();
      const productName = `${product?.name || ""}`.trim();
      const price = Number(product?.price) || 0;

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some(
          (selected) =>
            selected === productCategory ||
            selected === productCategoryName ||
            selected === productCategoryId
        );
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand);
      const matchPrice = !selectedPriceRange || (price >= selectedPriceRange.min && price <= selectedPriceRange.max);

      const matchRating = !showRatingFilter || !minRating || Number(product?.rating) >= minRating;

      const matchSearch =
        !q ||
        productName.toLowerCase().includes(q) ||
        productBrand.toLowerCase().includes(q) ||
        productCategory.toLowerCase().includes(q) ||
        productCategoryName.toLowerCase().includes(q);

      return matchCategory && matchBrand && matchPrice && matchRating && matchSearch;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => (Number(a?.price) || 0) - (Number(b?.price) || 0));
    else if (sortBy === 'price-desc') result.sort((a, b) => (Number(b?.price) || 0) - (Number(a?.price) || 0));
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b?.dateCreation || 0).getTime() - new Date(a?.dateCreation || 0).getTime());
    else if (sortBy === 'reviews') result.sort((a, b) => (Number(b?.reviews) || 0) - (Number(a?.reviews) || 0));

    return result;
  }, [catalogProducts, selectedCategories, selectedBrands, selectedPriceRange, minRating, sortBy, searchQuery, showRatingFilter]);

  useEffect(() => {
    if (limit) return;
    if (selectedCategories.length === 0) return;
    if (filteredProducts.length > 0) return;
    if (!hasMorePages || isLoadingMore) return;

    let cancelled = false;

    (async () => {
      setIsLoadingMore(true);
      try {
        const maxExtraPages = 10;
        let page = loadedPages;
        let loaded = 0;

        while (!cancelled && page < totalPages && loaded < maxExtraPages) {
          const { content } = await fetchPage(page);
          if (cancelled) return;

          setCatalogProducts((prev) => mergeUniqueById(prev, content));
          page += 1;
          loaded += 1;
          setLoadedPages(page);

          const hasMatchInNewPage = (Array.isArray(content) ? content : []).some((p) => {
            const slug = `${p?.categorySlug || ""}`.trim();
            const name = `${p?.categoryName || ""}`.trim();
            const id = `${p?.categoryId || ""}`.trim();
            return selectedCategories.includes(slug) || selectedCategories.includes(name) || selectedCategories.includes(id);
          });
          if (hasMatchInNewPage) break;
        }
      } catch {
      } finally {
        if (!cancelled) setIsLoadingMore(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filteredProducts.length, hasMorePages, isLoadingMore, limit, loadedPages, selectedCategories, totalPages]);

  useEffect(() => {
    if (limit) return;
    const base = viewMode === "list" ? 20 : 40;
    setVisibleCount(Math.min(base, filteredProducts.length));
  }, [limit, viewMode, filteredProducts.length, selectedCategories, selectedBrands, selectedColors, selectedPriceRange, minRating, sortBy, searchQuery]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedPriceRange(null);
    setMinRating(null);
  };

  const resetHeaderFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedPriceRange(null);
    setMinRating(null);
    setSortBy("featured");
  };

  const hasHeaderFilters =
    selectedBrands.length > 0 || selectedColors.length > 0 || selectedPriceRange !== null || minRating !== null || sortBy !== "featured";

  const displayedProducts = useMemo(() => {
    if (limit) return filteredProducts.slice(0, limit);
    return filteredProducts.slice(0, Math.min(visibleCount, filteredProducts.length));
  }, [filteredProducts, limit, visibleCount]);

  const handleLoadMore = async () => {
    if (limit) return;
    const step = viewMode === "list" ? 20 : 40;
    setVisibleCount((c) => c + step);
    if (!hasMorePages || isLoadingMore) return;

    if (visibleCount >= filteredProducts.length) {
      setIsLoadingMore(true);
      try {
        const { content } = await fetchPage(loadedPages);
        setCatalogProducts((prev) => mergeUniqueById(prev, content));
        setLoadedPages((prev) => prev + 1);
      } catch (err) {
        toast.error(err?.message || "Impossible de charger plus de produits.");
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const handleShowAll = async () => {
    if (limit) return;
    if (!hasMorePages || isLoadingMore) {
      setVisibleCount(filteredProducts.length);
      return;
    }
    setIsLoadingMore(true);
    try {
      const maxExtraPages = 8;
      let page = loadedPages;
      let loaded = 0;
      while (page < totalPages && loaded < maxExtraPages) {
        const { content } = await fetchPage(page);
        setCatalogProducts((prev) => mergeUniqueById(prev, content));
        page += 1;
        loaded += 1;
        setLoadedPages(page);
      }
      setVisibleCount(Number.MAX_SAFE_INTEGER);
    } catch (err) {
      toast.error(err?.message || "Impossible de charger tous les produits.");
    } finally {
      setIsLoadingMore(false);
    }
  };

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
                  {totalElements > 0 && filteredProducts.length !== totalElements ? (
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 hidden sm:inline">
                      sur {totalElements}
                    </span>
                  ) : null}
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
                {hasHeaderFilters ? (
                  <button
                    onClick={resetHeaderFilters}
                    className="hidden sm:flex items-center gap-2 text-xs sm:text-sm px-3 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all whitespace-nowrap"
                  >
                    Réinitialiser
                  </button>
                ) : null}

                <div ref={sortMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={isSortOpen}
                    className="flex items-center gap-2 text-xs sm:text-sm px-3 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all whitespace-nowrap"
                  >
                    <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline">Trier par:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {sortBy === 'featured' ? 'Pertinence' : sortBy === 'price-asc' ? 'Prix croissant' : sortBy === 'price-desc' ? 'Prix décroissant' : 'Nouveautés'}
                    </span>
                    <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className={`absolute right-0 top-[calc(100%+0.5rem)] w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl shadow-neutral-200/50 dark:shadow-black/50 border border-neutral-100 dark:border-neutral-800 p-1.5 z-50 transform origin-top-right transition-all ${isSortOpen ? "block" : "hidden"}`}>
                    {[
                       { label: 'Pertinence', value: 'featured' },
                       { label: 'Nouveautés', value: 'newest' },
                       { label: 'Prix croissant', value: 'price-asc' },
                       { label: 'Prix décroissant', value: 'price-desc' },
                    ].map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setIsSortOpen(false);
                        }}
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
                categoryOptions={categoryOptions}
                brandOptions={brandOptions}
                colorOptions={colorOptions}
                showRatingFilter={showRatingFilter}
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
           {isLoading ? (
             <div className="flex items-center justify-center py-24">
               <div className="w-12 h-12 border-4 border-neutral-200 border-t-orange-600 rounded-full animate-spin" />
             </div>
           ) : loadError ? (
             <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl px-6">
               <h3 className="text-lg font-bold">Impossible de charger les produits</h3>
               <p className="text-neutral-500 mt-2">{loadError}</p>
             </div>
           ) : (
             <>
               {displayedProducts.length > 0 ? (
                 <div className={viewMode === 'grid' 
                   ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6"
                   : "flex flex-col gap-4"
                 }>
                  {displayedProducts.map((product) => (
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

              {!limit && (displayedProducts.length > 0 || hasMorePages) && (displayedProducts.length < filteredProducts.length || hasMorePages) ? (
                 <div className="mt-10 flex flex-col items-center gap-3">
                   <button
                     onClick={handleLoadMore}
                     className="px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-sm disabled:opacity-60"
                     disabled={isLoadingMore}
                   >
                     {isLoadingMore ? "Chargement..." : `Charger plus (${Math.min(displayedProducts.length, filteredProducts.length)}/${filteredProducts.length}${hasMorePages ? "+" : ""})`}
                   </button>
                   <button
                     onClick={handleShowAll}
                     className="text-sm font-bold text-neutral-700 dark:text-neutral-300 hover:underline disabled:opacity-60"
                     disabled={isLoadingMore}
                   >
                     {isLoadingMore ? "Chargement..." : "Afficher tout"}
                   </button>
                 </div>
               ) : null}
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
                  categoryOptions={categoryOptions}
                  brandOptions={brandOptions}
                  colorOptions={colorOptions}
                  showRatingFilter={showRatingFilter}
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
