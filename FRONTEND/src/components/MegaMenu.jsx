import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { buildCategoryTree, getCatalogCategories, resolveBackendAssetUrl } from "@/services/categoryService";

export default function MegaMenu({ isOpen, onClose }) {
  const [remoteCategories, setRemoteCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    } else if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

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
      const imageUrl = resolveBackendAssetUrl(root.imageUrl);
      return {
        id: root.id,
        label: root.nom,
        subcategories,
        imageUrl,
      };
    });
  }, [remoteCategories]);

  const activeCategory = useMemo(() => {
    const list = menuCategories;
    if (!Array.isArray(list) || list.length === 0) return null;
    if (!activeCategoryId) return list[0];
    return list.find((c) => c.id === activeCategoryId) || list[0];
  }, [menuCategories, activeCategoryId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Portaled to document.body) */}
          {typeof document !== 'undefined' && createPortal(
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-40"
            />,
            document.body
          )}

          {/* Menu Container */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="absolute left-0 top-full w-full bg-white dark:bg-neutral-900 shadow-2xl border-t border-neutral-200 dark:border-neutral-800 h-[600px] max-h-[calc(100vh-60px)]"
          >
            <div className="max-w-[1400px] mx-auto h-full flex">
              
              {/* Left Sidebar: Categories List */}
              <div className="w-1/4 h-full border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto py-4 bg-neutral-50 dark:bg-neutral-900/50">
                {isLoadingCategories ? (
                  <div className="px-6 py-3 text-sm text-neutral-500 dark:text-neutral-400">Chargement...</div>
                ) : categoriesError ? (
                  <div className="px-6 py-3 text-sm text-red-600">{categoriesError}</div>
                ) : menuCategories.length === 0 ? (
                  <div className="px-6 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune catégorie.
                  </div>
                ) : (
                  menuCategories.map((category) => (
                    <button
                      key={category.id}
                      onMouseEnter={() => setActiveCategoryId(category.id)}
                      className={`w-full text-left px-6 py-3 flex items-center justify-between group transition-all duration-200 ${
                        activeCategory?.id === category.id
                          ? "bg-white dark:bg-neutral-800 shadow-sm border-l-4 border-[#6aa200]"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-medium ${
                            activeCategory?.id === category.id
                              ? "text-neutral-900 dark:text-white"
                              : "text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
                          }`}
                        >
                          {category.label}
                        </span>
                      </div>
                      {activeCategory?.id === category.id ? <span className="text-[#6aa200]">›</span> : null}
                    </button>
                  ))
                )}
              </div>

              {/* Right Content Area */}
              <div className="flex-1 h-full p-8 flex gap-8 overflow-y-auto">
                
                {/* Subcategories Grid */}
                <div className="flex-1 grid grid-cols-2 gap-8 content-start">
                  {(activeCategory?.subcategories || []).map((sub, index) => (
                    <motion.div
                      key={`${activeCategory?.id || "cat"}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <h3 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#6aa200] rounded-full"></span>
                        {sub.title}
                      </h3>
                      <ul className="space-y-2">
                        {sub.items.map((item) => (
                          <li key={item.slug}>
                            <Link
                              to={`/shop?category=${encodeURIComponent(item.slug)}`}
                              onClick={onClose}
                              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-[#6aa200] dark:hover:text-[#6aa200] hover:translate-x-1 transition-all inline-block"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

                {/* Featured Image / Offer */}
                <div className="w-1/3">
                  <motion.div
                    key={activeCategory?.id || "active"}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
                  >
                    {activeCategory?.imageUrl ? (
                      <>
                        <img
                          src={activeCategory.imageUrl}
                          alt={activeCategory?.label || ""}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent flex flex-col justify-end p-6 text-white">
                          <h3 className="text-2xl font-bold mb-2">{activeCategory?.label}</h3>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-700 flex items-end p-6 text-white">
                        <h3 className="text-2xl font-bold">{activeCategory?.label}</h3>
                      </div>
                    )}
                  </motion.div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
