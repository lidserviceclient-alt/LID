import { useParams, Link, useNavigate } from "react-router-dom";
import PageSEO from "@/components/PageSEO";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
    MapPin, Users, Star, CheckCircle2, 
    ArrowLeft, Share2, Mail, Phone, Globe, MessageCircle, ShoppingCart,
    ArrowUpRight, Search, Calendar, ShoppingBag, ArrowRight, Clock,
    CreditCard, ShieldCheck, Heart, MoreHorizontal, LayoutGrid, List
} from "lucide-react";
import { toast } from "sonner";
import { getPublicPartnerCollection } from "@/services/publicPartnerCatalogService";
import { resolveBackendAssetUrl } from "@/services/categoryService";

// Mock events data for the seller
const mockEvents = [
    { id: 1, title: "Grand Concert Live", date: "12 Déc 2024", time: "20:00", price: "15.000 FCFA", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000", location: "Palais des Congrès", type: "Concert" },
    { id: 2, title: "Festival des Arts", date: "15 Jan 2025", time: "10:00", price: "5.000 FCFA", image: "https://images.unsplash.com/photo-1459749411177-0473ef716175?q=80&w=1000", location: "Place du Souvenir", type: "Festival" },
    { id: 3, title: "Conférence Tech", date: "22 Fév 2025", time: "09:00", price: "Gratuit", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000", location: "Radisson Blu", type: "Conférence" },
    { id: 4, title: "Soirée Networking", date: "10 Mar 2025", time: "18:30", price: "25.000 FCFA", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000", location: "Terrou-Bi", type: "Networking" },
];

const mapCollectionToSeller = (collection, fallbackId) => {
    const partner = collection?.partner;
    if (!partner) return null;

    return {
        id: partner.partnerId || fallbackId,
        name: partner.shopName || `${partner.firstName || ""} ${partner.lastName || ""}`.trim() || "Boutique",
        type: "product_seller",
        category: partner.mainCategoryName || "Boutique",
        image: partner.logoUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000",
        coverImage: partner.backgroundUrl || partner.logoUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070",
        followers: "-",
        stats: { label: "Produits", value: Number(collection?.products || 0) },
        description: partner.shopDescription || "Découvrez cette boutique partenaire.",
        location: [partner.city, partner.country].filter(Boolean).join(", "),
        rating: 5,
        verified: true,
        email: partner.email,
        phoneNumber: partner.phoneNumber,
        websiteUrl: partner.websiteUrl,
    };
};

const mapCollectionProducts = (collection) => {
    const products = Array.isArray(collection?.productsPage?.content) ? collection.productsPage.content : [];
    return products.map((product) => ({
        id: product.id,
        title: product.name,
        date: "En Stock",
        price: `${Number(product.price || 0).toFixed(2)} FCFA`,
        image: resolveBackendAssetUrl(product.mainImageUrl) || "https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=1000",
        category: product.mainCategoryName || "Produit"
    }));
};

export default function SellerDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState("items");
    const [viewMode, setViewMode] = useState("grid");
    const [query, setQuery] = useState("");
    const [showActions, setShowActions] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const collectionQuery = useQuery({
        queryKey: ["public-partner-collection", id],
        queryFn: () => getPublicPartnerCollection(id, { page: 0, size: 20 }),
        enabled: Boolean(id),
        staleTime: 60_000,
        retry: (failureCount, error) => {
            const status = error?.response?.status;
            if (status === 404) {
                return false;
            }
            return failureCount < 1;
        },
    });

    useEffect(() => {
        if (!collectionQuery.isError) return;
        const status = collectionQuery.error?.response?.status;
        const message = `${collectionQuery.error?.response?.data?.errorMessage || collectionQuery.error?.response?.data?.message || collectionQuery.error?.message || ""}`.toLowerCase();
        if (status === 404 || message.includes("partner not found")) {
            navigate("/sellers", { replace: true });
        }
    }, [collectionQuery.error, collectionQuery.isError, navigate]);

    const seller = mapCollectionToSeller(collectionQuery.data, id);
    const remoteProducts = mapCollectionProducts(collectionQuery.data);
    const loadingItems = collectionQuery.isLoading;

    const toggleFollow = () => {
        setIsFollowing(!isFollowing);
        if (!isFollowing) {
            toast.success(`Vous suivez maintenant ${seller?.name}`);
        } else {
            toast.info(`Vous ne suivez plus ${seller?.name}`);
        }
    };

    const shareShop = async () => {
        const url = window.location.href;
        const title = seller?.name || "Boutique partenaire";
        try {
            if (navigator.share) {
                await navigator.share({ title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            toast.success("Lien copié.");
        } catch {
            toast.error("Impossible de partager pour le moment.");
        }
    };

    const contactShop = () => {
        if (seller?.email) {
            window.location.href = `mailto:${seller.email}?subject=${encodeURIComponent(`Contact boutique ${seller.name || ""}`)}`;
            return;
        }
        if (seller?.phoneNumber) {
            const phone = `${seller.phoneNumber}`.replace(/\s+/g, "");
            window.location.href = `https://wa.me/${phone.replace(/[^\d+]/g, "").replace("+", "")}`;
            return;
        }
        toast.info("Contact indisponible pour cette boutique.");
    };

    const openExternal = (value, type) => {
        if (!value) {
            toast.info("Information non disponible.");
            return;
        }
        if (type === "mail") {
            window.location.href = `mailto:${value}`;
            return;
        }
        if (type === "phone") {
            window.location.href = `tel:${value}`;
            return;
        }
        const href = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
        window.open(href, "_blank", "noopener,noreferrer");
    };

    const openItemDetails = (item) => {
        if (!item?.id) return;
        if (seller?.type === "product_seller") {
            navigate(`/product/${item.id}`);
            return;
        }
        navigate(`/tickets/${item.id}`);
    };

    const toggleFavorite = (itemId) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
                toast.info("Retiré des favoris.");
            } else {
                next.add(itemId);
                toast.success("Ajouté aux favoris.");
            }
            return next;
        });
    };

    if (collectionQuery.isLoading || !seller) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin w-8 h-8 border-4 border-[#6aa200] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const items = seller.type === 'product_seller' ? remoteProducts : mockEvents;
    const filteredItems = items.filter((item) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return `${item.title || ""}`.toLowerCase().includes(q) || `${item.category || item.type || ""}`.toLowerCase().includes(q);
    });

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 pb-20">
            <PageSEO
              title={seller?.name}
              description={seller?.description || (seller?.name ? `Découvrez la boutique ${seller.name} sur Lid.` : undefined)}
              canonical={seller?.id ? `/sellers/${seller.id}` : undefined}
            />
            {/* --- Professional Header --- */}
            <header className="relative bg-white border-b border-neutral-200">
                {/* Cover Area */}
                <div className="h-64 md:h-80 w-full overflow-hidden bg-neutral-900 relative group">
                    <img 
                        src={seller.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Header Actions */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setActiveTab("items");
                                    setTimeout(() => {
                                        const el = document.getElementById("seller-items-search");
                                        if (el) el.focus();
                                    }, 100);
                                }}
                                className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                            >
                                <Search size={18} />
                            </button>
                            <button
                                onClick={() => setShowActions((v) => !v)}
                                className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            {showActions ? (
                                <div className="absolute right-6 top-16 bg-white text-neutral-900 rounded-xl border border-neutral-200 shadow-xl p-2 z-20 min-w-[180px]">
                                    <button onClick={shareShop} className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm font-medium">Partager la boutique</button>
                                    <button onClick={contactShop} className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm font-medium">Contacter</button>
                                    <button onClick={() => { setShowActions(false); toast.info("Signalement envoyé."); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm font-medium">Signaler</button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Profile Bar */}
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 md:-mt-16 mb-8 relative z-10">
                        
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/5">
                                <img 
                                    src={seller.image} 
                                    alt={seller.name} 
                                    className="w-full h-full object-cover rounded-xl bg-neutral-100"
                                />
                            </div>
                            {seller.verified && (
                                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-[3px] border-white shadow-sm" title="Compte Vérifié">
                                    <CheckCircle2 size={16} strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        {/* Identity & Stats */}
                        <div className="flex-1 w-full md:pb-2">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight leading-none mb-2 flex items-center gap-3">
                                        {seller.name}
                                        <span className="px-2 py-1 rounded-md bg-[#6aa200]/10 text-[#6aa200] text-[10px] font-bold uppercase tracking-wider border border-[#6aa200]/20 align-middle">
                                            {seller.category}
                                        </span>
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-500 font-medium">
                                        <span className="flex items-center gap-1.5"><MapPin size={16} /> {seller.location}</span>
                                        <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                        <span className="flex items-center gap-1.5"><Users size={16} /> {seller.followers} Article(s)</span>
                                        <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                        <span className="flex items-center gap-1 text-amber-500 font-bold"><Star size={16} fill="currentColor" /> {seller.rating}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                                    <button 
                                        onClick={toggleFollow}
                                        className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all border ${
                                            isFollowing 
                                            ? "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50" 
                                            : "bg-neutral-900 border-neutral-900 text-white hover:bg-black"
                                        }`}
                                    >
                                        {isFollowing ? "Suivi" : "Suivre"}
                                    </button>
                                    <button onClick={contactShop} className="flex-1 lg:flex-none px-6 py-2.5 rounded-lg font-bold text-sm bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all">
                                        Contacter
                                    </button>
                                    <button onClick={shareShop} className="p-2.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-8 border-t border-neutral-100 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'items', label: seller.type === 'product_seller' ? 'Boutique' : 'Article', icon: seller.type === 'product_seller' ? ShoppingBag : ShoppingCart },
                            { id: 'about', label: 'À Propos', icon: ShieldCheck },
                            { id: 'reviews', label: 'Avis', icon: Star },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? "border-neutral-900 text-neutral-900" 
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-200"
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="container mx-auto px-4 sm:px-6 max-w-7xl py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Sidebar (Desktop) */}
                    <aside className="hidden lg:block lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">Informations</h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <div className="text-neutral-500 mb-1">Membre depuis</div>
                                    <div className="font-semibold">Octobre 2023</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 mb-1">Temps de réponse</div>
                                    <div className="font-semibold text-green-600">~ 1 heure</div>
                                </div>
                                <div>
                                    <div className="text-neutral-500 mb-1">Localisation</div>
                                    <div className="font-semibold">{seller.location}</div>
                                </div>
                            </div>
                            
                            <div className="h-px bg-neutral-100 my-5" />
                            
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">Réseaux</h3>
                            <div className="flex gap-2">
                                <button onClick={() => openExternal(seller?.websiteUrl, "web")} className="p-2 bg-neutral-50 rounded-lg hover:bg-[#6aa200] hover:text-white transition-colors text-neutral-600"><Globe size={16} /></button>
                                <button onClick={() => openExternal(seller?.email, "mail")} className="p-2 bg-neutral-50 rounded-lg hover:bg-[#6aa200] hover:text-white transition-colors text-neutral-600"><Mail size={16} /></button>
                                <button onClick={() => openExternal(seller?.phoneNumber, "phone")} className="p-2 bg-neutral-50 rounded-lg hover:bg-[#6aa200] hover:text-white transition-colors text-neutral-600"><Phone size={16} /></button>
                            </div>
                        </div>
                    </aside>

                    {/* Center Content */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            {activeTab === 'items' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {/* Filters & View Toggle */}
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold">
                                            {seller.type === 'product_seller' ? 'Tous les produits' : 'Prochains Événements'} 
                                            <span className="ml-2 text-neutral-400 text-sm font-medium">({filteredItems.length})</span>
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <div className="hidden md:flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
                                                <Search size={14} className="text-neutral-400" />
                                                <input
                                                    id="seller-items-search"
                                                    value={query}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                    placeholder="Rechercher..."
                                                    className="text-sm outline-none bg-transparent w-40"
                                                />
                                            </div>
                                            <div className="flex bg-white border border-neutral-200 rounded-lg p-1">
                                                <button 
                                                    onClick={() => setViewMode('grid')}
                                                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
                                                >
                                                    <LayoutGrid size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => setViewMode('list')}
                                                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
                                                >
                                                    <List size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Grid/List */}
                                    {loadingItems ? (
                                        <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-500">
                                            Chargement des produits...
                                        </div>
                                    ) : (
                                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                        {filteredItems.map((item) => (
                                            <div 
                                                key={item.id}
                                                onClick={() => openItemDetails(item)}
                                                className={`group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-[#6aa200]/30 transition-all duration-300 cursor-pointer ${viewMode === 'list' ? 'flex flex-row h-40' : 'flex-col'}`}
                                            >
                                                {/* Image */}
                                                <div className={`relative overflow-hidden bg-neutral-100 ${viewMode === 'list' ? 'w-48 shrink-0' : 'aspect-[4/3] w-full'}`}>
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.title} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                    />
                                                    {item.date && viewMode === 'grid' && (
                                                        <div className="absolute top-3 left-3">
                                                            <span className="bg-white/90 backdrop-blur-md text-neutral-900 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border border-neutral-100">
                                                                {item.date}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Details */}
                                                <div className="p-4 flex flex-col flex-1 justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6aa200] mb-1 block">
                                                                {item.category || item.type}
                                                            </span>
                                                            {viewMode === 'list' && (
                                                                <span className="text-lg font-black text-neutral-900">{item.price}</span>
                                                            )}
                                                        </div>
                                                        <h3 className="font-bold text-neutral-900 leading-tight mb-2 group-hover:text-[#6aa200] transition-colors line-clamp-2">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex gap-2">
                                                            {item.location && (
                                                                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3">
                                                                    <MapPin size={12} /> {item.location}
                                                                </div>
                                                            )}
                                                            {item.time && (
                                                                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3">
                                                                    <Clock size={12} /> {item.time}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {viewMode === 'grid' && (
                                                        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-2">
                                                            <span className="text-lg font-bold text-neutral-900">{item.price}</span>
                                                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }} className={`transition-colors ${favorites.has(item.id) ? "text-[#6aa200]" : "text-neutral-400 hover:text-[#6aa200]"}`}>
                                                                <Heart size={18} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    
                                                    {viewMode === 'list' && (
                                                        <div className="flex items-center gap-3 mt-auto">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openItemDetails(item); }}
                                                                className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                                                            >
                                                                Voir les détails
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {filteredItems.length === 0 ? (
                                            <div className="col-span-full bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-500">
                                                Aucun résultat.
                                            </div>
                                        ) : null}
                                    </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'about' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-xl border border-neutral-200 p-8"
                                >
                                    <h2 className="text-xl font-bold mb-4">À propos de {seller.name}</h2>
                                    <p className="text-neutral-600 leading-relaxed mb-8">
                                        {seller.description}
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-green-100 text-green-700 rounded-lg"><ShieldCheck size={20} /></div>
                                                <h4 className="font-bold">Identité Vérifiée</h4>
                                            </div>
                                            <p className="text-xs text-neutral-500">Les documents d'identité et l'entreprise de ce vendeur ont été vérifiés par nos équipes.</p>
                                        </div>
                                        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><CreditCard size={20} /></div>
                                                <h4 className="font-bold">Paiement Sécurisé</h4>
                                            </div>
                                            <p className="text-xs text-neutral-500">Toutes les transactions effectuées avec ce vendeur sont couvertes par la garantie LID.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'reviews' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-xl border border-neutral-200 p-8 text-center"
                                >
                                    <div className="max-w-md mx-auto">
                                        <div className="text-5xl font-black text-neutral-900 mb-2">4.9</div>
                                        <div className="flex justify-center gap-1 text-amber-400 mb-2">
                                            {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" size={24} />)}
                                        </div>
                                        <p className="text-neutral-500 font-medium mb-8">Note globale basée sur 124 avis</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
