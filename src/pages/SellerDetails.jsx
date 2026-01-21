import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
    MapPin, Users, Star, CheckCircle2, 
    ArrowLeft, Share2, Mail, Phone, Globe, MessageCircle, Heart,
    ArrowUpRight, Search, Filter
} from "lucide-react";
import { sellers } from "@/assets/data/sellers";
import { toast } from "sonner";

// Mock events data for the seller
const mockEvents = [
    { id: 1, title: "Grand Concert Live", date: "12 Déc 2024", price: "15.000 FCFA", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000" },
    { id: 2, title: "Festival des Arts", date: "15 Jan 2025", price: "5.000 FCFA", image: "https://images.unsplash.com/photo-1459749411177-0473ef716175?q=80&w=1000" },
    { id: 3, title: "Conférence Tech", date: "22 Fév 2025", price: "Gratuit", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000" },
    { id: 4, title: "Soirée Networking", date: "10 Mar 2025", price: "25.000 FCFA", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000" },
];

// Mock products data
const mockProducts = [
    { id: 101, title: "iPhone 15 Pro Max", date: "En Stock", price: "950.000 FCFA", image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1000", category: "Tech" },
    { id: 102, title: "Sony WH-1000XM5", date: "Promo", price: "250.000 FCFA", image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=1000", category: "Audio" },
    { id: 103, title: "MacBook Air M2", date: "En Stock", price: "890.000 FCFA", image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000", category: "Laptop" },
    { id: 104, title: "iPad Pro 12.9", date: "Nouveau", price: "750.000 FCFA", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000", category: "Tablette" },
];

export default function SellerDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState("items");
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 250]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => {
        const foundSeller = sellers.find(s => s.id === id);
        if (foundSeller) {
            setSeller(foundSeller);
        }
        window.scrollTo(0, 0);
    }, [id]);

    const toggleFollow = () => {
        setIsFollowing(!isFollowing);
        if (!isFollowing) {
            toast.success(`Vous suivez maintenant ${seller.name}`);
        } else {
            toast.info(`Vous ne suivez plus ${seller.name}`);
        }
    };

    if (!seller) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="animate-spin w-8 h-8 border-4 border-[#6aa200] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#6aa200] selection:text-white">
            
            {/* Immersive Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <motion.div style={{ y, opacity }} className="absolute inset-0">
                    <img 
                        src={seller.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050505]" />
                </motion.div>
                
                {/* Navigation Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-3">
                        <button className="w-12 h-12 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
                            <Search size={20} />
                        </button>
                        <button className="w-12 h-12 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 w-full p-8 pb-12 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex flex-col md:flex-row gap-8 items-end"
                        >
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-[#6aa200] to-green-400 shrink-0">
                                <img 
                                    src={seller.image} 
                                    alt={seller.name} 
                                    className="w-full h-full rounded-full object-cover border-4 border-[#050505]"
                                />
                            </div>
                            
                            <div className="flex-1 mb-2">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                                        {seller.category}
                                    </span>
                                    {seller.verified && (
                                        <span className="flex items-center gap-1 text-[#6aa200] font-bold text-xs uppercase tracking-widest">
                                            <CheckCircle2 size={14} fill="currentColor" className="text-[#6aa200]" /> Vérifié
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
                                    {seller.name}
                                </h1>
                                <div className="flex flex-wrap gap-6 text-sm font-medium text-white/60">
                                    <span className="flex items-center gap-2"><MapPin size={16} /> {seller.location}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="flex items-center gap-2"><Users size={16} /> {seller.followers} Abonnés</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="flex items-center gap-2 text-yellow-400"><Star size={16} fill="currentColor" /> {seller.rating}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                    onClick={toggleFollow}
                                    className={`flex-1 md:flex-none px-8 py-4 rounded-full font-bold uppercase tracking-widest transition-all ${
                                        isFollowing 
                                        ? "bg-white/10 text-white hover:bg-white/20" 
                                        : "bg-[#6aa200] text-black hover:bg-[#5a8a00]"
                                    }`}
                                >
                                    {isFollowing ? "Suivi" : "Suivre"}
                                </button>
                                <button className="px-6 py-4 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors">
                                    <MessageCircle size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Info Column */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center hover:bg-white/10 transition-colors">
                                <div className="text-3xl font-black text-[#6aa200] mb-1">{seller.stats?.value || 0}</div>
                                <div className="text-[10px] uppercase font-bold text-neutral-400">{seller.stats?.label || "Items"}</div>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center hover:bg-white/10 transition-colors">
                                <div className="text-3xl font-black text-[#6aa200]">98%</div>
                                <div className="text-[10px] uppercase font-bold text-neutral-400">Réponse</div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                            <h3 className="text-lg font-bold uppercase tracking-widest mb-4 text-white/40">À Propos</h3>
                            <p className="text-lg leading-relaxed text-white/80 mb-8 font-light">
                                {seller.description}
                            </p>
                            
                            <div className="space-y-4">
                                <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-full"><Globe size={18} /></div>
                                        <span className="text-sm font-bold">Site Web</span>
                                    </div>
                                    <ArrowUpRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </a>
                                <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-full"><Mail size={18} /></div>
                                        <span className="text-sm font-bold">Email</span>
                                    </div>
                                    <ArrowUpRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </a>
                                <a href="#" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-full"><Phone size={18} /></div>
                                        <span className="text-sm font-bold">Téléphone</span>
                                    </div>
                                    <ArrowUpRight size={16} className="text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Column */}
                    <div className="lg:col-span-8">
                        {/* Custom Tabs */}
                        <div className="flex items-center gap-8 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
                            {['items', 'reviews', 'gallery'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-bold uppercase tracking-widest whitespace-nowrap relative ${
                                        activeTab === tab ? "text-[#6aa200]" : "text-white/40 hover:text-white"
                                    }`}
                                >
                                    {tab === 'items' && (seller.type === 'product_seller' ? 'Produits' : 'Événements')}
                                    {tab === 'reviews' && 'Avis Clients'}
                                    {tab === 'gallery' && 'Galerie'}
                                    {activeTab === tab && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-[#6aa200] rounded-t-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {activeTab === 'items' && (seller.type === 'product_seller' ? 'Nouveautés' : 'Prochains Événements')}
                                {activeTab === 'reviews' && 'Ce qu\'ils en pensent'}
                                {activeTab === 'gallery' && 'Photos récentes'}
                            </h2>
                            {activeTab === 'items' && (
                                <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                                    <Filter size={14} /> Filtrer
                                </button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'items' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {(seller.type === 'product_seller' ? mockProducts : mockEvents).map((item) => (
                                        <div 
                                            key={item.id}
                                            className="group relative bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden hover:border-[#6aa200]/50 transition-all duration-500"
                                        >
                                            <div className="aspect-[4/3] overflow-hidden relative">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                                        {item.date}
                                                    </span>
                                                </div>
                                                <button className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-[#6aa200] transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                                    <Heart size={18} />
                                                </button>
                                            </div>
                                            
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold leading-tight mb-1 group-hover:text-[#6aa200] transition-colors">{item.title}</h3>
                                                        <span className="text-xs font-medium text-white/40">{seller.type === 'product_seller' ? item.category : 'Concert'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <span className="text-xl font-black text-white">{item.price}</span>
                                                    <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                                                        <ArrowUpRight size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === 'reviews' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white/5 rounded-3xl p-12 text-center border border-white/5 border-dashed"
                                >
                                    <div className="flex justify-center gap-1 mb-4 text-yellow-400">
                                        <Star fill="currentColor" />
                                        <Star fill="currentColor" />
                                        <Star fill="currentColor" />
                                        <Star fill="currentColor" />
                                        <Star fill="currentColor" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">4.9 / 5</h3>
                                    <p className="text-white/40">Basé sur 124 avis clients vérifiés</p>
                                </motion.div>
                            )}

                            {activeTab === 'gallery' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                                >
                                    {[1,2,3,4,5,6].map(i => (
                                        <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
