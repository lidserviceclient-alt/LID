import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import CategoryImagePanel from "../shared/CategoryImagePanel";
import LeafIconTile from "../shared/LeafIconTile";

/** Variant 1b: 3 columns (categories → subcategories → leaf icon grid + image). */
export default function ColumnsDesktop({ menuCategories, onClose }) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState(0);

  const activeCategory = useMemo(() => {
    if (menuCategories.length === 0) return null;
    if (!activeCategoryId) return menuCategories[0];
    return menuCategories.find((c) => c.id === activeCategoryId) || menuCategories[0];
  }, [menuCategories, activeCategoryId]);

  const activeSub = activeCategory?.subcategories?.[activeSubIndex] || activeCategory?.subcategories?.[0] || null;

  const handleSelectCategory = (id) => {
    setActiveCategoryId(id);
    setActiveSubIndex(0);
  };

  return (
    <div className="flex h-full">
      {/* Col 1: categories */}
      <div className="w-[230px] flex-shrink-0 h-full border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto py-4 bg-neutral-50 dark:bg-neutral-900/50">
        {menuCategories.map((category) => (
          <button
            key={category.id}
            onMouseEnter={() => handleSelectCategory(category.id)}
            className={`w-full text-left px-5 py-3 flex items-center justify-between transition-all duration-200 ${
              activeCategory?.id === category.id
                ? "bg-white dark:bg-neutral-800 shadow-sm border-l-4 border-[#6aa200] text-neutral-900 dark:text-white font-medium"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border-l-4 border-transparent text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {category.label}
            <ChevronRight size={14} className={activeCategory?.id === category.id ? "text-[#6aa200]" : "text-neutral-300"} />
          </button>
        ))}
      </div>

      {/* Col 2: subcategories of the active category */}
      <div className="w-[230px] flex-shrink-0 h-full border-r border-neutral-100 dark:border-neutral-800 overflow-y-auto py-4">
        {(activeCategory?.subcategories || []).map((sub, index) => (
          <button
            key={`${activeCategory?.id || "cat"}-${index}`}
            onMouseEnter={() => setActiveSubIndex(index)}
            className={`w-full text-left px-5 py-3 transition-all duration-200 ${
              activeSubIndex === index
                ? "bg-[#6aa200]/10 text-[#4d7a00] font-medium"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {sub.title}
          </button>
        ))}
      </div>

      {/* Col 3: breadcrumb + leaf icon grid + image */}
      <div className="flex-1 h-full p-8 overflow-y-auto">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
          <span>{activeCategory?.label}</span>
          <ChevronRight size={12} />
          <span className="text-neutral-900 dark:text-white font-medium">{activeSub?.title}</span>
        </div>
        <div className="flex gap-8">
          <div className="flex-1 grid grid-cols-3 gap-2 content-start">
            {(activeSub?.items || []).map((item) => (
              <LeafIconTile key={item.slug} item={item} onLinkClick={onClose} />
            ))}
          </div>
          <CategoryImagePanel
            imageUrl={activeCategory?.imageUrl}
            label={activeSub?.title || activeCategory?.label}
            className="w-1/3 h-full"
          />
        </div>
      </div>
    </div>
  );
}
