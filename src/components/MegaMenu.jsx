import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { buildCategoryTree, getCatalogCategories, resolveBackendAssetUrl } from "@/services/categoryService";
import { getCatalogProductsPage } from "@/services/productService";
import { UNIVERS_MAPPING, getUniversLabel } from "@/config/universMapping";

const FALLBACK_PRODUCT_IMAGE = "/imgs/logo.png";

export default function MegaMenu({ isOpen, onClose }) {
  const [remoteCategories, setRemoteCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryProductData, setCategoryProductData] = useState({});

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
              slug: g?.slug || g?.id || "",
              count: Number.isFinite(Number(g?.count)) ? Number(g.count) : null
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
        slug: root.slug || "",
        universLabel: getUniversLabel(root),
        subcategories,
        imageUrl,
      };
    });
  }, [remoteCategories]);

  // Regroupement du sidebar par univers (mapping explicite ou champ `univers` de la catégorie).
  const sidebarGroups = useMemo(() => {
    const byLabel = new Map();
    for (const category of menuCategories) {
      const key = category.universLabel || "Autres";
      if (!byLabel.has(key)) byLabel.set(key, []);
      byLabel.get(key).push(category);
    }
    const mappedOrder = Object.keys(UNIVERS_MAPPING).filter((label) => byLabel.has(label));
    const extraOrder = [...byLabel.keys()].filter((label) => !mappedOrder.includes(label) && label !== "Autres");
    const orderedLabels = [...mappedOrder, ...extraOrder, ...(byLabel.has("Autres") ? ["Autres"] : [])];
    return orderedLabels.map((label) => ({ label, categories: byLabel.get(label) }));
  }, [menuCategories]);

  const activeCategory = useMemo(() => {
    const list = menuCategories;
    if (!Array.isArray(list) || list.length === 0) return null;
    if (!activeCategoryId) return list[0];
    return list.find((c) => c.id === activeCategoryId) || list[0];
  }, [menuCategories, activeCategoryId]);

  const hasSubcategories = (activeCategory?.subcategories?.length || 0) > 0;

  // Besoin de données produits uniquement quand elles servent réellement :
  // fallback "produits phares" (pas de sous-catégorie) ou compteur d'en-tête (univers === catégorie).
  const needsProductData = Boolean(
    activeCategory &&
      (!hasSubcategories || activeCategory.universLabel === activeCategory.label)
  );

  useEffect(() => {
    const slug = activeCategory?.slug;
    if (!needsProductData || !slug || categoryProductData[slug]) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      getCatalogProductsPage(0, 6, { category: slug })
        .then((data) => {
          if (cancelled) return;
          const items = Array.isArray(data?.content) ? data.content : [];
          const total = Number.isFinite(Number(data?.totalElements)) ? Number(data.totalElements) : items.length;
          setCategoryProductData((prev) => ({ ...prev, [slug]: { items, total } }));
        })
        .catch(() => {
          if (cancelled) return;
          setCategoryProductData((prev) => ({ ...prev, [slug]: { items: [], total: 0 } }));
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeCategory, needsProductData, categoryProductData]);

  const activeProductData = activeCategory ? categoryProductData[activeCategory.slug] : null;
  const featuredProducts = (activeProductData?.items || []).slice(0, 6);
  const overlineText = !activeCategory
    ? ""
    : activeCategory.universLabel === activeCategory.label
      ? (Number.isFinite(activeProductData?.total) ? `${activeProductData.total} PRODUITS` : "")
      : activeCategory.universLabel;

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
              <div
                data-lenis-prevent
                className="w-1/4 h-full border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto py-4 bg-neutral-50 dark:bg-neutral-900/50"
              >
                {isLoadingCategories ? (
                  <div className="px-6 py-3 text-sm text-neutral-500 dark:text-neutral-400">Chargement...</div>
                ) : categoriesError ? (
                  <div className="px-6 py-3 text-sm text-red-600">{categoriesError}</div>
                ) : menuCategories.length === 0 ? (
                  <div className="px-6 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                    Aucune catégorie.
                  </div>
                ) : (
                  sidebarGroups.map((group, groupIndex) => (
                    <div key={group.label}>
                      <p className={`px-6 ${groupIndex === 0 ? "pt-2" : "pt-4"} pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500`}>
                        {group.label}
                      </p>
                      {group.categories.map((category) => (
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
                      ))}
                    </div>
                  ))
                )}
              </div>

              {/* Right Content Area */}
              <div data-lenis-prevent className="flex-1 h-full p-8 flex gap-8 overflow-y-auto">

                <div className="flex-1 flex flex-col min-w-0">
                  {/* Header: surtitre (univers) + titre, ou compteur produits si univers === catégorie */}
                  <div className="mb-6">
                    {overlineText ? (
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
                        {overlineText}
                      </p>
                    ) : null}
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{activeCategory?.label}</h2>
                  </div>

                  {hasSubcategories ? (
                    /* Subcategories Grid */
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
                              <li key={item.slug} className="flex items-center justify-between gap-2">
                                <Link
                                  to={`/shop?category=${encodeURIComponent(item.slug)}`}
                                  onClick={onClose}
                                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-[#6aa200] dark:hover:text-[#6aa200] transition-colors"
                                >
                                  {item.label}
                                </Link>
                                {item.count != null ? (
                                  <span className="text-xs text-neutral-400 dark:text-neutral-500">{item.count}</span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* Fallback: pas de sous-catégorie -> produits phares */
                    <div className="flex-1 flex flex-col">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {featuredProducts.map((product) => {
                          const productId = product?.id ?? product?.articleId ?? product?.productId;
                          const rawImage = product?.imageUrl || product?.image;
                          const imageSrc = rawImage ? resolveBackendAssetUrl(rawImage) : FALLBACK_PRODUCT_IMAGE;
                          const price = Number(product?.price) || 0;
                          return (
                            <Link
                              key={productId}
                              to={`/product/${productId}`}
                              onClick={onClose}
                              className="group flex flex-col gap-2"
                            >
                              <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                <img
                                  src={imageSrc}
                                  alt={product?.name || ""}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 line-clamp-1">
                                  {product?.name}
                                </p>
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                  {price.toLocaleString()} FCFA
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                      <Link
                        to={`/shop?category=${encodeURIComponent(activeCategory?.slug || "")}`}
                        onClick={onClose}
                        className="text-sm font-semibold text-[#6aa200] hover:underline mt-auto"
                      >
                        Voir tous les produits →
                      </Link>
                    </div>
                  )}
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
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent flex flex-col justify-end gap-4 p-6 text-white">
                          <h3 className="text-2xl font-bold">{activeCategory?.label}</h3>
                          <Link
                            to={`/shop?category=${encodeURIComponent(activeCategory?.slug || "")}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 self-start px-4 py-2 rounded-full bg-white text-neutral-900 text-sm font-bold hover:bg-neutral-100 transition-colors"
                          >
                            Explorer <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-700 flex flex-col justify-end gap-4 p-6 text-white">
                        <h3 className="text-2xl font-bold">{activeCategory?.label}</h3>
                        <Link
                          to={`/shop?category=${encodeURIComponent(activeCategory?.slug || "")}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1.5 self-start px-4 py-2 rounded-full bg-white text-neutral-900 text-sm font-bold hover:bg-neutral-100 transition-colors"
                        >
                          Explorer <span aria-hidden="true">→</span>
                        </Link>
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
