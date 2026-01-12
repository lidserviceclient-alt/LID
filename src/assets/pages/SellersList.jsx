import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, MapPin, Star, TrendingUp, Users, Calendar, 
    CheckCircle2, ArrowRight, Zap, Filter, ChevronDown, 
    MoreHorizontal, Heart, Share2, Globe, Award 
} from "lucide-react";
import { sellers, sellerCategories } from "../data/sellers";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// --- Components ---

const HeroCarousel = () => {
    const [index, setIndex] = useState(0);
    const featuredSellers = sellers.slice(0, 3);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % featuredSellers.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featuredSellers.length]);

    const handleFollow = (e, sellerName) => {
        e.stopPropagation();
        toast.success(`Vous suivez maintenant ${sellerName}`);
    };

    return (
        <div className="relative h-[500px] w-full overflow-hidden rounded-[2.5rem] mb-16 group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => navigate(`/sellers/${featuredSellers[index].id}`)}
                >
                    <img 
                        src={featuredSellers[index].coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 p-12 w-full md:w-2/3 z-10">
                <motion.div
                    key={`text-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#6aa200] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            À la une
                        </span>
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-white">{featuredSellers[index].rating} Note Moyenne</span>
                        </div>
                    </div>
                    
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-[0.9]">
                        {featuredSellers[index].name}
                    </h2>
                    
                    <p className="text-white/80 text-lg mb-8 line-clamp-2 max-w-xl">
                        {featuredSellers[index].description}
                    </p>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate(`/sellers/${featuredSellers[index].id}`)}
                            className="bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            Voir le profil <ArrowRight size={16} />
                        </button>
                        <button 
                            onClick={(e) => handleFollow(e, featuredSellers[index].name)}
                            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
                        >
                            + Suivre
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-12 right-12 flex gap-2">
                {featuredSellers.map((_, i) => (
                    <div 
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const RichSellerCard = ({ seller }) => {
    const navigate = useNavigate();

    const handleHeart = (e) => {
        e.stopPropagation();
        toast.success("Ajouté aux favoris !");
    };

    const handleShare = (e) => {
        e.stopPropagation();
        toast.success("Lien copié dans le presse-papier !");
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => navigate(`/sellers/${seller.id}`)}
            className="bg-white dark:bg-[#111] rounded-[2rem] overflow-hidden border border-neutral-100 dark:border-white/5 shadow-xl hover:shadow-2xl hover:shadow-[#6aa200]/10 transition-all duration-500 group flex flex-col h-full cursor-pointer relative"
        >
            {/* Header Image */}
            <div className="h-40 bg-neutral-100 relative overflow-hidden shrink-0">
                <img src={seller.coverImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                
                <button 
                    onClick={handleHeart}
                    className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all hover:scale-110 active:scale-95"
                >
                    <Heart size={18} />
                </button>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 flex-1 flex flex-col relative">
                <div className="flex justify-between items-end -mt-12 mb-4 relative z-10">
                    <div className="relative w-24 h-24 rounded-[1.5rem] p-1.5 bg-white dark:bg-[#111] shadow-lg group-hover:shadow-xl transition-shadow">
                        <img src={seller.image} alt={seller.name} className="w-full h-full rounded-[1.2rem] object-cover" />
                        {seller.verified && (
                             <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-[#111]">
                                 <CheckCircle2 size={10} strokeWidth={3} />
                             </div>
                        )}
                    </div>
                    <div className="flex gap-2 mb-1">
                        <div className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-purple-100 dark:border-purple-500/20">
                            <Award size={12} /> Top
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex-1">
                    <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none mb-2 group-hover:text-[#6aa200] transition-colors">
                        {seller.name}
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-4 h-10 leading-relaxed">
                        {seller.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
                        <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-[#6aa200]" /> {seller.location}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-300" />
                        <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-[#6aa200]" /> {seller.followers}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-dashed border-neutral-200 dark:border-white/10 mb-6 bg-neutral-50/50 dark:bg-white/5 rounded-xl px-2 group-hover:bg-[#6aa200]/5 transition-colors">
                    <div className="text-center p-2">
                        <div className="text-lg font-black text-neutral-900 dark:text-white">{seller.rating}</div>
                        <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Note</div>
                    </div>
                    <div className="text-center p-2 border-x border-dashed border-neutral-200 dark:border-white/10">
                        <div className="text-lg font-black text-neutral-900 dark:text-white">{seller.eventsCount}</div>
                        <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Events</div>
                    </div>
                    <div className="text-center p-2">
                        <div className="text-lg font-black text-neutral-900 dark:text-white">98%</div>
                        <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Réponse</div>
                    </div>
                </div>

                <div className="mt-auto flex gap-3">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/sellers/${seller.id}`);
                        }}
                        className="flex-1 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-md group-hover:shadow-lg group-hover:bg-[#6aa200] group-hover:text-white dark:group-hover:bg-[#6aa200] dark:group-hover:text-white border border-transparent"
                    >
                        Visiter
                    </button>
                    <button 
                        onClick={handleShare}
                        className="px-4 py-3 border border-neutral-200 dark:border-white/20 rounded-xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors text-neutral-600 dark:text-white hover:text-[#6aa200] dark:hover:text-[#6aa200]"
                    >
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Page ---

export default function SellersList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || seller.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 font-sans pb-20">
      
      <div className="container mx-auto px-6 pt-32">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-neutral-900 dark:text-white"
                >
                    Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6aa200] to-green-400">Partenaires</span>
                </motion.h1>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-lg">
                    Découvrez les organisateurs d'événements, boutiques et marques qui font vibrer la plateforme.
                </p>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0">
                <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#111] rounded-xl border border-neutral-200 dark:border-white/10 font-bold shadow-sm hover:shadow-md transition-all">
                    <Filter size={16} /> Filtres
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#6aa200] text-white rounded-xl font-bold shadow-lg shadow-[#6aa200]/20 hover:bg-[#5a8a00] transition-all">
                    <Zap size={16} fill="currentColor" /> Devenir Organisateur
                </button>
            </div>
        </div>

        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Filter Bar (Sticky) */}
        <div className="sticky top-24 z-30 mb-12">
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 rounded-2xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar items-center">
                    <button
                        onClick={() => setSelectedCategory("Tous")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                            selectedCategory === "Tous"
                            ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black"
                            : "bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                        }`}
                    >
                        Tous
                    </button>
                    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-2"></div>
                    {sellerCategories.filter(c => c !== "Tous").map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                                selectedCategory === category
                                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black"
                                : "bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Search & Sort */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#6aa200] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-neutral-100 dark:bg-white/5 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6aa200] transition-all outline-none"
                        />
                    </div>
                    <div className="hidden md:flex bg-neutral-100 dark:bg-white/5 rounded-xl p-1">
                        <button className="p-2.5 rounded-lg bg-white dark:bg-[#111] shadow-sm text-neutral-900 dark:text-white">
                            <Globe size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
                {filteredSellers.map((seller) => (
                    <RichSellerCard key={seller.id} seller={seller} />
                ))}
            </AnimatePresence>
        </div>

        {/* Footer CTA */}
        <div className="mt-32 mb-20">
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-200 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-4 py-1 rounded-full bg-[#6aa200] text-white text-xs font-bold uppercase tracking-widest mb-6">
                        LID Business
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white dark:text-neutral-900 uppercase tracking-tighter mb-6">
                        Boostez votre visibilité <br/> avec LID Events
                    </h2>
                    <p className="text-white/60 dark:text-neutral-600 text-lg mb-8">
                        Rejoignez +500 organisateurs qui utilisent notre plateforme pour vendre plus de billets et gérer leur communauté.
                    </p>
                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-white dark:bg-neutral-900 text-black dark:text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform">
                            Créer un compte Pro
                        </button>
                        <button className="px-8 py-4 border border-white/20 dark:border-neutral-900/20 text-white dark:text-neutral-900 rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 dark:hover:bg-neutral-900/10 transition-colors">
                            En savoir plus
                        </button>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-1/3">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-white">
                        <div className="text-4xl font-black mb-2">+125%</div>
                        <p className="text-sm opacity-80 mb-6">Augmentation moyenne des ventes après 3 mois sur LID.</p>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full w-[80%] bg-[#6aa200] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
