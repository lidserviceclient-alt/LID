import { useMemo, useState } from "react";
import CategoryImagePanel from "../shared/CategoryImagePanel";
import SubcategoryCard from "../shared/SubcategoryCard";

/** Variant 1c: horizontal scrollable pills + 3-column subcategory grid. */
export default function TabsDesktop({ menuCategories, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const activeCategory = useMemo(() => {
    if (menuCategories.length === 0) return null;
    if (!activeCategoryId) return menuCategories[0];
    return menuCategories.find((c) => c.id === activeCategoryId) || menuCategories[0];
  }, [menuCategories, activeCategoryId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-neutral-100 dark:border-neutral-800 px-8 py-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeCategory?.id === category.id
                  ? "bg-[#6aa200] text-white shadow-md shadow-[#6aa200]/30"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex gap-8">
          <div className="flex-1 grid grid-cols-3 gap-6 content-start">
            {(activeCategory?.subcategories || []).map((sub, index) => (
              <SubcategoryCard
                key={`${activeCategory?.id || "cat"}-${index}`}
                sub={sub}
                onLinkClick={onClose}
                layout="inline"
                index={index}
              />
            ))}
          </div>
          <CategoryImagePanel imageUrl={activeCategory?.imageUrl} label={activeCategory?.label} className="w-1/4 h-full" />
        </div>
      </div>
    </div>
  );
}
