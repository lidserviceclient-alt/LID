import { motion, MotionConfig } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Zap, Truck, ArrowUpRight } from "lucide-react";
import Hero from "../components/Hero";
import Promotion from "../components/Promotion";
import Offer from "../components/offer";
import { ProductCard } from "../components/Catalog";
import Opinion from "../components/Opinion";
import Blog from "../components/Blog";
import About from "../components/About";
import Mark from "../components/Mark";
import Newsletter from "../components/Newsletter";
import Reassurance from "../components/Reassurance";
import { cn } from "@/utils/cn";
import { buildCategoryTree, getFeaturedCatalogCategories, resolveBackendAssetUrl } from "@/services/categoryService";
import { getBestSellerCatalogProducts, getFeaturedCatalogProducts } from "@/services/productService";
import { useFlashSaleProduct } from "@/features/flashSale/useFlashSaleProduct";
import { getCatalogLayoutCollection } from "@/services/catalogLayoutService";

const CATEGORY_FALLBACK_IMAGE = "/imgs/wall-1.jpg";

// --- Mobile Specific Components ---
const MobileSectionHeader = ({ title, linkTo, linkText = "Voir tout" }) => (
  <div className="flex justify-between items-end px-4 mb-4">
    <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-none">{title}</h2>
    {linkTo && (
      <Link to={linkTo} className="text-xs font-medium text-orange-600 flex items-center gap-0.5">
        {linkText} <ChevronRight size={14} />
      </Link>
    )}
  </div>
);

const DesktopSectionHeader = ({ title, linkTo, linkText = "Voir tout" }) => (
  <div className="flex justify-between items-end mb-12">
    <h2 className="text-4xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">{title}</h2>
    {linkTo && (
      <Link to={linkTo} className="group flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-orange-600 transition-colors">
        {linkText} 
        <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
      </Link>
    )}
  </div>
);

const BentoCard = ({ title, image_url, count, slug, className, large = false, enableMotion = true }) => {
  const safeSlug = `${slug || ""}`.trim();
  const to = safeSlug ? `/shop?category=${encodeURIComponent(safeSlug)}` : "/shop";
  const ImageTag = enableMotion ? motion.img : "img";
  const imageMotionProps = enableMotion ? { whileHover: { scale: 1.05 } } : {};

  return (
    <Link
      to={to}
      className={cn("group relative overflow-hidden rounded-3xl cursor-pointer", className)}
    >
    <div className="absolute inset-0 bg-neutral-900/20 group-hover:bg-neutral-900/40 transition-colors duration-500 z-10" />
    <ImageTag 
      src={image_url || CATEGORY_FALLBACK_IMAGE} 
      alt={title} 
      width="800"
      height="600"
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 will-change-transform"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = CATEGORY_FALLBACK_IMAGE;
      }}
      {...imageMotionProps}
    />
    
    <div className="absolute inset-0 z-20 p-6 md:p-8 flex flex-col justify-between">
      <div className="flex justify-end">
        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
           <ArrowUpRight className="text-white" size={20} />
        </div>
      </div>
      
      <div>
        <h3
          className={cn(
            "font-black text-white mb-2 leading-none",
            large ? "text-3xl sm:text-4xl lg:text-5xl" : "text-xl sm:text-2xl lg:text-3xl"
          )}
        >
          {title}
        </h3>
        <div className="flex items-center gap-3 overflow-hidden">
          {count ? (
            <span className="text-white/80 text-sm font-medium backdrop-blur-sm bg-black/10 px-3 py-1 rounded-full border border-white/10">
              {count} produits
            </span>
          ) : null}
          <span className="text-white text-sm font-bold translate-y-8 group-hover:translate-y-0 transition-transform duration-300 delay-75">
            Explorer
          </span>
        </div>
      </div>
    </div>
    </Link>
  );
};
export default function Home() {
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [mobileCategory, setMobileCategory] = useState("");
  const { data: flashSaleProduct } = useFlashSaleProduct(1);
  const hasFlashSale = Boolean(flashSaleProduct);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCatalogLayoutCollection({ latestLimit: 24 }).catch(() => null),
      getFeaturedCatalogCategories(6).catch(() => []),
      getFeaturedCatalogProducts(12).catch(() => []),
      getBestSellerCatalogProducts(12).catch(() => []),
    ]).then(([layout, cats, prods, bestsellers]) => {
      if (cancelled) return;
      const layoutCategories = Array.isArray(layout?.categories) ? layout.categories : [];
      const latestProducts = Array.isArray(layout?.latestProducts) ? layout.latestProducts : [];
      const featuredList = Array.isArray(prods) ? prods : [];
      const bestSellerList = Array.isArray(bestsellers) ? bestsellers : [];
      setCatalogCategories(layoutCategories);
      setFeaturedCategories(Array.isArray(cats) ? cats : []);
      setCatalogProducts(latestProducts);
      setFeaturedProducts(featuredList);
      setBestSellerProducts(bestSellerList);
    }).catch(() => {
      if (cancelled) return;
      setCatalogCategories([]);
      setCatalogProducts([]);
      setFeaturedCategories([]);
      setFeaturedProducts([]);
      setBestSellerProducts([]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const rootCategories = useMemo(() => {
    const roots = buildCategoryTree(catalogCategories);
    return roots
      .filter((root) => root && root.estActive !== false)
      .map((root) => ({
        slug: `${root?.slug || root?.id || ""}`.trim(),
        label: `${root?.nom || ""}`.trim(),
        imageUrl: `${root?.imageUrl || ""}`.trim()
      }))
      .filter((item) => item.slug && item.label);
  }, [catalogCategories]);

  const normalizedFeaturedProducts = useMemo(() => {
    return (Array.isArray(featuredProducts) ? featuredProducts : [])
      .map((product, index) => {
        const amount = Number(product?.price ?? product?.prix ?? product?.amount);
        return {
          ...product,
          id: product?.id ?? (`${product?.code || ""}`.trim() || `featured-${index}`),
          name: `${product?.name || product?.nom || product?.title || `Produit ${index + 1}`}`.trim(),
          price: Number.isFinite(amount) ? amount : (product?.price ?? product?.prix ?? product?.amount),
        };
      })
      .filter((product) => product?.name);
  }, [featuredProducts]);

  const featuredOnHome = normalizedFeaturedProducts.slice(0, 12);

  const newArrivals = useMemo(() => {
    const list = Array.isArray(catalogProducts) ? [...catalogProducts] : [];
    list.sort((a, b) => {
      const at = Date.parse(a?.dateCreation || "") || 0;
      const bt = Date.parse(b?.dateCreation || "") || 0;
      return bt - at;
    });
    return list.slice(0, 4);
  }, [catalogProducts]);
  const normalizedBestSellerProducts = useMemo(() => {
    return (Array.isArray(bestSellerProducts) ? bestSellerProducts : [])
      .map((product, index) => {
        const amount = Number(product?.price ?? product?.prix ?? product?.amount);
        return {
          ...product,
          id: product?.id ?? (`${product?.code || ""}`.trim() || `best-${index}`),
          name: `${product?.name || product?.nom || product?.title || `Produit ${index + 1}`}`.trim(),
          price: Number.isFinite(amount) ? amount : (product?.price ?? product?.prix ?? product?.amount),
        };
      })
      .filter((product) => product?.name);
  }, [bestSellerProducts]);

  const bestSellers = normalizedBestSellerProducts.slice(0, 8);

  const trending = useMemo(() => {
    const list = Array.isArray(catalogProducts) ? [...catalogProducts] : [];
    return list.sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [catalogProducts]);

  const mobileCategoryOptions = useMemo(() => {
    if (rootCategories.length > 0) {
      return [{ slug: "", label: "Tous" }, ...rootCategories.slice(0, 8)];
    }
    const options = new Map();
    (normalizedFeaturedProducts.length > 0 ? normalizedFeaturedProducts : catalogProducts).forEach((product) => {
      const slug = `${product?.categorySlug || ""}`.trim();
      const label = `${product?.categoryName || ""}`.trim();
      if (slug && label && !options.has(slug)) {
        options.set(slug, { slug, label });
      }
    });
    return [{ slug: "", label: "Tous" }, ...Array.from(options.values()).slice(0, 8)];
  }, [rootCategories, normalizedFeaturedProducts, catalogProducts]);

  const filterByMobileCategory = (list) => {
    if (!mobileCategory) return list;
    return list.filter((product) => {
      const slug = `${product?.categorySlug || ""}`.trim();
      if (slug) return slug === mobileCategory;
      const name = `${product?.categoryName || ""}`.trim().toLowerCase();
      const target = `${mobileCategory || ""}`.trim().toLowerCase();
      return name && target && name === target;
    });
  };

  const mobileFeaturedProducts = useMemo(() => {
    const filtered = normalizedFeaturedProducts.filter((product) => product?.name);
    return filterByMobileCategory(filtered).slice(0, 8);
  }, [normalizedFeaturedProducts, mobileCategory]);

  const mobileBestSellers = useMemo(() => {
    const filtered = normalizedBestSellerProducts.filter((product) => product?.name);
    const byCategory = filterByMobileCategory(filtered);
    const slice = byCategory.slice(8, 16);
    return slice.length > 0 ? slice : filtered.slice(0, 8);
  }, [normalizedBestSellerProducts, mobileCategory]);

  const featuredBento = useMemo(() => {
    const resolveCategoryImage = (slug, imageUrl) => {
      const resolved = resolveBackendAssetUrl(imageUrl);
      if (resolved) return resolved;
      return CATEGORY_FALLBACK_IMAGE;
    };

    const items = [];
    const used = new Set();

    const add = (categoryLike) => {
      if (!categoryLike) return;
      const slug = `${categoryLike?.slug || ""}`.trim();
      const title = `${categoryLike?.nom || categoryLike?.label || ""}`.trim();
      if (!slug || !title) return;
      if (used.has(slug)) return;
      used.add(slug);
      items.push({
        title,
        slug,
        image_url: resolveCategoryImage(slug, categoryLike?.imageUrl),
        count: ""
      });
    };

    (Array.isArray(featuredCategories) ? featuredCategories : [])
      .filter((c) => c && c.estActive !== false && (!c.niveau || c.niveau === "PRINCIPALE"))
      .forEach(add);

    (Array.isArray(rootCategories) ? rootCategories : []).forEach(add);

    return items.slice(0, 4);
  }, [featuredCategories, rootCategories]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">

      {/* ================= MOBILE LAYOUT (md:hidden) ================= */}
      <MotionConfig reducedMotion="always">
        <div className="md:hidden pb-24 flex flex-col gap-8 mobile-no-motion">
          
          {/* Mobile Hero */}
          <div className="-mt-1">
            <Hero enableMotion={false} />
          </div>

        {/* Reassurance Grid (Compact) - always visible on mobile */}
        <div className="px-4 grid grid-cols-2 gap-3">
           <div className="bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
                <ShieldCheck size={16} />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] text-neutral-500 uppercase font-bold">Paiement</span>
               <span className="text-xs font-bold text-neutral-900 dark:text-white">Sécurisé</span>
             </div>
           </div>
           <div className="bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
             <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                <Truck size={16} />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] text-neutral-500 uppercase font-bold">Livraison</span>
               <span className="text-xs font-bold text-neutral-900 dark:text-white">Express</span>
             </div>
           </div>
        </div>

        {hasFlashSale ? (
          <div className="px-4">
            <Offer enableMotion={false} />
          </div>
        ) : null}

        {featuredBento.length > 0 ? (
          <div>
            <MobileSectionHeader title="Catégories" linkTo="/shop" />
            <div className="px-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[170px] sm:auto-rows-[220px]">
                {featuredBento[0] ? (
                  <BentoCard
                    title={featuredBento[0].title}
                    image_url={featuredBento[0].image_url}
                    count={featuredBento[0].count}
                    slug={featuredBento[0].slug}
                    className="col-span-2 sm:col-span-2"
                    large
                    enableMotion={false}
                  />
                ) : null}
                {featuredBento[1] ? (
                  <BentoCard
                    title={featuredBento[1].title}
                    image_url={featuredBento[1].image_url}
                    count={featuredBento[1].count}
                    slug={featuredBento[1].slug}
                    className="col-span-1"
                    enableMotion={false}
                  />
                ) : null}
                {featuredBento[2] ? (
                  <BentoCard
                    title={featuredBento[2].title}
                    image_url={featuredBento[2].image_url}
                    count={featuredBento[2].count}
                    slug={featuredBento[2].slug}
                    className="col-span-1"
                    enableMotion={false}
                  />
                ) : null}
                {featuredBento[3] ? (
                  <BentoCard
                    title={featuredBento[3].title}
                    image_url={featuredBento[3].image_url}
                    count={featuredBento[3].count}
                    slug={featuredBento[3].slug}
                    className="col-span-2 sm:col-span-2"
                    large
                    enableMotion={false}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : null}


        {mobileFeaturedProducts.length > 0 ? (
          <div>
            <MobileSectionHeader title="Produits en phare" linkTo="/shop" />
            <div className="flex overflow-x-auto px-4 gap-4 snap-x no-scrollbar">
              {mobileFeaturedProducts.map(product => (
                <div key={product.id} className="min-w-[240px] max-w-[240px] snap-center">
                  <ProductCard product={product} enableMotion={false} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {mobileBestSellers.length > 0 ? (
          <div>
            <MobileSectionHeader title="Best Sellers" linkTo="/shop?sort=bestsellers" />
            <div className="flex overflow-x-auto px-4 gap-4 pb-8 snap-x no-scrollbar">
              {mobileBestSellers.map(product => (
                <div key={product.id} className="min-w-[240px] max-w-[240px] snap-center">
                  <ProductCard product={product} enableMotion={false} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="">
          <Promotion enableMotion={false} />
        </div>

          {/* Newsletter Mobile */}
          <div className="px-4">
             <Newsletter />
          </div>

        </div>
      </MotionConfig>


      {/* ================= DESKTOP LAYOUT (hidden md:block) ================= */}
      <div className="hidden md:block">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Hero />
        </motion.section>

        {/* Reassurance Bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Reassurance />
        </motion.section>
        
        {hasFlashSale ? (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="px-6 pb-16 max-w-7xl mx-auto"
          >
            <Offer />
          </motion.section>
        ) : null}

        {featuredBento.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="px-6 pb-20 max-w-7xl mx-auto"
          >
            <DesktopSectionHeader title="Explorer par Catégorie" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
              {featuredBento[0] ? (
                <BentoCard
                  title={featuredBento[0].title}
                  image_url={featuredBento[0].image_url}
                  count={featuredBento[0].count}
                  slug={featuredBento[0].slug}
                  className="md:col-span-2"
                  large
                />
              ) : null}
              {featuredBento[1] ? (
                <BentoCard
                  title={featuredBento[1].title}
                  image_url={featuredBento[1].image_url}
                  count={featuredBento[1].count}
                  slug={featuredBento[1].slug}
                  className="md:col-span-1"
                />
              ) : null}
              {featuredBento[2] ? (
                <BentoCard
                  title={featuredBento[2].title}
                  image_url={featuredBento[2].image_url}
                  count={featuredBento[2].count}
                  slug={featuredBento[2].slug}
                  className="md:col-span-1"
                />
              ) : null}
              {featuredBento[3] ? (
                <BentoCard
                  title={featuredBento[3].title}
                  image_url={featuredBento[3].image_url}
                  count={featuredBento[3].count}
                  slug={featuredBento[3].slug}
                  className="md:col-span-2"
                  large
                />
              ) : null}
            </div>
          </motion.section>
        ) : null}

        {featuredOnHome.length > 0 ? (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="px-6 pb-20 max-w-7xl mx-auto"
          >
            <DesktopSectionHeader title="Produits en phare" linkTo="/shop" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredOnHome.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </motion.section>
        ) : null}

        {/* New Arrivals Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="px-6 pb-20 max-w-7xl mx-auto"
        >
          <DesktopSectionHeader title="Dernières Nouveautés" linkTo="/shop?sort=newest" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </motion.section>

        {/* Best Sellers Section */}
        {bestSellers.length > 0 ? (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="px-6 pb-20 max-w-7xl mx-auto"
          >
            <DesktopSectionHeader title="Meilleures Ventes" linkTo="/shop?sort=bestsellers" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestSellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </motion.section>
        ) : null}

        {/* Promotion */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="px-6 pb-20 max-w-7xl mx-auto"
        >
          <Promotion />
        </motion.section>

        {/* Trending Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="px-6 pb-20 max-w-7xl mx-auto"
        >
          <DesktopSectionHeader title="Tendances du Moment" linkTo="/shop?sort=trending" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trending.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </motion.section>

        {/* Blog */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Blog />
        </motion.section>

        {/* Opinion */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="px-6 "
        >
          <Opinion />
        </motion.section>

        {/* About */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="px-6 "
        >
          <About />
        </motion.section>

        {/* Newsletter */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Newsletter />
        </motion.section>

        {/* Mark */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Mark />
        </motion.section>
      </div>

    </div>
  );
}
