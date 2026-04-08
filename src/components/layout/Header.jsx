import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/features/theme/theme-provider.jsx';
import { cn } from '@/utils/cn';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, User, Search, ChevronDown, 
  Zap, Sun, Moon, Globe, Menu as MenuIcon, Phone, AlignLeft, X,
  Home, Grid, Heart, HelpCircle, Package, Mail, Bell
} from 'lucide-react';
import SearchBar from '../Search.jsx';
import Logo from '../Logo.jsx';
import MegaMenu from '../MegaMenu.jsx';
import MobileMenu from '../MobileMenu.jsx';
import Offer from '../offer.jsx';
import { useCart } from '@/features/cart/CartContext.jsx';
import NavMobile from '../NavMobile.jsx'
import { getCurrentUserPayload } from '@/services/authService.js';
import { useAppConfig } from '@/features/appConfig/useAppConfig.js'
import { useFlashSaleProduct } from '@/features/flashSale/useFlashSaleProduct.js'
import { useLatestCatalogProducts } from '@/features/catalog/useLatestCatalogProducts.js'
import { useCustomerSession } from '@/features/customerSession/CustomerSessionContext.jsx';

const DEFAULT_AVATAR = 'https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png';

const normalizeFirstName = (value) => {
  const raw = `${value || ''}`.trim();
  if (!raw) return '';
  const firstToken = raw.split(/\s+/)[0];
  if (!firstToken) return '';
  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
};

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { cartCount, setIsCartOpen, cartTotal } = useCart();
  const { data: appConfig } = useAppConfig()
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifDisplayProducts, setNotifDisplayProducts] = useState([]);
  const [notifSeenAt, setNotifSeenAt] = useState(() => {
    const raw = Number(localStorage.getItem("lid_last_seen_products") || "0");
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  });
  const { data: flashSaleProduct } = useFlashSaleProduct(1)
  const { data: latestProducts } = useLatestCatalogProducts(30)
  const hasFlashSale = Boolean(flashSaleProduct)
  const location = useLocation();
  const tokenPayload = useMemo(() => getCurrentUserPayload(), []);
  const customerSession = useCustomerSession();
  const userProfile = customerSession?.customer || null;

  const displayName = useMemo(() => {
    return normalizeFirstName(userProfile?.firstName || tokenPayload?.firstName) || 'Utilisateur';
  }, [tokenPayload?.firstName, userProfile?.firstName]);

  const getLastSeenProductsTs = () => {
    const raw = Number(localStorage.getItem("lid_last_seen_products") || "0");
    return Number.isFinite(raw) && raw > 0 ? raw : 0;
  };

  const getLatestProductTs = (products) => {
    const list = Array.isArray(products) ? products : [];
    let latest = 0;
    for (const p of list) {
      const t = p?.dateCreation ? new Date(p.dateCreation).getTime() : 0;
      if (Number.isFinite(t) && t > latest) latest = t;
    }
    return latest;
  };

  const notifState = useMemo(() => {
    const lastSeen = Math.max(getLastSeenProductsTs(), notifSeenAt);
    const list = Array.isArray(latestProducts) ? latestProducts : [];
    const fresh = list.filter((p) => {
      const t = p?.dateCreation ? new Date(p.dateCreation).getTime() : 0;
      return Number.isFinite(t) && t > lastSeen;
    });
    return { unreadCount: fresh.length, products: fresh.slice(0, 8) };
  }, [latestProducts, notifSeenAt]);
  const notifUnreadCount = notifState.unreadCount;

  const openNotifications = async () => {
    const products = Array.isArray(latestProducts) ? latestProducts : [];
    if (isNotifOpen) {
      setIsNotifOpen(false);
      setNotifDisplayProducts([]);
      return;
    }
    const lastSeen = Math.max(getLastSeenProductsTs(), notifSeenAt);
    const fresh = products.filter((p) => {
      const t = p?.dateCreation ? new Date(p.dateCreation).getTime() : 0;
      return Number.isFinite(t) && t > lastSeen;
    });
    setNotifDisplayProducts(fresh.slice(0, 8));
    setIsNotifOpen(true);
    if (fresh.length > 0) {
      const lastSeen = getLastSeenProductsTs();
      const latest = getLatestProductTs(products);
      const nextSeen = Math.max(lastSeen, latest);
      localStorage.setItem("lid_last_seen_products", `${nextSeen}`);
      setNotifSeenAt(nextSeen);
    }
  };


  const avatarUrl = userProfile?.avatarUrl || tokenPayload?.avatarUrl || DEFAULT_AVATAR;
  const isAuthenticated = Boolean(tokenPayload?.sub);
  const supportEmail = appConfig?.contactEmail || 'support@lid.com'
  const supportPhone = appConfig?.contactPhone || '+225 07 34 342 324'
  const supportPhoneHref = `tel:${supportPhone.replace(/[^\d+]/g, '')}`

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search on route change
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsSearchOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <>
      <header className="w-full sticky top-0 z-[100] font-sans pb-16 lg:pb-0">
        
        {/* =========================================
            TOP STRIP (Desktop Only)
        ========================================= */}
        <div className="hidden lg:block bg-neutral-900 text-white text-[11px] font-medium tracking-wide py-2.5">
          <div className="max-w-[1500px] mx-auto px-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                  <a
                    href={supportPhoneHref}
                    className="flex items-center gap-2 opacity-80 hover:opacity-100 hover:text-[#6aa200] cursor-pointer transition-all"
                  >
                      <Phone size={13} className="text-[#6aa200]" /> {supportPhone}
                  </a>
                  <span className="flex items-center gap-2 opacity-80 hover:opacity-100 hover:text-[#6aa200] cursor-pointer transition-all">
                      <Mail size={13} className="text-[#6aa200]" /> {supportEmail}
                  </span>
                  <span className="w-px h-3 bg-neutral-700"></span>
<span className="opacity-80">La livraison comprend différentes modalités.</span>
              </div>
              <div className="flex items-center gap-6">
                  <Link to="/tracking" className="hover:text-[#6aa200] transition-colors flex items-center gap-1">
                      Suivre ma commande
                  </Link>
                  <Link to="/help" className="hover:text-[#6aa200] transition-colors flex items-center gap-1">
                      <HelpCircle size={13} /> Aide
                  </Link>
                  <div className="w-px h-3 bg-neutral-700"></div>
                  <div className="flex items-center gap-4">
                      <span className="cursor-pointer hover:text-[#6aa200] transition-colors font-bold">FR</span>
                      <span className="cursor-pointer hover:text-[#6aa200] transition-colors font-bold">CFA</span>
                  </div>
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="hover:text-[#6aa200] transition-colors ml-2"
                  >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                  </button>
              </div>
          </div>
        </div>

        {/* =========================================
            STICKY HEADER GROUP (Main + Nav)
        ========================================= */}
        <div className="w-full bg-white dark:bg-neutral-950 shadow-sm transition-shadow duration-300">
          
          {/* Main Header Part */}
          <div className="border-b border-neutral-100 dark:border-neutral-800 lg:py-4 transition-all duration-300">
            <div className="max-w-[1500px] mx-auto lg:px-4 sm:px-6">
                
                {/* Desktop Row */}
                <div className="hidden lg:flex items-center justify-between gap-10">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0 w-48">
                        <Logo size={scrolled ? "md" : "xl"} />
                    </div>

                    {/* Search Bar - Centered & Wide */}
                    <div className="flex-1 max-w-2xl mx-auto transition-all duration-300">
                        <SearchBar /> 
                    </div>

                    {/* Actions - Enhanced for "Complete E-commerce" */}
                    <div className="flex items-center gap-8 flex-shrink-0">
                        
                        {/* Account - Detailed */}
                        <Link to={isAuthenticated ? "/profile" : "/login"} className="flex items-center gap-3 group">
                            <div className="p-2.5 rounded-full bg-neutral-50 dark:bg-neutral-900 group-hover:bg-[#6aa200]/10 transition-colors">
                                {isAuthenticated ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="w-[22px] h-[22px] rounded-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                                    />
                                ) : (
                                    <User size={22} strokeWidth={1.5} className="text-neutral-700 dark:text-neutral-300 group-hover:text-[#6aa200] transition-colors" />
                                )}
                            </div>
                            <div className="flex flex-col items-start leading-none gap-1">
                                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                                    {isAuthenticated ? 'Bon retour,' : 'Bonjour, Identifiez-vous'}
                                </span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#6aa200] transition-colors">
                                    {isAuthenticated ? displayName : 'Mon Compte'}
                                </span>
                            </div>
                        </Link>

                        <Link to={isAuthenticated ? "/profile?tab=orders" : "/tracking"} className="flex items-center gap-3 group">
                            <div className="p-2.5 rounded-full bg-neutral-50 dark:bg-neutral-900 group-hover:bg-[#6aa200]/10 transition-colors">
                                <Package size={22} strokeWidth={1.5} className="text-neutral-700 dark:text-neutral-300 group-hover:text-[#6aa200] transition-colors" />
                            </div>
                            <div className="flex flex-col items-start leading-none gap-1">
                                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Mes</span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#6aa200] transition-colors">Commandes</span>
                            </div>
                        </Link>

                        <button
                            onClick={openNotifications}
                            className="flex items-center gap-3 group relative"
                        >
                            <div className="p-2.5 rounded-full bg-neutral-50 dark:bg-neutral-900 group-hover:bg-[#6aa200]/10 transition-colors relative">
                                <Bell size={22} strokeWidth={1.5} className="text-neutral-700 dark:text-neutral-300 group-hover:text-[#6aa200] transition-colors" />
                                {notifUnreadCount > 0 ? (
                                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#6aa200] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-neutral-950 shadow-sm">
                                    {notifUnreadCount}
                                  </span>
                                ) : null}
                            </div>
                            <div className="flex flex-col items-start leading-none gap-1">
                                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Nouveautés</span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#6aa200] transition-colors">Produits</span>
                            </div>
                        </button>

                        {/* Cart */}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="flex items-center gap-3 group relative"
                        >
                            <div className="p-2.5 rounded-full bg-neutral-50 dark:bg-neutral-900 group-hover:bg-[#6aa200]/10 transition-colors relative">
                                <ShoppingCart size={22} strokeWidth={1.5} className="text-neutral-700 dark:text-neutral-300 group-hover:text-[#6aa200] transition-colors" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#6aa200] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-neutral-950 shadow-sm">
                                    {cartCount}
                                </span>
                            </div>
                            <div className="flex flex-col items-start leading-none gap-1">
                                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Mon Panier</span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-[#6aa200] transition-colors">{cartTotal.toLocaleString()} FCFA</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* =========================================
                    MOBILE HEADER (Floating Island Design)
                ========================================= */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] p-3 flex flex-col gap-2 pointer-events-none">
                    
                    {/* Main Floating Bar */}
                    <div className="pointer-events-auto w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/50 dark:border-neutral-800/50 rounded-[2rem] p-1.5 pr-2 flex items-center justify-between transition-all duration-300">
                        
                        {/* User Pill (Left) */}
                        <Link to={isAuthenticated ? "/profile" : "/login"} className="flex items-center gap-3 bg-white/50 dark:bg-neutral-800/50 rounded-full p-1 pr-5 border border-white/20 shadow-sm transition-transform active:scale-95">
                            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-950 overflow-hidden shadow-sm flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                {isAuthenticated ? (
                                    <img 
                                        src={avatarUrl} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                                    />
                                ) : (
                                    <User size={20} className="text-neutral-500 dark:text-neutral-400" />
                                )}
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Compte</span>
                                <span className="text-xs font-black text-neutral-800 dark:text-neutral-100">
                                    {isAuthenticated ? displayName : 'Se connecter'}
                                </span>
                            </div>
                        </Link>

                        {/* Action Pills (Right) */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={openNotifications}
                                className="w-11 h-11 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm border border-neutral-100 dark:border-neutral-700 relative active:scale-90 transition-all"
                            >
                                <Bell size={20} strokeWidth={2} />
                                {notifUnreadCount > 0 ? (
                                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#6aa200] text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-neutral-800 flex items-center justify-center">
                                    {notifUnreadCount}
                                  </span>
                                ) : null}
                            </button>
                            
                            <button 
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className={cn(
                                    "w-14 h-11 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 shadow-sm active:scale-90",
                                    isSearchOpen 
                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rotate-90" 
                                        : "bg-[#6aa200] text-white"
                                )}
                            >
                                {isSearchOpen ? <X size={20} strokeWidth={2.5} /> : <Search size={20} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>

                    {/* Search Dropdown (Floating Card) */}
                    <AnimatePresence>
                        {isSearchOpen && (
                            <Motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.95, y: -10, filter: "blur(10px)" }}
                                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                className="pointer-events-auto w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden p-2"
                            >
                                <SearchBar variant="mobile" onSearch={() => setIsSearchOpen(false)} />
                            </Motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
          </div>

          {/* Navigation Bar Part */}
          <div className="hidden lg:block border-b border-neutral-100 dark:border-neutral-800">
            <div className="max-w-[1500px] mx-auto px-6 h-16 flex items-center justify-between">
                
                {/* Left: Categories Trigger (Modern Pill) */}
                <button 
                    onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                    className={cn(
                        "flex items-center gap-3 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform active:scale-95",
                        isMegaMenuOpen 
                            ? "bg-[#6aa200] text-white shadow-lg shadow-[#6aa200]/30" 
                            : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-[#6aa200] hover:text-white"
                    )}
                >
                    <AlignLeft size={18} />
                    <span>Nos Catégories</span>
                    <ChevronDown size={14} className={cn("transition-transform ml-1", isMegaMenuOpen && "rotate-180")} />
                </button>

                {/* Center: Main Nav (Clean & Airy) */} 
                {/* NONE
                        { label: 'Partenaires', path: '/sellers' }, 
                       */}
                <nav className="flex items-center gap-10">
                    {[
                      { label: 'Accueil', path: '/' },
                      { label: 'Partenaires', path: '/sellers' }, 
                      { label: 'Catalogues', path: '/shop' },
                      { label: 'Billetterie', path: '/tickets' },
                      { label: 'Blog', path: '/blog' },
                    ].map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link 
                                key={link.label}
                                to={link.path}
                                className={cn(
                                    "relative py-2 text-sm font-semibold transition-colors group",
                                    isActive 
                                      ? "text-[#6aa200]" 
                                      : "text-neutral-600 dark:text-neutral-400 hover:text-[#6aa200]"
                                )}
                            >
                                {link.label}
                                <span className={cn(
                                    "absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-[#6aa200] rounded-full -translate-x-1/2 transition-all duration-300",
                                    isActive
                                      ? "opacity-100 translate-y-0"
                                      : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                                )}></span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: Offer (Elegant Badge) */}
                <div className="flex items-center">
                  {hasFlashSale ? (
                    <button 
                        onClick={() => setShowOffer(true)}
                        className="group flex items-center gap-3 pl-1.5 pr-5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-amber-400/50 hover:bg-amber-400/5 transition-all duration-300"
                    >
                        <div className="w-8 h-8 rounded-full gold-bg text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <Zap size={14} fill="currentColor" />
                        </div>
                        <span className="text-xs font-bold gold-text uppercase tracking-wide">Ventes Flash</span>
                    </button>
                  ) : null}
                </div>
            </div>
          </div>
        </div>

        {/* =========================================
            MODALS
        ========================================= */}
        <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
        
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          onOpenOffer={
            hasFlashSale
              ? () => {
                  setIsMobileMenuOpen(false);
                  setTimeout(() => setShowOffer(true), 300);
                }
              : undefined
          }
        />

        <AnimatePresence>
          {isNotifOpen && (
            <>
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNotifOpen(false)}
                className="fixed inset-0 bg-neutral-950/30 backdrop-blur-sm z-[120]"
              />
              <Motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                className="fixed top-20 right-4 lg:right-10 z-[121] w-[360px] max-w-[92vw] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="font-bold text-neutral-900 dark:text-white">Nouveaux produits</div>
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-auto">
                  {notifDisplayProducts.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-neutral-600 dark:text-neutral-400">
                      Aucun nouveau produit.
                    </div>
                  ) : (
                    <div className="py-2">
                      {notifDisplayProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setIsNotifOpen(false);
                            navigate(`/product/${encodeURIComponent(p.id)}`);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                          <div className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">{p.name}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            Ajouté le {p.dateCreation ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(p.dateCreation)) : ""}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
            {showOffer && hasFlashSale && (
              <>
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowOffer(false)}
                  className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[100]"
                />
                <Motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                >
                  <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto pointer-events-auto no-scrollbar">
                    <Offer onClose={() => setShowOffer(false)} />
                  </div>
                </Motion.div>
              </>
            )}
        </AnimatePresence>

      </header>

      {/* =========================================
          BOTTOM NAVIGATION (Mobile Only)
      ========================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-[90]">
        <NavMobile />
      </div>
    </>
  );
}
