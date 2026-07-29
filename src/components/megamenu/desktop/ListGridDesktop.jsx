import { useMemo, useState } from "react";
import CategoryImagePanel from "../shared/CategoryImagePanel";
import SubcategoryCard from "../shared/SubcategoryCard";

/** Variant 1a: flat sidebar list + 2-column subcategory grid. */
export default function ListGridDesktop({ menuCategories, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const activeCategory = useMemo(() => {
    if (menuCategories.length === 0) return null;
    if (!activeCategoryId) return menuCategories[0];
    return menuCategories.find((c) => c.id === activeCategoryId) || menuCategories[0];
  }, [menuCategories, activeCategoryId]);

  return (
    <div className="flex h-full">
      <div className="w-[260px] flex-shrink-0 h-full border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto py-4 bg-neutral-50 dark:bg-neutral-900/50">
        {menuCategories.map((category) => (
          <button
            key={category.id}
            onMouseEnter={() => setActiveCategoryId(category.id)}
            className={`w-full text-left px-6 py-3 flex items-center justify-between group transition-all duration-200 ${
              activeCategory?.id === category.id
                ? "bg-white dark:bg-neutral-800 shadow-sm border-l-4 border-[#6aa200]"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border-l-4 border-transparent"
            }`}
          >
            <span
              className={`font-medium ${
                activeCategory?.id === category.id
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
              }`}
            >
              {category.label}
            </span>
            {activeCategory?.id === category.id ? <span className="text-[#6aa200]">›</span> : null}
          </button>
        ))}
      </div>

      <div className="flex-1 h-full p-8 overflow-y-auto">
        {activeCategory ? (
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6">{activeCategory.label}</h2>
        ) : null}
        <div className="flex gap-8 h-[calc(100%-3rem)]">
          <div className="flex-1 grid grid-cols-2 gap-8 content-start">
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
          <CategoryImagePanel imageUrl={activeCategory?.imageUrl} label={activeCategory?.label} className="w-1/3 h-full" />
        </div>
      </div>
    </div>
  );
}
