import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, MapPin, Star, Users, ArrowRight, Zap, SlidersHorizontal, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getPublicPartnerCollection, listPublicPartners } from "@/services/publicPartnerCatalogService";
import { useCatalogBootstrap } from "@/features/catalog/CatalogBootstrapContext";

const mapPartnerToSeller = (p) => ({
  id: p.partnerId,
  name: p.shopName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Boutique",
  type: "product_seller",
  category: p.mainCategoryName || "Boutique",
  image: p.logoUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400",
  coverImage: p.backgroundUrl || p.logoUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200",
  followers: "-",
  stats: { label: "Produits", value: 0 },
  description: p.shopDescription || "Découvrez notre boutique partenaire.",
  location: [p.city, p.country].filter(Boolean).join(", ") || "Côte d'Ivoire",
  rating: 5.0,
  verified: true,
});

// --- Components ---

const HeroSection = ({ featuredSellers, onOpenSeller }) => {
    return (
        <div className="relative w-full mb-20">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#6aa200]/10 to-transparent blur-3xl -z-10" />
            <div className="absolute top-20 left-0 w-1/4 h-64 bg-purple-500/5 blur-3xl -z-10" />

            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
                <div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter leading-[0.9]"
                    >
                        Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6aa200] to-green-400">Partenaires</span><br />
                        <span className="text-neutral-300 dark:text-neutral-800">Exclusifs.</span>
                    </motion.h1>
                </div>
                <motion.p 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-neutral-500 dark:text-neutral-400 max-w-sm text-right md:text-left leading-relaxed"
                >
                    Une sélection rigoureuse des meilleurs organisateurs, créateurs et marques qui redéfinissent l'expérience événementielle.
                </motion.p>
            </div>

            {/* Featured Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[500px]">
                {featuredSellers.slice(0, 3).map((seller, index) => (
                    <motion.div
                        key={seller.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                        className={`relative rounded-3xl overflow-hidden cursor-pointer group ${
                            index === 0 ? 'md:col-span-6' : 'md:col-span-3'
                        }`}
                        onClick={() => onOpenSeller(seller.id)}
                    >
                        <img 
                            src={seller.coverImage} 
                            alt={seller.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        
                        <div className="absolute top-4 left-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                Top {index + 1}
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                            <h3 className={`font-black text-white uppercase tracking-tight leading-none mb-2 ${
                                index === 0 ? 'text-4xl' : 'text-2xl'
                            }`}>
                                {seller.name}
                            </h3>
                            {index === 0 && (
                                <p className="text-white/80 line-clamp-2 mb-4 max-w-md">
                                    {seller.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-white/60 text-xs font-medium uppercase tracking-wider">
                                <MapPin size={12} /> {seller.location}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const MinimalSellerCard = ({ seller, onOpenSeller }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            viewport={{ once: true }}
            onClick={() => onOpenSeller(seller.id)}
            className="group cursor-pointer"
        >
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 bg-neutral-100 dark:bg-neutral-900">
                <img 
                    src={seller.coverImage} 
                    alt={seller.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <button className="bg-white text-black p-3 rounded-full hover:bg-[#6aa200] hover:text-white transition-colors shadow-xl">
                        <ArrowRight size={20} />
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <img src={seller.image} alt="Avatar" className="w-8 h-8 rounded-lg object-cover bg-white" />
                            <div>
                                <h3 className="text-white font-bold leading-none">{seller.name}</h3>
                                <div className="text-[10px] text-white/70 uppercase tracking-wider font-medium mt-0.5">
                                    {seller.category}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-white/60 font-medium uppercase tracking-wider border-t border-white/10 pt-2 mt-2">
                            <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400 fill-yellow-400" /> {seller.rating}</span>
                            <span>{seller.followers} abonnés</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Page ---

export default function SellersList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bootstrap = useCatalogBootstrap();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sellers, setSellers] = useState([]);
  const bootstrapPartnersPage = bootstrap?.globalCollection?.partners || null;
  const bootstrapPartners = Array.isArray(bootstrapPartnersPage?.content) ? bootstrapPartnersPage.content : null;
  const isBootstrapLoading = Boolean(bootstrap?.isGlobalCollectionLoading);
  const isBootstrapResolved = Boolean(bootstrap?.isGlobalCollectionResolved);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (bootstrapPartners) {
        const totalPages = Number(bootstrapPartnersPage?.totalPages || 1);
        let all = [...bootstrapPartners];
        for (let page = 1; page < totalPages; page += 1) {
          const next = await listPublicPartners({ page, size: 100 });
          if (cancelled) return;
          const content = Array.isArray(next?.content) ? next.content : [];
          all = all.concat(content);
        }
        if (cancelled) return;
        setSellers(all.map(mapPartnerToSeller));
        return;
      }

      if (!isBootstrapResolved || isBootstrapLoading) {
        return;
      }

      const size = 100;
      const first = await listPublicPartners({ page: 0, size });
      if (cancelled) return;
      const firstContent = Array.isArray(first?.content) ? first.content : [];
      const totalPages = Number(first?.totalPages || 1);
      let all = [...firstContent];
      for (let page = 1; page < totalPages; page += 1) {
        const next = await listPublicPartners({ page, size });
        if (cancelled) return;
        const content = Array.isArray(next?.content) ? next.content : [];
        all = all.concat(content);
      }
      if (cancelled) return;
      setSellers(all.map(mapPartnerToSeller));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [bootstrapPartners, bootstrapPartnersPage?.totalPages, isBootstrapLoading, isBootstrapResolved]);

  const sellerCategories = useMemo(() => {
    const uniq = Array.from(new Set(sellers.map((s) => s.category).filter(Boolean)));
    return ["Tous", ...uniq];
  }, [sellers]);

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || seller.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openSeller = async (sellerId) => {
    if (!sellerId) return;
    await queryClient.prefetchQuery({
      queryKey: ["public-partner-collection", sellerId],
      queryFn: () => getPublicPartnerCollection(sellerId, { page: 0, size: 20 }),
      staleTime: 60_000,
    });
    navigate(`/sellers/${sellerId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 font-sans pb-20 selection:bg-[#6aa200] selection:text-white">
      
      <div className="container mx-auto px-6 pt-32">
        
        <HeroSection featuredSellers={sellers} onOpenSeller={openSeller} />

        {/* Filter & Search Bar */}
        <div className="sticky top-24 z-30 mb-12">
            <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-neutral-200 dark:border-white/5 p-2 pr-4 rounded-full shadow-2xl shadow-black/5 flex items-center gap-4 max-w-4xl mx-auto">
                
                <div className="flex-1 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un partenaire..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-sm font-bold placeholder:font-medium focus:ring-0 outline-none"
                    />
                </div>

                <div className="h-8 w-px bg-neutral-200 dark:bg-white/10" />

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[40%]">
                    <button
                        onClick={() => setSelectedCategory("Tous")}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            selectedCategory === "Tous"
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                            : "hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500"
                        }`}
                    >
                        Tous
                    </button>
                    {sellerCategories.filter(c => c !== "Tous").map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                selectedCategory === category
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                                : "hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <button className="p-3 bg-neutral-100 dark:bg-white/5 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-[#6aa200] hover:text-white transition-colors">
                    <SlidersHorizontal size={18} />
                </button>
            </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
            <AnimatePresence mode="popLayout">
                {filteredSellers.map((seller) => (
                    <MinimalSellerCard key={seller.id} seller={seller} onOpenSeller={openSeller} />
                ))}
            </AnimatePresence>
        </div>

        {/* Simple CTA */}
        <div className="relative rounded-[2.5rem] bg-neutral-900 dark:bg-white text-white dark:text-black overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#6aa200] opacity-10 blur-[100px]" />
            <div className="px-8 py-20 md:p-32 text-center relative z-10">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
                    Prêt à rejoindre l'aventure ?
                </h2>
                <p className="text-lg md:text-xl opacity-60 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Créez votre page organisateur en quelques minutes et commencez à vendre vos billets à une communauté passionnée.
                </p>
                <button 
                onClick={()=>navigate('/seller-join')}
                className="bg-white dark:bg-black text-black dark:text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
                    Créer mon compte Pro
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
