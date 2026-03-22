import { useEffect, useMemo, useState } from "react";
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShoppingBag, Heart, Zap } from "lucide-react";
import { buildCategoryTree, getCatalogCategories } from "@/services/categoryService";

export default function MobileMenu({ isOpen, onClose, onOpenOffer }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [remoteCategories, setRemoteCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoadingCategories(true);
      setCategoriesError("");
      try {
        const list = await getCatalogCategories();
        if (cancelled) return;
        setRemoteCategories(list);
      } catch (e) {
        if (!cancelled) {
          setRemoteCategories([]);
          setCategoriesError(e?.message || "Impossible de charger les catégories.");
        }
      } finally {
        if (!cancelled) setIsLoadingCategories(false);
      }
    }
    if (isOpen) load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const menuCategories = useMemo(() => {
    const tree = buildCategoryTree(remoteCategories);
    return tree.map((root) => {
      const subcategories = (root.children || [])
        .map((child) => {
          const items = (child.children || [])
            .map((g) => ({
              label: g?.nom,
              slug: g?.slug || g?.id || ""
            }))
            .filter((g) => g.label && g.slug);
          if (items.length === 0) return null;
          return { title: child.nom, items };
        })
        .filter(Boolean)
        .slice(0, 6);
      return {
        id: root.id,
        label: root.nom,
        subcategories,
      };
    });
  }, [remoteCategories]);

  const sidebarVariants = {
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          />

          {/* Sidebar */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-white dark:bg-neutral-950 z-[1000] overflow-y-auto shadow-2xl border-r border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-neutral-950 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="text-xl font-black tracking-tighter">MENU</h2>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Auth Section */}
            <div className="p-6 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
              <Link to="/login" onClick={onClose} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-[#6aa200]/10 dark:bg-[#6aa200]/20 flex items-center justify-center text-[#6aa200] group-hover:bg-[#6aa200] group-hover:text-white transition-all">
                  <User size={24} />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-medium">Bienvenue</div>
                  <div className="font-bold text-neutral-900 dark:text-white text-lg leading-tight">Se connecter</div>
                </div>
              </Link>
            </div>

            {/* Special Offer */}
            {onOpenOffer && (
              <div className="p-4 pb-0">
                <button 
                  onClick={onOpenOffer}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6aa200] via-[#8bc34a] to-[#6aa200] bg-[length:200%_auto] animate-shine text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(106,162,0,0.3)] hover:shadow-[0_6px_20px_rgba(106,162,0,0.4)] transition-all transform hover:-translate-y-1"
                >
                  <Zap size={20} className="fill-white" />
                  <span>OFFRE SPÉCIALE</span>
                </button>
              </div>
            )}

            {/* Main Links */}
            <nav className="p-4 space-y-1">
              {[
                { label: 'Accueil', path: '/' },
                { label: 'Boutique', path: '/shop' },
                { label: 'Organisateurs', path: '/sellers' },
                { label: 'Billetterie', path: '/tickets' },
                { label: 'Blog', path: '/blog' },
                { label: 'Contact', path: '/contact' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className="block px-4 py-3 text-lg font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="h-px bg-neutral-100 dark:bg-neutral-800 mx-6 my-2" />

            {/* Categories Accordion */}
            <div className="p-4">
              <h3 className="px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Catégories</h3>
              <div className="space-y-1">
                {isLoadingCategories ? (
                  <div className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">Chargement...</div>
                ) : categoriesError ? (
                  <div className="px-4 py-2 text-sm text-red-600">{categoriesError}</div>
                ) : menuCategories.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400">Aucune catégorie.</div>
                ) : menuCategories.map((cat) => (
                  <div key={cat.id} className="rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                        expandedCategory === cat.id 
                          ? 'bg-[#6aa200]/10 dark:bg-[#6aa200]/20 text-[#6aa200]' 
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{cat.label}</span>
                      </div>
                      <span className="text-neutral-400">{expandedCategory === cat.id ? "▾" : "▸"}</span>
                    </button>
                    
                    <AnimatePresence>
                      {expandedCategory === cat.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-neutral-50 dark:bg-neutral-900/30 overflow-hidden"
                        >
                          <div className="px-4 py-3 space-y-4">
                            {cat.subcategories.map((sub, idx) => (
                              <div key={idx}>
                                <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                                  <span className="w-1 h-3 bg-[#6aa200] rounded-full"></span>
                                  {sub.title}
                                </h4>
                                <ul className="pl-3 space-y-2 border-l border-neutral-200 dark:border-neutral-700 ml-0.5">
                                  {sub.items.map((item) => (
                                    <li key={item.slug}>
                                      <Link 
                                        to={`/shop?category=${encodeURIComponent(item.slug)}`}
                                        onClick={onClose}
                                        className="block text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#6aa200] pl-3 py-0.5"
                                      >
                                        {item.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 mt-4 space-y-4 pb-24">
              <Link to="/wishlist" onClick={onClose} className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:text-[#6aa200]">
                <Heart size={20} />
                <span>Mes souhaits</span>
              </Link>
              <Link to="/orders" onClick={onClose} className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:text-[#6aa200]">
                <ShoppingBag size={20} />
                <span>Mes commandes</span>
              </Link>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
