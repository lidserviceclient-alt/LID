import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Zap, Truck } from "lucide-react";
import Hero from "../components/Hero";
import Promotion from "../components/Promotion";
import Offer from "../components/offer";
import Catalog, { ProductCard } from "../components/Catalog";
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

export default function Home() {

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
          className="px-6 pb-10"
        >
          <Offer />
        </motion.section>

        {/* Catalog */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="px-6"
        >
          <Catalog showFilters={false} showHeader={false} limit={8} />
        </motion.section>

        {/* Promotion */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="px-6"
        >
          <Promotion />
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
