import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import SubcategoryLeafList from "../shared/SubcategoryLeafList";
import UniversGroupHeader from "../shared/UniversGroupHeader";

/** Variant 2a: accordion grouped by univers, with a light sticky subheader per group. */
export default function GroupedMobile({ groupedMenuCategories, onClose }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const toggle = (id) => setExpandedCategory((cur) => (cur === id ? null : id));

  return (
    <div className="space-y-1">
      {groupedMenuCategories.map((group) => (
        <div key={group.key}>
          <UniversGroupHeader
            label={group.label}
            className="sticky top-14 z-[1] -mx-4 px-4 py-1.5 bg-neutral-50 dark:bg-neutral-900/80 backdrop-blur-sm"
          />
          {group.categories.map((cat) => (
            <div key={cat.id} className="rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(cat.id)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                  expandedCategory === cat.id
                    ? "bg-[#6aa200]/10 dark:bg-[#6aa200]/20 text-[#6aa200]"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                <span className="font-medium">{cat.label}</span>
                <span className="text-neutral-400">{expandedCategory === cat.id ? "▾" : "▸"}</span>
              </button>

              <AnimatePresence>
                {expandedCategory === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-neutral-50 dark:bg-neutral-900/30 overflow-hidden"
                  >
                    <div className="px-4 py-3 space-y-4">
                      {cat.subcategories.map((sub, idx) => (
                        <SubcategoryLeafList key={idx} sub={sub} onLinkClick={onClose} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
