import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Zap, Truck } from "lucide-react";
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
import { products } from "../data/products";

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

// --- Desktop Specific Components ---
const DesktopSectionHeader = ({ title, linkTo, linkText = "Voir tout" }) => (
  <div className="flex justify-between items-end mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-4">
    <h2 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">{title}</h2>
    {linkTo && (
      <Link to={linkTo} className="group flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-orange-600 transition-colors">
        {linkText} 
        <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
      </Link>
    )}
  </div>
);

const CategoryCard = ({ title, image, count, link }) => (
  <Link to={link} className="group relative overflow-hidden rounded-2xl aspect-[4/5] md:aspect-[3/4]">
    <div className="absolute inset-0 bg-neutral-900/20 group-hover:bg-neutral-900/30 transition-colors z-10" />
    <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
      <h3 className="text-2xl font-black text-white mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{title}</h3>
      <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{count} produits</p>
    </div>
  </Link>
);

export default function Home() {
  const newArrivals = products.slice(0, 4);
  const bestSellers = products.slice(4, 8);
  // Reuse products for trending to ensure full grid with limited data
  const trending = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">

      {/* ================= MOBILE LAYOUT (md:hidden) ================= */}
      <div className="md:hidden pb-24 flex flex-col gap-8">
        
        {/* Mobile Hero */}
        <div className="-mt-1">
          <Hero />
        </div>

        {/* Quick Categories (Horizontal Scroll) */}
        <div className="pl-4 overflow-x-auto no-scrollbar">
           <div className="flex gap-2.5 pb-2">
             {['Nouveautés', 'Homme', 'Femme', 'Accessoires', 'Sport', 'Promo'].map((cat, i) => (
               <Link 
                 key={i} 
                 to={`/shop?category=${cat}`}
                 className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${i === 0 ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
               >
                 {cat}
               </Link>
             ))}
           </div>
        </div>

        {/* Reassurance Grid (Compact) */}
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

        {/* Flash Sale Banner */}
        <div className="px-4">
          <Offer />
        </div>

        {/* New Arrivals (Horizontal Scroll) */}
        <div>
          <MobileSectionHeader title="Dernières Pépites" linkTo="/shop?sort=newest" />
          <div className="flex overflow-x-auto px-4 gap-4 snap-x no-scrollbar">
            {products.slice(0, 6).map(product => (
              <div key={product.id} className="min-w-[240px] max-w-[240px] snap-center">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Best Sellers (Horizontal Scroll) */}
        <div>
          <MobileSectionHeader title="Best Sellers" linkTo="/shop?sort=bestsellers" />
          <div className="flex overflow-x-auto px-4 gap-4 pb-8 snap-x no-scrollbar">
            {products.slice(6, 12).map(product => (
              <div key={product.id} className="min-w-[240px] max-w-[240px] snap-center">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="">
          <Promotion/>
        </div>

        {/* Newsletter Mobile */}
        <div className="px-4">
           <Newsletter />
        </div>

      </div>


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
        
        {/* Offer */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="px-6 pb-16 max-w-7xl mx-auto"
        >
          <Offer />
        </motion.section>

        {/* Categories Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="px-6 pb-20 max-w-7xl mx-auto"
        >
          <DesktopSectionHeader title="Explorer par Catégorie" />
          <div className="grid grid-cols-4 gap-6">
            <CategoryCard 
              title="Homme" 
              image="https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?q=80&w=1000&auto=format&fit=crop" 
              count="120+" 
              link="/shop?category=Homme" 
            />
            <CategoryCard 
              title="Femme" 
              image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop" 
              count="85+" 
              link="/shop?category=Femme" 
            />
            <CategoryCard 
              title="Accessoires" 
              image="https://images.unsplash.com/photo-1523293182086-7651a899d60f?q=80&w=1000&auto=format&fit=crop" 
              count="45+" 
              link="/shop?category=Accessoires" 
            />
            <CategoryCard 
              title="Sport" 
              image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop" 
              count="60+" 
              link="/shop?category=Sport" 
            />
          </div>
        </motion.section>

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
