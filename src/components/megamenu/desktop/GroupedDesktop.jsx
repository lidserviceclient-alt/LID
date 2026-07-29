import { useMemo, useState } from "react";
import CategoryImagePanel from "../shared/CategoryImagePanel";
import SubcategoryCard from "../shared/SubcategoryCard";
import UniversGroupHeader from "../shared/UniversGroupHeader";

/** Variant 2a: sidebar grouped by univers + 2-column subcategory grid. */
export default function GroupedDesktop({ groupedMenuCategories, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const allCategories = useMemo(
    () => groupedMenuCategories.flatMap((g) => g.categories),
    [groupedMenuCategories]
  );

  const activeCategory = useMemo(() => {
    if (allCategories.length === 0) return null;
    if (!activeCategoryId) return allCategories[0];
    return allCategories.find((c) => c.id === activeCategoryId) || allCategories[0];
  }, [allCategories, activeCategoryId]);

  const activeGroupLabel = useMemo(() => {
    return groupedMenuCategories.find((g) => g.categories.some((c) => c.id === activeCategory?.id))?.label || "";
  }, [groupedMenuCategories, activeCategory]);

  return (
    <div className="flex h-full">
      <div className="w-[280px] flex-shrink-0 h-full border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto py-4 bg-neutral-50 dark:bg-neutral-900/50">
        {groupedMenuCategories.map((group) => (
          <div key={group.key}>
            <UniversGroupHeader label={group.label} className="px-6 pt-4 pb-1 first:pt-2" />
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
        ))}
      </div>

      <div className="flex-1 h-full p-8 overflow-y-auto">
        {activeCategory ? (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6aa200] mb-1">{activeGroupLabel}</p>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white">{activeCategory.label}</h2>
          </div>
        ) : null}
        <div className="flex gap-8">
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
