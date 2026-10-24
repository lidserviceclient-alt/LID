import { useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { buildCategoryTree, resolveBackendAssetUrl } from "@/services/categoryService";
import { useCatalogCategories } from "@/features/catalog/useCatalogCategories";
import { groupCategoriesByUniverse } from "@/features/catalog/categoryGroups";
import { useMenuVariant } from "@/features/catalog/useMenuVariant";
import ListGridDesktop from "./megamenu/desktop/ListGridDesktop";
import ColumnsDesktop from "./megamenu/desktop/ColumnsDesktop";
import TabsDesktop from "./megamenu/desktop/TabsDesktop";
import GroupedDesktop from "./megamenu/desktop/GroupedDesktop";

const VARIANT_COMPONENTS = {
  "list-grid": ListGridDesktop,
  "columns": ColumnsDesktop,
  "tabs": TabsDesktop,
  "grouped": GroupedDesktop,
};

/**
 * variant: "list-grid" (default) | "columns" | "tabs" | "grouped".
 * Falls back to the live-switchable design variant (see MenuVariantSwitcher)
 * when no explicit variant prop is passed.
 */
export default function MegaMenu({ isOpen, onClose, variant }) {
  const liveVariant = useMenuVariant();
  const activeVariant = variant || liveVariant;
  const VariantComponent = VARIANT_COMPONENTS[activeVariant] || ListGridDesktop;

  const { data: remoteCategories = [], isLoading: isLoadingCategories, error } = useCatalogCategories();
  const categoriesError = error?.message || "";

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
        slug: root.slug,
        // Once the backend exposes a univers/group field on root categories,
        // it flows through here and groupCategoriesByUniverse (categoryGroups.js)
        // will prefer it automatically over the static CATEGORY_GROUPS mapping.
        univers: root.univers || root.groupe || root.group,
        label: root.nom,
        subcategories,
        imageUrl: resolveBackendAssetUrl(root.imageUrl),
      };
    });
  }, [remoteCategories]);

  const groupedMenuCategories = useMemo(
    () => groupCategoriesByUniverse(menuCategories),
    [menuCategories]
  );

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
            <div className="max-w-[1400px] mx-auto h-full">
              {isLoadingCategories ? (
                <div className="px-6 py-3 text-sm text-neutral-500 dark:text-neutral-400">Chargement...</div>
              ) : categoriesError ? (
                <div className="px-6 py-3 text-sm text-red-600">{categoriesError}</div>
              ) : menuCategories.length === 0 ? (
                <div className="px-6 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                  Aucune catégorie.
                </div>
              ) : (
                <VariantComponent
                  menuCategories={menuCategories}
                  groupedMenuCategories={groupedMenuCategories}
                  onClose={onClose}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
