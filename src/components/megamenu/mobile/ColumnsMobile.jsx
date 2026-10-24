import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SubcategoryLeafList from "../shared/SubcategoryLeafList";

/** Variant 1b: drill-down — categories screen, then a subcategory detail screen with a back button. */
export default function ColumnsMobile({ menuCategories, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const activeCategory = menuCategories.find((c) => c.id === activeCategoryId) || null;

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {!activeCategory ? (
          <motion.div
            key="list"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1"
          >
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
              >
                <span className="font-medium">{cat.label}</span>
                <ChevronRight size={16} className="text-neutral-400" />
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setActiveCategoryId(null)}
              className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-3 px-2 py-1"
            >
              <ChevronLeft size={16} />
              <span>{activeCategory.label}</span>
            </button>
            <div className="space-y-4 px-2">
              {activeCategory.subcategories.map((sub, idx) => (
                <SubcategoryLeafList key={idx} sub={sub} onLinkClick={onClose} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
