import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, Ticket, MapPin, Calendar, Star, TrendingUp, Music, Globe, Trophy, ShieldCheck, Mail, ArrowRight, Zap } from "lucide-react";
import Barcode from "react-barcode";
import { getTicketEvents } from "@/services/ticketService";
import { useCart } from "@/features/cart/CartContext";
import { useTheme } from "@/features/theme/theme-provider";
import { toast } from "sonner";

// --- Theme Utility ---
const getTheme = (category) => {
    switch(category) {
        case 'Concert': return { bg: 'bg-[#ff007f]', text: 'text-[#ff007f]', accent: 'border-[#ff007f]', gradient: 'from-[#ff007f]/90 to-[#ff007f]/40' };
        case 'Gala': return { bg: 'bg-[#FFD700]', text: 'text-[#FFD700]', accent: 'border-[#FFD700]', gradient: 'from-[#FFD700]/90 to-[#FFD700]/40' };
        case 'Sport': return { bg: 'bg-[#0055ff]', text: 'text-[#0055ff]', accent: 'border-[#0055ff]', gradient: 'from-[#0055ff]/90 to-[#0055ff]/40' };
        case 'Conférence': return { bg: 'bg-[#1e293b]', text: 'text-[#1e293b]', accent: 'border-[#1e293b]', gradient: 'from-[#1e293b]/90 to-[#1e293b]/40' };
        case 'Art': return { bg: 'bg-[#ff7f50]', text: 'text-[#ff7f50]', accent: 'border-[#ff7f50]', gradient: 'from-[#ff7f50]/90 to-[#ff7f50]/40' };
        default: return { bg: 'bg-black', text: 'text-black', accent: 'border-black', gradient: 'from-black/90 to-black/40' };
    }
};

// --- Components ---

const Marquee = () => {
  return (
    <div className="relative flex overflow-x-hidden bg-black text-white py-3 border-y border-white/10">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-4">
                <Star className="w-3 h-3 text-purple-500" />
                Événements Exclusifs LID
                <span className="w-1 h-1 rounded-full bg-white/50"></span>
                Partenaire Officiel
                <span className="w-1 h-1 rounded-full bg-white/50"></span>
                Paiement Sécurisé
            </span>
        ))}
      </motion.div>
    </div>
  );
};

const ModernTicket = ({ ticket }) => {
    const { addToCart } = useCart();
    const { theme: appTheme } = useTheme();
    const navigate = useNavigate();
    const theme = getTheme(ticket?.category);
    const dateValue = ticket?.date ? new Date(ticket.date) : null;
    const hasValidDate = Boolean(dateValue) && !Number.isNaN(dateValue.getTime());
    const day = hasValidDate ? dateValue.getDate() : "--";
    const month = hasValidDate ? dateValue.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase() : "---";
    const year = hasValidDate ? dateValue.getFullYear() : "";
    const time = hasValidDate
      ? dateValue.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : "--:--";

    const priceNumber = Number(ticket?.price);
    const hasPrice = Number.isFinite(priceNumber);
    const priceLabel = hasPrice ? `${priceNumber.toLocaleString("fr-FR")} FCFA` : "—";

    const safeImage = ticket?.image || "/imgs/wall-1.jpg";
    const safeLocation = ticket?.location || "Lieu à confirmer";

    return (
        <div
            onClick={() => navigate(`/tickets/${encodeURIComponent(ticket.id)}`)}
            className="group w-full max-w-[1000px] mx-auto relative cursor-pointer perspective-1000"
        >
            {/* Background Glow */}
            <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${theme.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`}></div>
            
            <div className="relative flex flex-col md:flex-row w-full bg-white dark:bg-[#111] overflow-hidden border border-gray-100 dark:border-white/10 shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
                
                {/* Left: Image Area */}
                <div className="w-full md:w-[280px] shrink-0 relative h-64 md:h-auto overflow-hidden">
                    <img 
                        src={safeImage} 
                        alt={ticket.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/imgs/wall-1.jpg";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg`}>
                            {ticket.category}
                        </span>
                    </div>

                    {/* Date Badge Overlay */}
                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-black leading-none tracking-tighter">{day}</span>
                            <div className="flex flex-col pb-1">
                                <span className="text-xl font-bold leading-none">{month}</span>
                                <span className="text-xs opacity-80">{year}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle: Info */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative bg-white dark:bg-[#111]">
                     {/* Watermark */}
                     <div className="absolute  right-0 top-0 p-32 opacity-[0.03] pointer-events-none select-none">
                        <h1 className="text-9xl top-0 rotate-0 font-black uppercase tracking-tighter leading-[0.9] text-neutral-900 dark:text-white">LID</h1>
                     </div>

                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-60">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">{safeLocation}</span>
                        </div>
                        
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4 text-neutral-900 dark:text-white line-clamp-2">
                            {ticket.title}
                        </h2>

                        <div className="flex flex-wrap gap-4 mt-4">
                             <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                 <Calendar className="w-4 h-4 text-gray-400" />
                                 <span className="text-sm font-bold">{time}</span>
                             </div>
                             <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                 <Star className="w-4 h-4 text-gray-400" />
                                 <span className="text-sm font-bold">Accès VIP</span>
                             </div>
                        </div>
                     </div>

                     <div className="mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-white/10 flex items-center justify-between gap-4">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                                 <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                             </div>
                             <span className="text-xs font-bold uppercase tracking-widest opacity-50">Vérifié par LID</span>
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="text-2xl font-black tracking-tight whitespace-nowrap">
                              {priceLabel}
                           </div>
                           <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (ticket?.available === false) {
                                  toast.error("Événement indisponible");
                                  return;
                                }
                                addToCart({
                                  ...ticket,
                                  price: hasPrice ? priceNumber : 0,
                                  type: "ticket",
                                  name: ticket.title,
                                  brand: "LID Events"
                                });
                                toast.success("Ajouté au panier");
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={ticket?.available === false}
                           >
                              <Zap className="w-4 h-4" />
                              Ajouter
                           </button>
                         </div>
                     </div>
                </div>

                {/* Divider */}
                <div className="relative hidden md:flex flex-col items-center justify-center w-12 bg-[#f8f9fa] dark:bg-[#0a0a0a] border-l border-dashed border-gray-200 dark:border-white/10">
                     <div className="absolute -top-3 w-6 h-6 rounded-full bg-gray-50 dark:bg-[#020202]"></div>
                     <div className="absolute -bottom-3 w-6 h-6 rounded-full bg-gray-50 dark:bg-[#020202]"></div>
                     <div className="rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300">
                         Billet Entrée
                     </div>
                </div>

                {/* Right: Real Barcode */}
                <div className="w-full md:w-[180px] shrink-0 bg-[#f8f9fa] dark:bg-[#0a0a0a] p-4 flex flex-col items-center justify-center border-l border-dashed border-gray-200 dark:border-white/10 overflow-hidden relative">
                     <div className="md:rotate-90 md:absolute md:inset-0 md:flex md:items-center md:justify-center">
                        <Barcode 
                            value={ticket.id} 
                            width={19.5}
                            height={750}
                            displayValue={true}
                            background="transparent"
                            lineColor={appTheme === 'dark' ? '#ffffff' : '#000000'}
                            fontSize={14}
                        />
                     </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Catalog Page ---

export default function TicketCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    getTicketEvents()
      .then((list) => {
        if (cancelled) return;
        setEvents(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.message || "Impossible de charger la billetterie.";
        setError(message);
        toast.error(message);
        setEvents([]);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    (Array.isArray(events) ? events : []).forEach((ev) => {
      const c = `${ev?.category || ""}`.trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [events]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (Array.isArray(events) ? events : []).filter((ticket) => {
      const matchesSearch = !q || `${ticket.title || ""}`.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === "Tous" || ticket.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  const featuredTicket = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    return list.find((t) => t?.available !== false) || list[0] || null;
  }, [events]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 font-sans pb-20 selection:bg-purple-500 selection:text-white">
      
      {/* Immersive Hero Section */}
      <motion.div 
        style={{ opacity, scale }}
        className="relative h-[85vh] w-full overflow-hidden bg-black flex flex-col items-center justify-center"
      >
          {/* Video/Image Background */}
          <div className="absolute inset-0">
             <motion.div 
                animate={{ opacity: [0.4, 0.6, 0.4], scale: [1.05, 1.1, 1.05] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/3b/88/8a/3b888ae33caddd009ea0262a6dace304.jpg')] bg-cover bg-center"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                  <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-bold uppercase tracking-[0.3em] text-white mb-6">
                      La Collection Officielle
                  </span>
                  <h1 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8 mix-blend-overlay">
                      Moments <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Uniques</span>
                  </h1>
              </motion.div>

              {/* Stats Bar */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 text-white/50"
              >
                  <div className="flex flex-col items-center gap-2">
                      <Globe className="w-6 h-6 text-white" />
                      <span className="text-xs font-bold uppercase tracking-widest">Accès Mondial</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-white" />
                      <span className="text-xs font-bold uppercase tracking-widest">100% Vérifié</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                      <Zap className="w-6 h-6 text-white" />
                      <span className="text-xs font-bold uppercase tracking-widest">Réservation Immédiate</span>
                  </div>
              </motion.div>
          </div>
      </motion.div>

      {/* Marquee Strip */}
      <Marquee />

      <div className="max-w-[1400px] mx-auto px-6 -mt-20 relative z-20">
        
        {/* Controls Bar (Sticky Glass) */}
        <div className="sticky top-24 mt-40 z-40 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 p-4 rounded-3xl shadow-2xl mb-20 flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar items-center">
                <button
                  onClick={() => setSelectedCategory("Tous")}
                  className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                    selectedCategory === "Tous"
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                  }`}
                >
                  Tous
                </button>
                <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800 mx-2"></div>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                      selectedCategory === category
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-96 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-purple-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="RECHERCHER ÉVÉNEMENTS, ARTISTES..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-neutral-100 dark:bg-black/50 border-none rounded-2xl text-xs font-bold tracking-wider focus:ring-2 focus:ring-purple-500 transition-all uppercase placeholder:text-neutral-400"
                />
            </div>
        </div>

        {/* Featured Section (If no search) */}
        {!error && !isLoading && featuredTicket && !searchQuery && selectedCategory === "Tous" && (
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-32"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Tendance</h3>
                        <p className="text-neutral-500 text-sm">L'événement le plus populaire de la semaine</p>
                    </div>
                </div>
                <div className="transform scale-105 origin-top">
                    <ModernTicket ticket={featuredTicket} />
                </div>
            </motion.div>
        )}

        {/* Main Grid */}
        <div className="space-y-16">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    <Music size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Événements à Venir</h3>
                    <p className="text-neutral-500 text-sm">Réservez vos places avant la rupture</p>
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {error ? (
                    <motion.div className="text-center py-32 opacity-60 bg-neutral-100 dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
                        <Ticket className="w-16 h-16 mx-auto mb-6 text-neutral-400" />
                        <h3 className="text-3xl font-black uppercase mb-2">Erreur</h3>
                        <p className="text-neutral-500">{error}</p>
                    </motion.div>
                ) : isLoading ? (
                    <motion.div className="text-center py-32 opacity-60 bg-neutral-100 dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
                        <Ticket className="w-16 h-16 mx-auto mb-6 text-neutral-400" />
                        <h3 className="text-3xl font-black uppercase mb-2">Chargement...</h3>
                        <p className="text-neutral-500">Veuillez patienter</p>
                    </motion.div>
                ) : filteredTickets.length > 0 ? (
                    <div className="flex flex-col gap-16">
                        {filteredTickets.map((ticket, index) => (
                            <motion.div 
                              key={ticket.id}
                              initial={{ opacity: 0, y: 100 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: "-100px" }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                            >
                                <ModernTicket ticket={ticket} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div className="text-center py-32 opacity-50 bg-neutral-100 dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800">
                        <Ticket className="w-16 h-16 mx-auto mb-6 text-neutral-400" />
                        <h3 className="text-3xl font-black uppercase mb-2">Aucun Événement</h3>
                        <p className="text-neutral-500">Essayez de modifier vos filtres</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Newsletter / Footer Section */}
        <div className="mt-40 mb-20">
            <div className="relative overflow-hidden rounded-[3rem] bg-black p-12 md:p-24 text-center">
                <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/56/a3/86/56a3868a3ca19fe307c1c43f5b246344.jpg')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8">
                        Ne Manquez <br/> <span className="text-purple-500">Rien</span>
                    </h2>
                    <p className="text-white/60 mb-10 text-lg">Rejoignez +50 000 membres et accédez aux préventes exclusives.</p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <input 
                            type="email" 
                            placeholder="VOTRE ADRESSE EMAIL" 
                            className="flex-1 px-8 py-5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:bg-white/20 outline-none transition-all uppercase tracking-widest text-xs font-bold"
                        />
                        <button className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform">
                            Rejoindre
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}
