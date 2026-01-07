import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../provider/theme-provider.jsx';
import { cn } from './../../lib/utils.js';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { 
  ShoppingCart, User, Search, ChevronDown, 
  Zap, Sun, Moon, Globe, Menu as MenuIcon, Phone, AlignLeft, X,
  Home, Grid
} from 'lucide-react';
import SearchBar from '../components/Search.jsx';
import Logo from '../components/Logo.jsx';
import MegaMenu from '../components/MegaMenu.jsx';
import MobileMenu from '../components/MobileMenu.jsx';
import Offer from '../components/offer.jsx';
import { useCart } from '../provider/CartContext.jsx';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { cartCount, cartTotal } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search on route change
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsSearchOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const navItems = [
    { label: 'Accueil', path: '/', icon: Home },
    { label: 'Catalogue', path: '/shop', icon: Grid },
    { label: 'Panier', path: '/cart', icon: ShoppingCart, badge: cartCount },
    { label: 'Compte', path: '/account', icon: User },
    { label: 'Menu', action: () => setIsMobileMenuOpen(true), icon: MenuIcon },
  ];

  return (
    <motion.header 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full relative z-50"
    >
      {/* =========================================
          MOBILE LAYOUT (< lg)
          Refined: Clean Top + Bottom Nav with Menu
      ========================================= */}
      <div className="lg:hidden">
        {/* Sticky Top Bar */}
        <div className={cn(
          "fixed top-0 left-0 w-full bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md z-[100] transition-all duration-300",
          scrolled ? "shadow-sm border-b border-neutral-200/50 dark:border-neutral-800/50" : ""
        )}>
          {/* Main Bar */}
          <div className="px-4 h-14 flex items-center justify-between relative">
            {/* Left: Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 -ml-2 text-neutral-600 dark:text-neutral-400 active:scale-95 transition-transform"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Center: Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
              <Logo size="sm" />
            </div>

            {/* Right: Search Toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={cn(
                "p-2 -mr-2 active:scale-95 transition-all duration-300 relative z-20 cursor-pointer",
                isSearchOpen ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-full" : "text-neutral-600 dark:text-neutral-400"
              )}
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
          </div>

          {/* Expandable Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-neutral-100 dark:border-neutral-800"
              >
                <div className="p-4 bg-white dark:bg-neutral-950">
                  <SearchBar autoFocus variant="mobile" onSearch={() => setIsSearchOpen(false)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spacer */}
        <div className="h-14" />

        {/* Bottom Navigation Bar */}
        <div className="fixed rounded-t-[40px] bottom-0 left-0 w-full bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 z-50 px-2 py-2 pb-4 safe-area-pb">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path && !item.action;
              return item.action ? (
                // Button for actions (Menu)
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex flex-col items-center gap-1 min-w-[60px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 active:scale-95 transition-all"
                >
                  <div className="relative p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <item.icon size={22} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              ) : (
                // Link for navigation
                <Link 
                  key={item.label} 
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 min-w-[60px] transition-colors relative",
                    isActive 
                      ? "text-orange-600 dark:text-orange-500" 
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                  )}
                >
                  <div className={cn(
                    "relative p-1.5 rounded-xl transition-all duration-300",
                    isActive ? "bg-orange-50 dark:bg-orange-900/20" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}>
                    <item.icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2}
                      className={cn("transition-transform", isActive ? "scale-110" : "")} 
                    />
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-950 shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={cn("text-[10px] font-medium transition-all", isActive ? "font-bold" : "")}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="mobile-nav-indicator"
                      className="absolute -bottom-2 w-1 h-1 bg-orange-600 rounded-full" 
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================
          DESKTOP LAYOUT (>= lg)
          Original Layout
      ========================================= */}
      <div className="hidden lg:block bg-white dark:bg-neutral-950">
        {/* --- ROW 1: Top Bar (Dark) --- */}
        <motion.div variants={itemVariants} className="bg-neutral-900 text-neutral-300 text-[11px] py-2 border-b border-neutral-800">
          <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center">
            {/* Left: Language/Currency */}
            <div className="flex items-center gap-4">
              <motion.button whileHover={{ scale: 1.05, color: '#fff' }} className="flex items-center gap-1 transition-colors">
                <Globe size={12} />
                Français 
              </motion.button>
              <motion.button whileHover={{ scale: 1.05, color: '#fff' }} className="flex items-center gap-1 transition-colors">
                Fcfa 
              </motion.button>
              <span className="hidden sm:inline text-neutral-500">|</span>
              <span className="hidden sm:inline">Livraison gratuite sur toutes commandes supérieures à 10.000 Fcfa</span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              <Link to="/help" className="hover:text-white transition-colors hidden sm:block">Besoin d'aide</Link>
              <Link to="/account" className="hover:text-white transition-colors">Mon compte</Link>
              <Link to="/wishlist" className="hover:text-white transition-colors">Mes souhaits</Link>
              
              <div className="w-px h-3 bg-neutral-700 mx-1"></div>
              
              {/* Dark Mode Toggle */}
              <motion.button 
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* --- ROW 2: Middle Bar (Logo, Search, Cart) --- */}
        <motion.div variants={itemVariants} className="py-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* Logo */}
            <Logo size="xl" />

            {/* Search Bar */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 w-full max-w-2xl"
            >
              <SearchBar />
            </motion.div>

            {/* Cart & User Actions */}
            <div className="flex items-center gap-6 flex-shrink-0">
              {/* User */}
              <Link to="/login" className="flex items-center gap-3 group">
                <motion.div 
                  whileHover={{ scale: 1.1, backgroundColor: '#ea580c', color: '#fff' }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 transition-all"
                >
                  <User size={20} />
                </motion.div>
                <div className="hidden xl:block text-left">
                  <div className="text-[11px] text-neutral-500">Bienvenue</div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors">Se connecter</div>
                </div>
              </Link>

              {/* Cart */}
              <Link to="/cart">
                <motion.div 
                  className="flex items-center gap-3 group relative cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                    className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-neutral-950"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </motion.div>
                  <div className="hidden xl:block text-left">
                    <div className="text-[11px] text-neutral-500">Mon panier</div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">{cartTotal.toLocaleString()} FCFA</div>
                  </div>
                </motion.div>
              </Link>
            </div>

          </div>
        </motion.div>

        {/* --- ROW 3: Navigation (Sticky) --- */}
        <motion.div 
          variants={itemVariants}
          className={cn(
            "bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 transition-all duration-300",
            scrolled ? "sticky top-0 shadow-md z-40" : ""
          )}
        >
          <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between h-12">
            
            {/* Browse Categories */}
            <div className="relative h-full flex items-center">
              {/* Desktop Mega Menu Trigger */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className="hidden lg:flex h-full px-6 bg-orange-600 text-white items-center gap-3 font-semibold text-sm hover:bg-orange-700 transition-colors"
              >
                <AlignLeft size={20} />
                Parcourir les catégories
                <ChevronDown 
                  size={16} 
                  className={`ml-2 opacity-80 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} 
                />
              </motion.button>
            </div>

            {/* Main Menu */}
            <nav className="hidden lg:flex items-center gap-8 h-full">
              {[
                { label: 'Accueil', path: '/' },
                { label: 'Catalogue', path: '/shop' },
                { label: 'Vendeurs', path: '/vendors' },
                { label: 'Blog', path: '/blog' },
                { label: 'Contact', path: '/contact' },
              ].map((link) => (
                <Link 
                  key={link.label}
                  to={link.path}
                  className="relative h-full flex items-center group"
                >
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors z-10">
                    {link.label}
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              ))}
            </nav>

            {/* Right: Phone / Offer */}
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setShowOffer(true)}
                  className="gold-text flex items-center gap-2 text-orange-600 font-bold text-sm hover:text-orange-700 transition-colors"
                >
                  <Zap className="gold-text" size={18} />
                  <span>OFFRE SPÉCIALE</span>
                </button>

                <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 hidden xl:block"></div>
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <Phone size={16} />
                  <span className="text-sm font-medium">+225 07 34 342 324</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

        {/* Shared Modals */}
        <AnimatePresence>
          {showOffer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOffer(false)}
                className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
              >
                <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto pointer-events-auto no-scrollbar">
                  <Offer onClose={() => setShowOffer(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onOpenOffer={() => {
          setIsMobileMenuOpen(false);
          setTimeout(() => setShowOffer(true), 300); // Small delay for menu close animation
        }}
      />
    </motion.header>
  );
}
