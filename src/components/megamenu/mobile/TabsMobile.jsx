import { useState } from "react";
import SubcategoryLeafList from "../shared/SubcategoryLeafList";

/** Variant 1c: horizontal scrollable pills + subcategory list below. */
export default function TabsMobile({ menuCategories, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(menuCategories[0]?.id || null);
  const activeCategory = menuCategories.find((c) => c.id === activeCategoryId) || menuCategories[0] || null;

  return (
    <div>
      <div className="flex items-center gap-2 overflow-x-auto px-1 pb-3 -mx-1">
        {menuCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory?.id === cat.id
                ? "bg-[#6aa200] text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="space-y-4 px-2">
        {(activeCategory?.subcategories || []).map((sub, idx) => (
          <SubcategoryLeafList key={idx} sub={sub} onLinkClick={onClose} />
        ))}
      </div>
    </div>
  );
}
